import { createPublicClient, http, type PublicClient } from "viem";

import type { SupportedChainId } from "@goal-vault/shared";

import { clientEnv } from "../env/client";
import { goalVaultSupportedViemChains } from "./chains";

const clientCache = new Map<SupportedChainId, PublicClient | null>();

export const getReadClient = (chainId: SupportedChainId): PublicClient | null => {
  if (clientCache.has(chainId)) {
    return clientCache.get(chainId) ?? null;
  }

  const rpcUrl = clientEnv.rpcUrls[chainId];

  if (!rpcUrl) {
    clientCache.set(chainId, null);
    return null;
  }

  const client = createPublicClient({
    chain: goalVaultSupportedViemChains[chainId],
    transport: http(rpcUrl),
  });

  clientCache.set(chainId, client);

  return client;
};
