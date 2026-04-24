import type {
  ActivityItemViewModel,
  MetadataReconciliationState,
  ProductSyncState,
  VaultActivityEvent,
  VaultActivityItem,
  VaultDetailApiModel,
} from "@goal-vault/shared";

import { formatUsdc } from "../format";
import { getCurrentMessages, interpolate } from "../i18n";

export const createActivityDedupeKey = ({
  txHash,
  type,
  vaultAddress,
}: {
  txHash?: `0x${string}`;
  type: VaultActivityEvent["type"];
  vaultAddress: `0x${string}`;
}) => `${vaultAddress.toLowerCase()}:${type}:${txHash?.toLowerCase() ?? "local"}`;

export const getMetadataReconciliationState = ({
  metadataStatus,
  reconciliationStatus,
}: {
  metadataStatus?: VaultDetailApiModel["metadataStatus"];
  reconciliationStatus?: VaultDetailApiModel["reconciliationStatus"];
}): MetadataReconciliationState => {
  if (metadataStatus === "failed") {
    return "failed";
  }

  if (reconciliationStatus === "metadata_orphaned") {
    return "orphaned";
  }

  if (metadataStatus === "pending" || reconciliationStatus === "metadata_pending") {
    return "pending";
  }

  return "complete";
};

export const mapFreshnessToProductSyncState = ({
  freshness,
  isRefreshing,
  hasPartialData,
}: {
  freshness?: VaultDetailApiModel["freshness"] | null;
  isRefreshing?: boolean;
  hasPartialData?: boolean;
}): ProductSyncState => {
  if (hasPartialData) {
    return "partial";
  }

  if (isRefreshing) {
    return freshness?.freshness === "lagging" ? "catching_up" : "refreshing";
  }

  if (!freshness || freshness.freshness === "unavailable") {
    return "unavailable";
  }

  if (freshness.freshness === "lagging") {
    return "catching_up";
  }

  if (freshness.freshness === "syncing") {
    return "refreshing";
  }

  return "current";
};

export const mapActivityItemToViewEvent = ({
  item,
  syncState,
}: {
  item: VaultActivityItem;
  syncState: ProductSyncState;
}): ActivityItemViewModel => {
  const messages = getCurrentMessages();
  const goalName = item.displayName ?? messages.activityFeed.fallbackGoalName;
  const amount = item.amountAtomic ? Number(item.amountAtomic) / 1_000_000 : undefined;
  const metadataReconciliation = getMetadataReconciliationState({
    metadataStatus: item.metadataStatus,
  });

  if (item.eventType === "deposit_confirmed") {
    return {
      id: item.id,
      vaultAddress: item.vaultAddress,
      chainId: item.chainId,
      type: "deposit",
      title: messages.deposit.activityTitle,
      subtitle: interpolate(messages.deposit.activitySubtitle, { goal: goalName }),
      occurredAt: item.occurredAt,
      amount,
      txHash: item.txHash,
      source: "indexed",
      metadataReconciliation,
      syncState,
    };
  }

  if (item.eventType === "withdrawal_confirmed") {
    return {
      id: item.id,
      vaultAddress: item.vaultAddress,
      chainId: item.chainId,
      type: "withdrawal",
      title: messages.withdraw.activityTitle,
      subtitle: interpolate(messages.withdraw.activitySubtitle, {
        goal: goalName,
        amount: formatUsdc(amount ?? 0),
      }),
      occurredAt: item.occurredAt,
      amount,
      txHash: item.txHash,
      source: "indexed",
      metadataReconciliation,
      syncState,
    };
  }

  if (item.eventType === "unlock_requested") {
    return {
      id: item.id,
      vaultAddress: item.vaultAddress,
      chainId: item.chainId,
      type: "unlock_requested",
      title: "Unlock requested",
      subtitle: interpolate(messages.activityFeed.createdSubtitle, { goal: goalName }),
      occurredAt: item.occurredAt,
      txHash: item.txHash,
      source: "indexed",
      metadataReconciliation,
      syncState,
    };
  }

  if (item.eventType === "unlock_canceled") {
    return {
      id: item.id,
      vaultAddress: item.vaultAddress,
      chainId: item.chainId,
      type: "unlock_canceled",
      title: "Unlock request canceled",
      subtitle: interpolate(messages.activityFeed.createdSubtitle, { goal: goalName }),
      occurredAt: item.occurredAt,
      txHash: item.txHash,
      source: "indexed",
      metadataReconciliation,
      syncState,
    };
  }

  if (item.eventType === "guardian_approved") {
    return {
      id: item.id,
      vaultAddress: item.vaultAddress,
      chainId: item.chainId,
      type: "guardian_approved",
      title: "Guardian approved",
      subtitle: interpolate(messages.activityFeed.createdSubtitle, { goal: goalName }),
      occurredAt: item.occurredAt,
      txHash: item.txHash,
      source: "indexed",
      metadataReconciliation,
      syncState,
    };
  }

  if (item.eventType === "guardian_rejected") {
    return {
      id: item.id,
      vaultAddress: item.vaultAddress,
      chainId: item.chainId,
      type: "guardian_rejected",
      title: "Guardian rejected",
      subtitle: interpolate(messages.activityFeed.createdSubtitle, { goal: goalName }),
      occurredAt: item.occurredAt,
      txHash: item.txHash,
      source: "indexed",
      metadataReconciliation,
      syncState,
    };
  }

  return {
    id: item.id,
    vaultAddress: item.vaultAddress,
    chainId: item.chainId,
    type: "created",
    title: messages.activityFeed.createdTitle,
    subtitle: interpolate(messages.activityFeed.createdSubtitle, { goal: goalName }),
    occurredAt: item.occurredAt,
    txHash: item.txHash,
    source: "indexed",
    metadataReconciliation,
    syncState,
  };
};

export const mapActivityItemsToPreview = ({
  items,
  syncState,
}: {
  items: VaultActivityItem[];
  syncState: ProductSyncState;
}) => items.map((item) => mapActivityItemToViewEvent({ item, syncState })).slice(0, 6);
