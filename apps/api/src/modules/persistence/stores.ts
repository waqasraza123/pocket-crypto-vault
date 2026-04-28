import type { ApiRuntimeEnv } from "../../env";
import { AnalyticsStore } from "../../lib/observability/analytics";
import { IndexerStore } from "../indexer/indexer-store";
import { SupportStore } from "../support/support-store";
import type { ApiAnalyticsStore, ApiIndexerStore, ApiSupportStore } from "./ports";
import { assertPostgresqlRuntimeReady, createPostgresqlQueryExecutor } from "./postgresql-driver";
import { PostgresqlAnalyticsStore, PostgresqlIndexerStore, PostgresqlSupportStore } from "./postgresql-store";

export interface ApiPersistenceStores {
  driver: ApiRuntimeEnv["persistence"]["driver"];
  indexerStore: ApiIndexerStore;
  analyticsStore: ApiAnalyticsStore;
  supportStore: ApiSupportStore;
  close(): Promise<void>;
}

export const createApiPersistenceStores = async (env: ApiRuntimeEnv): Promise<ApiPersistenceStores> => {
  if (!env.persistence.runtimeReady) {
    throw new Error(env.persistence.message);
  }

  if (env.persistence.driver === "postgresql") {
    if (!env.persistence.postgresConnectionString) {
      throw new Error("API_DATABASE_URL is required when API_PERSISTENCE_DRIVER=postgresql.");
    }

    const queryExecutor = createPostgresqlQueryExecutor({
      connectionString: env.persistence.postgresConnectionString,
      driver: env.persistence.postgresqlDriver,
    });
    await assertPostgresqlRuntimeReady(queryExecutor, env.persistence.schemaName);

    return {
      driver: env.persistence.driver,
      indexerStore: new PostgresqlIndexerStore({
        schemaName: env.persistence.schemaName,
        queryExecutor,
      }),
      analyticsStore: new PostgresqlAnalyticsStore({
        schemaName: env.persistence.schemaName,
        queryExecutor,
      }),
      supportStore: new PostgresqlSupportStore({
        schemaName: env.persistence.schemaName,
        queryExecutor,
      }),
      close: async () => {
        await queryExecutor.close();
      },
    };
  }

  const indexerStore = new IndexerStore(env.persistence.sqliteDataDir);
  await indexerStore.initialize();
  const analyticsStore = new AnalyticsStore(env.persistence.sqliteDataDir);
  const supportStore = new SupportStore(env.persistence.sqliteDataDir);
  await supportStore.initialize();

  return {
    driver: env.persistence.driver,
    indexerStore,
    analyticsStore,
    supportStore,
    close: async () => {
      await Promise.all([indexerStore.close(), analyticsStore.close(), supportStore.close()]);
    },
  };
};
