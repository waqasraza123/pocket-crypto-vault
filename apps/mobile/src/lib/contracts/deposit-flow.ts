import type { Address, Hash } from "viem";

import type { ApprovalRequirement, DepositResult, SupportedChainId, VaultActivityEvent, VaultSummary } from "../../types";
import { getCurrentMessages, interpolate } from "../i18n";
import { buildDepositPreview as buildDepositPreviewModel, getUsdcAddressForChain } from "./amount-utils";

export const buildDepositPreview = buildDepositPreviewModel;

export const getApprovalRequirement = ({
  allowanceAtomic,
  amountAtomic,
}: {
  allowanceAtomic: bigint | null;
  amountAtomic: bigint | null;
}): ApprovalRequirement => {
  if (allowanceAtomic === null || amountAtomic === null || amountAtomic <= 0n) {
    return "unknown";
  }

  return allowanceAtomic >= amountAtomic ? "not_required" : "required";
};

export const vaultSupportsUsdcDeposits = ({
  chainId,
  assetAddress,
}: {
  chainId: SupportedChainId;
  assetAddress: Address;
}) => getUsdcAddressForChain(chainId).toLowerCase() === assetAddress.toLowerCase();

export const createDepositActivityEvent = ({
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
}): VaultActivityEvent & { chainId: SupportedChainId; ownerAddress: Address } => {
  const messages = getCurrentMessages().deposit;

  return {
    id: `${txHash.toLowerCase()}:deposit`,
    chainId,
    ownerAddress,
    vaultAddress: vault.address,
    type: "deposit",
    title: messages.activityTitle,
    subtitle: interpolate(messages.activitySubtitle, { goal: vault.goalName }),
    occurredAt: confirmedAt,
    amount,
    txHash,
    source: "session",
  };
};

export const createDepositResult = ({
  chainId,
  ownerAddress,
  vaultAddress,
  amountAtomic,
  approvalTxHash,
  depositTxHash,
  confirmedAt,
}: {
  chainId: SupportedChainId;
  ownerAddress: Address;
  vaultAddress: Address;
  amountAtomic: bigint;
  approvalTxHash: Hash | null;
  depositTxHash: Hash;
  confirmedAt: string;
}): DepositResult => ({
  chainId,
  ownerAddress,
  vaultAddress,
  amountAtomic,
  approvalTxHash,
  depositTxHash,
  confirmedAt,
});
