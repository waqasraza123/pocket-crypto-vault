import { formatUnits } from "viem";

import type { ApiVaultDetailItem, ApiVaultSummaryItem, VaultDetailResponse, VaultListResponse } from "@goal-vault/api-client";
import type { SyncFreshnessSnapshot, VaultSummary } from "@goal-vault/shared";

import { serializeVaultActivityItem } from "../vault-events/vault-events.serializers";
import type { PersistedVaultEventRecord, PersistedVaultRecord } from "../indexer/indexer-store";
import { getAccentTone } from "../indexer/reconciliation.service";

const getGoalName = (vault: PersistedVaultRecord) => vault.displayName ?? `Goal Vault ${vault.contractAddress.slice(2, 6).toUpperCase()}`;

const toNumberAmount = (value: string | null) => Number(formatUnits(BigInt(value || "0"), 6));

const getVaultStatus = ({
  currentBalanceAtomic,
  unlockDate,
}: {
  currentBalanceAtomic: string;
  unlockDate: string | null;
}): VaultSummary["status"] => {
  if (BigInt(currentBalanceAtomic) <= 0n) {
    return "active";
  }

  if (!unlockDate) {
    return "active";
  }

  return new Date(unlockDate).getTime() <= Date.now() ? "unlocked" : "locked";
};

export const serializeVaultSummary = ({
  events,
  freshness,
  vault,
}: {
  events: PersistedVaultEventRecord[];
  freshness: SyncFreshnessSnapshot;
  vault: PersistedVaultRecord;
}): ApiVaultSummaryItem => {
  const targetAmount = toNumberAmount(vault.targetAmountAtomic);
  const savedAmount = toNumberAmount(vault.currentBalanceAtomic);

  return {
    address: vault.contractAddress,
    chainId: vault.chainId,
    assetAddress: vault.assetAddress ?? "0x0000000000000000000000000000000000000000",
    ownerAddress: vault.ownerWallet ?? "0x0000000000000000000000000000000000000000",
    goalName: getGoalName(vault),
    category: vault.category ?? undefined,
    note: vault.note ?? undefined,
    targetAmount,
    savedAmount,
    unlockDate: vault.unlockDate ?? new Date(0).toISOString(),
    ruleType: "timeLock",
    status: getVaultStatus({
      currentBalanceAtomic: vault.currentBalanceAtomic,
      unlockDate: vault.unlockDate,
    }),
    accentTheme: vault.accentTheme ?? undefined,
    accentTone: getAccentTone(vault.accentTheme),
    metadataStatus: vault.metadataStatus,
    targetAmountAtomic: vault.targetAmountAtomic ?? "0",
    savedAmountAtomic: vault.currentBalanceAtomic,
    totalDepositedAtomic: vault.totalDepositedAtomic,
    totalWithdrawnAtomic: vault.totalWithdrawnAtomic,
    currentBalanceAtomic: vault.currentBalanceAtomic,
    progressRatio: targetAmount > 0 ? Math.min(savedAmount / targetAmount, 1) : 0,
    source: "backend",
    reconciliationStatus: vault.reconciliationStatus,
    activityCount: events.length,
    lastActivityAt: vault.lastActivityAt,
    freshness,
  };
};

export const serializeVaultDetail = ({
  events,
  freshness,
  vault,
}: {
  events: PersistedVaultEventRecord[];
  freshness: SyncFreshnessSnapshot;
  vault: PersistedVaultRecord;
}): ApiVaultDetailItem => {
  const summary = serializeVaultSummary({
    events,
    freshness,
    vault,
  });

  return {
    ...summary,
    ownerLabel: vault.ownerWallet ? `${vault.ownerWallet.slice(0, 6)}…${vault.ownerWallet.slice(-4)}` : "Unknown owner",
    normalizedActivity: events.map((event) =>
      serializeVaultActivityItem({
        event,
        vault,
      }),
    ),
  };
};

export const serializeVaultListResponse = ({ items }: { items: ApiVaultSummaryItem[] }): VaultListResponse => ({
  items,
});

export const serializeVaultDetailResponse = ({ item }: { item: ApiVaultDetailItem }): VaultDetailResponse => ({
  item,
});
