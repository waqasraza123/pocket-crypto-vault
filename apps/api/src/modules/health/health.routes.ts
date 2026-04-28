import type { FastifyInstance } from "fastify";

import type { HealthResponse, ServiceHealthResponse } from "@pocket-vault/api-client";

import type { ApiRuntimeEnv } from "../../env";
import type { IndexerContext } from "../indexer/context";
import { getReadinessStatus, getServiceHealthStatus } from "./health.service";

export const registerHealthRoutes = (app: FastifyInstance, context: IndexerContext, env: ApiRuntimeEnv) => {
  app.get("/health", async (): Promise<ServiceHealthResponse> => getServiceHealthStatus({ env }));
  app.get("/ready", async (): Promise<HealthResponse> => getReadinessStatus({ context, env }));
};
