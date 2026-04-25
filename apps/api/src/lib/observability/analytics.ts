import fs from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { z } from "zod";

const analyticsEventNames = [
  "landing_viewed",
  "how_it_works_viewed",
  "security_viewed",
  "wallet_connect_started",
  "wallet_connect_succeeded",
  "unsupported_network_encountered",
  "dashboard_viewed",
  "create_vault_started",
  "create_vault_step_progressed",
  "create_vault_submitted",
  "vault_created_confirmed",
  "deposit_flow_opened",
  "deposit_approval_required",
  "deposit_approved",
  "deposit_confirmed",
  "withdraw_flow_opened",
  "withdraw_blocked_by_lock",
  "withdraw_confirmed",
  "vault_detail_viewed",
  "activity_viewed",
  "empty_state_viewed",
  "degraded_state_viewed",
  "transaction_lifecycle_updated",
  "transaction_recovery_action",
] as const;

const analyticsEventSchema = z.object({
  name: z.enum(analyticsEventNames),
  category: z.enum(["marketing", "onboarding", "wallet", "vault", "deposit", "withdraw", "activity", "error", "sync"]),
  occurredAt: z.string().datetime(),
  context: z.object({
    platform: z.enum(["ios", "android", "web", "server"]),
    route: z.string().trim().min(1),
    environment: z.enum(["development", "staging", "production"]),
    deploymentTarget: z.enum(["local", "staging", "production"]),
    chainId: z.number().int().nullable().optional(),
    walletStatus: z.enum(["walletUnavailable", "disconnected", "connecting", "unsupportedNetwork", "ready"]).nullable().optional(),
    syncFreshness: z.enum(["current", "syncing", "lagging", "unavailable"]).nullable().optional(),
    vaultAddress: z.string().trim().nullable().optional(),
    txHash: z.string().trim().nullable().optional(),
  }),
  payload: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
});

export const analyticsBatchSchema = z.object({
  events: z.array(analyticsEventSchema).min(1).max(100),
});

type AnalyticsStoredEvent = z.infer<typeof analyticsEventSchema>;

export class AnalyticsStore {
  private readonly dbPath: string;
  private database: DatabaseSync | null = null;

  constructor(dataDir: string) {
    this.dbPath = path.join(dataDir, "goal-vault-analytics.sqlite");
  }

  async append(events: AnalyticsStoredEvent[]) {
    const database = await this.initialize();
    const statement = database.prepare(
      `INSERT INTO analytics_events (
        name,
        category,
        occurred_at,
        platform,
        route,
        environment,
        deployment_target,
        chain_id,
        wallet_status,
        sync_freshness,
        vault_address,
        tx_hash,
        context_json,
        payload_json
      ) VALUES (
        @name,
        @category,
        @occurredAt,
        @platform,
        @route,
        @environment,
        @deploymentTarget,
        @chainId,
        @walletStatus,
        @syncFreshness,
        @vaultAddress,
        @txHash,
        @contextJson,
        @payloadJson
      )`,
    );
    database.exec("BEGIN");

    try {
      for (const event of events) {
        statement.run({
          name: event.name,
          category: event.category,
          occurredAt: event.occurredAt,
          platform: event.context.platform,
          route: event.context.route,
          environment: event.context.environment,
          deploymentTarget: event.context.deploymentTarget,
          chainId: event.context.chainId ?? null,
          walletStatus: event.context.walletStatus ?? null,
          syncFreshness: event.context.syncFreshness ?? null,
          vaultAddress: event.context.vaultAddress ?? null,
          txHash: event.context.txHash ?? null,
          contextJson: JSON.stringify(event.context),
          payloadJson: JSON.stringify(event.payload),
        });
      }

      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  private async initialize() {
    if (this.database) {
      return this.database;
    }

    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    const database = new DatabaseSync(this.dbPath);
    database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        platform TEXT NOT NULL,
        route TEXT NOT NULL,
        environment TEXT NOT NULL,
        deployment_target TEXT NOT NULL,
        chain_id INTEGER,
        wallet_status TEXT,
        sync_freshness TEXT,
        vault_address TEXT,
        tx_hash TEXT,
        context_json TEXT NOT NULL,
        payload_json TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS analytics_events_name_idx ON analytics_events (name, occurred_at);
      CREATE INDEX IF NOT EXISTS analytics_events_route_idx ON analytics_events (route, occurred_at);
      CREATE INDEX IF NOT EXISTS analytics_events_vault_idx ON analytics_events (vault_address, occurred_at);
    `);

    this.database = database;
    return database;
  }
}
