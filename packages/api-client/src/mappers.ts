import type {
  ActivityFeedResult,
  ApiHealthSummary,
  AppEnvironment,
  ChainSyncStatus,
  StagingReadinessSummary,
  VaultActivityItem,
  VaultDetailApiModel,
  VaultListResult,
  VaultSummaryApiModel,
} from "@pocket-vault/shared";

import type {
  ActivityFeedResponse,
  ApiVaultActivityItem,
  ApiVaultDetailItem,
  ApiVaultSummaryItem,
  HealthResponse,
  SerializedSyncFreshnessSnapshot,
  VaultActivityResponse,
  VaultDetailResponse,
  VaultListResponse,
} from "./schemas";

const parseBigInt = (value: string | null | undefined) => BigInt(value || "0");

const parseRuleSummary = (ruleSummary: ApiVaultSummaryItem["ruleSummary"]) =>
  ruleSummary.type === "timeLock"
    ? ruleSummary
    : ruleSummary.type === "cooldownUnlock"
      ? ruleSummary
      : {
          ...ruleSummary,
          guardianAddress: ruleSummary.guardianAddress as `0x${string}`,
        };

const getActivityType = (eventType: ApiVaultActivityItem["eventType"]) => {
  if (eventType === "deposit_confirmed") {
    return "deposit" as const;
  }

  if (eventType === "withdrawal_confirmed") {
    return "withdrawal" as const;
  }

  if (eventType === "unlock_requested") {
    return "unlock_requested" as const;
  }

  if (eventType === "unlock_canceled") {
    return "unlock_canceled" as const;
  }

  if (eventType === "guardian_approved") {
    return "guardian_approved" as const;
  }

  if (eventType === "guardian_rejected") {
    return "guardian_rejected" as const;
  }

  return "created" as const;
};

export const parseApiVaultActivityItem = (item: ApiVaultActivityItem): VaultActivityItem => ({
  ...item,
  txHash: item.txHash as `0x${string}`,
  vaultAddress: item.vaultAddress as `0x${string}`,
  ownerAddress: (item.ownerAddress as `0x${string}` | null) ?? null,
  actorAddress: (item.actorAddress as `0x${string}` | null) ?? null,
  amountAtomic: item.amountAtomic ? parseBigInt(item.amountAtomic) : null,
});

export const parseApiVaultSummaryItem = (item: ApiVaultSummaryItem): VaultSummaryApiModel => ({
  ...item,
  address: item.address as `0x${string}`,
  assetAddress: item.assetAddress as `0x${string}`,
  ownerAddress: item.ownerAddress as `0x${string}`,
  ruleSummary: parseRuleSummary(item.ruleSummary),
  targetAmountAtomic: parseBigInt(item.targetAmountAtomic),
  savedAmountAtomic: parseBigInt(item.savedAmountAtomic),
  totalDepositedAtomic: parseBigInt(item.totalDepositedAtomic),
  totalWithdrawnAtomic: parseBigInt(item.totalWithdrawnAtomic),
  currentBalanceAtomic: parseBigInt(item.currentBalanceAtomic),
});

export const parseApiVaultDetailItem = (item: ApiVaultDetailItem): VaultDetailApiModel => ({
  ...parseApiVaultSummaryItem(item),
  ownerLabel: item.ownerLabel,
  depositPreview: {
    depositAmount: 0,
    resultingSavedAmount: item.savedAmount,
    resultingProgressRatio: item.progressRatio,
    resultingRemainingAmount: Math.max(item.targetAmount - item.savedAmount, 0),
  },
  withdrawEligibility: {
    lockState:
      item.ruleType === "timeLock"
        ? new Date(item.unlockDate ?? new Date().toISOString()).getTime() > Date.now()
          ? "locked"
          : "unlocked"
        : item.status === "unlocked"
          ? "unlocked"
          : "locked",
    availability: "unavailable",
    message: "",
    unlockDate: item.unlockDate,
    unlockTimestampMs: item.unlockDate ? new Date(item.unlockDate).getTime() : null,
    availableAmount: item.savedAmount,
    availableAmountAtomic: parseBigInt(item.currentBalanceAtomic),
    withdrawableAmount: {
      amount: item.savedAmount,
      amountAtomic: parseBigInt(item.currentBalanceAtomic),
      hasFunds: parseBigInt(item.currentBalanceAtomic) > 0n,
    },
    countdown: null,
    isOwner: false,
    isGuardian: false,
    connectedAddress: null,
    ownerAddress: item.ownerAddress as `0x${string}`,
    guardianAddress: item.ruleSummary.type === "guardianApproval" ? (item.ruleSummary.guardianAddress as `0x${string}`) : null,
    isConnected: false,
    isSupportedNetwork: true,
    canWithdraw: false,
    canRequestUnlock: false,
    canCancelUnlockRequest: false,
    canGuardianApprove: false,
    canGuardianReject: false,
    unlockRequestStatus:
      item.ruleSummary.type === "cooldownUnlock"
        ? item.ruleSummary.unlockRequestedAt
          ? (item.ruleSummary.unlockEligibleTimestampMs && item.ruleSummary.unlockEligibleTimestampMs <= Date.now() ? "matured" : "pending")
          : "not_requested"
        : item.ruleSummary.type === "guardianApproval"
          ? item.ruleSummary.guardianDecision === "approved"
            ? "approved"
            : item.ruleSummary.guardianDecision === "rejected"
              ? "rejected"
              : item.ruleSummary.guardianDecision === "pending"
                ? "pending"
                : "not_requested"
          : item.status === "unlocked"
            ? "approved"
            : "not_requested",
    guardianApprovalState:
      item.ruleSummary.type === "guardianApproval" ? item.ruleSummary.guardianDecision : "not_required",
    unlockRequestedAt:
      item.ruleSummary.type === "timeLock" ? null : item.ruleSummary.unlockRequestedAt,
    unlockEligibleAt:
      item.ruleSummary.type === "cooldownUnlock" ? item.ruleSummary.unlockEligibleAt : item.unlockDate,
    nextAction: "none",
    ruleType: item.ruleType,
  },
  activityPreview: item.normalizedActivity.slice(0, 6).map((activity) => ({
    id: activity.id,
    vaultAddress: activity.vaultAddress as `0x${string}`,
    chainId: activity.chainId,
    type: getActivityType(activity.eventType),
    title:
      activity.eventType === "deposit_confirmed"
        ? "Deposit confirmed"
        : activity.eventType === "withdrawal_confirmed"
          ? "Withdrawal confirmed"
          : activity.eventType === "unlock_requested"
            ? "Unlock requested"
            : activity.eventType === "unlock_canceled"
              ? "Unlock request canceled"
              : activity.eventType === "guardian_approved"
                ? "Guardian approved"
                : activity.eventType === "guardian_rejected"
                  ? "Guardian rejected"
                  : "Vault created",
    subtitle: item.goalName,
    occurredAt: activity.occurredAt,
    amount: activity.amountAtomic ? Number(activity.amountAtomic) / 1_000_000 : undefined,
    txHash: activity.txHash as `0x${string}`,
    source: "indexed",
  })),
  normalizedActivity: item.normalizedActivity.map(parseApiVaultActivityItem),
});

export const parseVaultListResponse = (response: VaultListResponse): VaultListResult => ({
  items: response.items.map(parseApiVaultSummaryItem),
});

export const parseVaultDetailResponse = (response: VaultDetailResponse): { item: VaultDetailApiModel } => ({
  item: parseApiVaultDetailItem(response.item),
});

export const parseVaultActivityResponse = (response: VaultActivityResponse): {
  items: VaultActivityItem[];
  hasMore: boolean;
  vaultAddress: `0x${string}`;
  chainId: VaultActivityResponse["chainId"];
  freshness: SerializedSyncFreshnessSnapshot;
} => ({
  ...response,
  vaultAddress: response.vaultAddress as `0x${string}`,
  items: response.items.map(parseApiVaultActivityItem),
});

export const parseActivityFeedResponse = (response: ActivityFeedResponse): ActivityFeedResult => ({
  items: response.items.map(parseApiVaultActivityItem),
  hasMore: response.hasMore,
});

export const parseHealthResponse = (response: HealthResponse): {
  ok: boolean;
  checkedAt: string;
  environment: AppEnvironment;
  chainSync: ChainSyncStatus[];
  api: ApiHealthSummary;
  staging: StagingReadinessSummary;
  release: HealthResponse["release"];
  productionActivation: HealthResponse["productionActivation"];
  validationErrors: string[];
} => ({
  ok: response.ok,
  checkedAt: response.checkedAt,
  environment: response.environment,
  chainSync: response.chainSync,
  api: response.api,
  staging: response.staging,
  release: response.release,
  productionActivation: response.productionActivation,
  validationErrors: response.validationErrors,
});
