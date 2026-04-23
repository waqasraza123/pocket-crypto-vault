import { contractsByChain } from "@goal-vault/config";

export const baseSepoliaAddresses = {
  chainId: 84532 as const,
  usdc: contractsByChain[84532].usdcAddress,
  goalVaultFactory: contractsByChain[84532].goalVaultFactoryAddress,
} as const;
