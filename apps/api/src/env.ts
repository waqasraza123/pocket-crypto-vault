import path from "node:path";

import type { SupportedChainId } from "@pocket-vault/shared";
import type { Address } from "viem";
import { isAddress } from "viem";
import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalBooleanSchema = z
  .enum(["true", "false", "1", "0", "yes", "no"])
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalSecretSchema = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalAddressSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal("").transform(() => undefined))
  .refine((value) => !value || isAddress(value), "Expected a valid EVM address.");

const optionalPostgresqlIdentifierSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal("").transform(() => undefined))
  .refine((value) => !value || /^[a-z_][a-z0-9_]*$/.test(value), "Expected a lowercase PostgreSQL identifier.");

const runtimeEnvSchema = z.object({
  EXPO_PUBLIC_BASE_RPC_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_FACTORY_ADDRESS: optionalAddressSchema,
  EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS: optionalAddressSchema,
  API_HOST: z.string().trim().min(1).optional(),
  API_PORT: z.coerce.number().int().positive().optional(),
  API_PUBLIC_BASE_URL: optionalUrlSchema,
  API_DATA_DIR: z.string().trim().min(1).optional(),
  API_PERSISTENCE_DRIVER: z.enum(["sqlite", "postgresql"]).optional(),
  API_POSTGRES_DRIVER: z.enum(["pg", "neon"]).optional(),
  API_DATABASE_URL: optionalSecretSchema,
  API_PERSISTENCE_SCHEMA_NAME: optionalPostgresqlIdentifierSchema,
  API_SYNC_INTERVAL_MS: z.coerce.number().int().min(0).optional(),
  API_ENABLE_INDEXER: optionalBooleanSchema,
  API_ENABLE_ANALYTICS: optionalBooleanSchema,
  API_ENABLE_SUPPORT: optionalBooleanSchema,
  API_ROLLBACK_EVIDENCE_ACCEPTED: optionalBooleanSchema,
  API_SMOKE_EVIDENCE_ACCEPTED: optionalBooleanSchema,
  API_LIMITED_BETA_SCOPE_APPROVED: optionalBooleanSchema,
  API_INTERNAL_TOKEN: z.string().trim().min(1).optional(),
  API_SIGNED_REQUEST_MAX_AGE_SECONDS: z.coerce.number().int().positive().optional(),
  API_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
  API_BASE_START_BLOCK: z.coerce.number().int().min(0).optional(),
  API_BASE_SEPOLIA_START_BLOCK: z.coerce.number().int().min(0).optional(),
});

export interface ApiChainRuntimeConfig {
  chainId: SupportedChainId;
  rpcUrl: string | null;
  factoryAddress: Address | null;
  startBlock: number;
}

export interface ApiPersistenceRuntimeConfig {
  driver: "sqlite" | "postgresql";
  postgresqlDriver: "pg" | "neon";
  sqliteDataDir: string;
  postgresConnectionString?: string | null;
  postgresUrlConfigured: boolean;
  schemaName: string;
  capabilities: ApiPersistenceRuntimeCapabilities;
  runtimeReady: boolean;
  message: string;
}

export interface ApiPersistenceRuntimeCapabilities {
  sqliteRuntimeReady: boolean;
  asyncStorePortsReady: boolean;
  postgresqlStoreCoreReady: boolean;
  postgresqlTransactionBoundaryReady: boolean;
  postgresqlPooledExecutorBoundaryReady: boolean;
  lifecycleShutdownReady: boolean;
  postgresqlDriverAdapterReady: boolean;
  neonPostgresqlDriverAdapterReady: boolean;
  postgresqlFactoryWiringReady: boolean;
  postgresqlPreflightConnectionCheckReady: boolean;
  postgresqlRuntimeReady: boolean;
  blockedReasons: string[];
}

export interface ApiRuntimeEnv {
  environment: "development" | "staging" | "production";
  deploymentTarget: "local" | "staging" | "production";
  host: string;
  port: number;
  version: string;
  publicBaseUrl: string | null;
  dataDir: string;
  persistence: ApiPersistenceRuntimeConfig;
  syncIntervalMs: number;
  indexerEnabled: boolean;
  analyticsEnabled: boolean;
  supportEnabled: boolean;
  rollbackEvidenceAccepted: boolean;
  smokeEvidenceAccepted: boolean;
  limitedBetaScopeApproved: boolean;
  internalToken: string | null;
  signedRequestMaxAgeSeconds: number;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  chains: Record<SupportedChainId, ApiChainRuntimeConfig>;
  validationErrors: string[];
}

const resolveEnvironment = (source: Record<string, string | undefined>): ApiRuntimeEnv["environment"] => {
  const appEnv = source.EXPO_PUBLIC_APP_ENV || source.APP_ENV || source.NODE_ENV;

  if (appEnv === "staging") {
    return "staging";
  }

  if (appEnv === "production") {
    return "production";
  }

  return "development";
};

const resolveDeploymentTarget = (
  environment: ApiRuntimeEnv["environment"],
): ApiRuntimeEnv["deploymentTarget"] => (environment === "development" ? "local" : environment);

const parseBoolean = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  return ["true", "1", "yes"].includes(value);
};

export const createApiPersistenceRuntimeCapabilities = (): ApiPersistenceRuntimeCapabilities => {
  const postgresqlDriverAdapterReady = true;
  const neonPostgresqlDriverAdapterReady = true;
  const postgresqlFactoryWiringReady = true;
  const postgresqlPreflightConnectionCheckReady = true;
  const postgresqlRuntimeReady =
    postgresqlDriverAdapterReady && postgresqlFactoryWiringReady && postgresqlPreflightConnectionCheckReady;

  return {
    sqliteRuntimeReady: true,
    asyncStorePortsReady: true,
    postgresqlStoreCoreReady: true,
    postgresqlTransactionBoundaryReady: true,
    postgresqlPooledExecutorBoundaryReady: true,
    lifecycleShutdownReady: true,
    postgresqlDriverAdapterReady,
    neonPostgresqlDriverAdapterReady,
    postgresqlFactoryWiringReady,
    postgresqlPreflightConnectionCheckReady,
    postgresqlRuntimeReady,
    blockedReasons: postgresqlRuntimeReady
      ? []
      : [
          "PostgreSQL driver adapter is not ready.",
          "PostgreSQL store factory wiring is not ready.",
          "PostgreSQL preflight connection checks are not ready.",
        ],
  };
};

const createPersistenceRuntimeConfig = ({
  driver,
  postgresqlDriver,
  sqliteDataDir,
  postgresConnectionString,
  postgresUrlConfigured,
  schemaName,
}: {
  driver: "sqlite" | "postgresql";
  postgresqlDriver: "pg" | "neon";
  sqliteDataDir: string;
  postgresConnectionString: string | null;
  postgresUrlConfigured: boolean;
  schemaName: string;
}): ApiPersistenceRuntimeConfig => {
  const capabilities = createApiPersistenceRuntimeCapabilities();

  if (driver === "postgresql") {
    return {
      driver,
      postgresqlDriver,
      sqliteDataDir,
      postgresConnectionString,
      postgresUrlConfigured,
      schemaName,
      capabilities,
      runtimeReady: capabilities.postgresqlRuntimeReady && postgresUrlConfigured,
      message:
        capabilities.postgresqlRuntimeReady && postgresUrlConfigured
          ? `PostgreSQL persistence is active through the ${postgresqlDriver} driver.`
          : "PostgreSQL persistence requires API_DATABASE_URL and runtime capabilities before use.",
    };
  }

  return {
    driver,
    postgresqlDriver,
    sqliteDataDir,
    postgresConnectionString,
    postgresUrlConfigured,
    schemaName,
    capabilities,
    runtimeReady: true,
    message: "SQLite persistence is active.",
  };
};

const isLocalUrl = (value: string | null) => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
};

export const readApiRuntimeEnv = (
  source: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): ApiRuntimeEnv => {
  const parsed = runtimeEnvSchema.safeParse(source);
  const environment = resolveEnvironment(source);
  const deploymentTarget = resolveDeploymentTarget(environment);
  const validationErrors: string[] = [];

  if (source.APP_ENV && source.EXPO_PUBLIC_APP_ENV && source.APP_ENV !== source.EXPO_PUBLIC_APP_ENV) {
    validationErrors.push("APP_ENV and EXPO_PUBLIC_APP_ENV must match when both are set.");
  }

  if (!parsed.success) {
    validationErrors.push(...parsed.error.issues.map((issue) => issue.message));

    return {
      environment,
      deploymentTarget,
      host: "127.0.0.1",
      port: 3001,
      version: source.npm_package_version?.trim() || "0.1.0",
      publicBaseUrl: null,
      dataDir: path.resolve(process.cwd(), ".data"),
      persistence: createPersistenceRuntimeConfig({
        driver: "sqlite",
        postgresqlDriver: source.API_POSTGRES_DRIVER === "neon" ? "neon" : "pg",
        sqliteDataDir: path.resolve(process.cwd(), ".data"),
        postgresConnectionString: source.API_DATABASE_URL?.trim() || null,
        postgresUrlConfigured: Boolean(source.API_DATABASE_URL?.trim()),
        schemaName: "goal_vault_api",
      }),
      syncIntervalMs: 30_000,
      indexerEnabled: true,
      analyticsEnabled: true,
      supportEnabled: true,
      rollbackEvidenceAccepted: false,
      smokeEvidenceAccepted: false,
      limitedBetaScopeApproved: false,
      internalToken: null,
      signedRequestMaxAgeSeconds: 900,
      logLevel: "info",
      chains: {
        8453: {
          chainId: 8453,
          rpcUrl: null,
          factoryAddress: null,
          startBlock: 0,
        },
        84532: {
          chainId: 84532,
          rpcUrl: null,
          factoryAddress: null,
          startBlock: 0,
        },
      },
      validationErrors,
    };
  }

  const publicBaseUrl = parsed.data.API_PUBLIC_BASE_URL || null;
  const dataDir = parsed.data.API_DATA_DIR || path.resolve(process.cwd(), ".data");
  const persistence = createPersistenceRuntimeConfig({
    driver: parsed.data.API_PERSISTENCE_DRIVER || "sqlite",
    postgresqlDriver: parsed.data.API_POSTGRES_DRIVER || "pg",
    sqliteDataDir: dataDir,
    postgresConnectionString: parsed.data.API_DATABASE_URL || null,
    postgresUrlConfigured: Boolean(parsed.data.API_DATABASE_URL),
    schemaName: parsed.data.API_PERSISTENCE_SCHEMA_NAME || "goal_vault_api",
  });
  const rpcUrls = {
    8453: parsed.data.EXPO_PUBLIC_BASE_RPC_URL || null,
    84532: parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL || null,
  } satisfies Record<SupportedChainId, string | null>;
  const factoryAddresses = {
    8453: (parsed.data.EXPO_PUBLIC_BASE_FACTORY_ADDRESS as Address | undefined) || null,
    84532: (parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS as Address | undefined) || null,
  } satisfies Record<SupportedChainId, Address | null>;

  if (environment !== "development" && !publicBaseUrl) {
    validationErrors.push("API_PUBLIC_BASE_URL is required for staging and production deployment.");
  }

  if (environment !== "development" && publicBaseUrl && !publicBaseUrl.startsWith("https://")) {
    validationErrors.push("API_PUBLIC_BASE_URL must use https outside development.");
  }

  if (environment === "production" && isLocalUrl(publicBaseUrl)) {
    validationErrors.push("API_PUBLIC_BASE_URL cannot point to localhost in production.");
  }

  if (environment !== "development" && !parsed.data.API_INTERNAL_TOKEN) {
    validationErrors.push("API_INTERNAL_TOKEN is required outside development.");
  }

  if (persistence.driver === "postgresql") {
    if (!persistence.postgresUrlConfigured) {
      validationErrors.push("API_DATABASE_URL is required when API_PERSISTENCE_DRIVER=postgresql.");
    }
  } else {
    if (parsed.data.API_DATABASE_URL) {
      validationErrors.push("API_DATABASE_URL must not be configured unless API_PERSISTENCE_DRIVER=postgresql.");
    }

    if (parsed.data.API_POSTGRES_DRIVER) {
      validationErrors.push("API_POSTGRES_DRIVER must not be configured unless API_PERSISTENCE_DRIVER=postgresql.");
    }

    if (parsed.data.API_PERSISTENCE_SCHEMA_NAME) {
      validationErrors.push("API_PERSISTENCE_SCHEMA_NAME must not be configured unless API_PERSISTENCE_DRIVER=postgresql.");
    }
  }

  if (environment === "production" && persistence.driver !== "postgresql") {
    validationErrors.push("Production activation requires API_PERSISTENCE_DRIVER=postgresql.");
  }

  return {
    environment,
    deploymentTarget,
    host: parsed.data.API_HOST || "127.0.0.1",
    port: parsed.data.API_PORT ?? 3001,
    version: source.npm_package_version?.trim() || "0.1.0",
    publicBaseUrl,
    dataDir,
    persistence,
    syncIntervalMs: parsed.data.API_SYNC_INTERVAL_MS ?? 30_000,
    indexerEnabled: parseBoolean(parsed.data.API_ENABLE_INDEXER) ?? true,
    analyticsEnabled: parseBoolean(parsed.data.API_ENABLE_ANALYTICS) ?? true,
    supportEnabled: parseBoolean(parsed.data.API_ENABLE_SUPPORT) ?? true,
    rollbackEvidenceAccepted: parseBoolean(parsed.data.API_ROLLBACK_EVIDENCE_ACCEPTED) ?? false,
    smokeEvidenceAccepted: parseBoolean(parsed.data.API_SMOKE_EVIDENCE_ACCEPTED) ?? false,
    limitedBetaScopeApproved: parseBoolean(parsed.data.API_LIMITED_BETA_SCOPE_APPROVED) ?? false,
    internalToken: parsed.data.API_INTERNAL_TOKEN ?? null,
    signedRequestMaxAgeSeconds: parsed.data.API_SIGNED_REQUEST_MAX_AGE_SECONDS ?? 900,
    logLevel: parsed.data.API_LOG_LEVEL || "info",
    chains: {
      8453: {
        chainId: 8453,
        rpcUrl: rpcUrls[8453],
        factoryAddress: factoryAddresses[8453],
        startBlock: parsed.data.API_BASE_START_BLOCK ?? 0,
      },
      84532: {
        chainId: 84532,
        rpcUrl: rpcUrls[84532],
        factoryAddress: factoryAddresses[84532],
        startBlock: parsed.data.API_BASE_SEPOLIA_START_BLOCK ?? 0,
      },
    },
    validationErrors,
  };
};
