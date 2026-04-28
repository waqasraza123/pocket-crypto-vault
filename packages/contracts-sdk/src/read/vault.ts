import type { PublicClient } from "viem";

import { goalVaultAbi } from "../abi";
import type { GoalVaultContractSummary } from "../types/contract-types";
import type { VaultAddress, VaultReadResult } from "@pocket-vault/shared";

const parseRuleType = (value: bigint): GoalVaultContractSummary["ruleType"] => {
  if (value === 1n) {
    return "cooldownUnlock";
  }

  if (value === 2n) {
    return "guardianApproval";
  }

  return "timeLock";
};

const parseGuardianDecision = (value: bigint): GoalVaultContractSummary["guardianDecision"] => {
  if (value === 1n) {
    return "pending";
  }

  if (value === 2n) {
    return "approved";
  }

  if (value === 3n) {
    return "rejected";
  }

  return "not_requested";
};

export const readGoalVaultSummary = async ({
  client,
  vaultAddress,
}: {
  client: PublicClient | null;
  vaultAddress: VaultAddress;
}): Promise<VaultReadResult<GoalVaultContractSummary>> => {
  if (!client) {
    return {
      status: "unavailable",
      data: null,
      error: {
        code: "missing_rpc",
        message: "A chain RPC URL is required before vault reads can run.",
      },
    };
  }

  try {
    const summary = (await client.readContract({
      address: vaultAddress,
      abi: goalVaultAbi,
      functionName: "getSummary",
    })) as readonly [string, string, bigint, bigint, bigint, bigint, bigint, boolean];

    let ruleType: GoalVaultContractSummary["ruleType"] = "timeLock";
    let cooldownDuration = 0n;
    let guardian: GoalVaultContractSummary["guardian"] = null;
    let unlockRequestedAt = 0n;
    let guardianDecision: GoalVaultContractSummary["guardianDecision"] = "not_required";
    let guardianDecisionAt = 0n;
    let unlockEligibleAt = summary[3];
    let isRuleStateSupported = false;

    try {
      const ruleState = (await client.readContract({
        address: vaultAddress,
        abi: goalVaultAbi,
        functionName: "getRuleState",
      })) as readonly [number, bigint, bigint, string, bigint, number, bigint, bigint, boolean];

      ruleType = parseRuleType(BigInt(ruleState[0]));
      cooldownDuration = ruleState[2];
      guardian = ruleState[3] !== "0x0000000000000000000000000000000000000000" ? (ruleState[3] as VaultAddress) : null;
      unlockRequestedAt = ruleState[4];
      guardianDecision = ruleType === "guardianApproval" ? parseGuardianDecision(BigInt(ruleState[5])) : "not_required";
      guardianDecisionAt = ruleState[6];
      unlockEligibleAt = ruleState[7];
      isRuleStateSupported = true;
    } catch {}

    return {
      status: "success",
      data: {
        owner: summary[0] as VaultAddress,
        asset: summary[1] as VaultAddress,
        targetAmount: summary[2],
        unlockAt: summary[3],
        totalDeposited: summary[4],
        totalWithdrawn: summary[5],
        currentBalance: summary[6],
        isUnlocked: summary[7],
        ruleType,
        cooldownDuration,
        guardian,
        unlockRequestedAt,
        guardianDecision,
        guardianDecisionAt,
        unlockEligibleAt,
        isRuleStateSupported,
      },
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: {
        code: "read_failed",
        message: error instanceof Error ? error.message : "Vault summary read failed.",
      },
    };
  }
};
