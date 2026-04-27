import type { FastifyBaseLogger } from "fastify";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";

import type { ApiRuntimeEnv } from "../../env";
import type { ApiAnalyticsStore, ApiIndexerStore } from "../persistence/ports";
import { createApiPersistenceStores } from "../persistence/stores";

export interface IndexerContext {
  env: ApiRuntimeEnv;
  store: ApiIndexerStore;
  analyticsStore: ApiAnalyticsStore;
  clients: Partial<Record<8453 | 84532, ReturnType<typeof createPublicClient> | null>>;
  logger: FastifyBaseLogger | null;
}

export const createIndexerContext = async (env: ApiRuntimeEnv): Promise<IndexerContext> => {
  const stores = await createApiPersistenceStores(env);

  const clients: Partial<Record<8453 | 84532, ReturnType<typeof createPublicClient> | null>> = {};

  if (env.chains[8453].rpcUrl) {
    clients[8453] = createPublicClient({
      chain: base,
      transport: http(env.chains[8453].rpcUrl),
    }) as ReturnType<typeof createPublicClient>;
  }

  if (env.chains[84532].rpcUrl) {
    clients[84532] = createPublicClient({
      chain: baseSepolia,
      transport: http(env.chains[84532].rpcUrl),
    }) as ReturnType<typeof createPublicClient>;
  }

  return {
    env,
    store: stores.indexerStore,
    analyticsStore: stores.analyticsStore,
    clients,
    logger: null,
  };
};
