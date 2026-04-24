import type { Address, Hash } from "viem";

import type {
  SupportedChainId,
  UnlockCountdown,
  WithdrawEligibility,
  WithdrawResult,
  VaultDetail,
  VaultSummary,
} from "../../types";
import { getCurrentMessages, interpolate } from "../i18n";
import { formatLongDate, formatUsdc } from "../format";
import { buildUnlockCountdown, formatCountdownParts, getUnlockTimestampMs } from "./time-lock-utils";
import { buildWithdrawPreview as buildWithdrawPreviewModel } from "./amount-utils";

export const buildWithdrawPreview = buildWithdrawPreviewModel;

export const formatUnlockCountdownLabel = (countdown: UnlockCountdown) => {
  const messages = getCurrentMessages().withdraw.countdown;
  const formatter = new Intl.NumberFormat(getCurrentMessages().dateLocale);

  return formatCountdownParts(countdown)
    .filter((part) => part.value > 0 || part.unit === "seconds")
    .map((part) => {
      switch (part.unit) {
        case "days":
          return interpolate(messages.days, { count: formatter.format(part.value) });
        case "hours":
          return interpolate(messages.hours, { count: formatter.format(part.value) });
        case "minutes":
          return interpolate(messages.minutes, { count: formatter.format(part.value) });
        case "seconds":
        default:
          return interpolate(messages.seconds, { count: formatter.format(part.value) });
      }
    })
    .slice(0, 2)
    .join(" ");
};

const buildRuleCountdown = ({
  vault,
  nowMs,
}: {
  vault: VaultDetail;
  nowMs: number;
}) => {
  if (vault.ruleSummary.type === "timeLock") {
    return buildUnlockCountdown({
      unlockDate: vault.ruleSummary.unlockDate,
      nowMs,
    });
  }

  if (vault.ruleSummary.type === "cooldownUnlock" && vault.ruleSummary.unlockEligibleAt) {
    return buildUnlockCountdown({
      unlockDate: vault.ruleSummary.unlockEligibleAt,
      nowMs,
    });
  }

  return null;
};

export const buildWithdrawEligibility = ({
  vault,
  connectionStatus,
  connectedAddress,
  activeChainId,
  nowMs = Date.now(),
}: {
  vault: VaultDetail | null;
  connectionStatus:
    | "disconnected"
    | "walletUnavailable"
    | "unsupportedNetwork"
    | "connecting"
    | "ready"
    | "idle";
  connectedAddress?: Address | null;
  activeChainId?: SupportedChainId | null;
  nowMs?: number;
}): WithdrawEligibility | null => {
  if (!vault) {
    return null;
  }

  const messages = getCurrentMessages().withdraw;
  const countdown = buildRuleCountdown({
    vault,
    nowMs,
  });
  const isConnected = connectionStatus === "ready";
  const isSupportedNetwork = connectionStatus !== "unsupportedNetwork";
  const normalizedConnectedAddress = connectedAddress ?? null;
  const isOwner = isConnected && normalizedConnectedAddress !== null && normalizedConnectedAddress.toLowerCase() === vault.ownerAddress.toLowerCase();
  const guardianAddress = vault.ruleSummary.type === "guardianApproval" ? vault.ruleSummary.guardianAddress : null;
  const isGuardian =
    isConnected && guardianAddress !== null && normalizedConnectedAddress !== null && normalizedConnectedAddress.toLowerCase() === guardianAddress.toLowerCase();
  const unlockTimestampMs =
    vault.ruleSummary.type === "timeLock"
      ? vault.ruleSummary.unlockTimestampMs
      : vault.ruleSummary.type === "cooldownUnlock"
        ? vault.ruleSummary.unlockEligibleTimestampMs
        : null;
  const isUnlocked =
    vault.ruleSummary.type === "timeLock"
      ? (countdown?.isComplete ?? false)
      : vault.ruleSummary.type === "cooldownUnlock"
        ? Boolean(vault.ruleSummary.unlockEligibleTimestampMs && vault.ruleSummary.unlockEligibleTimestampMs <= nowMs)
        : vault.ruleSummary.guardianDecision === "approved";
  const availableAmountAtomic = isUnlocked ? vault.currentBalanceAtomic : 0n;
  const availableAmount = isUnlocked ? vault.savedAmount : 0;
  const unlockRequestStatus =
    vault.ruleSummary.type === "timeLock"
      ? isUnlocked
        ? "approved"
        : "not_requested"
      : vault.ruleSummary.type === "cooldownUnlock"
        ? vault.ruleSummary.unlockRequestedAt
          ? isUnlocked
            ? "matured"
            : "pending"
          : "not_requested"
        : vault.ruleSummary.guardianDecision === "approved"
          ? "approved"
          : vault.ruleSummary.guardianDecision === "rejected"
            ? "rejected"
            : vault.ruleSummary.guardianDecision === "pending"
              ? "pending"
              : "not_requested";

  if (!isConnected) {
    return {
      lockState: isUnlocked ? "unlocked" : "locked",
      availability: connectionStatus === "unsupportedNetwork" ? "unsupported_network" : "disconnected",
      message: connectionStatus === "unsupportedNetwork" ? messages.switchNetwork : messages.connectWallet,
      unlockDate:
        vault.ruleSummary.type === "timeLock"
          ? vault.ruleSummary.unlockDate
          : vault.ruleSummary.type === "cooldownUnlock"
            ? vault.ruleSummary.unlockEligibleAt
            : null,
      unlockTimestampMs,
      availableAmount,
      availableAmountAtomic,
      withdrawableAmount: {
        amount: availableAmount,
        amountAtomic: availableAmountAtomic,
        hasFunds: availableAmountAtomic > 0n,
      },
      countdown: isUnlocked ? null : countdown,
      isOwner: false,
      isGuardian: false,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      guardianAddress,
      isConnected: false,
      isSupportedNetwork,
      canWithdraw: false,
      canRequestUnlock: false,
      canCancelUnlockRequest: false,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus,
      guardianApprovalState: vault.ruleSummary.type === "guardianApproval" ? vault.ruleSummary.guardianDecision : "not_required",
      unlockRequestedAt: vault.ruleSummary.type === "timeLock" ? null : vault.ruleSummary.unlockRequestedAt,
      unlockEligibleAt: vault.ruleSummary.type === "cooldownUnlock" ? vault.ruleSummary.unlockEligibleAt : null,
      nextAction: "none",
      ruleType: vault.ruleType,
    };
  }

  if (!activeChainId || activeChainId !== vault.chainId) {
    return {
      lockState: isUnlocked ? "unlocked" : "locked",
      availability: "unsupported_network",
      message: messages.switchNetwork,
      unlockDate: vault.unlockDate,
      unlockTimestampMs,
      availableAmount,
      availableAmountAtomic,
      withdrawableAmount: {
        amount: availableAmount,
        amountAtomic: availableAmountAtomic,
        hasFunds: availableAmountAtomic > 0n,
      },
      countdown: isUnlocked ? null : countdown,
      isOwner,
      isGuardian,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      guardianAddress,
      isConnected: true,
      isSupportedNetwork: false,
      canWithdraw: false,
      canRequestUnlock: false,
      canCancelUnlockRequest: false,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus,
      guardianApprovalState: vault.ruleSummary.type === "guardianApproval" ? vault.ruleSummary.guardianDecision : "not_required",
      unlockRequestedAt: vault.ruleSummary.type === "timeLock" ? null : vault.ruleSummary.unlockRequestedAt,
      unlockEligibleAt: vault.ruleSummary.type === "cooldownUnlock" ? vault.ruleSummary.unlockEligibleAt : null,
      nextAction: "none",
      ruleType: vault.ruleType,
    };
  }

  if (vault.ruleSummary.type === "guardianApproval" && !isOwner && !isGuardian) {
    return {
      lockState: isUnlocked ? "unlocked" : "locked",
      availability: "guardian_only",
      message: "Only the owner or assigned guardian can act on this vault.",
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
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      guardianAddress,
      isConnected: true,
      isSupportedNetwork: true,
      canWithdraw: false,
      canRequestUnlock: false,
      canCancelUnlockRequest: false,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus,
      guardianApprovalState: vault.ruleSummary.guardianDecision,
      unlockRequestedAt: vault.ruleSummary.unlockRequestedAt,
      unlockEligibleAt: null,
      nextAction: "none",
      ruleType: vault.ruleType,
    };
  }

  if (!isOwner && !isGuardian) {
    return {
      lockState: isUnlocked ? "unlocked" : "locked",
      availability: "owner_only",
      message: messages.ownerOnlyDescription,
      unlockDate: vault.unlockDate,
      unlockTimestampMs,
      availableAmount,
      availableAmountAtomic,
      withdrawableAmount: {
        amount: availableAmount,
        amountAtomic: availableAmountAtomic,
        hasFunds: availableAmountAtomic > 0n,
      },
      countdown: isUnlocked ? null : countdown,
      isOwner: false,
      isGuardian: false,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      guardianAddress,
      isConnected: true,
      isSupportedNetwork: true,
      canWithdraw: false,
      canRequestUnlock: false,
      canCancelUnlockRequest: false,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus,
      guardianApprovalState: vault.ruleSummary.type === "guardianApproval" ? vault.ruleSummary.guardianDecision : "not_required",
      unlockRequestedAt: vault.ruleSummary.type === "timeLock" ? null : vault.ruleSummary.unlockRequestedAt,
      unlockEligibleAt: vault.ruleSummary.type === "cooldownUnlock" ? vault.ruleSummary.unlockEligibleAt : null,
      nextAction: "none",
      ruleType: vault.ruleType,
    };
  }

  if (vault.ruleSummary.type === "cooldownUnlock" && !vault.ruleSummary.unlockRequestedAt) {
    return {
      lockState: "locked",
      availability: "unlock_request_required",
      message: "Request unlock first. Funds become withdrawable after the cooldown ends.",
      unlockDate: null,
      unlockTimestampMs: null,
      availableAmount: 0,
      availableAmountAtomic: 0n,
      withdrawableAmount: {
        amount: 0,
        amountAtomic: 0n,
        hasFunds: false,
      },
      countdown: null,
      isOwner: true,
      isGuardian: false,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      guardianAddress: null,
      isConnected: true,
      isSupportedNetwork: true,
      canWithdraw: false,
      canRequestUnlock: true,
      canCancelUnlockRequest: false,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus: "not_requested",
      guardianApprovalState: "not_required",
      unlockRequestedAt: null,
      unlockEligibleAt: null,
      nextAction: "request_unlock",
      ruleType: vault.ruleType,
    };
  }

  if (vault.ruleSummary.type === "cooldownUnlock" && !isUnlocked) {
    const countdownLabel = countdown ? formatUnlockCountdownLabel(countdown) : null;

    return {
      lockState: "locked",
      availability: "cooldown_pending",
      message: countdownLabel ? `Funds become withdrawable in ${countdownLabel}.` : "Funds become withdrawable after the cooldown ends.",
      unlockDate: vault.ruleSummary.unlockEligibleAt,
      unlockTimestampMs,
      availableAmount: 0,
      availableAmountAtomic: 0n,
      withdrawableAmount: {
        amount: 0,
        amountAtomic: 0n,
        hasFunds: false,
      },
      countdown,
      isOwner: true,
      isGuardian: false,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      guardianAddress: null,
      isConnected: true,
      isSupportedNetwork: true,
      canWithdraw: false,
      canRequestUnlock: false,
      canCancelUnlockRequest: true,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus: "pending",
      guardianApprovalState: "not_required",
      unlockRequestedAt: vault.ruleSummary.unlockRequestedAt,
      unlockEligibleAt: vault.ruleSummary.unlockEligibleAt,
      nextAction: "wait",
      ruleType: vault.ruleType,
    };
  }

  if (vault.ruleSummary.type === "guardianApproval") {
    if (isGuardian && vault.ruleSummary.guardianDecision === "pending") {
      return {
        lockState: "locked",
        availability: "guardian_pending",
        message: "This vault is waiting for your decision.",
        unlockDate: null,
        unlockTimestampMs: null,
        availableAmount: 0,
        availableAmountAtomic: 0n,
        withdrawableAmount: {
          amount: 0,
          amountAtomic: 0n,
          hasFunds: false,
        },
        countdown: null,
        isOwner: false,
        isGuardian: true,
        connectedAddress: normalizedConnectedAddress,
        ownerAddress: vault.ownerAddress,
        guardianAddress,
        isConnected: true,
        isSupportedNetwork: true,
        canWithdraw: false,
        canRequestUnlock: false,
        canCancelUnlockRequest: false,
        canGuardianApprove: true,
        canGuardianReject: true,
        unlockRequestStatus: "pending",
        guardianApprovalState: "pending",
        unlockRequestedAt: vault.ruleSummary.unlockRequestedAt,
        unlockEligibleAt: null,
        nextAction: "guardian_approve",
        ruleType: vault.ruleType,
      };
    }

    if (isOwner && vault.ruleSummary.guardianDecision === "not_requested") {
      return {
        lockState: "locked",
        availability: "unlock_request_required",
        message: "Request unlock to send this vault to the guardian for approval.",
        unlockDate: null,
        unlockTimestampMs: null,
        availableAmount: 0,
        availableAmountAtomic: 0n,
        withdrawableAmount: {
          amount: 0,
          amountAtomic: 0n,
          hasFunds: false,
        },
        countdown: null,
        isOwner: true,
        isGuardian: false,
        connectedAddress: normalizedConnectedAddress,
        ownerAddress: vault.ownerAddress,
        guardianAddress,
        isConnected: true,
        isSupportedNetwork: true,
        canWithdraw: false,
        canRequestUnlock: true,
        canCancelUnlockRequest: false,
        canGuardianApprove: false,
        canGuardianReject: false,
        unlockRequestStatus: "not_requested",
        guardianApprovalState: "not_requested",
        unlockRequestedAt: null,
        unlockEligibleAt: null,
        nextAction: "request_unlock",
        ruleType: vault.ruleType,
      };
    }

    if (isOwner && vault.ruleSummary.guardianDecision === "pending") {
      return {
        lockState: "locked",
        availability: "guardian_pending",
        message: "Waiting for guardian approval.",
        unlockDate: null,
        unlockTimestampMs: null,
        availableAmount: 0,
        availableAmountAtomic: 0n,
        withdrawableAmount: {
          amount: 0,
          amountAtomic: 0n,
          hasFunds: false,
        },
        countdown: null,
        isOwner: true,
        isGuardian: false,
        connectedAddress: normalizedConnectedAddress,
        ownerAddress: vault.ownerAddress,
        guardianAddress,
        isConnected: true,
        isSupportedNetwork: true,
        canWithdraw: false,
        canRequestUnlock: false,
        canCancelUnlockRequest: true,
        canGuardianApprove: false,
        canGuardianReject: false,
        unlockRequestStatus: "pending",
        guardianApprovalState: "pending",
        unlockRequestedAt: vault.ruleSummary.unlockRequestedAt,
        unlockEligibleAt: null,
        nextAction: "wait",
        ruleType: vault.ruleType,
      };
    }

    if (isOwner && vault.ruleSummary.guardianDecision === "rejected") {
      return {
        lockState: "locked",
        availability: "guardian_rejected",
        message: "The guardian rejected the latest unlock request.",
        unlockDate: null,
        unlockTimestampMs: null,
        availableAmount: 0,
        availableAmountAtomic: 0n,
        withdrawableAmount: {
          amount: 0,
          amountAtomic: 0n,
          hasFunds: false,
        },
        countdown: null,
        isOwner: true,
        isGuardian: false,
        connectedAddress: normalizedConnectedAddress,
        ownerAddress: vault.ownerAddress,
        guardianAddress,
        isConnected: true,
        isSupportedNetwork: true,
        canWithdraw: false,
        canRequestUnlock: true,
        canCancelUnlockRequest: true,
        canGuardianApprove: false,
        canGuardianReject: false,
        unlockRequestStatus: "rejected",
        guardianApprovalState: "rejected",
        unlockRequestedAt: vault.ruleSummary.unlockRequestedAt,
        unlockEligibleAt: null,
        nextAction: "request_unlock",
        ruleType: vault.ruleType,
      };
    }
  }

  if (!isUnlocked) {
    const exactUnlockDate = vault.unlockDate ? formatLongDate(vault.unlockDate) : "later";
    const countdownLabel = countdown ? formatUnlockCountdownLabel(countdown) : null;

    return {
      lockState: "locked",
      availability: "locked",
      message:
        countdownLabel
          ? interpolate(messages.lockedCountdownDescription, { time: countdownLabel })
          : interpolate(messages.lockedDescriptionExact, { date: exactUnlockDate }),
      unlockDate: vault.unlockDate,
      unlockTimestampMs,
      availableAmount: 0,
      availableAmountAtomic: 0n,
      withdrawableAmount: {
        amount: 0,
        amountAtomic: 0n,
        hasFunds: false,
      },
      countdown,
      isOwner,
      isGuardian,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      guardianAddress,
      isConnected: true,
      isSupportedNetwork: true,
      canWithdraw: false,
      canRequestUnlock: false,
      canCancelUnlockRequest: false,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus,
      guardianApprovalState: vault.ruleSummary.type === "guardianApproval" ? vault.ruleSummary.guardianDecision : "not_required",
      unlockRequestedAt: vault.ruleSummary.type === "timeLock" ? null : vault.ruleSummary.unlockRequestedAt,
      unlockEligibleAt: vault.ruleSummary.type === "cooldownUnlock" ? vault.ruleSummary.unlockEligibleAt : null,
      nextAction: "wait",
      ruleType: vault.ruleType,
    };
  }

  if (vault.currentBalanceAtomic <= 0n) {
    return {
      lockState: "unlocked",
      availability: "empty",
      message: messages.emptyDescription,
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
      isOwner,
      isGuardian,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      guardianAddress,
      isConnected: true,
      isSupportedNetwork: true,
      canWithdraw: false,
      canRequestUnlock: false,
      canCancelUnlockRequest: false,
      canGuardianApprove: false,
      canGuardianReject: false,
      unlockRequestStatus,
      guardianApprovalState: vault.ruleSummary.type === "guardianApproval" ? vault.ruleSummary.guardianDecision : "not_required",
      unlockRequestedAt: vault.ruleSummary.type === "timeLock" ? null : vault.ruleSummary.unlockRequestedAt,
      unlockEligibleAt: vault.ruleSummary.type === "cooldownUnlock" ? vault.ruleSummary.unlockEligibleAt : null,
      nextAction: "none",
      ruleType: vault.ruleType,
    };
  }

  return {
    lockState: "unlocked",
    availability: "ready",
    message: interpolate(messages.readyDescription, {
      amount: formatUsdc(vault.savedAmount),
    }),
    unlockDate: vault.unlockDate,
    unlockTimestampMs,
    availableAmount: vault.savedAmount,
    availableAmountAtomic: vault.currentBalanceAtomic,
    withdrawableAmount: {
      amount: vault.savedAmount,
      amountAtomic: vault.currentBalanceAtomic,
      hasFunds: true,
    },
    countdown: null,
    isOwner,
    isGuardian,
    connectedAddress: normalizedConnectedAddress,
    ownerAddress: vault.ownerAddress,
    guardianAddress,
    isConnected: true,
    isSupportedNetwork: true,
    canWithdraw: isOwner,
    canRequestUnlock: false,
    canCancelUnlockRequest: false,
    canGuardianApprove: false,
    canGuardianReject: false,
    unlockRequestStatus,
    guardianApprovalState: vault.ruleSummary.type === "guardianApproval" ? vault.ruleSummary.guardianDecision : "not_required",
    unlockRequestedAt: vault.ruleSummary.type === "timeLock" ? null : vault.ruleSummary.unlockRequestedAt,
    unlockEligibleAt: vault.ruleSummary.type === "cooldownUnlock" ? vault.ruleSummary.unlockEligibleAt : null,
    nextAction: isOwner ? "withdraw" : "none",
    ruleType: vault.ruleType,
  };
};

export const createWithdrawalActivityEvent = ({
  chainId,
  ownerAddress,
  vault,
  amount,
  confirmedAt,
  txHash,
}: {
  chainId: SupportedChainId;
  ownerAddress: Address;
  vault: Pick<VaultSummary, "address" | "goalName">;
  amount: number;
  confirmedAt: string;
  txHash: Hash;
}) => {
  const messages = getCurrentMessages().withdraw;

  return {
    id: `${txHash.toLowerCase()}:withdrawal`,
    chainId,
    ownerAddress,
    vaultAddress: vault.address,
    type: "withdrawal" as const,
    title: messages.activityTitle,
    subtitle: interpolate(messages.activitySubtitle, {
      goal: vault.goalName,
      amount: formatUsdc(amount),
    }),
    occurredAt: confirmedAt,
    amount,
    txHash,
    source: "session" as const,
  };
};

export const createWithdrawResult = ({
  chainId,
  ownerAddress,
  vaultAddress,
  amountAtomic,
  withdrawTxHash,
  confirmedAt,
}: {
  chainId: SupportedChainId;
  ownerAddress: Address;
  vaultAddress: Address;
  amountAtomic: bigint;
  withdrawTxHash: Hash;
  confirmedAt: string;
}): WithdrawResult => ({
  chainId,
  ownerAddress,
  vaultAddress,
  amountAtomic,
  withdrawTxHash,
  confirmedAt,
});
