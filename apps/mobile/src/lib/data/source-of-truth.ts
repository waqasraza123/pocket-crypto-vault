import type {
  ActivityItemViewModel,
  EnrichedVaultReadState,
  MetadataReconciliationState,
  PostTransactionRefreshState,
  ProductSyncState,
  SyncFreshnessSnapshot,
  VaultActivityEvent,
  VaultActivityItem,
  VaultDetail,
  VaultDetailApiModel,
  VaultDetailViewModel,
  VaultMetadataRecord,
  VaultSummary,
  VaultSummaryApiModel,
  VaultSummaryViewModel,
} from "@goal-vault/shared";

import { createSessionVaultDetail, createSessionVaultSummary } from "../contracts/mappers";
import { mapActivityItemToViewEvent, mapActivityItemsToPreview, mapFreshnessToProductSyncState, getMetadataReconciliationState, createActivityDedupeKey } from "../api/mappers";
import { applySessionRuleActivityToVault } from "./rule-overrides";

const emptyFreshness: SyncFreshnessSnapshot = {
  freshness: "unavailable",
  lastSyncedAt: null,
  latestIndexedBlock: null,
  latestChainBlock: null,
  lagBlocks: null,
};

const isBackendSummary = (vault: VaultSummary | VaultSummaryApiModel): vault is VaultSummaryApiModel =>
  "reconciliationStatus" in vault && "activityCount" in vault && "freshness" in vault;

const applyMetadataToVault = <TVault extends VaultSummary | VaultDetail>({
  vault,
  metadata,
}: {
  vault: TVault;
  metadata: VaultMetadataRecord | null;
}): TVault =>
  metadata
    ? ({
        ...vault,
        goalName: metadata.displayName,
        category: metadata.category,
        note: metadata.note,
        accentTheme: metadata.accentTheme,
        accentTone: metadata.accentTone,
        metadataStatus: metadata.metadataStatus,
      } as TVault)
    : vault;

const getReadState = ({
  freshness,
  hasBackend,
  hasFallback,
  hasSession,
  notFound,
}: {
  freshness?: SyncFreshnessSnapshot | null;
  hasBackend: boolean;
  hasFallback: boolean;
  hasSession: boolean;
  notFound?: boolean;
}): EnrichedVaultReadState => {
  if (notFound) {
    return "backend_not_found";
  }

  if (hasBackend) {
    if (freshness?.freshness === "current") {
      return "backend_current";
    }

    return freshness?.freshness === "unavailable" ? "backend_partial" : "backend_syncing";
  }

  if (hasFallback) {
    return "onchain_fallback";
  }

  if (hasSession) {
    return "session_pending";
  }

  return "unavailable";
};

const getSyncState = ({
  freshness,
  refreshState,
  hasPartialData,
}: {
  freshness?: SyncFreshnessSnapshot | null;
  refreshState?: PostTransactionRefreshState | null;
  hasPartialData?: boolean;
}): ProductSyncState =>
  mapFreshnessToProductSyncState({
    freshness,
    hasPartialData,
    isRefreshing: Boolean(refreshState && refreshState.status !== "idle"),
  });

const toMetadataReconciliationState = ({
  metadataStatus,
  reconciliationStatus,
}: {
  metadataStatus?: VaultSummaryApiModel["metadataStatus"];
  reconciliationStatus?: VaultSummaryApiModel["reconciliationStatus"];
}): MetadataReconciliationState =>
  getMetadataReconciliationState({
    metadataStatus,
    reconciliationStatus,
  });

export const mergeVaultSummaries = ({
  backendVaults,
  fallbackVaults,
  sessionEvents,
  sessionMetadata,
  refreshState,
}: {
  backendVaults: VaultSummaryApiModel[] | null;
  fallbackVaults: VaultSummary[] | null;
  sessionEvents: VaultActivityEvent[];
  sessionMetadata: VaultMetadataRecord[];
  refreshState?: PostTransactionRefreshState | null;
}): VaultSummaryViewModel[] => {
  const vaultMap = new Map<string, VaultSummaryViewModel>();
  const sourceVaults = backendVaults ?? fallbackVaults ?? [];
  const hasBackend = Boolean(backendVaults);
  const hasFallback = Boolean(!backendVaults && fallbackVaults);

  for (const vault of sourceVaults) {
    const metadata = sessionMetadata.find((record) => record.contractAddress.toLowerCase() === vault.address.toLowerCase()) ?? null;
    const merged = applySessionRuleActivityToVault({
      sessionEvents,
      vault: applyMetadataToVault({
        vault,
        metadata,
      }),
    });
    const isBackendVault = isBackendSummary(vault);
    const freshness = isBackendVault ? vault.freshness : emptyFreshness;
    vaultMap.set(vault.address.toLowerCase(), {
      ...(merged as VaultSummaryApiModel),
      reconciliationStatus: isBackendVault ? vault.reconciliationStatus : "metadata_pending",
      activityCount: isBackendVault ? vault.activityCount : 0,
      lastActivityAt: isBackendVault ? vault.lastActivityAt : null,
      freshness,
      metadataReconciliation: toMetadataReconciliationState({
        metadataStatus: merged.metadataStatus,
        reconciliationStatus: isBackendVault ? vault.reconciliationStatus : "metadata_pending",
      }),
      readState: getReadState({
        freshness,
        hasBackend,
        hasFallback,
        hasSession: Boolean(metadata),
      }),
      syncState: getSyncState({
        freshness,
        refreshState,
        hasPartialData: hasFallback,
      }),
    });
  }

  for (const metadata of sessionMetadata) {
    const key = metadata.contractAddress.toLowerCase();

    if (!vaultMap.has(key)) {
      const sessionVault = createSessionVaultSummary(metadata);
      vaultMap.set(key, {
        ...applySessionRuleActivityToVault({
          sessionEvents,
          vault: sessionVault,
        }),
        reconciliationStatus: "metadata_pending",
        activityCount: 0,
        lastActivityAt: metadata.createdAt,
        freshness: emptyFreshness,
        metadataReconciliation: toMetadataReconciliationState({
          metadataStatus: metadata.metadataStatus,
          reconciliationStatus: "metadata_pending",
        }),
        readState: "session_pending",
        syncState: getSyncState({
          freshness: emptyFreshness,
          refreshState,
        }),
      });
    }
  }

  return Array.from(vaultMap.values()).sort((left, right) => {
    const leftDate = left.lastActivityAt ?? left.unlockDate ?? new Date(0).toISOString();
    const rightDate = right.lastActivityAt ?? right.unlockDate ?? new Date(0).toISOString();

    return leftDate < rightDate ? 1 : -1;
  });
};

const mergeActivityItems = ({
  backendItems,
  sessionEvents,
  syncState,
}: {
  backendItems: VaultActivityItem[];
  sessionEvents: VaultActivityEvent[];
  syncState: ProductSyncState;
}): ActivityItemViewModel[] => {
  const activityMap = new Map<string, ActivityItemViewModel>();

  for (const item of backendItems) {
    const mapped = mapActivityItemToViewEvent({
      item,
      syncState,
    });
    activityMap.set(
      createActivityDedupeKey({
        txHash: mapped.txHash,
        type: mapped.type,
        vaultAddress: mapped.vaultAddress,
      }),
      mapped,
    );
  }

  for (const event of sessionEvents) {
    activityMap.set(
      createActivityDedupeKey({
        txHash: event.txHash,
        type: event.type,
        vaultAddress: event.vaultAddress,
      }),
      {
        ...event,
        metadataReconciliation: "pending",
        syncState: syncState === "current" ? "refreshing" : syncState,
      },
    );
  }

  return Array.from(activityMap.values()).sort((left, right) => (left.occurredAt < right.occurredAt ? 1 : -1));
};

export const mergeVaultDetailRecord = ({
  backendVault,
  fallbackVault,
  sessionMetadata,
  sessionEvents,
  refreshState,
}: {
  backendVault: VaultDetailApiModel | null;
  fallbackVault: VaultDetail | null;
  sessionMetadata: VaultMetadataRecord | null;
  sessionEvents: VaultActivityEvent[];
  refreshState?: PostTransactionRefreshState | null;
}): VaultDetailViewModel | null => {
  const sourceVault = backendVault ?? fallbackVault ?? (sessionMetadata ? createSessionVaultDetail(sessionMetadata) : null);

  if (!sourceVault) {
    return null;
  }

  const mergedVault = applyMetadataToVault({
    vault: sourceVault,
    metadata: sessionMetadata,
  });
  const mergedRuleAwareVault = applySessionRuleActivityToVault({
    sessionEvents,
    vault: mergedVault,
  });
  const freshness = backendVault?.freshness ?? emptyFreshness;
  const syncState = getSyncState({
    freshness,
    refreshState,
    hasPartialData: Boolean(!backendVault && fallbackVault),
  });
  const activityItems = mergeActivityItems({
    backendItems: backendVault?.normalizedActivity ?? [],
    sessionEvents,
    syncState,
  });
  const metadataReconciliation = toMetadataReconciliationState({
    metadataStatus: mergedRuleAwareVault.metadataStatus,
    reconciliationStatus: backendVault?.reconciliationStatus ?? "metadata_pending",
  });

  return {
    ...(mergedRuleAwareVault as VaultDetailApiModel),
    reconciliationStatus: backendVault?.reconciliationStatus ?? "metadata_pending",
    freshness,
    normalizedActivity: backendVault?.normalizedActivity ?? [],
    activityPreview:
      activityItems.length > 0
        ? activityItems.slice(0, 6)
        : mapActivityItemsToPreview({
            items: backendVault?.normalizedActivity ?? [],
            syncState,
          }),
    activityItems,
    metadataReconciliation,
    readState: getReadState({
      freshness,
      hasBackend: Boolean(backendVault),
      hasFallback: Boolean(!backendVault && fallbackVault),
      hasSession: Boolean(sessionMetadata),
    }),
    syncState,
  };
};

export const mergeOwnerActivityFeed = ({
  backendItems,
  sessionEvents,
  refreshState,
}: {
  backendItems: VaultActivityItem[] | null;
  sessionEvents: VaultActivityEvent[];
  refreshState?: PostTransactionRefreshState | null;
}) =>
  mergeActivityItems({
    backendItems: backendItems ?? [],
    sessionEvents,
    syncState: getSyncState({
      freshness: null,
      refreshState,
      hasPartialData: !backendItems,
    }),
  });
