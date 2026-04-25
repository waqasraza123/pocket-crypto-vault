import type { Address, Hash } from "viem";

import type { SupportedChainId } from "./chain";
import type { ActivityFeedResult, VaultActivityItem } from "./activity";
import type { SyncFreshnessSnapshot, VaultReconciliationStatus } from "./sync";

export type VaultAddress = Address;

export type VaultRuleType = "timeLock" | "cooldownUnlock" | "guardianApproval";

export type VaultStatus = "active" | "locked" | "unlocking" | "unlocked" | "withdrawn" | "closed";

export type VaultAccentTheme = "sand" | "sage" | "sky" | "terracotta";

export type VaultMetadataStatus = "pending" | "saved" | "failed";

export type VaultActivityEventType =
  | "created"
  | "deposit"
  | "withdrawal"
  | "unlock_requested"
  | "unlock_canceled"
  | "guardian_approved"
  | "guardian_rejected"
  | "milestone";

export type VaultLockState = "locked" | "unlocked";

export type UnlockRequestStatus = "not_requested" | "pending" | "canceled" | "approved" | "rejected" | "matured";

export type GuardianApprovalState = "not_required" | "not_requested" | "pending" | "approved" | "rejected";

export type WithdrawalAvailability =
  | "locked"
  | "unlock_request_required"
  | "cooldown_pending"
  | "guardian_pending"
  | "guardian_rejected"
  | "ready"
  | "empty"
  | "owner_only"
  | "guardian_only"
  | "disconnected"
  | "unsupported_network"
  | "unavailable";

export type NextVaultAction =
  | "deposit"
  | "request_unlock"
  | "cancel_unlock_request"
  | "guardian_approve"
  | "guardian_reject"
  | "withdraw"
  | "wait"
  | "none";

export interface TimeLockRule {
  type: "timeLock";
  unlockDate: string;
  unlockTimestampMs: number;
}

export interface CooldownRule {
  type: "cooldownUnlock";
  cooldownDurationSeconds: number;
  cooldownDurationDays: number;
  cooldownDurationLabel: string;
  unlockRequestedAt: string | null;
  unlockEligibleAt: string | null;
  unlockEligibleTimestampMs: number | null;
}

export interface GuardianRule {
  type: "guardianApproval";
  guardianAddress: Address;
  guardianLabel: string;
  unlockRequestedAt: string | null;
  guardianDecision: GuardianApprovalState;
  guardianDecisionAt: string | null;
}

export type VaultRuleConfig = TimeLockRule | CooldownRule | GuardianRule;
export type VaultRuleSummary = VaultRuleConfig;

export interface Vault {
  address: VaultAddress;
  chainId: SupportedChainId;
  goalName: string;
  category?: string;
  note?: string;
  targetAmount: number;
  savedAmount: number;
  unlockDate: string | null;
  ruleType: VaultRuleType;
  ruleSummary: VaultRuleSummary;
  status: VaultStatus;
  accentTheme?: VaultAccentTheme;
  accentTone: string;
  metadataStatus?: VaultMetadataStatus;
}

export interface VaultSummary extends Vault {
  assetAddress: Address;
  ownerAddress: Address;
  targetAmountAtomic: bigint;
  savedAmountAtomic: bigint;
  totalDepositedAtomic: bigint;
  totalWithdrawnAtomic: bigint;
  currentBalanceAtomic: bigint;
  progressRatio: number;
  source: "backend" | "onchain" | "fallback" | "session";
}

export interface VaultActivityEvent {
  id: string;
  vaultAddress: VaultAddress;
  chainId?: SupportedChainId;
  type: VaultActivityEventType;
  title: string;
  subtitle: string;
  occurredAt: string;
  amount?: number;
  txHash?: Hash;
  source?: "indexed" | "session" | "fallback";
}

export interface UnlockCountdown {
  totalMs: number;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export interface WithdrawableAmountState {
  amount: number;
  amountAtomic: bigint;
  hasFunds: boolean;
}

export interface WithdrawalEligibilityState {
  lockState: VaultLockState;
  availability: WithdrawalAvailability;
  message: string;
  unlockDate: string | null;
  unlockTimestampMs: number | null;
  availableAmount: number;
  availableAmountAtomic: bigint;
  withdrawableAmount: WithdrawableAmountState;
  countdown: UnlockCountdown | null;
  isOwner: boolean;
  isGuardian: boolean;
  connectedAddress: Address | null;
  ownerAddress: Address;
  guardianAddress: Address | null;
  isConnected: boolean;
  isSupportedNetwork: boolean;
  canWithdraw: boolean;
  canRequestUnlock: boolean;
  canCancelUnlockRequest: boolean;
  canGuardianApprove: boolean;
  canGuardianReject: boolean;
  unlockRequestStatus: UnlockRequestStatus;
  guardianApprovalState: GuardianApprovalState;
  unlockRequestedAt: string | null;
  unlockEligibleAt: string | null;
  nextAction: NextVaultAction;
  ruleType: VaultRuleType;
}

export type WithdrawEligibility = WithdrawalEligibilityState;
export type VaultEligibility = WithdrawEligibility;
export type GuardianActionEligibility = "allowed" | "not_guardian" | "no_pending_request" | "already_decided";
export type CooldownState = "not_requested" | "pending" | "matured" | "canceled";
export type GuardianDecisionState = GuardianApprovalState;
export type GuardianRequestState = UnlockRequestStatus;
export type RuleProtectedVaultViewModel = VaultDetail;

export interface DepositPreview {
  depositAmount: number;
  resultingSavedAmount: number;
  resultingProgressRatio: number;
  resultingRemainingAmount: number;
}

export interface WithdrawPreview {
  withdrawAmount: number;
  resultingSavedAmount: number;
  resultingProgressRatio: number;
  resultingRemainingAmount: number;
}

export interface DepositFormInput {
  amount: string;
}

export interface WithdrawFormInput {
  amount: string;
}

export interface VaultDetail extends VaultSummary {
  ownerLabel: string;
  depositPreview: DepositPreview;
  withdrawEligibility: WithdrawEligibility;
  activityPreview: VaultActivityEvent[];
}

export interface VaultSummaryEnriched extends VaultSummary {
  reconciliationStatus: VaultReconciliationStatus;
  activityCount: number;
  lastActivityAt: string | null;
  freshness: SyncFreshnessSnapshot;
}

export interface VaultDetailEnriched extends VaultDetail {
  reconciliationStatus: VaultReconciliationStatus;
  normalizedActivity: VaultActivityItem[];
  freshness: SyncFreshnessSnapshot;
}

export interface VaultListResult {
  items: VaultSummaryEnriched[];
}

export interface VaultDetailResult {
  item: VaultDetailEnriched;
}

export interface VaultActivityResult extends ActivityFeedResult {
  vaultAddress: VaultAddress;
  chainId: SupportedChainId;
  freshness: SyncFreshnessSnapshot;
}

export interface VaultReadError {
  code:
    | "disconnected"
    | "unsupported_chain"
    | "missing_rpc"
    | "missing_factory_address"
    | "not_found"
    | "read_failed";
  message: string;
}

export interface TokenReadError {
  code: "missing_rpc" | "read_failed";
  message: string;
}

export type TokenReadResult<T> =
  | {
      status: "success";
      data: T;
      error: null;
    }
  | {
      status: "unavailable" | "error";
      data: null;
      error: TokenReadError;
    };

export type VaultReadResult<T> =
  | {
      status: "success";
      data: T;
      error: null;
    }
  | {
      status: "empty";
      data: null;
      error: null;
    }
  | {
      status: "unavailable" | "error";
      data: null;
      error: VaultReadError;
    };

export interface CreateVaultInput {
  goalName: string;
  category: string;
  note: string;
  targetAmount: string;
  accentTheme: VaultAccentTheme | "";
  ruleType: VaultRuleType;
  unlockDate: string;
  cooldownDays: string;
  guardianAddress: string;
}

export type CreateVaultFormInput = CreateVaultInput;

export interface CreateVaultReviewModel {
  goalName: string;
  category?: string;
  note: string;
  accentTheme?: VaultAccentTheme;
  accentTone: string;
  targetAmount: number;
  targetAmountAtomic: bigint;
  targetAmountDisplay: string;
  assetSymbol: string;
  networkLabel: string;
  ruleType: VaultRuleType;
  ruleSummary: VaultRuleSummary;
  unlockDate: string | null;
  unlockDateLabel: string | null;
  unlockTimestamp: bigint | null;
  cooldownDurationSeconds: bigint | null;
  cooldownDurationLabel: string | null;
  guardianAddress: Address | null;
  protectionCopy: string[];
}

export interface VaultMetadataPayload {
  contractAddress: VaultAddress;
  chainId: SupportedChainId;
  ownerWallet: Address;
  createdTxHash: Hash;
  displayName: string;
  category?: string;
  note?: string;
  accentTheme?: VaultAccentTheme;
  targetAmount: string;
  ruleType: VaultRuleType;
  unlockDate?: string | null;
  cooldownDurationSeconds?: number | null;
  guardianAddress?: Address | null;
}

export interface VaultMetadataAuth {
  issuedAt: string;
  signature: Hash;
}

export interface VaultMetadataWriteRequest {
  metadata: VaultMetadataPayload;
  auth: VaultMetadataAuth;
}

export interface VaultMetadataRecord extends VaultMetadataPayload {
  metadataStatus: VaultMetadataStatus;
  accentTone: string;
  createdAt: string;
}
