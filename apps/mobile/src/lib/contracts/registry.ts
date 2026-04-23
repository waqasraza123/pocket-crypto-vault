import { contractsByChain } from "@goal-vault/config";
import type { SupportedChainId } from "@goal-vault/shared";

export const getContractConfigForChain = (chainId: SupportedChainId) => contractsByChain[chainId];

export const getFactoryAddressForChain = (chainId: SupportedChainId) =>
  contractsByChain[chainId]?.goalVaultFactoryAddress ?? null;
