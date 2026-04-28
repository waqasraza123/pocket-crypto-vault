import type { SupportedChainId } from "./chain";
import type { ApiHealthSummary, StagingReadinessSummary } from "./app-readiness";
import type { AppEnvironment, ProductionActivationReadinessState, ReleaseReadinessState } from "./deployment";

export type SyncFreshnessState = "current" | "syncing" | "lagging" | "unavailable";
export type ChainSyncStreamType = "factory" | "vault";
export type ChainSyncLifecycle = "idle" | "running" | "error";
export type VaultReconciliationStatus = "metadata_complete" | "metadata_pending" | "metadata_orphaned";

export interface ChainSyncStatus {
  key: string;
  chainId: SupportedChainId;
  streamType: ChainSyncStreamType;
  scopeKey: string;
  lifecycle: ChainSyncLifecycle;
  freshness: SyncFreshnessState;
  latestIndexedBlock: number | null;
  latestIndexedLogIndex: number | null;
  latestChainBlock: number | null;
  lagBlocks: number | null;
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

export interface SyncFreshnessSnapshot {
  freshness: SyncFreshnessState;
  lastSyncedAt: string | null;
  latestIndexedBlock: number | null;
  latestChainBlock: number | null;
  lagBlocks: number | null;
}

export interface HealthStatus {
  ok: boolean;
  checkedAt: string;
  environment: AppEnvironment;
  chainSync: ChainSyncStatus[];
  api: ApiHealthSummary;
  staging: StagingReadinessSummary;
  release: ReleaseReadinessState;
  productionActivation: ProductionActivationReadinessState;
  validationErrors: string[];
}
