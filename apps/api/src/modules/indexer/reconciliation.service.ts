import { parseUnits } from "viem";

import type { VaultMetadataPayload, VaultMetadataStatus, VaultReconciliationStatus } from "@goal-vault/shared";
import type { Address } from "viem";

import type { IndexerContext } from "./context";
import type { PersistedVaultRecord } from "./indexer-store";

const accentTones = {
  sand: "#87684f",
  sage: "#66735c",
  sky: "#5f7f96",
  terracotta: "#9a5f4d",
} as const;

export const createVaultRecordKey = (chainId: number, vaultAddress: Address) => `${chainId}:${vaultAddress.toLowerCase()}`;

export const getAccentTone = (accentTheme?: keyof typeof accentTones | null) => {
  if (!accentTheme) {
    return accentTones.sand;
  }

  return accentTones[accentTheme] ?? accentTones.sand;
};

export const deriveMetadataStatus = ({
  hasMetadata,
  onchainFound,
}: {
  hasMetadata: boolean;
  onchainFound: boolean;
}): VaultMetadataStatus => {
  if (hasMetadata) {
    return "saved";
  }

  return onchainFound ? "pending" : "failed";
};

export const deriveReconciliationStatus = ({
  hasMetadata,
  onchainFound,
}: {
  hasMetadata: boolean;
  onchainFound: boolean;
}): VaultReconciliationStatus => {
  if (hasMetadata && onchainFound) {
    return "metadata_complete";
  }

  if (hasMetadata) {
    return "metadata_orphaned";
  }

  return "metadata_pending";
};

export const mergeVaultRecord = ({
  current,
  patch,
}: {
  current: PersistedVaultRecord | null;
  patch: Partial<PersistedVaultRecord> & {
    chainId: PersistedVaultRecord["chainId"];
    contractAddress: PersistedVaultRecord["contractAddress"];
  };
}): PersistedVaultRecord => {
  const nextDisplayName = patch.displayName ?? current?.displayName ?? null;
  const nextCategory = patch.category ?? current?.category ?? null;
  const nextNote = patch.note ?? current?.note ?? null;
  const nextAccentTheme = patch.accentTheme ?? current?.accentTheme ?? null;
  const hasMetadata = Boolean(nextDisplayName);
  const onchainFound = patch.onchainFound ?? current?.onchainFound ?? false;

  return {
    key: current?.key ?? createVaultRecordKey(patch.chainId, patch.contractAddress),
    chainId: patch.chainId,
    contractAddress: patch.contractAddress,
    ownerWallet: patch.ownerWallet ?? current?.ownerWallet ?? null,
    assetAddress: patch.assetAddress ?? current?.assetAddress ?? null,
    targetAmountAtomic: patch.targetAmountAtomic ?? current?.targetAmountAtomic ?? null,
    unlockDate: patch.unlockDate ?? current?.unlockDate ?? null,
    createdAt: patch.createdAt ?? current?.createdAt ?? null,
    createdTxHash: patch.createdTxHash ?? current?.createdTxHash ?? null,
    displayName: nextDisplayName,
    category: nextCategory,
    note: nextNote,
    accentTheme: nextAccentTheme,
    metadataStatus: patch.metadataStatus ?? deriveMetadataStatus({ hasMetadata, onchainFound }),
    reconciliationStatus: patch.reconciliationStatus ?? deriveReconciliationStatus({ hasMetadata, onchainFound }),
    totalDepositedAtomic: patch.totalDepositedAtomic ?? current?.totalDepositedAtomic ?? "0",
    totalWithdrawnAtomic: patch.totalWithdrawnAtomic ?? current?.totalWithdrawnAtomic ?? "0",
    currentBalanceAtomic: patch.currentBalanceAtomic ?? current?.currentBalanceAtomic ?? "0",
    lastActivityAt: patch.lastActivityAt ?? current?.lastActivityAt ?? current?.createdAt ?? null,
    lastIndexedAt: patch.lastIndexedAt ?? current?.lastIndexedAt ?? null,
    onchainFound,
  };
};

export const reconcileVaultMetadata = async (context: IndexerContext) => {
  for (const vault of context.store.listVaults()) {
    const nextRecord = mergeVaultRecord({
      current: vault,
      patch: {
        chainId: vault.chainId,
        contractAddress: vault.contractAddress,
        metadataStatus: deriveMetadataStatus({
          hasMetadata: Boolean(vault.displayName),
          onchainFound: vault.onchainFound,
        }),
        reconciliationStatus: deriveReconciliationStatus({
          hasMetadata: Boolean(vault.displayName),
          onchainFound: vault.onchainFound,
        }),
      },
    });
    await context.store.upsertVault(nextRecord);
  }
};

export const saveVaultMetadata = async (context: IndexerContext, payload: VaultMetadataPayload) => {
  const current = context.store.getVault(payload.chainId, payload.contractAddress);
  const targetAmountAtomic = parseUnits(payload.targetAmount.replaceAll(",", "").trim(), 6).toString();

  const nextRecord = mergeVaultRecord({
    current,
    patch: {
      chainId: payload.chainId,
      contractAddress: payload.contractAddress,
      ownerWallet: payload.ownerWallet,
      targetAmountAtomic,
      unlockDate: new Date(payload.unlockDate).toISOString(),
      displayName: payload.displayName.trim(),
      category: payload.category?.trim() || null,
      note: payload.note?.trim() || null,
      accentTheme: payload.accentTheme ?? null,
      lastIndexedAt: current?.lastIndexedAt ?? new Date().toISOString(),
      metadataStatus: "saved",
      reconciliationStatus: deriveReconciliationStatus({
        hasMetadata: true,
        onchainFound: current?.onchainFound ?? false,
      }),
    },
  });

  await context.store.upsertVault(nextRecord);
  return nextRecord;
};
