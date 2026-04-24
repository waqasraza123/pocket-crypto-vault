import fs from "node:fs/promises";
import path from "node:path";

import type {
  GuardianApprovalState,
  VaultAccentTheme,
  VaultMetadataStatus,
  VaultReconciliationStatus,
  VaultRuleType,
  UnlockRequestStatus,
} from "@goal-vault/shared";
import type { Address, Hash } from "viem";

import type { SupportedChainId } from "@goal-vault/shared";

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

interface DatabaseSnapshot {
  version: 1;
  vaults: PersistedVaultRecord[];
  vaultEvents: PersistedVaultEventRecord[];
  syncStates: PersistedSyncStateRecord[];
}

const createEmptySnapshot = (): DatabaseSnapshot => ({
  version: 1,
  vaults: [],
  vaultEvents: [],
  syncStates: [],
});

export class IndexerStore {
  private readonly dbPath: string;
  private snapshot: DatabaseSnapshot = createEmptySnapshot();
  private writeQueue: Promise<void> = Promise.resolve();
  private initialized = false;

  constructor(dataDir: string) {
    this.dbPath = path.join(dataDir, "goal-vault-indexer.json");
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    try {
      const raw = await fs.readFile(this.dbPath, "utf8");
      const parsed = JSON.parse(raw) as Partial<DatabaseSnapshot>;
      this.snapshot = {
        version: 1,
        vaults: Array.isArray(parsed.vaults) ? parsed.vaults : [],
        vaultEvents: Array.isArray(parsed.vaultEvents) ? parsed.vaultEvents : [],
        syncStates: Array.isArray(parsed.syncStates) ? parsed.syncStates : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }

      this.snapshot = createEmptySnapshot();
      await this.persist();
    }

    this.initialized = true;
  }

  listVaults() {
    return [...this.snapshot.vaults];
  }

  getVault(chainId: SupportedChainId, contractAddress: Address) {
    return (
      this.snapshot.vaults.find(
        (item) => item.chainId === chainId && item.contractAddress.toLowerCase() === contractAddress.toLowerCase(),
      ) ?? null
    );
  }

  async upsertVault(record: PersistedVaultRecord) {
    const nextVaults = this.snapshot.vaults.filter((item) => item.key !== record.key);
    nextVaults.push(record);
    this.snapshot = {
      ...this.snapshot,
      vaults: nextVaults,
    };
    await this.persist();
  }

  listEvents() {
    return [...this.snapshot.vaultEvents];
  }

  async upsertEvent(record: PersistedVaultEventRecord) {
    const nextEvents = this.snapshot.vaultEvents.filter((item) => item.id !== record.id);
    nextEvents.push(record);
    this.snapshot = {
      ...this.snapshot,
      vaultEvents: nextEvents,
    };
    await this.persist();
  }

  getSyncState(key: string) {
    return this.snapshot.syncStates.find((item) => item.key === key) ?? null;
  }

  listSyncStates() {
    return [...this.snapshot.syncStates];
  }

  async upsertSyncState(record: PersistedSyncStateRecord) {
    const nextStates = this.snapshot.syncStates.filter((item) => item.key !== record.key);
    nextStates.push(record);
    this.snapshot = {
      ...this.snapshot,
      syncStates: nextStates,
    };
    await this.persist();
  }

  private async persist() {
    this.writeQueue = this.writeQueue.then(async () => {
      await fs.writeFile(this.dbPath, JSON.stringify(this.snapshot, null, 2), "utf8");
    });
    await this.writeQueue;
  }
}
