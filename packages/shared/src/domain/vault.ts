import type { Address, Hash } from "viem";

import type { SupportedChainId } from "./chain";

export type VaultAddress = Address;

export type VaultRuleType = "timeLock";

export type VaultStatus = "active" | "locked" | "unlocked" | "withdrawn" | "closed";

export type VaultAccentTheme = "sand" | "sage" | "sky" | "terracotta";

export type VaultMetadataStatus = "pending" | "saved" | "failed";

export type VaultActivityEventType = "created" | "deposit" | "withdrawal" | "milestone";

export interface Vault {
  address: VaultAddress;
  chainId: SupportedChainId;
  goalName: string;
  category?: string;
  note?: string;
  targetAmount: number;
  savedAmount: number;
  unlockDate: string;
  ruleType: VaultRuleType;
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
  source: "onchain" | "fallback" | "session";
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

export interface VaultEligibility {
  state: "locked" | "eligible" | "unavailable";
  message: string;
  unlockDate: string;
  availableAmount: number;
}

export interface DepositPreview {
  depositAmount: number;
  resultingSavedAmount: number;
  resultingProgressRatio: number;
  resultingRemainingAmount: number;
}

export interface DepositFormInput {
  amount: string;
}

export interface VaultDetail extends VaultSummary {
  ownerLabel: string;
  depositPreview: DepositPreview;
  withdrawEligibility: VaultEligibility;
  activityPreview: VaultActivityEvent[];
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
  unlockDate: string;
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
  unlockDate: string;
  unlockDateLabel: string;
  unlockTimestamp: bigint;
  protectionCopy: string[];
}

export interface VaultMetadataPayload {
  contractAddress: VaultAddress;
  chainId: SupportedChainId;
  ownerWallet: Address;
  displayName: string;
  category?: string;
  note?: string;
  accentTheme?: VaultAccentTheme;
  targetAmount: string;
  unlockDate: string;
}

export interface VaultMetadataRecord extends VaultMetadataPayload {
  metadataStatus: VaultMetadataStatus;
  accentTone: string;
  createdAt: string;
  txHash?: Hash;
}
