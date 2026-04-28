import type { Address } from "viem";

import type { SupportedChainId } from "@pocket-vault/shared";

import { appRuntimeEnv } from "./env";
import { usdcTokenConfig } from "./tokens";

export interface GoalVaultContractsByChain {
  usdcAddress: Address;
  goalVaultFactoryAddress: Address | null;
}

export const contractsByChain: Record<SupportedChainId, GoalVaultContractsByChain> = {
  8453: {
    usdcAddress: usdcTokenConfig.addresses[8453],
    goalVaultFactoryAddress: appRuntimeEnv.factoryAddresses[8453],
  },
  84532: {
    usdcAddress: usdcTokenConfig.addresses[84532],
    goalVaultFactoryAddress: appRuntimeEnv.factoryAddresses[84532],
  },
};
