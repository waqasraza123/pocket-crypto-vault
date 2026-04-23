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
  const unlockTimestampMs = getUnlockTimestampMs(vault.unlockDate);
  const countdown = buildUnlockCountdown({
    unlockDate: vault.unlockDate,
    nowMs,
  });
  const isUnlocked = countdown.isComplete;
  const isConnected = connectionStatus === "ready";
  const isSupportedNetwork = connectionStatus !== "unsupportedNetwork";
  const normalizedConnectedAddress = connectedAddress ?? null;
  const isOwner = isConnected && normalizedConnectedAddress !== null && normalizedConnectedAddress.toLowerCase() === vault.ownerAddress.toLowerCase();
  const availableAmountAtomic = isUnlocked ? vault.currentBalanceAtomic : 0n;
  const availableAmount = isUnlocked ? vault.savedAmount : 0;
  const exactUnlockDate = formatLongDate(vault.unlockDate);

  if (!isConnected) {
    return {
      lockState: isUnlocked ? "unlocked" : "locked",
      availability: connectionStatus === "unsupportedNetwork" ? "unsupported_network" : "disconnected",
      message: connectionStatus === "unsupportedNetwork" ? messages.switchNetwork : messages.connectWallet,
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
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      isConnected: false,
      isSupportedNetwork,
      canWithdraw: false,
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
      isOwner: false,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      isConnected: true,
      isSupportedNetwork: false,
      canWithdraw: false,
    };
  }

  if (!isOwner) {
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
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      isConnected: true,
      isSupportedNetwork: true,
      canWithdraw: false,
    };
  }

  if (!isUnlocked) {
    const countdownLabel = formatUnlockCountdownLabel(countdown);

    return {
      lockState: "locked",
      availability: "locked",
      message:
        countdown.totalSeconds > 0
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
      isOwner: true,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      isConnected: true,
      isSupportedNetwork: true,
      canWithdraw: false,
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
      isOwner: true,
      connectedAddress: normalizedConnectedAddress,
      ownerAddress: vault.ownerAddress,
      isConnected: true,
      isSupportedNetwork: true,
      canWithdraw: false,
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
    isOwner: true,
      connectedAddress: normalizedConnectedAddress,
    ownerAddress: vault.ownerAddress,
    isConnected: true,
    isSupportedNetwork: true,
    canWithdraw: true,
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
