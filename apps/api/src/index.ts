import { buildApp } from "./app";
import { readApiRuntimeEnv } from "./env";
import { logObservabilitySignal } from "./lib/observability/logger";
import { createIndexerContext } from "./modules/indexer/context";
import { runFullIndexerSync } from "./modules/indexer/indexer.routes";

const start = async () => {
  const env = readApiRuntimeEnv();

  if (env.validationErrors.length > 0) {
    const error = new Error(`Pocket Vault API cannot start with invalid configuration: ${env.validationErrors.join(" ")}`);
    console.error(error.message);
    process.exit(1);
  }

  const context = await createIndexerContext(env);
  const app = buildApp({ context, env });
  let syncTimer: NodeJS.Timeout | null = null;
  const runSync = async () => {
    try {
      logObservabilitySignal(app.log, {
        domain: "indexer",
        action: "full_sync",
        status: "started",
        message: "Pocket Vault indexer sync started.",
      });
      await runFullIndexerSync(context);
      logObservabilitySignal(app.log, {
        domain: "indexer",
        action: "full_sync",
        status: "succeeded",
        message: "Pocket Vault indexer sync completed.",
      });
    } catch (error) {
      app.log.error(error, "Pocket Vault indexer sync failed.");
    }
  };
  const closeApp = async (signal: NodeJS.Signals) => {
    try {
      app.log.info({ signal }, "Pocket Vault API shutting down.");
      await app.close();
      process.exit(0);
    } catch (error) {
      app.log.error(error, "Pocket Vault API shutdown failed.");
      process.exit(1);
    }
  };

  app.addHook("onClose", async () => {
    if (!syncTimer) {
      return;
    }

    clearInterval(syncTimer);
    syncTimer = null;
  });

  process.once("SIGINT", () => {
    void closeApp("SIGINT");
  });
  process.once("SIGTERM", () => {
    void closeApp("SIGTERM");
  });

  app.log.info(
    {
      environment: env.environment,
      deploymentTarget: env.deploymentTarget,
      publicBaseUrl: env.publicBaseUrl,
      indexerEnabled: env.indexerEnabled,
      analyticsEnabled: env.analyticsEnabled,
      supportEnabled: env.supportEnabled,
      persistenceDriver: env.persistence.driver,
      postgresqlDriver: env.persistence.postgresqlDriver,
      postgresPersistenceConfigured: env.persistence.postgresUrlConfigured,
      persistenceSchemaName: env.persistence.schemaName,
      syncIntervalMs: env.syncIntervalMs,
      chains: Object.values(env.chains).map((chain) => ({
        chainId: chain.chainId,
        rpcConfigured: Boolean(chain.rpcUrl),
        factoryConfigured: Boolean(chain.factoryAddress),
        startBlock: chain.startBlock,
      })),
    },
    "Pocket Vault API starting.",
  );

  if (env.indexerEnabled && env.syncIntervalMs > 0) {
    void runSync();
    syncTimer = setInterval(() => {
      void runSync();
    }, env.syncIntervalMs).unref();
  } else if (!env.indexerEnabled) {
    app.log.warn("Pocket Vault indexer loop is disabled. Manual syncs are required.");
  } else {
    app.log.warn("Pocket Vault indexer loop is disabled by sync interval. Manual syncs are required.");
  }

  await app.listen({
    host: env.host,
    port: env.port,
  });
};

void start();
