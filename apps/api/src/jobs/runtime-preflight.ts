import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SupportedChainId } from "@pocket-vault/shared";

import { readApiRuntimeEnv, type ApiPersistenceRuntimeCapabilities } from "../env";
import { buildProductionActivationReadinessSummary } from "../modules/health/readiness.service";
import {
  checkPostgresqlConnection,
  checkPostgresqlSchema,
  createPostgresqlQueryExecutor,
} from "../modules/persistence/postgresql-driver";

type PreflightStatus = "valid" | "invalid";

interface ChainPreflightReport {
  chainId: SupportedChainId;
  role: "primary" | "secondary";
  rpcConfigured: boolean;
  factoryConfigured: boolean;
  factoryAddress: string | null;
  startBlock: number;
}

interface RuntimePreflightReport {
  app: "pocket-vault";
  component: "api";
  status: PreflightStatus;
  generatedAt: string;
  environment: string;
  deploymentTarget: string;
  version: string;
  publicBaseUrl: string | null;
  host: string;
  port: number;
  dataDir: string;
  dataDirExists: boolean;
  persistence: {
    driver: "sqlite" | "postgresql";
    postgresqlDriver: "pg" | "neon";
    sqliteDataDir: string;
    postgresUrlConfigured: boolean;
    schemaName: string;
    capabilities: ApiPersistenceRuntimeCapabilities;
    runtimeReady: boolean;
    message: string;
    connectionCheck: "skipped" | "passed" | "failed";
    schemaCheck: "skipped" | "passed" | "failed";
    missingTables: string[];
  };
  syncIntervalMs: number;
  indexerEnabled: boolean;
  analyticsEnabled: boolean;
  supportEnabled: boolean;
  rollbackEvidenceAccepted: boolean;
  smokeEvidenceAccepted: boolean;
  limitedBetaScopeApproved: boolean;
  internalTokenConfigured: boolean;
  signedRequestMaxAgeSeconds: number;
  logLevel: string;
  primaryChainId: SupportedChainId | null;
  chains: ChainPreflightReport[];
  productionActivation: ReturnType<typeof buildProductionActivationReadinessSummary>;
  validationErrors: string[];
}

const resolveRepositoryRoot = (startDirectory: string) => {
  let currentDirectory = startDirectory;

  while (currentDirectory !== path.dirname(currentDirectory)) {
    if (existsSync(path.join(currentDirectory, "pnpm-workspace.yaml"))) {
      return currentDirectory;
    }

    currentDirectory = path.dirname(currentDirectory);
  }

  return startDirectory;
};

const resolveOutputPath = () => {
  if (process.env.API_PREFLIGHT_OUTPUT?.trim()) {
    const configuredOutputPath = process.env.API_PREFLIGHT_OUTPUT.trim();

    if (path.isAbsolute(configuredOutputPath)) {
      return configuredOutputPath;
    }

    return path.join(resolveRepositoryRoot(process.cwd()), configuredOutputPath);
  }

  return path.join(resolveRepositoryRoot(process.cwd()), "artifacts", "pocket-vault-api-preflight.json");
};

const resolvePrimaryChainId = (environment: string): SupportedChainId | null => {
  if (environment === "production") {
    return 8453;
  }

  if (environment === "staging") {
    return 84532;
  }

  return null;
};

const buildRuntimePreflightReport = async (): Promise<RuntimePreflightReport> => {
  const env = readApiRuntimeEnv();
  const primaryChainId = resolvePrimaryChainId(env.environment);
  const validationErrors = [...env.validationErrors];
  let connectionCheck: RuntimePreflightReport["persistence"]["connectionCheck"] = "skipped";
  let schemaCheck: RuntimePreflightReport["persistence"]["schemaCheck"] = "skipped";
  let missingTables: string[] = [];

  if (env.persistence.driver === "postgresql" && env.persistence.postgresConnectionString) {
    const queryExecutor = createPostgresqlQueryExecutor({
      connectionString: env.persistence.postgresConnectionString,
      driver: env.persistence.postgresqlDriver,
    });

    try {
      await checkPostgresqlConnection(queryExecutor);
      connectionCheck = "passed";

      const schemaResult = await checkPostgresqlSchema(queryExecutor, env.persistence.schemaName);
      missingTables = schemaResult.missingTables;
      schemaCheck = schemaResult.ready ? "passed" : "failed";

      if (!schemaResult.ready) {
        validationErrors.push(`PostgreSQL schema is missing tables: ${schemaResult.missingTables.join(", ")}.`);
      }
    } catch (error) {
      connectionCheck = "failed";
      schemaCheck = "failed";
      validationErrors.push(error instanceof Error ? error.message : "PostgreSQL preflight connection check failed.");
    } finally {
      await queryExecutor.close();
    }
  }

  if (primaryChainId) {
    const primaryChain = env.chains[primaryChainId];

    if (!primaryChain.rpcUrl) {
      validationErrors.push(`RPC URL is required for primary chain ${primaryChainId}.`);
    }

    if (!primaryChain.factoryAddress) {
      validationErrors.push(`Factory address is required for primary chain ${primaryChainId}.`);
    }
  }

  const chains = Object.values(env.chains)
    .sort((left, right) => left.chainId - right.chainId)
    .map((chain): ChainPreflightReport => ({
      chainId: chain.chainId,
      role: chain.chainId === primaryChainId ? "primary" : "secondary",
      rpcConfigured: Boolean(chain.rpcUrl),
      factoryConfigured: Boolean(chain.factoryAddress),
      factoryAddress: chain.factoryAddress,
      startBlock: chain.startBlock,
    }));
  const productionActivation = buildProductionActivationReadinessSummary(env);

  return {
    app: "pocket-vault",
    component: "api",
    status: validationErrors.length > 0 ? "invalid" : "valid",
    generatedAt: new Date().toISOString(),
    environment: env.environment,
    deploymentTarget: env.deploymentTarget,
    version: env.version,
    publicBaseUrl: env.publicBaseUrl,
    host: env.host,
    port: env.port,
    dataDir: env.dataDir,
    dataDirExists: existsSync(env.dataDir),
    persistence: {
      driver: env.persistence.driver,
      postgresqlDriver: env.persistence.postgresqlDriver,
      sqliteDataDir: env.persistence.sqliteDataDir,
      postgresUrlConfigured: env.persistence.postgresUrlConfigured,
      schemaName: env.persistence.schemaName,
      capabilities: env.persistence.capabilities,
      runtimeReady: env.persistence.runtimeReady,
      message: env.persistence.message,
      connectionCheck,
      schemaCheck,
      missingTables,
    },
    syncIntervalMs: env.syncIntervalMs,
    indexerEnabled: env.indexerEnabled,
    analyticsEnabled: env.analyticsEnabled,
    supportEnabled: env.supportEnabled,
    rollbackEvidenceAccepted: env.rollbackEvidenceAccepted,
    smokeEvidenceAccepted: env.smokeEvidenceAccepted,
    limitedBetaScopeApproved: env.limitedBetaScopeApproved,
    internalTokenConfigured: Boolean(env.internalToken),
    signedRequestMaxAgeSeconds: env.signedRequestMaxAgeSeconds,
    logLevel: env.logLevel,
    primaryChainId,
    chains,
    productionActivation,
    validationErrors,
  };
};

const writeRuntimePreflightReport = async (report: RuntimePreflightReport) => {
  const outputPath = resolveOutputPath();

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  return outputPath;
};

const main = async () => {
  const report = await buildRuntimePreflightReport();
  const outputPath = await writeRuntimePreflightReport(report);

  console.log(JSON.stringify(report, null, 2));
  console.log(`API runtime preflight report written to ${outputPath}`);

  if (report.status === "invalid") {
    process.exitCode = 1;
  }
};

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown API runtime preflight failure.";
  console.error(message);
  process.exitCode = 1;
});
