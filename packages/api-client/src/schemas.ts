import { z } from "zod";

const supportedChainIdSchema = z.union([z.literal(8453), z.literal(84532)]);
const appEnvironmentSchema = z.enum(["development", "staging", "production"]);
const deploymentTargetSchema = z.enum(["local", "staging", "production"]);
const syncFreshnessStateSchema = z.enum(["current", "syncing", "lagging", "unavailable"]);
const vaultMetadataStatusSchema = z.enum(["pending", "saved", "failed"]);
const vaultReconciliationStatusSchema = z.enum(["metadata_complete", "metadata_pending", "metadata_orphaned"]);
const vaultRuleTypeSchema = z.enum(["timeLock", "cooldownUnlock", "guardianApproval"]);
const guardianApprovalStateSchema = z.enum(["not_required", "not_requested", "pending", "approved", "rejected"]);
const unlockRequestStatusSchema = z.enum(["not_requested", "pending", "canceled", "approved", "rejected", "matured"]);
const normalizedVaultEventTypeSchema = z.enum([
  "vault_created",
  "deposit_confirmed",
  "withdrawal_confirmed",
  "unlock_requested",
  "unlock_canceled",
  "guardian_approved",
  "guardian_rejected",
]);

const TimeLockRuleSummarySchema = z.object({
  type: z.literal("timeLock"),
  unlockDate: z.string(),
  unlockTimestampMs: z.number(),
});

const CooldownRuleSummarySchema = z.object({
  type: z.literal("cooldownUnlock"),
  cooldownDurationSeconds: z.number().int(),
  cooldownDurationDays: z.number(),
  cooldownDurationLabel: z.string(),
  unlockRequestedAt: z.string().nullable(),
  unlockEligibleAt: z.string().nullable(),
  unlockEligibleTimestampMs: z.number().nullable(),
});

const GuardianRuleSummarySchema = z.object({
  type: z.literal("guardianApproval"),
  guardianAddress: z.string(),
  guardianLabel: z.string(),
  unlockRequestedAt: z.string().nullable(),
  guardianDecision: guardianApprovalStateSchema,
  guardianDecisionAt: z.string().nullable(),
});

const vaultRuleSummarySchema = z.union([
  TimeLockRuleSummarySchema,
  CooldownRuleSummarySchema,
  GuardianRuleSummarySchema,
]);

export const SyncFreshnessSnapshotSchema = z.object({
  freshness: syncFreshnessStateSchema,
  lastSyncedAt: z.string().nullable(),
  latestIndexedBlock: z.number().int().nullable(),
  latestChainBlock: z.number().int().nullable(),
  lagBlocks: z.number().int().nullable(),
});

export const ApiVaultSummaryItemSchema = z.object({
  address: z.string(),
  chainId: supportedChainIdSchema,
  assetAddress: z.string(),
  ownerAddress: z.string(),
  goalName: z.string(),
  category: z.string().optional(),
  note: z.string().optional(),
  targetAmount: z.number(),
  savedAmount: z.number(),
  unlockDate: z.string().nullable(),
  ruleType: vaultRuleTypeSchema,
  ruleSummary: vaultRuleSummarySchema,
  status: z.enum(["active", "locked", "unlocking", "unlocked", "withdrawn", "closed"]),
  accentTheme: z.enum(["sand", "sage", "sky", "terracotta"]).optional(),
  accentTone: z.string(),
  metadataStatus: vaultMetadataStatusSchema.optional(),
  targetAmountAtomic: z.string(),
  savedAmountAtomic: z.string(),
  totalDepositedAtomic: z.string(),
  totalWithdrawnAtomic: z.string(),
  currentBalanceAtomic: z.string(),
  progressRatio: z.number(),
  source: z.literal("backend"),
  reconciliationStatus: vaultReconciliationStatusSchema,
  activityCount: z.number().int(),
  lastActivityAt: z.string().nullable(),
  freshness: SyncFreshnessSnapshotSchema,
});

export const ApiVaultActivityItemSchema = z.object({
  id: z.string(),
  chainId: supportedChainIdSchema,
  txHash: z.string(),
  blockNumber: z.number().int(),
  logIndex: z.number().int(),
  vaultAddress: z.string(),
  ownerAddress: z.string().nullable(),
  actorAddress: z.string().nullable(),
  eventType: normalizedVaultEventTypeSchema,
  amountAtomic: z.string().nullable(),
  occurredAt: z.string(),
  indexedAt: z.string(),
  displayName: z.string().nullable(),
  metadataStatus: vaultMetadataStatusSchema,
  ruleType: vaultRuleTypeSchema.optional(),
  unlockRequestStatus: unlockRequestStatusSchema.optional(),
  guardianApprovalState: guardianApprovalStateSchema.optional(),
});

export const ApiVaultDetailItemSchema = ApiVaultSummaryItemSchema.extend({
  ownerLabel: z.string(),
  normalizedActivity: z.array(ApiVaultActivityItemSchema),
});

export const VaultListResponseSchema = z.object({
  items: z.array(ApiVaultSummaryItemSchema),
});

export const VaultDetailResponseSchema = z.object({
  item: ApiVaultDetailItemSchema,
});

export const VaultActivityResponseSchema = z.object({
  items: z.array(ApiVaultActivityItemSchema),
  hasMore: z.boolean(),
  vaultAddress: z.string(),
  chainId: supportedChainIdSchema,
  freshness: SyncFreshnessSnapshotSchema,
});

export const ActivityFeedResponseSchema = z.object({
  items: z.array(ApiVaultActivityItemSchema),
  hasMore: z.boolean(),
  freshness: SyncFreshnessSnapshotSchema,
});

export const HealthResponseSchema = z.object({
  ok: z.boolean(),
  checkedAt: z.string(),
  environment: appEnvironmentSchema,
  chainSync: z.array(
    z.object({
      key: z.string(),
      chainId: supportedChainIdSchema,
      streamType: z.enum(["factory", "vault"]),
      scopeKey: z.string(),
      lifecycle: z.enum(["idle", "running", "error"]),
      freshness: syncFreshnessStateSchema,
      latestIndexedBlock: z.number().int().nullable(),
      latestIndexedLogIndex: z.number().int().nullable(),
      latestChainBlock: z.number().int().nullable(),
      lagBlocks: z.number().int().nullable(),
      lastSyncedAt: z.string().nullable(),
      errorMessage: z.string().nullable(),
    }),
  ),
  api: z.object({
    status: z.enum(["healthy", "degraded", "unavailable"]),
    checkedAt: z.string().nullable(),
    message: z.string().nullable(),
    checks: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        status: z.enum(["ready", "warning", "blocked"]),
        message: z.string(),
      }),
    ),
    chains: z.array(
      z.object({
        chainId: supportedChainIdSchema,
        rpcConfigured: z.boolean(),
        factoryConfigured: z.boolean(),
        readsReady: z.boolean(),
        writesReady: z.boolean(),
        checks: z.array(
          z.object({
            key: z.string(),
            label: z.string(),
            status: z.enum(["ready", "warning", "blocked"]),
            message: z.string(),
          }),
        ),
      }),
    ),
  }),
  staging: z.object({
    status: z.enum(["ready", "degraded", "blocked"]),
    message: z.string().nullable(),
    checks: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        status: z.enum(["ready", "warning", "blocked"]),
        message: z.string(),
      }),
    ),
  }),
  release: z.object({
    environment: appEnvironmentSchema,
    status: z.enum(["ready", "degraded", "blocked"]),
    message: z.string(),
    checks: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        status: z.enum(["ready", "warning", "blocked"]),
        message: z.string(),
      }),
    ),
  }),
  validationErrors: z.array(z.string()),
});

export const ServiceHealthResponseSchema = z.object({
  ok: z.boolean(),
  checkedAt: z.string(),
  service: z.string(),
  environment: appEnvironmentSchema,
  deploymentTarget: deploymentTargetSchema,
  indexerEnabled: z.boolean(),
  version: z.string(),
  readyPath: z.string(),
});

export const VaultMetadataSaveResponseSchema = z.object({
  contractAddress: z.string(),
  chainId: supportedChainIdSchema,
  metadataStatus: vaultMetadataStatusSchema,
  reconciliationStatus: vaultReconciliationStatusSchema,
  result: z.enum(["created", "updated"]),
});

export type SerializedSyncFreshnessSnapshot = z.infer<typeof SyncFreshnessSnapshotSchema>;
export type ApiVaultSummaryItem = z.infer<typeof ApiVaultSummaryItemSchema>;
export type ApiVaultActivityItem = z.infer<typeof ApiVaultActivityItemSchema>;
export type ApiVaultDetailItem = z.infer<typeof ApiVaultDetailItemSchema>;
export type VaultListResponse = z.infer<typeof VaultListResponseSchema>;
export type VaultDetailResponse = z.infer<typeof VaultDetailResponseSchema>;
export type VaultActivityResponse = z.infer<typeof VaultActivityResponseSchema>;
export type ActivityFeedResponse = z.infer<typeof ActivityFeedResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type ServiceHealthResponse = z.infer<typeof ServiceHealthResponseSchema>;
export type VaultMetadataSaveResponse = z.infer<typeof VaultMetadataSaveResponseSchema>;
