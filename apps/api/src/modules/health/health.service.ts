import type { HealthStatus } from "@pocket-vault/shared";
import type { ServiceHealthResponse } from "@pocket-vault/api-client";

import type { ApiRuntimeEnv } from "../../env";
import type { IndexerContext } from "../indexer/context";
import { getChainSyncStatuses } from "../indexer/sync-state.service";
import {
  buildApiHealthSummary,
  buildProductionActivationReadinessSummary,
  buildReleaseReadinessSummary,
  buildStagingReadinessSummary,
} from "./readiness.service";

export const getServiceHealthStatus = ({ env }: { env: ApiRuntimeEnv }): ServiceHealthResponse => ({
  ok: true,
  checkedAt: new Date().toISOString(),
  service: "pocket-vault-api",
  environment: env.environment,
  deploymentTarget: env.deploymentTarget,
  indexerEnabled: env.indexerEnabled,
  supportEnabled: env.supportEnabled,
  persistenceDriver: env.persistence.driver,
  version: env.version,
  readyPath: "/ready",
});

export const getReadinessStatus = async ({
  context,
  env,
}: {
  context: IndexerContext;
  env: ApiRuntimeEnv;
}): Promise<HealthStatus> => {
  const chainSync = await getChainSyncStatuses(context);
  const syncHasErrors = chainSync.some((item) => item.lifecycle === "error");
  const syncIsLagging = chainSync.some((item) => item.freshness === "lagging");
  const baseApiHealth = buildApiHealthSummary(env);
  const api: HealthStatus["api"] =
    syncHasErrors || syncIsLagging
      ? {
          ...baseApiHealth,
          status: baseApiHealth.status === "unavailable" ? "unavailable" : "degraded",
          message: syncHasErrors
            ? "Indexer sync is reporting errors."
            : syncIsLagging
              ? "Indexer sync is behind chain truth."
              : baseApiHealth.message,
        }
      : baseApiHealth;

  return {
    ok: api.status !== "unavailable",
    checkedAt: new Date().toISOString(),
    environment: env.environment,
    chainSync,
    api,
    staging: buildStagingReadinessSummary(env),
    release: buildReleaseReadinessSummary(env),
    productionActivation: buildProductionActivationReadinessSummary(env, chainSync),
    validationErrors: env.validationErrors,
  };
};
