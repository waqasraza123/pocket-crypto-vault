import type { Address } from "viem";

export interface GoalVaultContractSummary {
  owner: Address;
  asset: Address;
  targetAmount: bigint;
  unlockAt: bigint;
  totalDeposited: bigint;
  totalWithdrawn: bigint;
  currentBalance: bigint;
  isUnlocked: boolean;
}
