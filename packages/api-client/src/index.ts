import type {
  ActivityFeedResult,
  ChainSyncStatus,
  HealthStatus,
  SupportedChainId,
  SyncFreshnessSnapshot,
  VaultActivityItem,
  VaultDetailEnriched,
  VaultListResult,
  VaultMetadataStatus,
  VaultReconciliationStatus,
  VaultSummaryEnriched,
} from "@goal-vault/shared";

export interface SerializedSyncFreshnessSnapshot extends SyncFreshnessSnapshot {}

export interface ApiVaultSummaryItem {
  address: `0x${string}`;
  chainId: SupportedChainId;
  assetAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  goalName: string;
  category?: string;
  note?: string;
  targetAmount: number;
  savedAmount: number;
  unlockDate: string;
  ruleType: "timeLock";
  status: "active" | "locked" | "unlocked" | "withdrawn" | "closed";
  accentTheme?: "sand" | "sage" | "sky" | "terracotta";
  accentTone: string;
  metadataStatus?: VaultMetadataStatus;
  targetAmountAtomic: string;
  savedAmountAtomic: string;
  totalDepositedAtomic: string;
  totalWithdrawnAtomic: string;
  currentBalanceAtomic: string;
  progressRatio: number;
  source: "backend";
  reconciliationStatus: VaultReconciliationStatus;
  activityCount: number;
  lastActivityAt: string | null;
  freshness: SerializedSyncFreshnessSnapshot;
}

export interface ApiVaultActivityItem {
  id: string;
  chainId: SupportedChainId;
  txHash: `0x${string}`;
  blockNumber: number;
  logIndex: number;
  vaultAddress: `0x${string}`;
  ownerAddress: `0x${string}` | null;
  actorAddress: `0x${string}` | null;
  eventType: "vault_created" | "deposit_confirmed" | "withdrawal_confirmed";
  amountAtomic: string | null;
  occurredAt: string;
  indexedAt: string;
  displayName: string | null;
  metadataStatus: VaultMetadataStatus;
}

export interface ApiVaultDetailItem extends ApiVaultSummaryItem {
  ownerLabel: string;
  normalizedActivity: ApiVaultActivityItem[];
}

export interface VaultListResponse {
  items: ApiVaultSummaryItem[];
}

export interface VaultDetailResponse {
  item: ApiVaultDetailItem;
}

export interface VaultActivityResponse {
  items: ApiVaultActivityItem[];
  hasMore: boolean;
  vaultAddress: `0x${string}`;
  chainId: SupportedChainId;
  freshness: SerializedSyncFreshnessSnapshot;
}

export interface ActivityFeedResponse {
  items: ApiVaultActivityItem[];
  hasMore: boolean;
}

export interface HealthResponse extends HealthStatus {}

const parseBigInt = (value: string | null | undefined) => BigInt(value || "0");

export const parseApiVaultActivityItem = (item: ApiVaultActivityItem): VaultActivityItem => ({
  ...item,
  amountAtomic: item.amountAtomic ? parseBigInt(item.amountAtomic) : null,
});

export const parseApiVaultSummaryItem = (item: ApiVaultSummaryItem): VaultSummaryEnriched => ({
  ...item,
  targetAmountAtomic: parseBigInt(item.targetAmountAtomic),
  savedAmountAtomic: parseBigInt(item.savedAmountAtomic),
  totalDepositedAtomic: parseBigInt(item.totalDepositedAtomic),
  totalWithdrawnAtomic: parseBigInt(item.totalWithdrawnAtomic),
  currentBalanceAtomic: parseBigInt(item.currentBalanceAtomic),
});

export const parseApiVaultDetailItem = (item: ApiVaultDetailItem): VaultDetailEnriched => ({
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
    ownerAddress: item.ownerAddress,
    isConnected: false,
    isSupportedNetwork: true,
    canWithdraw: false,
  },
  activityPreview: item.normalizedActivity.slice(0, 6).map((activity) => ({
    id: activity.id,
    vaultAddress: activity.vaultAddress,
    chainId: activity.chainId,
    type:
      activity.eventType === "deposit_confirmed"
        ? "deposit"
        : activity.eventType === "withdrawal_confirmed"
          ? "withdrawal"
          : "created",
    title: item.goalName,
    subtitle: item.goalName,
    occurredAt: activity.occurredAt,
    amount: activity.amountAtomic ? Number(activity.amountAtomic) / 1_000_000 : undefined,
    txHash: activity.txHash,
    source: "indexed",
  })),
  normalizedActivity: item.normalizedActivity.map(parseApiVaultActivityItem),
});

export const parseVaultListResponse = (response: VaultListResponse): VaultListResult => ({
  items: response.items.map(parseApiVaultSummaryItem),
});

export const parseVaultDetailResponse = (response: VaultDetailResponse): { item: VaultDetailEnriched } => ({
  item: parseApiVaultDetailItem(response.item),
});

export const parseVaultActivityResponse = (response: VaultActivityResponse): {
  items: VaultActivityItem[];
  hasMore: boolean;
  vaultAddress: `0x${string}`;
  chainId: SupportedChainId;
  freshness: SerializedSyncFreshnessSnapshot;
} => ({
  ...response,
  items: response.items.map(parseApiVaultActivityItem),
});

export const parseActivityFeedResponse = (response: ActivityFeedResponse): ActivityFeedResult => ({
  items: response.items.map(parseApiVaultActivityItem),
  hasMore: response.hasMore,
});

export const parseHealthResponse = (response: HealthResponse): { ok: boolean; checkedAt: string; chainSync: ChainSyncStatus[] } => ({
  ok: response.ok,
  checkedAt: response.checkedAt,
  chainSync: response.chainSync,
});
