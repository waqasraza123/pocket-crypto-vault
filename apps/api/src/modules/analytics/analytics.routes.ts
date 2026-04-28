import type { FastifyInstance } from "fastify";

import type { AnalyticsBatchResponse } from "@pocket-vault/shared";

import type { ApiRuntimeEnv } from "../../env";
import { analyticsBatchSchema } from "../../lib/observability/analytics";
import { classifyObservedError } from "../../lib/observability/event-classification";
import { logObservabilitySignal } from "../../lib/observability/logger";
import type { IndexerContext } from "../indexer/context";

export const registerAnalyticsRoutes = (app: FastifyInstance, context: IndexerContext, env: ApiRuntimeEnv) => {
  const store = context.analyticsStore;

  app.post("/analytics/events", async (request, reply): Promise<AnalyticsBatchResponse | { message: string }> => {
    if (!env.analyticsEnabled) {
      return reply.status(202).send({
        accepted: 0,
        stored: false,
      });
    }

    const parsed = analyticsBatchSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      logObservabilitySignal(app.log, {
        domain: "analytics",
        action: "ingest_batch",
        status: "failed",
        message: "Analytics batch was rejected.",
        route: "/analytics/events",
        requestId: request.id,
        count: 0,
        errorClass: "invalid_state",
      });

      return reply.status(400).send({
        message: "Analytics batch is invalid.",
      });
    }

    try {
      await store.append(parsed.data.events);
      logObservabilitySignal(app.log, {
        domain: "analytics",
        action: "ingest_batch",
        status: "succeeded",
        message: "Analytics batch stored.",
        route: "/analytics/events",
        requestId: request.id,
        count: parsed.data.events.length,
        metadata: {
          categories: parsed.data.events.map((event) => event.category).join(","),
        },
      });

      return {
        accepted: parsed.data.events.length,
        stored: true,
      };
    } catch (error) {
      logObservabilitySignal(app.log, {
        domain: "analytics",
        action: "ingest_batch",
        status: "failed",
        message: "Analytics batch storage failed.",
        route: "/analytics/events",
        requestId: request.id,
        count: parsed.data.events.length,
        errorClass: classifyObservedError(error),
      });

      return reply.status(503).send({
        message: "Analytics events could not be accepted right now.",
      });
    }
  });
};
