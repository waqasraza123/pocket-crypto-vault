import type { FastifyBaseLogger } from "fastify";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";

import type { ApiRuntimeEnv } from "../../env";
import { IndexerStore } from "./indexer-store";

export interface IndexerContext {
  env: ApiRuntimeEnv;
  store: IndexerStore;
  clients: Partial<Record<8453 | 84532, ReturnType<typeof createPublicClient> | null>>;
  logger: FastifyBaseLogger | null;
}

export const createIndexerContext = async (env: ApiRuntimeEnv): Promise<IndexerContext> => {
  const store = new IndexerStore(env.dataDir);
  await store.initialize();

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
    store,
    clients,
    logger: null,
  };
};
