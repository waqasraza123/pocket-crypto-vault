import type { Address } from "viem";

import type { SupportedChainId } from "@goal-vault/shared";

export * from "./base";
export * from "./base-sepolia";

import { baseAddresses } from "./base";
import { baseSepoliaAddresses } from "./base-sepolia";

const goalVaultAddressesByChain: Record<
  SupportedChainId,
  {
    usdc: Address;
    goalVaultFactory: Address | null;
  }
> = {
  8453: {
    usdc: baseAddresses.usdc,
    goalVaultFactory: baseAddresses.goalVaultFactory,
  },
  84532: {
    usdc: baseSepoliaAddresses.usdc,
    goalVaultFactory: baseSepoliaAddresses.goalVaultFactory,
  },
};

export const getGoalVaultFactoryAddress = (chainId: SupportedChainId): Address | null =>
  goalVaultAddressesByChain[chainId]?.goalVaultFactory ?? null;

export const getUsdcAddress = (chainId: SupportedChainId): Address => goalVaultAddressesByChain[chainId].usdc;
