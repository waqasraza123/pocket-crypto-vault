import { buildApp } from "./app";
import { readApiRuntimeEnv } from "./env";
import { logObservabilitySignal } from "./lib/observability/logger";
import { createIndexerContext } from "./modules/indexer/context";
import { runFullIndexerSync } from "./modules/indexer/indexer.routes";

const start = async () => {
  const env = readApiRuntimeEnv();

  if (env.validationErrors.length > 0) {
    const error = new Error(`Goal Vault API cannot start with invalid configuration: ${env.validationErrors.join(" ")}`);
    console.error(error.message);
    process.exit(1);
  }

  const context = await createIndexerContext(env);
  const app = buildApp({ context, env });
  const runSync = async () => {
    try {
      logObservabilitySignal(app.log, {
        domain: "indexer",
        action: "full_sync",
        status: "started",
        message: "Goal Vault indexer sync started.",
      });
      await runFullIndexerSync(context);
      logObservabilitySignal(app.log, {
        domain: "indexer",
        action: "full_sync",
        status: "succeeded",
        message: "Goal Vault indexer sync completed.",
      });
    } catch (error) {
      app.log.error(error, "Goal Vault indexer sync failed.");
    }
  };

  app.log.info(
    {
      environment: env.environment,
      deploymentTarget: env.deploymentTarget,
      publicBaseUrl: env.publicBaseUrl,
      indexerEnabled: env.indexerEnabled,
      analyticsEnabled: env.analyticsEnabled,
      syncIntervalMs: env.syncIntervalMs,
      chains: Object.values(env.chains).map((chain) => ({
        chainId: chain.chainId,
        rpcConfigured: Boolean(chain.rpcUrl),
        factoryConfigured: Boolean(chain.factoryAddress),
        startBlock: chain.startBlock,
      })),
    },
    "Goal Vault API starting.",
  );

  if (env.indexerEnabled && env.syncIntervalMs > 0) {
    void runSync();
    setInterval(() => {
      void runSync();
    }, env.syncIntervalMs).unref();
  } else if (!env.indexerEnabled) {
    app.log.warn("Goal Vault indexer loop is disabled. Manual syncs are required.");
  } else {
    app.log.warn("Goal Vault indexer loop is disabled by sync interval. Manual syncs are required.");
  }

  await app.listen({
    host: env.host,
    port: env.port,
  });
};

void start();
