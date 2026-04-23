import type { Address } from "viem";

import type { SupportedChainId } from "./chain";

export type VaultAddress = Address;

export type VaultRuleType = "timeLock";

export type VaultStatus = "active" | "locked" | "unlocked" | "withdrawn" | "closed";

export type VaultActivityEventType = "created" | "deposit" | "withdrawal" | "milestone";

export interface Vault {
  address: VaultAddress;
  chainId: SupportedChainId;
  goalName: string;
  note?: string;
  targetAmount: number;
  savedAmount: number;
  unlockDate: string;
  ruleType: VaultRuleType;
  status: VaultStatus;
  accentTone: string;
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
  source: "onchain" | "fallback";
}

export interface VaultActivityEvent {
  id: string;
  vaultAddress: VaultAddress;
  type: VaultActivityEventType;
  title: string;
  subtitle: string;
  occurredAt: string;
  amount?: number;
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
  note: string;
  targetAmount: string;
  unlockDate: string;
}
