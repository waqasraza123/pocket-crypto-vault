import type { Address, Hash } from "viem";

import type { SupportedChainId, VaultActivityEvent, VaultDetail } from "../../types";

export type VaultUnlockAction = "request" | "cancel" | "approve" | "reject";

const getActivityCopy = (action: VaultUnlockAction) => {
  if (action === "request") {
    return {
      id: "unlock_requested",
      title: "Unlock requested",
    };
  }

  if (action === "cancel") {
    return {
      id: "unlock_canceled",
      title: "Unlock request canceled",
    };
  }

  if (action === "approve") {
    return {
      id: "guardian_approved",
      title: "Guardian approved",
    };
  }

  return {
    id: "guardian_rejected",
    title: "Guardian rejected",
  };
};

export const getUnlockActionLabel = (action: VaultUnlockAction) => {
  if (action === "request") {
    return "Unlock requested.";
  }

  if (action === "cancel") {
    return "Unlock request canceled.";
  }

  if (action === "approve") {
    return "Guardian approval submitted.";
  }

  return "Guardian rejection submitted.";
};

export const createUnlockActivityEvent = ({
  action,
  chainId,
  ownerAddress,
  txHash,
  vault,
  occurredAt,
}: {
  action: VaultUnlockAction;
  chainId: SupportedChainId;
  ownerAddress: Address;
  txHash: Hash;
  vault: Pick<VaultDetail, "address" | "goalName">;
  occurredAt: string;
}): VaultActivityEvent & { chainId: SupportedChainId; ownerAddress: Address } => {
  const copy = getActivityCopy(action);

  return {
    id: `${txHash.toLowerCase()}:${copy.id}`,
    chainId,
    ownerAddress,
    vaultAddress: vault.address,
    type: copy.id as VaultActivityEvent["type"],
    title: copy.title,
    subtitle: vault.goalName,
    occurredAt,
    txHash,
    source: "session",
  };
};
