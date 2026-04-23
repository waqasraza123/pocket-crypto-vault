import { buildApp } from "./app";
import { readApiRuntimeEnv } from "./env";
import { createIndexerContext } from "./modules/indexer/context";
import { runFullIndexerSync } from "./modules/indexer/indexer.routes";

const start = async () => {
  const env = readApiRuntimeEnv();
  const context = await createIndexerContext(env);
  const app = buildApp({ context, env });

  if (env.syncIntervalMs > 0) {
    void runFullIndexerSync(context);
    setInterval(() => {
      void runFullIndexerSync(context);
    }, env.syncIntervalMs).unref();
  }

  await app.listen({
    host: env.host,
    port: env.port,
  });
};

void start();
