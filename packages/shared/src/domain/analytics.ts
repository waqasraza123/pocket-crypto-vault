import type { Address, Hash } from "viem";

import type { SupportedChainId } from "./chain";
import type { AppEnvironment } from "./deployment";
import type { SyncFreshnessState } from "./sync";
import type { AppConnectionStatus } from "./wallet";

export const analyticsEventNames = [
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

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type AnalyticsEventCategory =
  | "marketing"
  | "onboarding"
  | "wallet"
  | "vault"
  | "deposit"
  | "withdraw"
  | "activity"
  | "error"
  | "sync";
export type AnalyticsPlatform = "ios" | "android" | "web" | "server";
export type TransactionFlow = "create_vault" | "deposit" | "withdraw";
export type TransactionLifecycleEvent =
  | "started"
  | "wallet_confirmation_requested"
  | "approval_required"
  | "approval_confirmed"
  | "submitted"
  | "confirming"
  | "confirmed"
  | "syncing"
  | "partial_success"
  | "failed"
  | "completed";
export type FunnelStep =
  | "landing"
  | "wallet_connected"
  | "dashboard"
  | "create_vault_started"
  | "create_vault_confirmed"
  | "first_deposit"
  | "repeat_deposit"
  | "withdraw_attempted"
  | "withdraw_blocked"
  | "withdraw_confirmed";
export type ProductDegradedEvent =
  | "unsupported_network"
  | "wallet_disconnected_mid_flow"
  | "missing_backend_config"
  | "chain_read_failed"
  | "api_fetch_failed"
  | "index_lag_visible"
  | "metadata_missing"
  | "deposit_approval_failed"
  | "deposit_submission_failed"
  | "withdraw_blocked"
  | "create_metadata_delayed"
  | "vault_not_found"
  | "partial_data";
export type EmptyStateSurface = "dashboard" | "activity" | "vault_detail";
export type EmptyStateKind = "no_vaults" | "no_activity" | "vault_not_found";
export type DegradedSurface = "app_shell" | "dashboard" | "create_vault" | "vault_detail" | "activity";
export type ErrorClass =
  | "wallet_rejected"
  | "wallet_unavailable"
  | "unsupported_network"
  | "timeout"
  | "network_error"
  | "config_missing"
  | "metadata_sync_delayed"
  | "onchain_resolution_failed"
  | "invalid_state"
  | "api_unavailable"
  | "unknown";

export interface AnalyticsContext {
  platform: AnalyticsPlatform;
  route: string;
  environment: AppEnvironment;
  deploymentTarget: "local" | "staging" | "production";
  chainId?: number | null;
  walletStatus?: AppConnectionStatus | null;
  syncFreshness?: SyncFreshnessState | null;
  vaultAddress?: Address | null;
  txHash?: Hash | null;
}

export interface AnalyticsEventPayloadMap {
  landing_viewed: {
    entry: "direct" | "returning";
  };
  how_it_works_viewed: Record<string, never>;
  security_viewed: Record<string, never>;
  wallet_connect_started: {
    source: "landing" | "dashboard" | "create_vault" | "vault_detail" | "activity" | "unknown";
  };
  wallet_connect_succeeded: {
    chainId: number | null;
  };
  unsupported_network_encountered: {
    connectedChainId: number | null;
  };
  dashboard_viewed: {
    hasVaults: boolean;
    vaultCount: number;
    unlockedVaultCount: number;
    dataSource: "backend" | "fallback" | "session" | "none";
  };
  create_vault_started: {
    entry: "dashboard" | "direct";
  };
  create_vault_step_progressed: {
    stepIndex: number;
    stepName: string;
  };
  create_vault_submitted: {
    hasCategory: boolean;
    hasNote: boolean;
    targetAmountBucket: string;
    unlockLeadDaysBucket: string;
  };
  vault_created_confirmed: {
    vaultAddress: Address | null;
    metadataStatus: "saved" | "pending" | "failed";
  };
  deposit_flow_opened: {
    vaultAddress: Address;
    vaultStatus: string;
    savedAmountBucket: string;
  };
  deposit_approval_required: {
    vaultAddress: Address;
  };
  deposit_approved: {
    vaultAddress: Address;
    approvalTxHash: Hash;
  };
  deposit_confirmed: {
    vaultAddress: Address;
    depositTxHash: Hash;
    firstDeposit: boolean;
  };
  withdraw_flow_opened: {
    vaultAddress: Address;
    availability: "locked" | "ready" | "owner_only" | "empty" | "unavailable";
  };
  withdraw_blocked_by_lock: {
    vaultAddress: Address;
    unlockDate: string;
  };
  withdraw_confirmed: {
    vaultAddress: Address;
    withdrawTxHash: Hash;
  };
  vault_detail_viewed: {
    vaultAddress: Address;
    vaultStatus: string;
    dataSource: "backend" | "fallback" | "session" | "none";
    activityCount: number;
  };
  activity_viewed: {
    eventCount: number;
    dataSource: "backend" | "fallback" | "session";
  };
  empty_state_viewed: {
    surface: EmptyStateSurface;
    kind: EmptyStateKind;
  };
  degraded_state_viewed: {
    surface: DegradedSurface;
    degradedEvent: ProductDegradedEvent;
  };
  transaction_lifecycle_updated: {
    flow: TransactionFlow;
    lifecycle: TransactionLifecycleEvent;
    vaultAddress?: Address | null;
    txHash?: Hash | null;
    errorClass?: ErrorClass | null;
    partialSuccess?: boolean;
    syncFreshness?: SyncFreshnessState | null;
  };
  transaction_recovery_action: {
    flow: TransactionFlow;
    action: "retry" | "dismiss";
  };
}

export type AnalyticsEventPayload<Name extends AnalyticsEventName> = AnalyticsEventPayloadMap[Name];

export interface AnalyticsEventEnvelope<Name extends AnalyticsEventName = AnalyticsEventName> {
  name: Name;
  category: AnalyticsEventCategory;
  occurredAt: string;
  context: AnalyticsContext;
  payload: AnalyticsEventPayload<Name>;
}

export interface AnalyticsBatchRequest {
  events: AnalyticsEventEnvelope[];
}

export interface AnalyticsBatchResponse {
  accepted: number;
  stored: boolean;
}

export interface AnalyticsProviderState {
  status: "disabled" | "local_log" | "backend";
  enabled: boolean;
  endpoint: string | null;
  lastError: string | null;
}

export interface PostLaunchMetricDefinition {
  key: string;
  label: string;
  question: string;
  funnelStep?: FunnelStep;
  sourceEvents: AnalyticsEventName[];
}

export interface ObservabilitySignal {
  domain: "api" | "indexer" | "analytics" | "transaction" | "readiness";
  action: string;
  status: "started" | "succeeded" | "failed" | "degraded";
  message: string;
  route?: string;
  requestId?: string;
  chainId?: SupportedChainId;
  vaultAddress?: Address | null;
  txHash?: Hash | null;
  count?: number;
  durationMs?: number | null;
  errorClass?: ErrorClass | null;
  metadata?: Record<string, string | number | boolean | null>;
}

export const analyticsEventCategoryMap: Record<AnalyticsEventName, AnalyticsEventCategory> = {
  landing_viewed: "marketing",
  how_it_works_viewed: "marketing",
  security_viewed: "marketing",
  wallet_connect_started: "wallet",
  wallet_connect_succeeded: "wallet",
  unsupported_network_encountered: "error",
  dashboard_viewed: "vault",
  create_vault_started: "vault",
  create_vault_step_progressed: "vault",
  create_vault_submitted: "vault",
  vault_created_confirmed: "vault",
  deposit_flow_opened: "deposit",
  deposit_approval_required: "deposit",
  deposit_approved: "deposit",
  deposit_confirmed: "deposit",
  withdraw_flow_opened: "withdraw",
  withdraw_blocked_by_lock: "withdraw",
  withdraw_confirmed: "withdraw",
  vault_detail_viewed: "vault",
  activity_viewed: "activity",
  empty_state_viewed: "error",
  degraded_state_viewed: "error",
  transaction_lifecycle_updated: "sync",
  transaction_recovery_action: "sync",
};
