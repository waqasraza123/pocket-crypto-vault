import Fastify from "fastify";

import type { ApiRuntimeEnv } from "./env";
import type { IndexerContext } from "./modules/indexer/context";
import { registerHealthRoutes } from "./modules/health/health.routes";
import { registerIndexerRoutes } from "./modules/indexer/indexer.routes";
import { registerVaultEventRoutes } from "./modules/vault-events/vault-events.routes";
import { registerVaultRoutes } from "./modules/vaults/vaults.routes";

export const buildApp = ({ context, env }: { context: IndexerContext; env: ApiRuntimeEnv }) => {
  const app = Fastify({
    logger: true,
  });

  app.decorate("goalVaultContext", context);

  app.get("/", async () => ({
    service: "goal-vault-api",
    ok: true,
    checkedAt: new Date().toISOString(),
    validationErrors: env.validationErrors,
  }));

  registerHealthRoutes(app, context);
  registerIndexerRoutes(app, context);
  registerVaultRoutes(app);
  registerVaultEventRoutes(app);

  return app;
};

declare module "fastify" {
  interface FastifyInstance {
    goalVaultContext: IndexerContext;
  }
}
