import { getGoalVaultFactoryAddress, getUsdcAddress } from "@goal-vault/contracts-sdk";
import type { SupportedChainId } from "@goal-vault/shared";

export const getContractConfigForChain = (chainId: SupportedChainId) => ({
  usdcAddress: getUsdcAddress(chainId),
  goalVaultFactoryAddress: getGoalVaultFactoryAddress(chainId),
});

export const getFactoryAddressForChain = (chainId: SupportedChainId) => getGoalVaultFactoryAddress(chainId);
