import type {
  GuardianApprovalState,
  SupportRequestListFilters,
  SupportRequestRecord,
  SupportRequestStatus,
  SupportedChainId,
  VaultAccentTheme,
  VaultMetadataStatus,
  VaultReconciliationStatus,
  VaultRuleType,
  UnlockRequestStatus,
} from "@pocket-vault/shared";
import type { Address, Hash } from "viem";

import type { AnalyticsStoredEvent } from "../../lib/observability/analytics";

export interface PersistedVaultRecord {
  key: string;
  chainId: SupportedChainId;
  contractAddress: Address;
  ownerWallet: Address | null;
  assetAddress: Address | null;
  targetAmountAtomic: string | null;
  ruleType: VaultRuleType;
  unlockDate: string | null;
  cooldownDurationSeconds: number | null;
  guardianAddress: Address | null;
  unlockRequestedAt: string | null;
  unlockEligibleAt: string | null;
  unlockRequestStatus: UnlockRequestStatus;
  guardianApprovalState: GuardianApprovalState;
  guardianDecisionAt: string | null;
  createdAt: string | null;
  createdTxHash: Hash | null;
  displayName: string | null;
  category: string | null;
  note: string | null;
  accentTheme: VaultAccentTheme | null;
  metadataStatus: VaultMetadataStatus;
  reconciliationStatus: VaultReconciliationStatus;
  totalDepositedAtomic: string;
  totalWithdrawnAtomic: string;
  currentBalanceAtomic: string;
  lastActivityAt: string | null;
  lastIndexedAt: string | null;
  onchainFound: boolean;
}

export interface PersistedVaultEventRecord {
  id: string;
  chainId: SupportedChainId;
  txHash: Hash;
  blockNumber: number;
  logIndex: number;
  vaultAddress: Address;
  ownerAddress: Address | null;
  actorAddress: Address | null;
  eventType:
    | "vault_created"
    | "deposit_confirmed"
    | "withdrawal_confirmed"
    | "unlock_requested"
    | "unlock_canceled"
    | "guardian_approved"
    | "guardian_rejected";
  amountAtomic: string | null;
  occurredAt: string;
  indexedAt: string;
}

export interface PersistedSyncStateRecord {
  key: string;
  chainId: SupportedChainId;
  streamType: "factory" | "vault";
  scopeKey: string;
  lifecycle: "idle" | "running" | "error";
  latestIndexedBlock: number | null;
  latestIndexedLogIndex: number | null;
  latestChainBlock: number | null;
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

export interface ApiIndexerReadStore {
  listVaults(): Promise<PersistedVaultRecord[]>;
  getVault(chainId: SupportedChainId, contractAddress: Address): Promise<PersistedVaultRecord | null>;
  listEvents(): Promise<PersistedVaultEventRecord[]>;
  getSyncState(key: string): Promise<PersistedSyncStateRecord | null>;
  listSyncStates(): Promise<PersistedSyncStateRecord[]>;
}

export interface ApiIndexerWriteStore {
  upsertVault(record: PersistedVaultRecord): Promise<void>;
  upsertEvent(record: PersistedVaultEventRecord): Promise<void>;
  upsertSyncState(record: PersistedSyncStateRecord): Promise<void>;
}

export type ApiIndexerStore = ApiIndexerReadStore & ApiIndexerWriteStore;

export interface ApiAnalyticsStore {
  append(events: AnalyticsStoredEvent[]): Promise<void>;
}

export interface ApiSupportStore {
  create(record: SupportRequestRecord): Promise<void>;
  list(filters: SupportRequestListFilters): Promise<SupportRequestRecord[]>;
  get(id: string): Promise<SupportRequestRecord | null>;
  updateStatus(id: string, status: SupportRequestStatus): Promise<SupportRequestRecord | null>;
}
