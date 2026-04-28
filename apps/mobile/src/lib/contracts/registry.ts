import { getGoalVaultFactoryAddress, getUsdcAddress } from "@pocket-vault/contracts-sdk";
import type { SupportedChainId } from "@pocket-vault/shared";

export const getContractConfigForChain = (chainId: SupportedChainId) => ({
  usdcAddress: getUsdcAddress(chainId),
  goalVaultFactoryAddress: getGoalVaultFactoryAddress(chainId),
});

export const getFactoryAddressForChain = (chainId: SupportedChainId) => getGoalVaultFactoryAddress(chainId);
