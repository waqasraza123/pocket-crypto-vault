import type { HealthStatus } from "@goal-vault/shared";
import type { ServiceHealthResponse } from "@goal-vault/api-client";

import type { ApiRuntimeEnv } from "../../env";
import type { IndexerContext } from "../indexer/context";
import { getChainSyncStatuses } from "../indexer/sync-state.service";
import { buildApiHealthSummary, buildReleaseReadinessSummary, buildStagingReadinessSummary } from "./readiness.service";

export const getServiceHealthStatus = ({ env }: { env: ApiRuntimeEnv }): ServiceHealthResponse => ({
  ok: true,
  checkedAt: new Date().toISOString(),
  service: "goal-vault-api",
  environment: env.environment,
  deploymentTarget: env.deploymentTarget,
  indexerEnabled: env.indexerEnabled,
  persistenceDriver: env.persistence.driver,
  version: env.version,
  readyPath: "/ready",
});

export const getReadinessStatus = ({
  context,
  env,
}: {
  context: IndexerContext;
  env: ApiRuntimeEnv;
}): HealthStatus => {
  const chainSync = getChainSyncStatuses(context);
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
    validationErrors: env.validationErrors,
  };
};
