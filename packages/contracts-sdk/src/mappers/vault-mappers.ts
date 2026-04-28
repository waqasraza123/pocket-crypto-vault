import type { GoalVaultContractSummary } from "../types/contract-types";
import type { VaultMetadataFallback } from "../types/vault-types";
import { formatTokenAmountNumber } from "./token-mappers";
import type { VaultAddress, VaultDetail, VaultRuleSummary, WithdrawEligibility, VaultSummary } from "@pocket-vault/shared";

const usdcDecimals = 6;

const toDisplayNumber = (value: bigint): number =>
  formatTokenAmountNumber({
    value,
    decimals: usdcDecimals,
  });

const formatCooldownDurationLabel = (durationSeconds: bigint) => {
  const durationDays = Number(durationSeconds) / 86_400;

  if (Number.isInteger(durationDays)) {
    return `${durationDays} day${durationDays === 1 ? "" : "s"}`;
  }

  const durationHours = Number(durationSeconds) / 3_600;
  return `${durationHours} hour${durationHours === 1 ? "" : "s"}`;
};

const getRuleSummary = (summary: GoalVaultContractSummary): VaultRuleSummary => {
  if (summary.ruleType === "cooldownUnlock") {
    const cooldownDurationDays = Number(summary.cooldownDuration) / 86_400;
    return {
      type: "cooldownUnlock",
      cooldownDurationSeconds: Number(summary.cooldownDuration),
      cooldownDurationDays,
      cooldownDurationLabel: formatCooldownDurationLabel(summary.cooldownDuration),
      unlockRequestedAt: summary.unlockRequestedAt > 0n ? new Date(Number(summary.unlockRequestedAt) * 1000).toISOString() : null,
      unlockEligibleAt: summary.unlockEligibleAt > 0n ? new Date(Number(summary.unlockEligibleAt) * 1000).toISOString() : null,
      unlockEligibleTimestampMs: summary.unlockEligibleAt > 0n ? Number(summary.unlockEligibleAt) * 1000 : null,
    };
  }

  if (summary.ruleType === "guardianApproval") {
    const guardianAddress = summary.guardian ?? "0x0000000000000000000000000000000000000000";
    return {
      type: "guardianApproval",
      guardianAddress,
      guardianLabel: `${guardianAddress.slice(0, 6)}…${guardianAddress.slice(-4)}`,
      unlockRequestedAt: summary.unlockRequestedAt > 0n ? new Date(Number(summary.unlockRequestedAt) * 1000).toISOString() : null,
      guardianDecision: summary.guardianDecision,
      guardianDecisionAt: summary.guardianDecisionAt > 0n ? new Date(Number(summary.guardianDecisionAt) * 1000).toISOString() : null,
    };
  }

  return {
    type: "timeLock",
    unlockDate: new Date(Number(summary.unlockAt) * 1000).toISOString(),
    unlockTimestampMs: Number(summary.unlockAt) * 1000,
  };
};

const deriveVaultStatus = (summary: GoalVaultContractSummary): VaultSummary["status"] => {
  if (summary.currentBalance === 0n && summary.totalWithdrawn > 0n) {
    return "closed";
  }

  if (summary.isUnlocked) {
    return "unlocked";
  }

  if (summary.ruleType === "cooldownUnlock" && summary.unlockRequestedAt > 0n) {
    return "unlocking";
  }

  if (summary.ruleType === "guardianApproval" && summary.guardianDecision === "pending") {
    return "unlocking";
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
  const ruleSummary = getRuleSummary(summary);

  return {
    address,
    chainId,
    assetAddress: summary.asset,
    ownerAddress: summary.owner,
    goalName: metadataFallback?.goalName || "Pocket Vault",
    category: metadataFallback?.category,
    note: metadataFallback?.note,
    targetAmount,
    savedAmount,
    unlockDate: ruleSummary.type === "timeLock" ? ruleSummary.unlockDate : ruleSummary.type === "cooldownUnlock" ? ruleSummary.unlockEligibleAt : null,
    ruleType: summary.ruleType,
    ruleSummary,
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

const buildVaultEligibility = (vault: VaultSummary): WithdrawEligibility => {
  const unlockTimestampMs =
    vault.ruleSummary.type === "timeLock"
      ? vault.ruleSummary.unlockTimestampMs
      : vault.ruleSummary.type === "cooldownUnlock"
        ? vault.ruleSummary.unlockEligibleTimestampMs
        : null;
  const isUnlocked = vault.status === "unlocked";
  const availableAmount = isUnlocked ? vault.savedAmount : 0;
  const availableAmountAtomic = isUnlocked ? vault.currentBalanceAtomic : 0n;

  if (vault.ruleSummary.type === "cooldownUnlock") {
    const unlockRequestStatus =
      vault.ruleSummary.unlockRequestedAt && vault.ruleSummary.unlockEligibleTimestampMs && vault.ruleSummary.unlockEligibleTimestampMs <= Date.now()
        ? "matured"
        : vault.ruleSummary.unlockRequestedAt
          ? "pending"
          : "not_requested";

    return {
      lockState: isUnlocked ? "unlocked" : "locked",
      availability: isUnlocked ? (availableAmountAtomic > 0n ? "ready" : "empty") : unlockRequestStatus === "pending" ? "cooldown_pending" : "unlock_request_required",
      message:
        unlockRequestStatus === "not_requested"
          ? "Request unlock before withdrawals can become available."
          : unlockRequestStatus === "pending"
            ? "Funds become withdrawable after the cooldown ends."
            : availableAmountAtomic > 0n
              ? "Withdrawals are available whenever you are ready."
              : "This vault has already been emptied.",
      unlockDate: vault.ruleSummary.unlockEligibleAt,
      unlockTimestampMs,
      availableAmount,
      availableAmountAtomic,
      withdrawableAmount: {
        amount: availableAmount,
        amountAtomic: availableAmountAtomic,
        hasFunds: availableAmountAtomic > 0n,
      },
      countdown: null,
      isOwner: false,
      isGuardian: false,
      connectedAddress: null,
      ownerAddress: vault.ownerAddress,
      guardianAddress: null,
      isConnected: false,
      isSupportedNetwork: true,
      canWithdraw: isUnlocked && availableAmountAtomic > 0n,
      canRequestUnlock: unlockRequestStatus === "not_requested",
      canCancelUnlockRequest: unlockRequestStatus === "pending" || unlockRequestStatus === "matured",
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus,
      guardianApprovalState: "not_required",
      unlockRequestedAt: vault.ruleSummary.unlockRequestedAt,
      unlockEligibleAt: vault.ruleSummary.unlockEligibleAt,
      nextAction: isUnlocked ? (availableAmountAtomic > 0n ? "withdraw" : "none") : unlockRequestStatus === "not_requested" ? "request_unlock" : "wait",
      ruleType: vault.ruleType,
    };
  }

  if (vault.ruleSummary.type === "guardianApproval") {
    const unlockRequestStatus =
      vault.ruleSummary.guardianDecision === "approved"
        ? "approved"
        : vault.ruleSummary.guardianDecision === "rejected"
          ? "rejected"
          : vault.ruleSummary.guardianDecision === "pending"
            ? "pending"
            : "not_requested";

    return {
      lockState: isUnlocked ? "unlocked" : "locked",
      availability:
        isUnlocked ? (availableAmountAtomic > 0n ? "ready" : "empty") : unlockRequestStatus === "pending" ? "guardian_pending" : unlockRequestStatus === "rejected" ? "guardian_rejected" : "unlock_request_required",
      message:
        unlockRequestStatus === "not_requested"
          ? "Request unlock before guardian approval can begin."
          : unlockRequestStatus === "pending"
            ? "Waiting for guardian approval."
            : unlockRequestStatus === "rejected"
              ? "The guardian rejected the latest unlock request."
              : availableAmountAtomic > 0n
                ? "Withdrawals are available whenever you are ready."
                : "This vault has already been emptied.",
      unlockDate: null,
      unlockTimestampMs: null,
      availableAmount,
      availableAmountAtomic,
      withdrawableAmount: {
        amount: availableAmount,
        amountAtomic: availableAmountAtomic,
        hasFunds: availableAmountAtomic > 0n,
      },
      countdown: null,
      isOwner: false,
      isGuardian: false,
      connectedAddress: null,
      ownerAddress: vault.ownerAddress,
      guardianAddress: vault.ruleSummary.guardianAddress,
      isConnected: false,
      isSupportedNetwork: true,
      canWithdraw: isUnlocked && availableAmountAtomic > 0n,
      canRequestUnlock: unlockRequestStatus === "not_requested" || unlockRequestStatus === "rejected",
      canCancelUnlockRequest: unlockRequestStatus === "pending" || unlockRequestStatus === "approved" || unlockRequestStatus === "rejected",
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus,
      guardianApprovalState: vault.ruleSummary.guardianDecision,
      unlockRequestedAt: vault.ruleSummary.unlockRequestedAt,
      unlockEligibleAt: null,
      nextAction: isUnlocked ? (availableAmountAtomic > 0n ? "withdraw" : "none") : unlockRequestStatus === "pending" ? "wait" : "request_unlock",
      ruleType: vault.ruleType,
    };
  }

  if (vault.status === "unlocked") {
    return {
      lockState: "unlocked",
      availability: availableAmountAtomic > 0n ? "ready" : "empty",
      message: "Withdrawals are available whenever you are ready.",
      unlockDate: vault.unlockDate,
      unlockTimestampMs,
      availableAmount,
      availableAmountAtomic,
      withdrawableAmount: {
        amount: availableAmount,
        amountAtomic: availableAmountAtomic,
        hasFunds: availableAmountAtomic > 0n,
      },
      countdown: null,
      isOwner: false,
      isGuardian: false,
      connectedAddress: null,
      ownerAddress: vault.ownerAddress,
      guardianAddress: null,
      isConnected: false,
      isSupportedNetwork: true,
      canWithdraw: availableAmountAtomic > 0n,
      canRequestUnlock: false,
      canCancelUnlockRequest: false,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus: "approved",
      guardianApprovalState: "not_required",
      unlockRequestedAt: null,
      unlockEligibleAt: vault.unlockDate,
      nextAction: availableAmountAtomic > 0n ? "withdraw" : "none",
      ruleType: vault.ruleType,
    };
  }

  if (vault.status === "closed") {
    return {
      lockState: "unlocked",
      availability: "empty",
      message: "This vault has already been emptied.",
      unlockDate: vault.unlockDate,
      unlockTimestampMs,
      availableAmount: 0,
      availableAmountAtomic: 0n,
      withdrawableAmount: {
        amount: 0,
        amountAtomic: 0n,
        hasFunds: false,
      },
      countdown: null,
      isOwner: false,
      isGuardian: false,
      connectedAddress: null,
      ownerAddress: vault.ownerAddress,
      guardianAddress: null,
      isConnected: false,
      isSupportedNetwork: true,
      canWithdraw: false,
      canRequestUnlock: false,
      canCancelUnlockRequest: false,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus: "approved",
      guardianApprovalState: "not_required",
      unlockRequestedAt: null,
      unlockEligibleAt: vault.unlockDate,
      nextAction: "none",
      ruleType: vault.ruleType,
    };
  }

  return {
    lockState: "locked",
    availability: "locked",
    message: vault.unlockDate ? `Withdrawals stay unavailable until ${new Date(vault.unlockDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}.` : "This vault is still locked.",
    unlockDate: vault.unlockDate,
    unlockTimestampMs,
    availableAmount: 0,
    availableAmountAtomic: 0n,
    withdrawableAmount: {
      amount: 0,
      amountAtomic: 0n,
      hasFunds: false,
    },
    countdown: null,
    isOwner: false,
    isGuardian: false,
    connectedAddress: null,
    ownerAddress: vault.ownerAddress,
    guardianAddress: null,
    isConnected: false,
    isSupportedNetwork: true,
    canWithdraw: false,
    canRequestUnlock: false,
    canCancelUnlockRequest: false,
    canGuardianApprove: false,
    canGuardianReject: false,
    unlockRequestStatus: "not_requested",
    guardianApprovalState: "not_required",
    unlockRequestedAt: null,
    unlockEligibleAt: vault.unlockDate,
    nextAction: "wait",
    ruleType: vault.ruleType,
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
