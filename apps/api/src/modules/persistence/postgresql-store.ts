import type {
  GuardianApprovalState,
  SupportedChainId,
  VaultAccentTheme,
  VaultMetadataStatus,
  VaultReconciliationStatus,
  VaultRuleType,
  UnlockRequestStatus,
} from "@goal-vault/shared";
import type { Address, Hash } from "viem";

import type { AnalyticsStoredEvent } from "../../lib/observability/analytics";
import type {
  ApiAnalyticsStore,
  ApiIndexerStore,
  PersistedSyncStateRecord,
  PersistedVaultEventRecord,
  PersistedVaultRecord,
} from "./ports";

export type PostgresqlQueryValue = string | number | boolean | null;

export interface PostgresqlQueryResult<Row> {
  rows: Row[];
}

export interface PostgresqlQueryExecutor {
  query<Row>(sql: string, values?: readonly PostgresqlQueryValue[]): Promise<PostgresqlQueryResult<Row>>;
  transaction?<Result>(operation: (executor: PostgresqlQueryExecutor) => Promise<Result>): Promise<Result>;
}

interface PostgresqlStoreOptions {
  schemaName: string;
  queryExecutor: PostgresqlQueryExecutor;
}

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
  onchain_found: boolean | number | string;
}

interface VaultEventRow {
  id: string;
  chain_id: number;
  tx_hash: string;
  block_number: number | string;
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
  latest_indexed_block: number | string | null;
  latest_indexed_log_index: number | null;
  latest_chain_block: number | string | null;
  last_synced_at: string | null;
  error_message: string | null;
}

const identifierPattern = /^[a-z_][a-z0-9_]*$/;

const quoteIdentifier = (value: string) => `"${value.replaceAll('"', '""')}"`;

const normalizeSchemaName = (schemaName: string) => {
  const value = schemaName.trim();

  if (!identifierPattern.test(value)) {
    throw new Error("PostgreSQL persistence schema name must be a lowercase PostgreSQL identifier.");
  }

  return value;
};

const tableName = (schemaName: string, table: string) => `${quoteIdentifier(schemaName)}.${quoteIdentifier(table)}`;

const normalizeNumber = (value: number | string) => {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw new Error("PostgreSQL persistence returned an invalid integer value.");
  }

  return parsed;
};

const normalizeNullableNumber = (value: number | string | null) => (value === null ? null : normalizeNumber(value));

const normalizeBoolean = (value: boolean | number | string) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return value === "true" || value === "t" || value === "1";
};

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
  onchainFound: normalizeBoolean(row.onchain_found),
});

const mapVaultEventRow = (row: VaultEventRow): PersistedVaultEventRecord => ({
  id: row.id,
  chainId: row.chain_id as SupportedChainId,
  txHash: row.tx_hash as Hash,
  blockNumber: normalizeNumber(row.block_number),
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
  latestIndexedBlock: normalizeNullableNumber(row.latest_indexed_block),
  latestIndexedLogIndex: row.latest_indexed_log_index,
  latestChainBlock: normalizeNullableNumber(row.latest_chain_block),
  lastSyncedAt: row.last_synced_at,
  errorMessage: row.error_message,
});

const vaultColumns = [
  "key",
  "chain_id",
  "contract_address",
  "owner_wallet",
  "asset_address",
  "target_amount_atomic",
  "rule_type",
  "unlock_date",
  "cooldown_duration_seconds",
  "guardian_address",
  "unlock_requested_at",
  "unlock_eligible_at",
  "unlock_request_status",
  "guardian_approval_state",
  "guardian_decision_at",
  "created_at",
  "created_tx_hash",
  "display_name",
  "category",
  "note",
  "accent_theme",
  "metadata_status",
  "reconciliation_status",
  "total_deposited_atomic",
  "total_withdrawn_atomic",
  "current_balance_atomic",
  "last_activity_at",
  "last_indexed_at",
  "onchain_found",
] as const;

const vaultEventColumns = [
  "id",
  "chain_id",
  "tx_hash",
  "block_number",
  "log_index",
  "vault_address",
  "owner_address",
  "actor_address",
  "event_type",
  "amount_atomic",
  "occurred_at",
  "indexed_at",
] as const;

const syncStateColumns = [
  "key",
  "chain_id",
  "stream_type",
  "scope_key",
  "lifecycle",
  "latest_indexed_block",
  "latest_indexed_log_index",
  "latest_chain_block",
  "last_synced_at",
  "error_message",
] as const;

const buildPlaceholders = (start: number, count: number) =>
  Array.from({ length: count }, (_, index) => `$${start + index}`).join(", ");

const runInTransaction = async <Result>(
  queryExecutor: PostgresqlQueryExecutor,
  operation: (executor: PostgresqlQueryExecutor) => Promise<Result>,
) => {
  if (queryExecutor.transaction) {
    return queryExecutor.transaction(operation);
  }

  await queryExecutor.query("BEGIN");

  try {
    const result = await operation(queryExecutor);
    await queryExecutor.query("COMMIT");
    return result;
  } catch (error) {
    await queryExecutor.query("ROLLBACK");
    throw error;
  }
};

export class PostgresqlIndexerStore implements ApiIndexerStore {
  private readonly queryExecutor: PostgresqlQueryExecutor;
  private readonly vaultsTable: string;
  private readonly vaultEventsTable: string;
  private readonly syncStatesTable: string;

  constructor(options: PostgresqlStoreOptions) {
    const schemaName = normalizeSchemaName(options.schemaName);
    this.queryExecutor = options.queryExecutor;
    this.vaultsTable = tableName(schemaName, "vaults");
    this.vaultEventsTable = tableName(schemaName, "vault_events");
    this.syncStatesTable = tableName(schemaName, "sync_states");
  }

  async listVaults() {
    const result = await this.queryExecutor.query<VaultRow>(
      `SELECT ${vaultColumns.join(", ")} FROM ${this.vaultsTable} ORDER BY chain_id ASC, lower(contract_address) ASC`,
    );

    return result.rows.map(mapVaultRow);
  }

  async getVault(chainId: SupportedChainId, contractAddress: Address) {
    const result = await this.queryExecutor.query<VaultRow>(
      `SELECT ${vaultColumns.join(", ")} FROM ${this.vaultsTable} WHERE chain_id = $1 AND lower(contract_address) = lower($2) LIMIT 1`,
      [chainId, contractAddress],
    );

    return result.rows[0] ? mapVaultRow(result.rows[0]) : null;
  }

  async upsertVault(record: PersistedVaultRecord) {
    await this.queryExecutor.query(
      `INSERT INTO ${this.vaultsTable} (
        ${vaultColumns.join(", ")}
      ) VALUES (
        ${buildPlaceholders(1, vaultColumns.length)}
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
      [
        record.key,
        record.chainId,
        record.contractAddress,
        record.ownerWallet,
        record.assetAddress,
        record.targetAmountAtomic,
        record.ruleType,
        record.unlockDate,
        record.cooldownDurationSeconds,
        record.guardianAddress,
        record.unlockRequestedAt,
        record.unlockEligibleAt,
        record.unlockRequestStatus,
        record.guardianApprovalState,
        record.guardianDecisionAt,
        record.createdAt,
        record.createdTxHash,
        record.displayName,
        record.category,
        record.note,
        record.accentTheme,
        record.metadataStatus,
        record.reconciliationStatus,
        record.totalDepositedAtomic,
        record.totalWithdrawnAtomic,
        record.currentBalanceAtomic,
        record.lastActivityAt,
        record.lastIndexedAt,
        record.onchainFound,
      ],
    );
  }

  async listEvents() {
    const result = await this.queryExecutor.query<VaultEventRow>(
      `SELECT ${vaultEventColumns.join(", ")} FROM ${this.vaultEventsTable} ORDER BY chain_id ASC, block_number ASC, log_index ASC`,
    );

    return result.rows.map(mapVaultEventRow);
  }

  async upsertEvent(record: PersistedVaultEventRecord) {
    await this.queryExecutor.query(
      `INSERT INTO ${this.vaultEventsTable} (
        ${vaultEventColumns.join(", ")}
      ) VALUES (
        ${buildPlaceholders(1, vaultEventColumns.length)}
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
      [
        record.id,
        record.chainId,
        record.txHash,
        record.blockNumber,
        record.logIndex,
        record.vaultAddress,
        record.ownerAddress,
        record.actorAddress,
        record.eventType,
        record.amountAtomic,
        record.occurredAt,
        record.indexedAt,
      ],
    );
  }

  async getSyncState(key: string) {
    const result = await this.queryExecutor.query<SyncStateRow>(
      `SELECT ${syncStateColumns.join(", ")} FROM ${this.syncStatesTable} WHERE key = $1 LIMIT 1`,
      [key],
    );

    return result.rows[0] ? mapSyncStateRow(result.rows[0]) : null;
  }

  async listSyncStates() {
    const result = await this.queryExecutor.query<SyncStateRow>(
      `SELECT ${syncStateColumns.join(", ")} FROM ${this.syncStatesTable} ORDER BY key ASC`,
    );

    return result.rows.map(mapSyncStateRow);
  }

  async upsertSyncState(record: PersistedSyncStateRecord) {
    await this.queryExecutor.query(
      `INSERT INTO ${this.syncStatesTable} (
        ${syncStateColumns.join(", ")}
      ) VALUES (
        ${buildPlaceholders(1, syncStateColumns.length)}
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
      [
        record.key,
        record.chainId,
        record.streamType,
        record.scopeKey,
        record.lifecycle,
        record.latestIndexedBlock,
        record.latestIndexedLogIndex,
        record.latestChainBlock,
        record.lastSyncedAt,
        record.errorMessage,
      ],
    );
  }
}

export class PostgresqlAnalyticsStore implements ApiAnalyticsStore {
  private readonly queryExecutor: PostgresqlQueryExecutor;
  private readonly analyticsEventsTable: string;

  constructor(options: PostgresqlStoreOptions) {
    const schemaName = normalizeSchemaName(options.schemaName);
    this.queryExecutor = options.queryExecutor;
    this.analyticsEventsTable = tableName(schemaName, "analytics_events");
  }

  async append(events: AnalyticsStoredEvent[]) {
    if (events.length === 0) {
      return;
    }

    const columnNames = [
      "name",
      "category",
      "occurred_at",
      "platform",
      "route",
      "environment",
      "deployment_target",
      "chain_id",
      "wallet_status",
      "sync_freshness",
      "vault_address",
      "tx_hash",
      "context_json",
      "payload_json",
    ] as const;
    const values = events.flatMap((event) => [
      event.name,
      event.category,
      event.occurredAt,
      event.context.platform,
      event.context.route,
      event.context.environment,
      event.context.deploymentTarget,
      event.context.chainId ?? null,
      event.context.walletStatus ?? null,
      event.context.syncFreshness ?? null,
      event.context.vaultAddress ?? null,
      event.context.txHash ?? null,
      JSON.stringify(event.context),
      JSON.stringify(event.payload),
    ]);
    const rows = events.map((_, index) => `(${buildPlaceholders(index * columnNames.length + 1, columnNames.length)})`);

    await runInTransaction(
      this.queryExecutor,
      async (executor) =>
        executor.query(
          `INSERT INTO ${this.analyticsEventsTable} (${columnNames.join(", ")}) VALUES ${rows.join(", ")}`,
          values,
        ),
    );
  }
}
