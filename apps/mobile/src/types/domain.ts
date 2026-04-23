import type { Address, Hash } from "viem";

export type {
  AllowanceState,
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
  SupportedChain,
  SupportedChainId,
  TokenBalanceState,
  TokenQueryStatus,
  TokenReadResult,
  Vault,
  VaultActivityEvent,
  VaultAddress,
  VaultAccentTheme,
  VaultCreatedResolution,
  VaultDetail,
  VaultEligibility,
  VaultMetadataPayload,
  VaultMetadataRecord,
  VaultMetadataStatus,
  VaultRuleType,
  VaultReadResult,
  VaultStatus,
  VaultSummary,
  WalletConnectionStatus,
  WalletSession,
} from "@goal-vault/shared";

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
