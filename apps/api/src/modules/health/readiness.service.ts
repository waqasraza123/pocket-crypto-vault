import type {
  ApiChainReadiness,
  ApiHealthSummary,
  ChainSyncStatus,
  EnvironmentCheckStatus,
  ProductionActivationGate,
  ProductionActivationReadinessState,
  ReadinessCheck,
  ReleaseReadinessState,
  StagingReadinessSummary,
  SupportedChainId,
} from "@pocket-vault/shared";

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

const getProductionActivationStatus = (
  gates: ProductionActivationGate[],
): ProductionActivationReadinessState["status"] => {
  if (gates.some((gate) => gate.status === "blocked")) {
    return "blocked";
  }

  if (gates.some((gate) => gate.status === "warning")) {
    return "degraded";
  }

  return "ready";
};

const getProductionActivationMessage = (status: ProductionActivationReadinessState["status"]) => {
  if (status === "ready") {
    return "Production activation gates are ready for controlled limited-beta traffic.";
  }

  if (status === "degraded") {
    return "Production activation still needs operator evidence before limited beta opens.";
  }

  return "Production activation is blocked by runtime, database, chain, or operational gate failures.";
};

const hasCurrentOrSyncingPrimarySync = (chainSync: ChainSyncStatus[] | undefined, primaryChainId: SupportedChainId) => {
  if (!chainSync) {
    return true;
  }

  if (chainSync.length === 0) {
    return false;
  }

  return chainSync.some(
    (item) =>
      item.chainId === primaryChainId &&
      item.lifecycle !== "error" &&
      (item.freshness === "current" || item.freshness === "syncing"),
  );
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
          : env.persistence.runtimeReady
            ? `Indexer data will persist in PostgreSQL schema ${env.persistence.schemaName} through ${env.persistence.postgresqlDriver}.`
            : "PostgreSQL persistence is configured but not runtime-ready.",
    }),
    createCheck({
      key: "persistence-driver",
      label: "Persistence driver",
      status: env.persistence.runtimeReady ? "ready" : "blocked",
      message:
        env.persistence.driver === "sqlite"
          ? "SQLite is the active API persistence driver."
          : env.persistence.postgresUrlConfigured
            ? `PostgreSQL is the active API persistence driver through ${env.persistence.postgresqlDriver}.`
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
          : env.persistence.runtimeReady
            ? `PostgreSQL persistence is active for this API release through ${env.persistence.postgresqlDriver}.`
            : "PostgreSQL persistence is not release-ready until API_DATABASE_URL and runtime capabilities are configured.",
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

export const buildProductionActivationReadinessSummary = (
  env: ApiRuntimeEnv,
  chainSync?: ChainSyncStatus[],
): ProductionActivationReadinessState => {
  const primaryChainId = env.environment === "production" ? 8453 : 84532;
  const primaryChain = getApiChainReadiness(env, primaryChainId);
  const hasValidationErrors = env.validationErrors.length > 0;
  const productionDatabaseSelected = env.persistence.driver === "postgresql";
  const databaseCutoverReady =
    productionDatabaseSelected && env.persistence.runtimeReady && env.persistence.postgresUrlConfigured;
  const supportReady = env.supportEnabled && env.persistence.runtimeReady;
  const analyticsReady = env.analyticsEnabled && env.persistence.runtimeReady;
  const smokePrerequisitesReady = env.environment === "production" && databaseCutoverReady && primaryChain.writesReady;
  const primarySyncReady =
    env.environment === "development" || !env.indexerEnabled
      ? true
      : hasCurrentOrSyncingPrimarySync(chainSync, primaryChainId);
  const gates: ProductionActivationGate[] = [
    {
      key: "code-ready",
      area: "code",
      status: hasValidationErrors ? "blocked" : "ready",
      message: hasValidationErrors
        ? `Resolve runtime validation errors: ${env.validationErrors.join(" ")}`
        : "Runtime configuration validates without ambiguous mixed modes.",
    },
    {
      key: "database-selected",
      area: "database",
      status: env.environment === "production" ? (productionDatabaseSelected ? "ready" : "blocked") : productionDatabaseSelected ? "ready" : "warning",
      message: productionDatabaseSelected
        ? `PostgreSQL persistence is selected through ${env.persistence.postgresqlDriver}.`
        : env.environment === "production"
          ? "Production activation requires PostgreSQL persistence before limited beta traffic."
          : "SQLite remains available for local or staging rehearsal only.",
    },
    {
      key: "database-runtime",
      area: "database",
      status: databaseCutoverReady ? "ready" : productionDatabaseSelected ? "blocked" : "warning",
      message: databaseCutoverReady
        ? `PostgreSQL runtime is configured for schema ${env.persistence.schemaName}.`
        : productionDatabaseSelected
          ? "PostgreSQL runtime still needs credentials, schema readiness, and successful startup checks."
          : "Database cutover is not active in SQLite mode.",
    },
    {
      key: "chain-config",
      area: "chain",
      status: primaryChain.writesReady ? "ready" : primaryChain.readsReady ? "warning" : "blocked",
      message: primaryChain.writesReady
        ? `Primary chain ${primaryChainId} has RPC and factory configuration.`
        : primaryChain.readsReady
          ? `Primary chain ${primaryChainId} can read but cannot support create/deposit/withdraw smoke without a factory address.`
          : `Primary chain ${primaryChainId} is missing RPC and factory configuration.`,
    },
    {
      key: "indexer-ready",
      area: "indexer",
      status: env.indexerEnabled && env.syncIntervalMs > 0 && primarySyncReady ? "ready" : "warning",
      message:
        env.indexerEnabled && env.syncIntervalMs > 0
          ? primarySyncReady
            ? "Indexer persistence and sync posture are ready for launch monitoring."
            : "Indexer is enabled, but primary-chain sync evidence is not current yet."
          : "Indexer background sync is not automatic; operators must run manual syncs during activation.",
    },
    {
      key: "internal-token",
      area: "security",
      status: env.environment === "development" ? (env.internalToken ? "ready" : "warning") : env.internalToken ? "ready" : "blocked",
      message: env.internalToken
        ? "Internal API routes are token protected."
        : env.environment === "development"
          ? "Local development may rely on loopback internal access."
          : "Production and staging require API_INTERNAL_TOKEN before activation.",
    },
    {
      key: "support-ready",
      area: "support",
      status: supportReady ? "ready" : "blocked",
      message: supportReady
        ? "Support intake and internal triage persistence are enabled."
        : "Support intake must be enabled and backed by the active persistence runtime for beta.",
    },
    {
      key: "analytics-ready",
      area: "analytics",
      status: analyticsReady ? "ready" : "warning",
      message: analyticsReady
        ? "Analytics persistence is enabled for post-launch monitoring."
        : "Analytics is disabled; beta monitoring must use alternate evidence.",
    },
    {
      key: "protected-smoke-ready",
      area: "smoke",
      status: smokePrerequisitesReady && env.smokeEvidenceAccepted ? "ready" : smokePrerequisitesReady ? "warning" : "blocked",
      message:
        smokePrerequisitesReady && env.smokeEvidenceAccepted
          ? "Protected live smoke evidence is accepted for this runtime."
          : smokePrerequisitesReady
            ? "Protected live smoke prerequisites are present; record accepted smoke evidence before beta traffic."
            : "Protected live smoke still needs production database and primary-chain write readiness.",
    },
    {
      key: "rollback-ready",
      area: "rollback",
      status: env.rollbackEvidenceAccepted ? "ready" : "blocked",
      message: env.rollbackEvidenceAccepted
        ? "Rollback URL, image, snapshot, and traffic reversal evidence are accepted for this runtime."
        : "Confirm rollback URL, image, snapshot, and traffic reversal artifacts before beta.",
    },
    {
      key: "limited-beta-scope",
      area: "beta",
      status: env.limitedBetaScopeApproved ? "ready" : "blocked",
      message: env.limitedBetaScopeApproved
        ? "Limited beta audience, value limits, support owner, and monitoring window are approved."
        : "Approve participant limit, value limit, support owner, monitoring window, and pause criteria before opening beta.",
    },
  ];
  const status = getProductionActivationStatus(gates);
  const rollbackReady = gates.find((gate) => gate.key === "rollback-ready")?.status === "ready";
  const protectedSmokeReady = gates.find((gate) => gate.key === "protected-smoke-ready")?.status === "ready";
  const safeForLimitedBetaTraffic =
    status === "ready" && databaseCutoverReady && supportReady && analyticsReady && protectedSmokeReady && rollbackReady;

  return {
    environment: env.environment,
    deploymentTarget: env.deploymentTarget,
    status,
    safeForLimitedBetaTraffic,
    productionDatabaseSelected,
    databaseCutoverReady,
    rollbackReady,
    protectedSmokeReady,
    supportReady,
    analyticsReady,
    message: getProductionActivationMessage(status),
    gates,
  };
};
