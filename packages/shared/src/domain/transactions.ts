import type { Address, Hash } from "viem";

import type { SupportedChainId } from "./chain";
import type { CreateVaultReviewModel, VaultAddress } from "./vault";

export type AppTransactionStatus =
  | "idle"
  | "validating"
  | "awaiting_wallet_confirmation"
  | "submitting"
  | "confirming"
  | "confirmed"
  | "metadata_saving"
  | "success"
  | "failed";

export interface VaultCreatedResolution {
  status: "resolved" | "unresolved";
  strategy: "receipt_event" | "owner_vault_list" | null;
  vaultAddress: VaultAddress | null;
  message: string | null;
}

export interface MetadataSaveResult {
  status: "saved" | "failed";
  persistence: "backend" | "local_cache";
  message: string | null;
  retryable: boolean;
  responseStatus: number | null;
}

export interface CreateVaultResult {
  chainId: SupportedChainId;
  ownerAddress: Address;
  txHash: Hash;
  vaultAddress: VaultAddress;
  review: CreateVaultReviewModel;
  resolution: VaultCreatedResolution;
  metadataSave: MetadataSaveResult;
}

export interface CreateVaultTransactionState {
  status: AppTransactionStatus;
  txHash: Hash | null;
  vaultAddress: VaultAddress | null;
  errorMessage: string | null;
  didOnchainSucceed: boolean;
  isRetryable: boolean;
  metadataSave: MetadataSaveResult | null;
}

export type ApprovalRequirement = "unknown" | "required" | "not_required";

export type TokenQueryStatus = "idle" | "loading" | "ready" | "error" | "unavailable";

export interface TokenBalanceState {
  status: TokenQueryStatus;
  balanceAtomic: bigint | null;
  decimals: number | null;
  symbol: string;
  errorMessage: string | null;
  updatedAt: string | null;
}

export interface AllowanceState {
  status: TokenQueryStatus;
  allowanceAtomic: bigint | null;
  decimals: number | null;
  approvalRequirement: ApprovalRequirement;
  requiredAmountAtomic: bigint | null;
  errorMessage: string | null;
  updatedAt: string | null;
}

export type DepositFlowStatus =
  | "idle"
  | "invalid"
  | "ready_for_approval"
  | "approving"
  | "approval_confirming"
  | "ready_for_deposit"
  | "depositing"
  | "deposit_confirming"
  | "success"
  | "failed";

export interface DepositResult {
  chainId: SupportedChainId;
  ownerAddress: Address;
  vaultAddress: VaultAddress;
  amountAtomic: bigint;
  approvalTxHash: Hash | null;
  depositTxHash: Hash;
  confirmedAt: string;
}

export interface DepositFlowState {
  status: DepositFlowStatus;
  errorMessage: string | null;
  approvalTxHash: Hash | null;
  depositTxHash: Hash | null;
  amountAtomic: bigint | null;
  isRetryable: boolean;
  approvalCompleted: boolean;
  result: DepositResult | null;
}
