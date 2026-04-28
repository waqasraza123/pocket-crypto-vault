import { mapVaultDetail, mapVaultSummary } from "@pocket-vault/contracts-sdk";
import type { VaultDetail, VaultSummary, SupportedChainId } from "@pocket-vault/shared";

import { getReadClient } from "../blockchain/read-client";
import { getFactoryAddressForChain } from "./registry";
import { readFactoryVaultAddresses, readGoalVaultSummary } from "./reads";

export interface VaultQueryResult<T> {
  status: "success" | "empty" | "unavailable" | "error";
  data: T | null;
  source: "backend" | "onchain" | "fallback" | null;
  message: string | null;
}

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

        return mapVaultSummary({
          address: vaultAddress,
          chainId,
          summary: summaryResult.data,
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
    const vault = mapVaultSummary({
      address: vaultAddress,
      chainId,
      summary: summaryResult.data,
    });

    return {
      status: "success",
      data: {
        ...mapVaultDetail(vault),
        activityPreview: [],
      },
      source: "onchain",
      message: null,
    };
  }

  return {
    status: summaryResult.status,
    data: null,
    source: null,
    message: summaryResult.error?.message ?? "Vault detail is not available for this address.",
  };
};
