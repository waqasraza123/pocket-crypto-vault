import type { ApiRuntimeEnv } from "../../env";
import { AnalyticsStore } from "../../lib/observability/analytics";
import { IndexerStore } from "../indexer/indexer-store";
import type { ApiAnalyticsStore, ApiIndexerStore } from "./ports";

export interface ApiPersistenceStores {
  driver: ApiRuntimeEnv["persistence"]["driver"];
  indexerStore: ApiIndexerStore;
  analyticsStore: ApiAnalyticsStore;
  close(): Promise<void>;
}

export const createApiPersistenceStores = async (env: ApiRuntimeEnv): Promise<ApiPersistenceStores> => {
  if (!env.persistence.runtimeReady || env.persistence.driver !== "sqlite") {
    throw new Error(env.persistence.message);
  }

  const indexerStore = new IndexerStore(env.persistence.sqliteDataDir);
  await indexerStore.initialize();
  const analyticsStore = new AnalyticsStore(env.persistence.sqliteDataDir);

  return {
    driver: env.persistence.driver,
    indexerStore,
    analyticsStore,
    close: async () => {
      await Promise.all([indexerStore.close(), analyticsStore.close()]);
    },
  };
};
