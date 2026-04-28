import { contractsByChain } from "@pocket-vault/config";

export const baseAddresses = {
  chainId: 8453 as const,
  usdc: contractsByChain[8453].usdcAddress,
  goalVaultFactory: contractsByChain[8453].goalVaultFactoryAddress,
} as const;
