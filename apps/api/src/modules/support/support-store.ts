import fs from "node:fs/promises";
import path from "node:path";
import { DatabaseSync, type SQLOutputValue } from "node:sqlite";

import type { SupportRequestListFilters, SupportRequestRecord, SupportRequestStatus } from "@pocket-vault/shared";
import type { Address } from "viem";

import type { ApiSupportStore } from "../persistence/ports";

interface SupportRequestRow {
  id: string;
  status: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  reporter_wallet: string | null;
  contact_email: string | null;
  route: string | null;
  environment: string;
  deployment_target: string;
  chain_id: number | null;
  wallet_status: string | null;
  vault_address: string | null;
  user_agent: string | null;
  requester_ip_hash: string | null;
  created_at: string;
}

const mapSupportRequestRow = (row: SupportRequestRow): SupportRequestRecord => ({
  id: row.id,
  status: row.status as SupportRequestRecord["status"],
  category: row.category as SupportRequestRecord["category"],
  priority: row.priority as SupportRequestRecord["priority"],
  subject: row.subject,
  message: row.message,
  reporterWallet: (row.reporter_wallet as Address | null) ?? null,
  contactEmail: row.contact_email,
  context: {
    route: row.route,
    environment: row.environment as SupportRequestRecord["context"]["environment"],
    deploymentTarget: row.deployment_target as SupportRequestRecord["context"]["deploymentTarget"],
    chainId: row.chain_id as SupportRequestRecord["context"]["chainId"],
    walletStatus: row.wallet_status as SupportRequestRecord["context"]["walletStatus"],
    vaultAddress: (row.vault_address as Address | null) ?? null,
  },
  createdAt: row.created_at,
  userAgent: row.user_agent,
  requesterIpHash: row.requester_ip_hash,
});

const supportRequestColumns = [
  "id",
  "status",
  "category",
  "priority",
  "subject",
  "message",
  "reporter_wallet",
  "contact_email",
  "route",
  "environment",
  "deployment_target",
  "chain_id",
  "wallet_status",
  "vault_address",
  "user_agent",
  "requester_ip_hash",
  "created_at",
];

const requiredStringSupportRequestColumns = [
  "id",
  "status",
  "category",
  "priority",
  "subject",
  "message",
  "environment",
  "deployment_target",
  "created_at",
] as const;

const nullableStringSupportRequestColumns = [
  "reporter_wallet",
  "contact_email",
  "route",
  "wallet_status",
  "vault_address",
  "user_agent",
  "requester_ip_hash",
] as const;

const assertSupportRequestRowValue = (
  row: Record<string, SQLOutputValue>,
  column: string,
  acceptsNull: boolean,
  type: "string" | "number",
) => {
  const value = row[column];

  if (acceptsNull && value === null) {
    return;
  }

  if (typeof value !== type) {
    throw new Error(`Support request row column ${column} has invalid storage type.`);
  }
};

const getStringRowValue = (row: Record<string, SQLOutputValue>, column: string) => {
  const value = row[column];

  if (typeof value !== "string") {
    throw new Error(`Support request row column ${column} has invalid storage type.`);
  }

  return value;
};

const getNullableStringRowValue = (row: Record<string, SQLOutputValue>, column: string) => {
  const value = row[column];

  if (value !== null && typeof value !== "string") {
    throw new Error(`Support request row column ${column} has invalid storage type.`);
  }

  return value;
};

const getNullableNumberRowValue = (row: Record<string, SQLOutputValue>, column: string) => {
  const value = row[column];

  if (value !== null && typeof value !== "number") {
    throw new Error(`Support request row column ${column} has invalid storage type.`);
  }

  return value;
};

const mapRawSupportRequestRow = (row: Record<string, SQLOutputValue>): SupportRequestRow => {
  for (const column of requiredStringSupportRequestColumns) {
    assertSupportRequestRowValue(row, column, false, "string");
  }

  for (const column of nullableStringSupportRequestColumns) {
    assertSupportRequestRowValue(row, column, true, "string");
  }

  assertSupportRequestRowValue(row, "chain_id", true, "number");

  return {
    id: getStringRowValue(row, "id"),
    status: getStringRowValue(row, "status"),
    category: getStringRowValue(row, "category"),
    priority: getStringRowValue(row, "priority"),
    subject: getStringRowValue(row, "subject"),
    message: getStringRowValue(row, "message"),
    reporter_wallet: getNullableStringRowValue(row, "reporter_wallet"),
    contact_email: getNullableStringRowValue(row, "contact_email"),
    route: getNullableStringRowValue(row, "route"),
    environment: getStringRowValue(row, "environment"),
    deployment_target: getStringRowValue(row, "deployment_target"),
    chain_id: getNullableNumberRowValue(row, "chain_id"),
    wallet_status: getNullableStringRowValue(row, "wallet_status"),
    vault_address: getNullableStringRowValue(row, "vault_address"),
    user_agent: getNullableStringRowValue(row, "user_agent"),
    requester_ip_hash: getNullableStringRowValue(row, "requester_ip_hash"),
    created_at: getStringRowValue(row, "created_at"),
  };
};

export class SupportStore implements ApiSupportStore {
  private readonly dbPath: string;
  private database: DatabaseSync | null = null;

  constructor(dataDir: string) {
    this.dbPath = path.join(dataDir, "goal-vault-analytics.sqlite");
  }

  async create(record: SupportRequestRecord) {
    const database = await this.initialize();
    const statement = database.prepare(
      `INSERT INTO support_requests (
        id,
        status,
        category,
        priority,
        subject,
        message,
        reporter_wallet,
        contact_email,
        route,
        environment,
        deployment_target,
        chain_id,
        wallet_status,
        vault_address,
        user_agent,
        requester_ip_hash,
        created_at
      ) VALUES (
        @id,
        @status,
        @category,
        @priority,
        @subject,
        @message,
        @reporterWallet,
        @contactEmail,
        @route,
        @environment,
        @deploymentTarget,
        @chainId,
        @walletStatus,
        @vaultAddress,
        @userAgent,
        @requesterIpHash,
        @createdAt
      )`,
    );

    statement.run({
      id: record.id,
      status: record.status,
      category: record.category,
      priority: record.priority,
      subject: record.subject,
      message: record.message,
      reporterWallet: record.reporterWallet ?? null,
      contactEmail: record.contactEmail ?? null,
      route: record.context.route,
      environment: record.context.environment,
      deploymentTarget: record.context.deploymentTarget,
      chainId: record.context.chainId ?? null,
      walletStatus: record.context.walletStatus ?? null,
      vaultAddress: record.context.vaultAddress ?? null,
      userAgent: record.userAgent,
      requesterIpHash: record.requesterIpHash,
      createdAt: record.createdAt,
    });
  }

  async list(filters: SupportRequestListFilters) {
    const database = await this.initialize();
    const where: string[] = [];
    const values: Array<string | number> = [];

    if (filters.status) {
      where.push("status = ?");
      values.push(filters.status);
    }

    if (filters.category) {
      where.push("category = ?");
      values.push(filters.category);
    }

    if (filters.priority) {
      where.push("priority = ?");
      values.push(filters.priority);
    }

    values.push(filters.limit);

    const rows = database
      .prepare(
        `SELECT ${supportRequestColumns.join(", ")}
         FROM support_requests
         ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
         ORDER BY created_at DESC, id DESC
         LIMIT ?`,
      )
      .all(...values)
      .map(mapRawSupportRequestRow);

    return rows.map(mapSupportRequestRow);
  }

  async get(id: string) {
    const database = await this.initialize();
    const row = database
      .prepare(`SELECT ${supportRequestColumns.join(", ")} FROM support_requests WHERE id = ?`)
      .get(id);

    return row ? mapSupportRequestRow(mapRawSupportRequestRow(row)) : null;
  }

  async updateStatus(id: string, status: SupportRequestStatus) {
    const database = await this.initialize();
    database.prepare("UPDATE support_requests SET status = ? WHERE id = ?").run(status, id);
    return this.get(id);
  }

  async initialize() {
    if (this.database) {
      return this.database;
    }

    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    const database = new DatabaseSync(this.dbPath);
    database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS support_requests (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        reporter_wallet TEXT,
        contact_email TEXT,
        route TEXT,
        environment TEXT NOT NULL,
        deployment_target TEXT NOT NULL,
        chain_id INTEGER,
        wallet_status TEXT,
        vault_address TEXT,
        user_agent TEXT,
        requester_ip_hash TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS support_requests_status_created_idx ON support_requests (status, created_at);
      CREATE INDEX IF NOT EXISTS support_requests_priority_created_idx ON support_requests (priority, created_at);
      CREATE INDEX IF NOT EXISTS support_requests_wallet_idx ON support_requests (reporter_wallet, created_at);
      CREATE INDEX IF NOT EXISTS support_requests_vault_idx ON support_requests (vault_address, created_at);
    `);

    this.database = database;
    return database;
  }

  async close() {
    if (!this.database) {
      return;
    }

    this.database.close();
    this.database = null;
  }
}
