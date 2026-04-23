import type { GoalVaultContractSummary } from "../types/contract-types";
import type { VaultMetadataFallback } from "../types/vault-types";
import { formatTokenAmountNumber } from "./token-mappers";
import type { VaultAddress, VaultDetail, VaultEligibility, VaultSummary } from "@goal-vault/shared";

const usdcDecimals = 6;

const toDisplayNumber = (value: bigint): number =>
  formatTokenAmountNumber({
    value,
    decimals: usdcDecimals,
  });

const deriveVaultStatus = (summary: GoalVaultContractSummary): VaultSummary["status"] => {
  if (summary.currentBalance === 0n && summary.totalWithdrawn > 0n) {
    return "closed";
  }

  if (summary.isUnlocked) {
    return "unlocked";
  }

  if (summary.totalDeposited > 0n) {
    return "locked";
  }

  return "active";
};

export const mapVaultSummary = ({
  address,
  chainId,
  summary,
  metadataFallback,
}: {
  address: VaultAddress;
  chainId: VaultSummary["chainId"];
  summary: GoalVaultContractSummary;
  metadataFallback?: VaultMetadataFallback;
}): VaultSummary => {
  const savedAmount = toDisplayNumber(summary.currentBalance);
  const targetAmount = toDisplayNumber(summary.targetAmount);

  return {
    address,
    chainId,
    assetAddress: summary.asset,
    ownerAddress: summary.owner,
    goalName: metadataFallback?.goalName || "Goal Vault",
    category: metadataFallback?.category,
    note: metadataFallback?.note,
    targetAmount,
    savedAmount,
    unlockDate: new Date(Number(summary.unlockAt) * 1000).toISOString(),
    ruleType: "timeLock",
    status: deriveVaultStatus(summary),
    accentTheme: metadataFallback?.accentTheme as VaultSummary["accentTheme"],
    accentTone: metadataFallback?.accentTone || "#87684f",
    metadataStatus: metadataFallback?.metadataStatus,
    targetAmountAtomic: summary.targetAmount,
    savedAmountAtomic: summary.currentBalance,
    totalDepositedAtomic: summary.totalDeposited,
    totalWithdrawnAtomic: summary.totalWithdrawn,
    currentBalanceAtomic: summary.currentBalance,
    progressRatio: targetAmount > 0 ? Math.min(savedAmount / targetAmount, 1) : 0,
    source: "onchain",
  };
};

const buildVaultEligibility = (vault: VaultSummary): VaultEligibility => {
  if (vault.status === "unlocked") {
    return {
      state: "eligible",
      message: "Withdrawals are available whenever you are ready.",
      unlockDate: vault.unlockDate,
      availableAmount: vault.savedAmount,
    };
  }

  if (vault.status === "closed") {
    return {
      state: "unavailable",
      message: "This vault has already been emptied.",
      unlockDate: vault.unlockDate,
      availableAmount: 0,
    };
  }

  return {
    state: "locked",
    message: `Withdrawals stay unavailable until ${new Date(vault.unlockDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}.`,
    unlockDate: vault.unlockDate,
    availableAmount: 0,
  };
};

export const mapVaultDetail = (vault: VaultSummary): VaultDetail => {
  const nextDepositAmount = Math.min(vault.targetAmount - vault.savedAmount, 250);

  return {
    ...vault,
    ownerLabel: "Connected wallet",
    depositPreview: {
      depositAmount: nextDepositAmount > 0 ? nextDepositAmount : 0,
      resultingSavedAmount: vault.savedAmount + (nextDepositAmount > 0 ? nextDepositAmount : 0),
      resultingProgressRatio:
        vault.targetAmount > 0
          ? Math.min((vault.savedAmount + (nextDepositAmount > 0 ? nextDepositAmount : 0)) / vault.targetAmount, 1)
          : 0,
      resultingRemainingAmount: Math.max(vault.targetAmount - (vault.savedAmount + (nextDepositAmount > 0 ? nextDepositAmount : 0)), 0),
    },
    withdrawEligibility: buildVaultEligibility(vault),
    activityPreview: [],
  };
};
