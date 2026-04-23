import type { PublicClient } from "viem";

import { goalVaultAbi } from "../abi";
import type { GoalVaultContractSummary } from "../types/contract-types";
import type { VaultAddress, VaultReadResult } from "@goal-vault/shared";

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
