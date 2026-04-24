import type { VaultActivityItem } from "./activity";
import type { SyncFreshnessSnapshot } from "./sync";
import type { Hash } from "viem";

import type { VaultActivityEvent, VaultDetailEnriched, VaultSummaryEnriched } from "./vault";

export type MetadataReconciliationState = "complete" | "pending" | "orphaned" | "failed";
export type ProductSyncState = "current" | "refreshing" | "catching_up" | "partial" | "unavailable";
export type EnrichedVaultReadState =
  | "backend_current"
  | "backend_syncing"
  | "backend_partial"
  | "backend_not_found"
  | "onchain_fallback"
  | "session_pending"
  | "unavailable";

export interface VaultSummaryApiModel extends VaultSummaryEnriched {}

export interface VaultDetailApiModel extends VaultDetailEnriched {}

export interface VaultActivityApiModel extends VaultActivityItem {
  freshness?: SyncFreshnessSnapshot | null;
}

export interface ActivityItemViewModel extends VaultActivityEvent {
  metadataReconciliation: MetadataReconciliationState;
  syncState: ProductSyncState;
}

export interface VaultSummaryViewModel extends VaultSummaryEnriched {
  metadataReconciliation: MetadataReconciliationState;
  readState: EnrichedVaultReadState;
  syncState: ProductSyncState;
}

export interface VaultDetailViewModel extends VaultDetailEnriched {
  activityItems: ActivityItemViewModel[];
  metadataReconciliation: MetadataReconciliationState;
  readState: EnrichedVaultReadState;
  syncState: ProductSyncState;
}

export interface PostTransactionRefreshState {
  status: "idle" | "refreshing" | "catching_up";
  chainId: VaultSummaryEnriched["chainId"];
  ownerAddress: VaultSummaryEnriched["ownerAddress"] | null;
  vaultAddress: VaultSummaryEnriched["address"] | null;
  flow: "create_vault" | "deposit" | "withdraw";
  txHash: Hash | null;
  startedAt: string | null;
  updatedAt: string | null;
}
