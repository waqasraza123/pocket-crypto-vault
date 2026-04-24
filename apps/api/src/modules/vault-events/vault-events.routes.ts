import type { FastifyInstance } from "fastify";
import { isAddress } from "viem";
import { z } from "zod";

import { classifyObservedError } from "../../lib/observability/event-classification";
import { logObservabilitySignal } from "../../lib/observability/logger";
import { serializeActivityFeedResponse, serializeVaultActivityItem, serializeVaultActivityResponse } from "./vault-events.serializers";
import { getOwnerActivity, getVaultActivity } from "./vault-events.service";

const activityQuerySchema = z.object({
  chainId: z.union([z.literal(8453), z.literal(84532)]).optional(),
  ownerWallet: z.string().trim().optional(),
});

export const registerVaultEventRoutes = (app: FastifyInstance) => {
  app.get("/activity", async (request, reply) => {
    const parsed = activityQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Invalid activity query.",
      });
    }

    if (parsed.data.ownerWallet && !isAddress(parsed.data.ownerWallet)) {
      return reply.status(400).send({
        message: "Expected a valid owner wallet address.",
      });
    }

    try {
      const context = app.goalVaultContext;
      const items = getOwnerActivity({
        context,
        chainId: parsed.data.chainId,
        ownerWallet: parsed.data.ownerWallet as `0x${string}` | undefined,
      }).items.map((event) =>
        serializeVaultActivityItem({
          event,
          vault: context.store.getVault(event.chainId, event.vaultAddress),
        }),
      );
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "activity_feed_read",
        status: "succeeded",
        message: "Activity feed served.",
        route: "/activity",
        requestId: request.id,
        chainId: parsed.data.chainId,
        count: items.length,
      });

      return serializeActivityFeedResponse({ items });
    } catch (error) {
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "activity_feed_read",
        status: "failed",
        message: "Activity feed failed.",
        route: "/activity",
        requestId: request.id,
        chainId: parsed.data.chainId,
        errorClass: classifyObservedError(error),
      });
      return reply.status(503).send({
        message: "Activity is temporarily unavailable.",
      });
    }
  });

  app.get("/vaults/:vaultAddress/activity", async (request, reply) => {
    const params = request.params as { vaultAddress?: string };
    const parsed = z
      .object({
        chainId: z.union([z.literal(8453), z.literal(84532)]),
      })
      .safeParse(request.query);

    if (!params.vaultAddress || !isAddress(params.vaultAddress) || !parsed.success) {
      return reply.status(400).send({
        message: "Expected a valid vault address and chain id.",
      });
    }

    try {
      const context = app.goalVaultContext;
      const activity = getVaultActivity({
        context,
        chainId: parsed.data.chainId,
        vaultAddress: params.vaultAddress as `0x${string}`,
      });
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_activity_read",
        status: "succeeded",
        message: "Vault activity served.",
        route: "/vaults/:vaultAddress/activity",
        requestId: request.id,
        chainId: parsed.data.chainId,
        vaultAddress: params.vaultAddress as `0x${string}`,
        count: activity.items.length,
      });

      return serializeVaultActivityResponse({
        chainId: parsed.data.chainId,
        vaultAddress: params.vaultAddress as `0x${string}`,
        freshness: activity.freshness,
        items: activity.items.map((event) =>
          serializeVaultActivityItem({
            event,
            vault: context.store.getVault(event.chainId, event.vaultAddress),
          }),
        ),
      });
    } catch (error) {
      logObservabilitySignal(app.log, {
        domain: "api",
        action: "vault_activity_read",
        status: "failed",
        message: "Vault activity failed.",
        route: "/vaults/:vaultAddress/activity",
        requestId: request.id,
        chainId: parsed.data.chainId,
        vaultAddress: params.vaultAddress as `0x${string}`,
        errorClass: classifyObservedError(error),
      });
      return reply.status(503).send({
        message: "Vault activity is temporarily unavailable.",
      });
    }
  });
};
