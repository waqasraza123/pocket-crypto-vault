import type { Address } from "viem";

import type { VaultRuleType } from "@pocket-vault/shared";

export interface GoalVaultContractSummary {
  owner: Address;
  asset: Address;
  targetAmount: bigint;
  unlockAt: bigint;
  totalDeposited: bigint;
  totalWithdrawn: bigint;
  currentBalance: bigint;
  isUnlocked: boolean;
  ruleType: VaultRuleType;
  cooldownDuration: bigint;
  guardian: Address | null;
  unlockRequestedAt: bigint;
  guardianDecision: "not_required" | "not_requested" | "pending" | "approved" | "rejected";
  guardianDecisionAt: bigint;
  unlockEligibleAt: bigint;
  isRuleStateSupported: boolean;
}
