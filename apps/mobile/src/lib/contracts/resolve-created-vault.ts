import type { SupportedChainId, VaultAddress, VaultCreatedResolution } from "@pocket-vault/shared";
import { parseVaultCreatedResolution, readFactoryVaultAddresses } from "@pocket-vault/contracts-sdk";
import type { Address, TransactionReceipt } from "viem";

import { getReadClient } from "../blockchain/read-client";
import { getFactoryAddressForChain } from "./registry";

export const resolveCreatedVaultAddress = async ({
  chainId,
  ownerAddress,
  receipt,
  knownVaultAddresses,
}: {
  chainId: SupportedChainId;
  ownerAddress: Address;
  receipt: TransactionReceipt;
  knownVaultAddresses?: VaultAddress[];
}): Promise<VaultCreatedResolution> => {
  const factoryAddress = getFactoryAddressForChain(chainId);
  const receiptResolution = parseVaultCreatedResolution({
    receipt,
    factoryAddress,
  });

  if (receiptResolution.status === "resolved") {
    return receiptResolution;
  }

  const vaultReadResult = await readFactoryVaultAddresses({
    client: getReadClient(chainId),
    factoryAddress,
    ownerAddress,
  });

  if (vaultReadResult.status !== "success") {
    return {
      status: "unresolved",
      strategy: null,
      vaultAddress: null,
      message: receiptResolution.message ?? vaultReadResult.error?.message ?? "The new vault address could not be resolved.",
    };
  }

  const previousAddresses = new Set((knownVaultAddresses ?? []).map((address) => address.toLowerCase()));
  const createdVault = vaultReadResult.data.find((vaultAddress) => !previousAddresses.has(vaultAddress.toLowerCase()));

  if (createdVault) {
    return {
      status: "resolved",
      strategy: "owner_vault_list",
      vaultAddress: createdVault,
      message: null,
    };
  }

  const mostRecentVault = vaultReadResult.data.at(-1) ?? null;

  if (mostRecentVault) {
    return {
      status: "resolved",
      strategy: "owner_vault_list",
      vaultAddress: mostRecentVault,
      message: null,
    };
  }

  return {
    status: "unresolved",
    strategy: null,
    vaultAddress: null,
    message: receiptResolution.message ?? "The new vault address could not be resolved after confirmation.",
  };
};
