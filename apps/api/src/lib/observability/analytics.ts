import fs from "node:fs/promises";
import path from "node:path";

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
  private readonly filePath: string;
  private initialized = false;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(dataDir: string) {
    this.filePath = path.join(dataDir, "goal-vault-analytics.ndjson");
  }

  async append(events: AnalyticsStoredEvent[]) {
    if (!this.initialized) {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      this.initialized = true;
    }

    const batch = `${events.map((event) => JSON.stringify(event)).join("\n")}\n`;
    this.writeQueue = this.writeQueue.then(() => fs.appendFile(this.filePath, batch, "utf8"));
    await this.writeQueue;
  }
}
