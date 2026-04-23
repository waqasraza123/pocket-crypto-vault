import {
  defaultSupportedChainId,
  supportedChainIds,
  supportedChains,
  supportedViemChainList,
  supportedViemChains,
} from "@goal-vault/config";
import type { SupportedChain, SupportedChainId } from "@goal-vault/shared";

export const goalVaultSupportedChainIds = supportedChainIds;
export const goalVaultSupportedChains = supportedChains;
export const goalVaultSupportedViemChains = supportedViemChains;
export const goalVaultSupportedViemChainList = supportedViemChainList;
export const defaultGoalVaultChainId = defaultSupportedChainId;

export const isSupportedChainId = (value: number | string | null | undefined): value is SupportedChainId => {
  if (typeof value === "number") {
    return goalVaultSupportedChainIds.includes(value as SupportedChainId);
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return goalVaultSupportedChainIds.includes(Number(value) as SupportedChainId);
  }

  return false;
};

export const toSupportedChainId = (value: number | string | null | undefined): SupportedChainId | null => {
  if (!isSupportedChainId(value)) {
    return null;
  }

  return typeof value === "number" ? value : (Number(value) as SupportedChainId);
};

export const getSupportedChain = (chainId: SupportedChainId | null | undefined): SupportedChain | null => {
  if (!chainId) {
    return null;
  }

  return goalVaultSupportedChains[chainId] ?? null;
};
