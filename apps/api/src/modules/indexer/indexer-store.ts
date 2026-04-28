import fs from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import type {
  GuardianApprovalState,
  SupportedChainId,
  VaultAccentTheme,
  VaultMetadataStatus,
  VaultReconciliationStatus,
  VaultRuleType,
  UnlockRequestStatus,
} from "@pocket-vault/shared";
import type { Address, Hash } from "viem";

import type {
  ApiIndexerStore,
  PersistedSyncStateRecord,
  PersistedVaultEventRecord,
  PersistedVaultRecord,
} from "../persistence/ports";

interface VaultRow {
  key: string;
  chain_id: number;
  contract_address: string;
  owner_wallet: string | null;
  asset_address: string | null;
  target_amount_atomic: string | null;
  rule_type: string;
  unlock_date: string | null;
  cooldown_duration_seconds: number | null;
  guardian_address: string | null;
  unlock_requested_at: string | null;
  unlock_eligible_at: string | null;
  unlock_request_status: string;
  guardian_approval_state: string;
  guardian_decision_at: string | null;
  created_at: string | null;
  created_tx_hash: string | null;
  display_name: string | null;
  category: string | null;
  note: string | null;
  accent_theme: string | null;
  metadata_status: string;
  reconciliation_status: string;
  total_deposited_atomic: string;
  total_withdrawn_atomic: string;
  current_balance_atomic: string;
  last_activity_at: string | null;
  last_indexed_at: string | null;
  onchain_found: number;
}

interface VaultEventRow {
  id: string;
  chain_id: number;
  tx_hash: string;
  block_number: number;
  log_index: number;
  vault_address: string;
  owner_address: string | null;
  actor_address: string | null;
  event_type: string;
  amount_atomic: string | null;
  occurred_at: string;
  indexed_at: string;
}

interface SyncStateRow {
  key: string;
  chain_id: number;
  stream_type: string;
  scope_key: string;
  lifecycle: string;
  latest_indexed_block: number | null;
  latest_indexed_log_index: number | null;
  latest_chain_block: number | null;
  last_synced_at: string | null;
  error_message: string | null;
}

const mapVaultRow = (row: VaultRow): PersistedVaultRecord => ({
  key: row.key,
  chainId: row.chain_id as SupportedChainId,
  contractAddress: row.contract_address as Address,
  ownerWallet: (row.owner_wallet as Address | null) ?? null,
  assetAddress: (row.asset_address as Address | null) ?? null,
  targetAmountAtomic: row.target_amount_atomic,
  ruleType: row.rule_type as VaultRuleType,
  unlockDate: row.unlock_date,
  cooldownDurationSeconds: row.cooldown_duration_seconds,
  guardianAddress: (row.guardian_address as Address | null) ?? null,
  unlockRequestedAt: row.unlock_requested_at,
  unlockEligibleAt: row.unlock_eligible_at,
  unlockRequestStatus: row.unlock_request_status as UnlockRequestStatus,
  guardianApprovalState: row.guardian_approval_state as GuardianApprovalState,
  guardianDecisionAt: row.guardian_decision_at,
  createdAt: row.created_at,
  createdTxHash: (row.created_tx_hash as Hash | null) ?? null,
  displayName: row.display_name,
  category: row.category,
  note: row.note,
  accentTheme: (row.accent_theme as VaultAccentTheme | null) ?? null,
  metadataStatus: row.metadata_status as VaultMetadataStatus,
  reconciliationStatus: row.reconciliation_status as VaultReconciliationStatus,
  totalDepositedAtomic: row.total_deposited_atomic,
  totalWithdrawnAtomic: row.total_withdrawn_atomic,
  currentBalanceAtomic: row.current_balance_atomic,
  lastActivityAt: row.last_activity_at,
  lastIndexedAt: row.last_indexed_at,
  onchainFound: row.onchain_found === 1,
});

const mapVaultEventRow = (row: VaultEventRow): PersistedVaultEventRecord => ({
  id: row.id,
  chainId: row.chain_id as SupportedChainId,
  txHash: row.tx_hash as Hash,
  blockNumber: row.block_number,
  logIndex: row.log_index,
  vaultAddress: row.vault_address as Address,
  ownerAddress: (row.owner_address as Address | null) ?? null,
  actorAddress: (row.actor_address as Address | null) ?? null,
  eventType: row.event_type as PersistedVaultEventRecord["eventType"],
  amountAtomic: row.amount_atomic,
  occurredAt: row.occurred_at,
  indexedAt: row.indexed_at,
});

const mapSyncStateRow = (row: SyncStateRow): PersistedSyncStateRecord => ({
  key: row.key,
  chainId: row.chain_id as SupportedChainId,
  streamType: row.stream_type as PersistedSyncStateRecord["streamType"],
  scopeKey: row.scope_key,
  lifecycle: row.lifecycle as PersistedSyncStateRecord["lifecycle"],
  latestIndexedBlock: row.latest_indexed_block,
  latestIndexedLogIndex: row.latest_indexed_log_index,
  latestChainBlock: row.latest_chain_block,
  lastSyncedAt: row.last_synced_at,
  errorMessage: row.error_message,
});

export class IndexerStore implements ApiIndexerStore {
  private readonly dbPath: string;
  private database: DatabaseSync | null = null;

  constructor(dataDir: string) {
    this.dbPath = path.join(dataDir, "goal-vault-indexer.sqlite");
  }

  async initialize() {
    if (this.database) {
      return;
    }

    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    const database = new DatabaseSync(this.dbPath);
    database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS vaults (
        key TEXT PRIMARY KEY,
        chain_id INTEGER NOT NULL,
        contract_address TEXT NOT NULL,
        owner_wallet TEXT,
        asset_address TEXT,
        target_amount_atomic TEXT,
        rule_type TEXT NOT NULL,
        unlock_date TEXT,
        cooldown_duration_seconds INTEGER,
        guardian_address TEXT,
        unlock_requested_at TEXT,
        unlock_eligible_at TEXT,
        unlock_request_status TEXT NOT NULL,
        guardian_approval_state TEXT NOT NULL,
        guardian_decision_at TEXT,
        created_at TEXT,
        created_tx_hash TEXT,
        display_name TEXT,
        category TEXT,
        note TEXT,
        accent_theme TEXT,
        metadata_status TEXT NOT NULL,
        reconciliation_status TEXT NOT NULL,
        total_deposited_atomic TEXT NOT NULL,
        total_withdrawn_atomic TEXT NOT NULL,
        current_balance_atomic TEXT NOT NULL,
        last_activity_at TEXT,
        last_indexed_at TEXT,
        onchain_found INTEGER NOT NULL DEFAULT 0
      );
      CREATE UNIQUE INDEX IF NOT EXISTS vaults_chain_contract_idx ON vaults (chain_id, contract_address);
      CREATE INDEX IF NOT EXISTS vaults_owner_idx ON vaults (chain_id, owner_wallet);

      CREATE TABLE IF NOT EXISTS vault_events (
        id TEXT PRIMARY KEY,
        chain_id INTEGER NOT NULL,
        tx_hash TEXT NOT NULL,
        block_number INTEGER NOT NULL,
        log_index INTEGER NOT NULL,
        vault_address TEXT NOT NULL,
        owner_address TEXT,
        actor_address TEXT,
        event_type TEXT NOT NULL,
        amount_atomic TEXT,
        occurred_at TEXT NOT NULL,
        indexed_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS vault_events_chain_vault_idx ON vault_events (chain_id, vault_address, block_number, log_index);
      CREATE INDEX IF NOT EXISTS vault_events_chain_owner_idx ON vault_events (chain_id, owner_address, block_number, log_index);

      CREATE TABLE IF NOT EXISTS sync_states (
        key TEXT PRIMARY KEY,
        chain_id INTEGER NOT NULL,
        stream_type TEXT NOT NULL,
        scope_key TEXT NOT NULL,
        lifecycle TEXT NOT NULL,
        latest_indexed_block INTEGER,
        latest_indexed_log_index INTEGER,
        latest_chain_block INTEGER,
        last_synced_at TEXT,
        error_message TEXT
      );
      CREATE INDEX IF NOT EXISTS sync_states_chain_stream_idx ON sync_states (chain_id, stream_type);
    `);

    this.database = database;
  }

  async listVaults() {
    return (
      this.getDatabase()
        .prepare(
          `SELECT
            key,
            chain_id,
            contract_address,
            owner_wallet,
            asset_address,
            target_amount_atomic,
            rule_type,
            unlock_date,
            cooldown_duration_seconds,
            guardian_address,
            unlock_requested_at,
            unlock_eligible_at,
            unlock_request_status,
            guardian_approval_state,
            guardian_decision_at,
            created_at,
            created_tx_hash,
            display_name,
            category,
            note,
            accent_theme,
            metadata_status,
            reconciliation_status,
            total_deposited_atomic,
            total_withdrawn_atomic,
            current_balance_atomic,
            last_activity_at,
            last_indexed_at,
            onchain_found
          FROM vaults
          ORDER BY chain_id ASC, contract_address ASC`,
        )
        .all() as unknown as VaultRow[]
    ).map((row) => mapVaultRow(row as unknown as VaultRow));
  }

  async getVault(chainId: SupportedChainId, contractAddress: Address) {
    const row = this.getDatabase()
      .prepare(
        `SELECT
          key,
          chain_id,
          contract_address,
          owner_wallet,
          asset_address,
          target_amount_atomic,
          rule_type,
          unlock_date,
          cooldown_duration_seconds,
          guardian_address,
          unlock_requested_at,
          unlock_eligible_at,
          unlock_request_status,
          guardian_approval_state,
          guardian_decision_at,
          created_at,
          created_tx_hash,
          display_name,
          category,
          note,
          accent_theme,
          metadata_status,
          reconciliation_status,
          total_deposited_atomic,
          total_withdrawn_atomic,
          current_balance_atomic,
          last_activity_at,
          last_indexed_at,
          onchain_found
        FROM vaults
        WHERE chain_id = ? AND lower(contract_address) = lower(?)`,
      )
      .get(chainId, contractAddress) as VaultRow | undefined;

    return row ? mapVaultRow(row) : null;
  }

  async upsertVault(record: PersistedVaultRecord) {
    this.getDatabase()
      .prepare(
        `INSERT INTO vaults (
          key,
          chain_id,
          contract_address,
          owner_wallet,
          asset_address,
          target_amount_atomic,
          rule_type,
          unlock_date,
          cooldown_duration_seconds,
          guardian_address,
          unlock_requested_at,
          unlock_eligible_at,
          unlock_request_status,
          guardian_approval_state,
          guardian_decision_at,
          created_at,
          created_tx_hash,
          display_name,
          category,
          note,
          accent_theme,
          metadata_status,
          reconciliation_status,
          total_deposited_atomic,
          total_withdrawn_atomic,
          current_balance_atomic,
          last_activity_at,
          last_indexed_at,
          onchain_found
        ) VALUES (
          @key,
          @chainId,
          @contractAddress,
          @ownerWallet,
          @assetAddress,
          @targetAmountAtomic,
          @ruleType,
          @unlockDate,
          @cooldownDurationSeconds,
          @guardianAddress,
          @unlockRequestedAt,
          @unlockEligibleAt,
          @unlockRequestStatus,
          @guardianApprovalState,
          @guardianDecisionAt,
          @createdAt,
          @createdTxHash,
          @displayName,
          @category,
          @note,
          @accentTheme,
          @metadataStatus,
          @reconciliationStatus,
          @totalDepositedAtomic,
          @totalWithdrawnAtomic,
          @currentBalanceAtomic,
          @lastActivityAt,
          @lastIndexedAt,
          @onchainFound
        )
        ON CONFLICT(key) DO UPDATE SET
          chain_id = excluded.chain_id,
          contract_address = excluded.contract_address,
          owner_wallet = excluded.owner_wallet,
          asset_address = excluded.asset_address,
          target_amount_atomic = excluded.target_amount_atomic,
          rule_type = excluded.rule_type,
          unlock_date = excluded.unlock_date,
          cooldown_duration_seconds = excluded.cooldown_duration_seconds,
          guardian_address = excluded.guardian_address,
          unlock_requested_at = excluded.unlock_requested_at,
          unlock_eligible_at = excluded.unlock_eligible_at,
          unlock_request_status = excluded.unlock_request_status,
          guardian_approval_state = excluded.guardian_approval_state,
          guardian_decision_at = excluded.guardian_decision_at,
          created_at = excluded.created_at,
          created_tx_hash = excluded.created_tx_hash,
          display_name = excluded.display_name,
          category = excluded.category,
          note = excluded.note,
          accent_theme = excluded.accent_theme,
          metadata_status = excluded.metadata_status,
          reconciliation_status = excluded.reconciliation_status,
          total_deposited_atomic = excluded.total_deposited_atomic,
          total_withdrawn_atomic = excluded.total_withdrawn_atomic,
          current_balance_atomic = excluded.current_balance_atomic,
          last_activity_at = excluded.last_activity_at,
          last_indexed_at = excluded.last_indexed_at,
          onchain_found = excluded.onchain_found`,
      )
      .run({
        ...record,
        onchainFound: record.onchainFound ? 1 : 0,
      } as unknown as Record<string, string | number | null>);
  }

  async listEvents() {
    return (
      this.getDatabase()
        .prepare(
          `SELECT
            id,
            chain_id,
            tx_hash,
            block_number,
            log_index,
            vault_address,
            owner_address,
            actor_address,
            event_type,
            amount_atomic,
            occurred_at,
            indexed_at
          FROM vault_events
          ORDER BY chain_id ASC, block_number ASC, log_index ASC`,
        )
        .all() as unknown as VaultEventRow[]
    ).map((row) => mapVaultEventRow(row as unknown as VaultEventRow));
  }

  async upsertEvent(record: PersistedVaultEventRecord) {
    this.getDatabase()
      .prepare(
        `INSERT INTO vault_events (
          id,
          chain_id,
          tx_hash,
          block_number,
          log_index,
          vault_address,
          owner_address,
          actor_address,
          event_type,
          amount_atomic,
          occurred_at,
          indexed_at
        ) VALUES (
          @id,
          @chainId,
          @txHash,
          @blockNumber,
          @logIndex,
          @vaultAddress,
          @ownerAddress,
          @actorAddress,
          @eventType,
          @amountAtomic,
          @occurredAt,
          @indexedAt
        )
        ON CONFLICT(id) DO UPDATE SET
          chain_id = excluded.chain_id,
          tx_hash = excluded.tx_hash,
          block_number = excluded.block_number,
          log_index = excluded.log_index,
          vault_address = excluded.vault_address,
          owner_address = excluded.owner_address,
          actor_address = excluded.actor_address,
          event_type = excluded.event_type,
          amount_atomic = excluded.amount_atomic,
          occurred_at = excluded.occurred_at,
          indexed_at = excluded.indexed_at`,
      )
      .run(record as unknown as Record<string, string | number | null>);
  }

  async getSyncState(key: string) {
    const row = this.getDatabase()
      .prepare(
        `SELECT
          key,
          chain_id,
          stream_type,
          scope_key,
          lifecycle,
          latest_indexed_block,
          latest_indexed_log_index,
          latest_chain_block,
          last_synced_at,
          error_message
        FROM sync_states
        WHERE key = ?`,
      )
      .get(key) as SyncStateRow | undefined;

    return row ? mapSyncStateRow(row) : null;
  }

  async listSyncStates() {
    return (
      this.getDatabase()
        .prepare(
          `SELECT
            key,
            chain_id,
            stream_type,
            scope_key,
            lifecycle,
            latest_indexed_block,
            latest_indexed_log_index,
            latest_chain_block,
            last_synced_at,
            error_message
          FROM sync_states
          ORDER BY key ASC`,
        )
        .all() as unknown as SyncStateRow[]
    ).map((row) => mapSyncStateRow(row as unknown as SyncStateRow));
  }

  async upsertSyncState(record: PersistedSyncStateRecord) {
    this.getDatabase()
      .prepare(
        `INSERT INTO sync_states (
          key,
          chain_id,
          stream_type,
          scope_key,
          lifecycle,
          latest_indexed_block,
          latest_indexed_log_index,
          latest_chain_block,
          last_synced_at,
          error_message
        ) VALUES (
          @key,
          @chainId,
          @streamType,
          @scopeKey,
          @lifecycle,
          @latestIndexedBlock,
          @latestIndexedLogIndex,
          @latestChainBlock,
          @lastSyncedAt,
          @errorMessage
        )
        ON CONFLICT(key) DO UPDATE SET
          chain_id = excluded.chain_id,
          stream_type = excluded.stream_type,
          scope_key = excluded.scope_key,
          lifecycle = excluded.lifecycle,
          latest_indexed_block = excluded.latest_indexed_block,
          latest_indexed_log_index = excluded.latest_indexed_log_index,
          latest_chain_block = excluded.latest_chain_block,
          last_synced_at = excluded.last_synced_at,
          error_message = excluded.error_message`,
      )
      .run(record as unknown as Record<string, string | number | null>);
  }

  async close() {
    if (!this.database) {
      return;
    }

    this.database.close();
    this.database = null;
  }

  private getDatabase() {
    if (!this.database) {
      throw new Error("IndexerStore must be initialized before use.");
    }

    return this.database;
  }
}
