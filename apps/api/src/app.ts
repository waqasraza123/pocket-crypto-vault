import Fastify from "fastify";

import type { ApiRuntimeEnv } from "./env";
import { registerAnalyticsRoutes } from "./modules/analytics/analytics.routes";
import type { IndexerContext } from "./modules/indexer/context";
import { registerHealthRoutes } from "./modules/health/health.routes";
import { registerIndexerRoutes } from "./modules/indexer/indexer.routes";
import { registerSupportRoutes } from "./modules/support/support.routes";
import { registerVaultEventRoutes } from "./modules/vault-events/vault-events.routes";
import { registerVaultRoutes } from "./modules/vaults/vaults.routes";

export const buildApp = ({ context, env }: { context: IndexerContext; env: ApiRuntimeEnv }) => {
  const app = Fastify({
    logger: {
      level: env.logLevel,
    },
  });

  context.logger = app.log;
  app.decorate("goalVaultContext", context);
  app.addHook("onClose", async () => {
    await context.close();
  });

  app.get("/", async () => ({
    service: "pocket-vault-api",
    ok: true,
    checkedAt: new Date().toISOString(),
    environment: env.environment,
    deploymentTarget: env.deploymentTarget,
    publicBaseUrl: env.publicBaseUrl,
    indexerEnabled: env.indexerEnabled,
    supportEnabled: env.supportEnabled,
    persistenceDriver: env.persistence.driver,
    postgresqlDriver: env.persistence.postgresqlDriver,
    readyPath: "/ready",
    validationErrors: env.validationErrors,
  }));

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    return reply.status(500).send({
      message: "Pocket Vault API could not complete this request.",
    });
  });

  registerHealthRoutes(app, context, env);
  registerAnalyticsRoutes(app, context, env);
  registerSupportRoutes(app, context, env);
  registerIndexerRoutes(app, context, env);
  registerVaultRoutes(app);
  registerVaultEventRoutes(app);

  return app;
};

declare module "fastify" {
  interface FastifyInstance {
    goalVaultContext: IndexerContext;
  }
}
