import { createHash, randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";
import {
  supportRequestCategories,
  supportRequestPriorities,
  supportRequestStatuses,
  type SupportRequestRecord,
  type SupportRequestResponse,
  type SupportRequestStatus,
} from "@goal-vault/shared";
import { isAddress } from "viem";
import { z } from "zod";

import type { ApiRuntimeEnv } from "../../env";
import { classifyObservedError } from "../../lib/observability/event-classification";
import { logObservabilitySignal } from "../../lib/observability/logger";
import { requireInternalRequestAccess } from "../../lib/security/internal-access";
import type { IndexerContext } from "../indexer/context";

const supportRateLimits = new Map<string, { count: number; resetAt: number }>();
const supportRateLimitWindowMs = 10 * 60 * 1000;
const supportRateLimitMax = 5;
const secretWarningPattern = /\b(private key|seed phrase|mnemonic|recovery phrase)\b/i;

const addressSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => value || null)
  .refine((value) => !value || isAddress(value), "Expected a valid EVM address.");

const supportRequestSchema = z.object({
  category: z.enum(supportRequestCategories),
  priority: z.enum(supportRequestPriorities),
  subject: z.string().trim().min(4).max(120),
  message: z.string().trim().min(20).max(2_000),
  reporterWallet: addressSchema,
  contactEmail: z
    .string()
    .trim()
    .email()
    .max(160)
    .optional()
    .nullable()
    .transform((value) => value || null),
  context: z.object({
    route: z.string().trim().min(1).max(160).optional().nullable().transform((value) => value || null),
    environment: z.enum(["development", "staging", "production"]),
    deploymentTarget: z.enum(["local", "staging", "production"]),
    chainId: z.union([z.literal(8453), z.literal(84532)]).optional().nullable(),
    walletStatus: z
      .enum(["walletUnavailable", "disconnected", "connecting", "unsupportedNetwork", "ready"])
      .optional()
      .nullable(),
    vaultAddress: addressSchema,
  }),
});
const supportListQuerySchema = z.object({
  status: z.enum(supportRequestStatuses).optional(),
  category: z.enum(supportRequestCategories).optional(),
  priority: z.enum(supportRequestPriorities).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
const supportRequestIdParamsSchema = z.object({
  id: z.string().trim().uuid(),
});
const supportStatusUpdateSchema = z.object({
  status: z.enum(supportRequestStatuses),
});

const normalizeUserAgent = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.join(" ").slice(0, 240);
  }

  return value ? value.slice(0, 240) : null;
};

const hashRequesterIp = (deploymentTarget: ApiRuntimeEnv["deploymentTarget"], requesterIp: string | undefined) => {
  if (!requesterIp) {
    return null;
  }

  return createHash("sha256").update(`${deploymentTarget}:${requesterIp}`).digest("hex");
};

const isRateLimited = (key: string, now: number) => {
  const current = supportRateLimits.get(key);

  if (!current || current.resetAt <= now) {
    supportRateLimits.set(key, {
      count: 1,
      resetAt: now + supportRateLimitWindowMs,
    });
    return false;
  }

  if (current.count >= supportRateLimitMax) {
    return true;
  }

  supportRateLimits.set(key, {
    ...current,
    count: current.count + 1,
  });
  return false;
};

const hasSecretLikeContent = (values: string[]) => values.some((value) => secretWarningPattern.test(value));

export const registerSupportRoutes = (app: FastifyInstance, context: IndexerContext, env: ApiRuntimeEnv) => {
  app.get("/internal/support/requests", async (request, reply) => {
    if (!(await requireInternalRequestAccess({ env, request, reply }))) {
      return;
    }

    const parsed = supportListQuerySchema.safeParse(request.query ?? {});

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Support request filters are invalid.",
      });
    }

    const items = await context.supportStore.list(parsed.data);

    logObservabilitySignal(app.log, {
      domain: "support",
      action: "list_requests",
      status: "succeeded",
      message: "Support requests listed for internal review.",
      route: "/internal/support/requests",
      requestId: request.id,
      count: items.length,
      metadata: {
        status: parsed.data.status ?? null,
        category: parsed.data.category ?? null,
        priority: parsed.data.priority ?? null,
      },
    });

    return {
      items,
      filters: parsed.data,
      generatedAt: new Date().toISOString(),
    };
  });

  app.get("/internal/support/requests/:id", async (request, reply) => {
    if (!(await requireInternalRequestAccess({ env, request, reply }))) {
      return;
    }

    const parsed = supportRequestIdParamsSchema.safeParse(request.params ?? {});

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Support request id is invalid.",
      });
    }

    const item = await context.supportStore.get(parsed.data.id);

    if (!item) {
      return reply.status(404).send({
        message: "Support request was not found.",
      });
    }

    return {
      item,
    };
  });

  app.patch("/internal/support/requests/:id", async (request, reply) => {
    if (!(await requireInternalRequestAccess({ env, request, reply }))) {
      return;
    }

    const parsedParams = supportRequestIdParamsSchema.safeParse(request.params ?? {});
    const parsedBody = supportStatusUpdateSchema.safeParse(request.body ?? {});

    if (!parsedParams.success || !parsedBody.success) {
      return reply.status(400).send({
        message: "Support status update is invalid.",
      });
    }

    const item = await context.supportStore.updateStatus(parsedParams.data.id, parsedBody.data.status as SupportRequestStatus);

    if (!item) {
      return reply.status(404).send({
        message: "Support request was not found.",
      });
    }

    logObservabilitySignal(app.log, {
      domain: "support",
      action: "update_request_status",
      status: "succeeded",
      message: "Support request status updated.",
      route: "/internal/support/requests/:id",
      requestId: request.id,
      metadata: {
        requestStatus: item.status,
        category: item.category,
        priority: item.priority,
      },
    });

    return {
      item,
    };
  });

  app.post("/support/requests", async (request, reply): Promise<SupportRequestResponse | { message: string }> => {
    if (!env.supportEnabled) {
      return reply.status(503).send({
        message: "Support intake is not accepting requests right now.",
      });
    }

    const rateLimitKey = request.ip || request.headers["x-forwarded-for"]?.toString() || "unknown";

    if (isRateLimited(rateLimitKey, Date.now())) {
      logObservabilitySignal(app.log, {
        domain: "support",
        action: "create_request",
        status: "degraded",
        message: "Support request rate limit reached.",
        route: "/support/requests",
        requestId: request.id,
        errorClass: "invalid_state",
      });

      return reply.status(429).send({
        message: "Too many support requests were submitted from this connection. Try again later.",
      });
    }

    const parsed = supportRequestSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      logObservabilitySignal(app.log, {
        domain: "support",
        action: "create_request",
        status: "failed",
        message: "Support request was rejected.",
        route: "/support/requests",
        requestId: request.id,
        errorClass: "invalid_state",
      });

      return reply.status(400).send({
        message: "Support request is invalid.",
      });
    }

    if (hasSecretLikeContent([parsed.data.subject, parsed.data.message, parsed.data.contactEmail ?? ""])) {
      return reply.status(400).send({
        message: "Remove secret recovery phrases, private keys, or credentials before submitting support.",
      });
    }

    const payload = parsed.data;
    const createdAt = new Date().toISOString();
    const record: SupportRequestRecord = {
      id: randomUUID(),
      category: payload.category,
      priority: payload.priority,
      subject: payload.subject,
      message: payload.message,
      reporterWallet: payload.reporterWallet as SupportRequestRecord["reporterWallet"],
      contactEmail: payload.contactEmail,
      context: {
        ...payload.context,
        vaultAddress: payload.context.vaultAddress as SupportRequestRecord["context"]["vaultAddress"],
      },
      status: "open",
      createdAt,
      userAgent: normalizeUserAgent(request.headers["user-agent"]),
      requesterIpHash: hashRequesterIp(env.deploymentTarget, request.ip),
    };

    try {
      await context.supportStore.create(record);
      logObservabilitySignal(app.log, {
        domain: "support",
        action: "create_request",
        status: "succeeded",
        message: "Support request stored.",
        route: "/support/requests",
        requestId: request.id,
        metadata: {
          category: record.category,
          priority: record.priority,
          environment: record.context.environment,
          deploymentTarget: record.context.deploymentTarget,
        },
      });

      return reply.status(201).send({
        id: record.id,
        status: record.status,
        receivedAt: createdAt,
        message: "Support request received.",
      });
    } catch (error) {
      logObservabilitySignal(app.log, {
        domain: "support",
        action: "create_request",
        status: "failed",
        message: "Support request storage failed.",
        route: "/support/requests",
        requestId: request.id,
        errorClass: classifyObservedError(error),
      });

      return reply.status(503).send({
        message: "Support request could not be accepted right now.",
      });
    }
  });
};
