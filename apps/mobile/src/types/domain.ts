import type { Address, Hash } from "viem";

export type {
  AllowanceState,
  ApiChainReadiness,
  ApiHealthState,
  ApiHealthSummary,
  AppReadinessIssue,
  AppReadinessState,
  AppReadinessStatus,
  AppConnectionState,
  AppTransactionStatus,
  ApprovalRequirement,
  CreateVaultFormInput,
  CreateVaultReviewModel,
  CreateVaultResult,
  CreateVaultTransactionState,
  CreateVaultInput,
  DepositFlowState,
  DepositFlowStatus,
  DepositFormInput,
  DepositPreview,
  DepositResult,
  MetadataSaveResult,
  NetworkSupportState,
  ReadinessCheck,
  StagingReadinessState,
  StagingReadinessSummary,
  SupportedChain,
  SupportedChainId,
  TokenBalanceState,
  TokenQueryStatus,
  TokenReadResult,
  TransactionRecoveryLifecycle,
  TransactionRecoveryMetadata,
  TransactionRecoveryRecord,
  TransactionRecoveryState,
  TransactionRecoverySyncStatus,
  TransactionRecoveryKind,
  UserFacingRecoveryAction,
  Vault,
  VaultActivityEvent,
  VaultAddress,
  VaultAccentTheme,
  VaultCreatedResolution,
  VaultDegradedState,
  VaultDetail,
  VaultEligibility,
  VaultLockState,
  VaultMetadataPayload,
  VaultMetadataRecord,
  VaultMetadataStatus,
  VaultRuleType,
  VaultReadResult,
  VaultStatus,
  VaultSummary,
  WithdrawalAvailability,
  WithdrawEligibility,
  WithdrawFormInput,
  WithdrawPreview,
  WithdrawResult,
  WithdrawFlowState,
  WithdrawFlowStatus,
  UnlockCountdown,
  WithdrawableAmountState,
  WalletConnectionStatus,
  WalletAvailabilityState,
  WalletSession,
} from "@pocket-vault/shared";

export interface DepositActivityViewModel {
  id: string;
  chainId: 8453 | 84532;
  ownerAddress?: Address;
  vaultAddress: `0x${string}`;
  type: "created" | "deposit" | "withdrawal" | "milestone";
  title: string;
  subtitle: string;
  occurredAt: string;
  amount?: number;
  txHash?: Hash;
  source?: "indexed" | "session" | "fallback";
}
