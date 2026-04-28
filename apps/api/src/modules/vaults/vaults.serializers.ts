import { formatUnits } from "viem";

import type { ApiVaultDetailItem, ApiVaultSummaryItem, VaultDetailResponse, VaultListResponse } from "@pocket-vault/api-client";
import type { SyncFreshnessSnapshot, VaultSummary } from "@pocket-vault/shared";

import { serializeVaultActivityItem } from "../vault-events/vault-events.serializers";
import type { PersistedVaultEventRecord, PersistedVaultRecord } from "../persistence/ports";
import { getAccentTone } from "../indexer/reconciliation.service";

const getGoalName = (vault: PersistedVaultRecord) => vault.displayName ?? `Pocket Vault ${vault.contractAddress.slice(2, 6).toUpperCase()}`;

const toNumberAmount = (value: string | null) => Number(formatUnits(BigInt(value || "0"), 6));

const getVaultStatus = ({
  currentBalanceAtomic,
  ruleType,
  unlockDate,
  unlockRequestStatus,
}: {
  currentBalanceAtomic: string;
  ruleType: PersistedVaultRecord["ruleType"];
  unlockDate: string | null;
  unlockRequestStatus: PersistedVaultRecord["unlockRequestStatus"];
}): VaultSummary["status"] => {
  if (BigInt(currentBalanceAtomic) <= 0n) {
    return "active";
  }

  if (ruleType === "cooldownUnlock" && unlockRequestStatus === "pending") {
    return "unlocking";
  }

  if (ruleType === "guardianApproval" && unlockRequestStatus === "pending") {
    return "unlocking";
  }

  if (ruleType === "cooldownUnlock" && unlockRequestStatus === "matured") {
    return "unlocked";
  }

  if (ruleType === "guardianApproval" && unlockRequestStatus === "approved") {
    return "unlocked";
  }

  if (ruleType === "timeLock" && unlockDate && new Date(unlockDate).getTime() <= Date.now()) {
    return "unlocked";
  }

  return "locked";
};

const buildRuleSummary = (vault: PersistedVaultRecord): ApiVaultSummaryItem["ruleSummary"] => {
  if (vault.ruleType === "cooldownUnlock") {
    const cooldownDurationDays = Number(vault.cooldownDurationSeconds ?? 0) / 86_400;
    return {
      type: "cooldownUnlock",
      cooldownDurationSeconds: vault.cooldownDurationSeconds ?? 0,
      cooldownDurationDays,
      cooldownDurationLabel: `${cooldownDurationDays} day${cooldownDurationDays === 1 ? "" : "s"}`,
      unlockRequestedAt: vault.unlockRequestedAt,
      unlockEligibleAt: vault.unlockEligibleAt,
      unlockEligibleTimestampMs: vault.unlockEligibleAt ? new Date(vault.unlockEligibleAt).getTime() : null,
    };
  }

  if (vault.ruleType === "guardianApproval") {
    const guardianAddress = vault.guardianAddress ?? "0x0000000000000000000000000000000000000000";

    return {
      type: "guardianApproval",
      guardianAddress,
      guardianLabel: `${guardianAddress.slice(0, 6)}…${guardianAddress.slice(-4)}`,
      unlockRequestedAt: vault.unlockRequestedAt,
      guardianDecision: vault.guardianApprovalState,
      guardianDecisionAt: vault.guardianDecisionAt,
    };
  }

  return {
    type: "timeLock",
    unlockDate: vault.unlockDate ?? new Date(0).toISOString(),
    unlockTimestampMs: new Date(vault.unlockDate ?? new Date(0).toISOString()).getTime(),
  };
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
    unlockDate: vault.unlockDate,
    ruleType: vault.ruleType,
    ruleSummary: buildRuleSummary(vault),
    status: getVaultStatus({
      currentBalanceAtomic: vault.currentBalanceAtomic,
      ruleType: vault.ruleType,
      unlockDate: vault.unlockDate,
      unlockRequestStatus: vault.unlockRequestStatus,
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
