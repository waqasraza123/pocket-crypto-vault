export type VaultAddress = `0x${string}`;

export type VaultRuleType = "timeLock";

export type VaultStatus = "active" | "locked" | "unlocked" | "withdrawn" | "closed";

export type VaultActivityEventType = "created" | "deposit" | "withdrawal" | "milestone";

export interface Vault {
  address: VaultAddress;
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
  progressRatio: number;
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

export interface WithdrawEligibility {
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
  withdrawEligibility: WithdrawEligibility;
  activityPreview: VaultActivityEvent[];
}

export interface CreateVaultInput {
  goalName: string;
  note: string;
  targetAmount: string;
  unlockDate: string;
}
