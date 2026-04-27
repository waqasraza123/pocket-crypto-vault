import type { ApiRuntimeEnv } from "../../env";
import { AnalyticsStore } from "../../lib/observability/analytics";
import { IndexerStore } from "../indexer/indexer-store";
import type { ApiAnalyticsStore, ApiIndexerStore } from "./ports";

export interface ApiPersistenceStores {
  driver: ApiRuntimeEnv["persistence"]["driver"];
  indexerStore: ApiIndexerStore;
  analyticsStore: ApiAnalyticsStore;
}

export const createApiPersistenceStores = async (env: ApiRuntimeEnv): Promise<ApiPersistenceStores> => {
  if (!env.persistence.runtimeReady || env.persistence.driver !== "sqlite") {
    throw new Error(env.persistence.message);
  }

  const indexerStore = new IndexerStore(env.persistence.sqliteDataDir);
  await indexerStore.initialize();

  return {
    driver: env.persistence.driver,
    indexerStore,
    analyticsStore: new AnalyticsStore(env.persistence.sqliteDataDir),
  };
};
