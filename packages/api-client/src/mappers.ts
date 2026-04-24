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
} from "@goal-vault/shared";

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
    lockState: new Date(item.unlockDate).getTime() > Date.now() ? "locked" : "unlocked",
    availability: "unavailable",
    message: "",
    unlockDate: item.unlockDate,
    unlockTimestampMs: new Date(item.unlockDate).getTime(),
    availableAmount: item.savedAmount,
    availableAmountAtomic: parseBigInt(item.currentBalanceAtomic),
    withdrawableAmount: {
      amount: item.savedAmount,
      amountAtomic: parseBigInt(item.currentBalanceAtomic),
      hasFunds: parseBigInt(item.currentBalanceAtomic) > 0n,
    },
    countdown: null,
    isOwner: false,
    connectedAddress: null,
    ownerAddress: item.ownerAddress as `0x${string}`,
    isConnected: false,
    isSupportedNetwork: true,
    canWithdraw: false,
  },
  activityPreview: item.normalizedActivity.slice(0, 6).map((activity) => ({
    id: activity.id,
    vaultAddress: activity.vaultAddress as `0x${string}`,
    chainId: activity.chainId,
    type:
      activity.eventType === "deposit_confirmed"
        ? "deposit"
        : activity.eventType === "withdrawal_confirmed"
          ? "withdrawal"
          : "created",
    title:
      activity.eventType === "deposit_confirmed"
        ? "Deposit confirmed"
        : activity.eventType === "withdrawal_confirmed"
          ? "Withdrawal confirmed"
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
  validationErrors: string[];
} => ({
  ok: response.ok,
  checkedAt: response.checkedAt,
  environment: response.environment,
  chainSync: response.chainSync,
  api: response.api,
  staging: response.staging,
  release: response.release,
  validationErrors: response.validationErrors,
});
