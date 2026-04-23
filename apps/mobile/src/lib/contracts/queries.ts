import { mapVaultDetail, mapVaultSummary } from "@goal-vault/contracts-sdk";
import type { VaultDetail, VaultSummary, SupportedChainId } from "@goal-vault/shared";

import { getMockVaultDetail } from "../../features/vault-detail/mockVaultDetail";
import { mockVaults } from "../../features/vault-list/mockVaults";
import { getReadClient } from "../blockchain/read-client";
import { getFactoryAddressForChain } from "./registry";
import { readFactoryVaultAddresses, readGoalVaultSummary } from "./reads";

export interface VaultQueryResult<T> {
  status: "success" | "empty" | "unavailable" | "error";
  data: T | null;
  source: "onchain" | "fallback" | null;
  message: string | null;
}

const fallbackVaultsByChain = (chainId: SupportedChainId): VaultSummary[] =>
  mockVaults.filter((vault) => vault.chainId === chainId);

const fallbackVaultByAddress = (vaultAddress: VaultSummary["address"]): VaultDetail | null => {
  try {
    return getMockVaultDetail(vaultAddress);
  } catch {
    return null;
  }
};

export const readVaultSummariesByOwner = async ({
  chainId,
  ownerAddress,
}: {
  chainId: SupportedChainId;
  ownerAddress: VaultSummary["ownerAddress"];
}): Promise<VaultQueryResult<VaultSummary[]>> => {
  const client = getReadClient(chainId);
  const factoryAddress = getFactoryAddressForChain(chainId);
  const addressesResult = await readFactoryVaultAddresses({
    client,
    factoryAddress,
    ownerAddress,
  });

  if (addressesResult.status === "success") {
    const summaries = await Promise.all(
      addressesResult.data.map(async (vaultAddress) => {
        const summaryResult = await readGoalVaultSummary({
          client,
          vaultAddress,
        });

        if (summaryResult.status !== "success") {
          return null;
        }

        const fallback = mockVaults.find((vault) => vault.address === vaultAddress);

        return mapVaultSummary({
          address: vaultAddress,
          chainId,
          summary: summaryResult.data,
          metadataFallback: fallback
            ? {
                goalName: fallback.goalName,
                note: fallback.note,
                accentTone: fallback.accentTone,
              }
            : undefined,
        });
      }),
    );

    const vaults = summaries.filter((vault): vault is VaultSummary => Boolean(vault));

    if (vaults.length === 0) {
      return {
        status: "empty",
        data: null,
        source: null,
        message: "No deployed vaults were found for this wallet on the selected chain.",
      };
    }

    return {
      status: "success",
      data: vaults,
      source: "onchain",
      message: null,
    };
  }

  if (addressesResult.status === "empty") {
    return {
      status: "empty",
      data: null,
      source: null,
      message: "No vaults were found for this wallet on the selected chain.",
    };
  }

  const fallbackVaults = fallbackVaultsByChain(chainId);

  if (fallbackVaults.length > 0) {
    return {
      status: "success",
      data: fallbackVaults,
      source: "fallback",
      message: addressesResult.error.message,
    };
  }

  return {
    status: addressesResult.status,
    data: null,
    source: null,
    message: addressesResult.error.message,
  };
};

export const readVaultDetailByAddress = async ({
  chainId,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  vaultAddress: VaultSummary["address"];
}): Promise<VaultQueryResult<VaultDetail>> => {
  const client = getReadClient(chainId);
  const summaryResult = await readGoalVaultSummary({
    client,
    vaultAddress,
  });

  if (summaryResult.status === "success") {
    const fallback = fallbackVaultByAddress(vaultAddress);
    const vault = mapVaultSummary({
      address: vaultAddress,
      chainId,
      summary: summaryResult.data,
      metadataFallback: fallback
        ? {
            goalName: fallback.goalName,
            note: fallback.note,
            accentTone: fallback.accentTone,
          }
        : undefined,
    });

    return {
      status: "success",
      data: {
        ...mapVaultDetail(vault),
        activityPreview: fallback?.activityPreview ?? [],
      },
      source: "onchain",
      message: null,
    };
  }

  const fallback = fallbackVaultByAddress(vaultAddress);

  if (fallback) {
    return {
      status: "success",
      data: fallback,
      source: "fallback",
      message: summaryResult.error?.message ?? null,
    };
  }

  return {
    status: summaryResult.status,
    data: null,
    source: null,
    message: summaryResult.error?.message ?? "Vault detail is not available for this address.",
  };
};
