import type {
  ApiChainReadiness,
  ApiHealthSummary,
  EnvironmentCheckStatus,
  ReadinessCheck,
  ReleaseReadinessState,
  StagingReadinessSummary,
  SupportedChainId,
} from "@goal-vault/shared";

import type { ApiRuntimeEnv } from "../../env";

const createCheck = ({
  key,
  label,
  status,
  message,
}: {
  key: string;
  label: string;
  status: EnvironmentCheckStatus;
  message: string;
}): ReadinessCheck => ({
  key,
  label,
  status,
  message,
});

const getApiChainReadiness = (env: ApiRuntimeEnv, chainId: SupportedChainId): ApiChainReadiness => {
  const chain = env.chains[chainId];
  const rpcConfigured = Boolean(chain.rpcUrl);
  const factoryConfigured = Boolean(chain.factoryAddress);
  const checks = [
    createCheck({
      key: `rpc:${chainId}`,
      label: `RPC ${chainId}`,
      status: rpcConfigured ? "ready" : "blocked",
      message: rpcConfigured ? "RPC URL is configured." : "RPC URL is missing.",
    }),
    createCheck({
      key: `factory:${chainId}`,
      label: `Factory ${chainId}`,
      status: factoryConfigured ? "ready" : "blocked",
      message: factoryConfigured ? "Factory address is configured." : "Factory address is missing.",
    }),
  ];

  return {
    chainId,
    rpcConfigured,
    factoryConfigured,
    readsReady: rpcConfigured,
    writesReady: rpcConfigured && factoryConfigured,
    checks,
  };
};

const getSummaryStatus = (checks: ReadinessCheck[]): ApiHealthSummary["status"] => {
  if (checks.some((check) => check.status === "blocked")) {
    return "unavailable";
  }

  if (checks.some((check) => check.status === "warning")) {
    return "degraded";
  }

  return "healthy";
};

const getStagingStatus = (checks: ReadinessCheck[]): StagingReadinessSummary["status"] => {
  if (checks.some((check) => check.status === "blocked")) {
    return "blocked";
  }

  if (checks.some((check) => check.status === "warning")) {
    return "degraded";
  }

  return "ready";
};

export const buildApiHealthSummary = (env: ApiRuntimeEnv): ApiHealthSummary => {
  const chains = ([8453, 84532] as const).map((chainId) => getApiChainReadiness(env, chainId));
  const hasValidationErrors = env.validationErrors.length > 0;
  const checks = [
    createCheck({
      key: "app-environment",
      label: "Application environment",
      status: "ready",
      message: `API is running in ${env.environment}.`,
    }),
    createCheck({
      key: "env-validation",
      label: "Environment validation",
      status: hasValidationErrors ? "blocked" : "ready",
      message: hasValidationErrors ? env.validationErrors.join(" ") : "Environment values passed validation.",
    }),
    createCheck({
      key: "public-base-url",
      label: "Public API URL",
      status:
        env.environment === "development"
          ? env.publicBaseUrl
            ? "ready"
            : "warning"
          : env.publicBaseUrl
            ? "ready"
            : "blocked",
      message:
        env.publicBaseUrl
          ? `Public API URL is set to ${env.publicBaseUrl}.`
          : env.environment === "development"
            ? "Public API URL is optional during local development."
            : "Set API_PUBLIC_BASE_URL before staging or production deployment.",
    }),
    createCheck({
      key: "data-dir",
      label: "Persistent store",
      status: env.persistence.runtimeReady ? "ready" : "blocked",
      message:
        env.persistence.driver === "sqlite"
          ? `Indexer data will persist in SQLite under ${env.persistence.sqliteDataDir}.`
          : "PostgreSQL persistence is configured but the API runtime adapter is not implemented yet.",
    }),
    createCheck({
      key: "persistence-driver",
      label: "Persistence driver",
      status: env.persistence.runtimeReady ? "ready" : "blocked",
      message:
        env.persistence.driver === "sqlite"
          ? "SQLite is the active API persistence driver."
          : env.persistence.postgresUrlConfigured
            ? "PostgreSQL credentials are configured but blocked until the runtime adapter exists."
            : "PostgreSQL persistence requires API_DATABASE_URL and the runtime adapter before use.",
    }),
    createCheck({
      key: "persistence-capabilities",
      label: "Persistence capabilities",
      status:
        env.persistence.driver === "sqlite"
          ? env.persistence.capabilities.lifecycleShutdownReady
            ? "ready"
            : "blocked"
          : env.persistence.capabilities.postgresqlRuntimeReady
            ? "ready"
            : "blocked",
      message:
        env.persistence.driver === "sqlite"
          ? "SQLite runtime, async ports, store factory, and shutdown lifecycle are available."
          : env.persistence.capabilities.blockedReasons.join(" "),
    }),
    createCheck({
      key: "internal-routes",
      label: "Internal route protection",
      status:
        env.environment === "development"
          ? env.internalToken
            ? "ready"
            : "warning"
          : env.internalToken
            ? "ready"
            : "blocked",
      message:
        env.internalToken
          ? "Internal routes require the configured token."
          : env.environment === "development"
            ? "Internal routes are restricted to loopback traffic during local development."
            : "Set API_INTERNAL_TOKEN before exposing the API outside development.",
    }),
    createCheck({
      key: "indexer-mode",
      label: "Indexer mode",
      status: env.indexerEnabled ? "ready" : "warning",
      message: env.indexerEnabled
        ? env.syncIntervalMs > 0
          ? `Indexer sync loop is enabled every ${env.syncIntervalMs}ms.`
          : "Indexer sync loop is disabled by interval and requires manual runs."
        : "Indexer background sync is disabled. Enriched reads require manual sync runs.",
    }),
    ...chains.flatMap((chain) => chain.checks),
  ];
  const status = getSummaryStatus(checks);

  return {
    status,
    checkedAt: new Date().toISOString(),
    message:
      status === "healthy"
        ? "API configuration is ready."
        : status === "degraded"
          ? "API configuration is usable with warnings."
          : "API configuration is missing required values.",
    checks,
    chains,
  };
};

export const buildStagingReadinessSummary = (env: ApiRuntimeEnv): StagingReadinessSummary => {
  const sepolia = getApiChainReadiness(env, 84532);
  const checks = [
    createCheck({
      key: "staging-rpc",
      label: "Base Sepolia RPC",
      status: sepolia.rpcConfigured ? "ready" : "blocked",
      message: sepolia.rpcConfigured ? "Base Sepolia RPC is configured." : "Set EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL for staging.",
    }),
    createCheck({
      key: "staging-factory",
      label: "Base Sepolia factory",
      status: sepolia.factoryConfigured ? "ready" : "blocked",
      message:
        sepolia.factoryConfigured
          ? "Base Sepolia factory is configured."
          : "Set EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS for create, deposit, and withdraw smoke tests.",
    }),
    createCheck({
      key: "sync-interval",
      label: "Indexer sync loop",
      status: env.indexerEnabled && env.syncIntervalMs > 0 ? "ready" : "warning",
      message:
        env.indexerEnabled && env.syncIntervalMs > 0
          ? `Indexer sync loop is enabled every ${env.syncIntervalMs}ms.`
          : "Indexer sync loop is not running automatically. Manual syncs are required during staging.",
    }),
  ];
  const status = getStagingStatus(checks);

  return {
    status,
    message:
      status === "ready"
        ? "Base Sepolia smoke testing is ready."
        : status === "degraded"
          ? "Base Sepolia smoke testing is usable with manual steps."
          : "Base Sepolia smoke testing is blocked by missing configuration.",
    checks,
  };
};

export const buildReleaseReadinessSummary = (env: ApiRuntimeEnv): ReleaseReadinessState => {
  const expectedChain = env.environment === "production" ? getApiChainReadiness(env, 8453) : getApiChainReadiness(env, 84532);
  const checks = [
    {
      key: "deployment-url",
      label: "Public API URL",
      status:
        env.environment === "development"
          ? env.publicBaseUrl
            ? "ready"
            : "warning"
          : env.publicBaseUrl
            ? "ready"
            : "blocked",
      message:
        env.publicBaseUrl
          ? `API will publish at ${env.publicBaseUrl}.`
          : env.environment === "development"
            ? "Public API URL is optional during local development."
            : "Set API_PUBLIC_BASE_URL before launch.",
    },
    {
      key: "indexer-enabled",
      label: "Indexer readiness",
      status: env.indexerEnabled ? "ready" : "warning",
      message: env.indexerEnabled
        ? "Indexer background sync is enabled."
        : "Indexer background sync is disabled. Manual sync runs are required.",
    },
    {
      key: "persistence-driver",
      label: "Persistence driver",
      status: env.persistence.runtimeReady ? "ready" : "blocked",
      message:
        env.persistence.driver === "sqlite"
          ? "SQLite persistence is active for this API release."
          : "PostgreSQL persistence is not release-ready until the runtime adapter is implemented.",
    },
    {
      key: "persistence-capabilities",
      label: "Persistence capabilities",
      status:
        env.persistence.driver === "sqlite"
          ? env.persistence.capabilities.lifecycleShutdownReady
            ? "ready"
            : "blocked"
          : env.persistence.capabilities.postgresqlRuntimeReady
            ? "ready"
            : "blocked",
      message:
        env.persistence.driver === "sqlite"
          ? "Persistence ports, SQLite runtime, and lifecycle shutdown are ready."
          : env.persistence.capabilities.blockedReasons.join(" "),
    },
    {
      key: `launch-chain-${expectedChain.chainId}`,
      label: `${expectedChain.chainId} launch chain`,
      status: expectedChain.writesReady ? "ready" : expectedChain.readsReady ? "warning" : "blocked",
      message: expectedChain.writesReady
        ? "Launch chain has both RPC and factory configuration."
        : expectedChain.readsReady
          ? "Launch chain can read, but write flows still need the factory address."
          : "Launch chain is missing required RPC and contract configuration.",
    },
  ] satisfies ReleaseReadinessState["checks"];
  const status =
    checks.some((check) => check.status === "blocked")
      ? "blocked"
      : checks.some((check) => check.status === "warning")
        ? "degraded"
        : "ready";

  return {
    environment: env.environment,
    status,
    message:
      status === "ready"
        ? "Backend release configuration is ready."
        : status === "degraded"
          ? "Backend release configuration is usable with warnings."
          : "Backend release configuration is blocked by missing values.",
    checks,
  };
};
