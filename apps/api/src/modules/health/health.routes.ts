import type { FastifyInstance } from "fastify";

import type { HealthResponse } from "@goal-vault/api-client";

import type { IndexerContext } from "../indexer/context";
import { getChainSyncStatuses } from "../indexer/sync-state.service";

export const registerHealthRoutes = (app: FastifyInstance, context: IndexerContext) => {
  app.get("/health", async (): Promise<HealthResponse> => ({
    ok: true,
    checkedAt: new Date().toISOString(),
    chainSync: getChainSyncStatuses(context),
  }));
};
