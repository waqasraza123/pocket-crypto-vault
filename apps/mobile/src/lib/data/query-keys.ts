import type { SupportedChainId, VaultAddress } from "@goal-vault/shared";
import type { Address } from "viem";

export const queryKeys = {
  ownerVaults: ({ chainId, ownerAddress }: { chainId: SupportedChainId; ownerAddress: Address }) =>
    `vaults:${chainId}:${ownerAddress.toLowerCase()}`,
  vaultDetail: ({ chainId, vaultAddress }: { chainId: SupportedChainId; vaultAddress: VaultAddress }) =>
    `vault:${chainId}:${vaultAddress.toLowerCase()}`,
  ownerActivity: ({ chainId, ownerAddress }: { chainId: SupportedChainId; ownerAddress: Address }) =>
    `activity:${chainId}:${ownerAddress.toLowerCase()}`,
  vaultActivity: ({ chainId, vaultAddress }: { chainId: SupportedChainId; vaultAddress: VaultAddress }) =>
    `activity:${chainId}:${vaultAddress.toLowerCase()}`,
};
