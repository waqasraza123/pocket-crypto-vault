import {
  parseActivityFeedResponse,
  parseVaultActivityResponse,
  type ActivityFeedResponse,
  type VaultActivityResponse,
} from "@goal-vault/api-client";
import type { SupportedChainId, VaultActivityEvent, VaultActivityItem } from "@goal-vault/shared";
import type { Address } from "viem";

import { formatUsdc } from "../format";
import { getCurrentMessages, interpolate } from "../i18n";
import { fetchBackendJson } from "./client";

export const fetchOwnerActivityFeed = async ({
  chainId,
  ownerWallet,
}: {
  chainId?: SupportedChainId;
  ownerWallet?: Address | null;
}): Promise<{
  status: "success" | "unavailable" | "error" | "not_found";
  data: VaultActivityItem[] | null;
  message: string | null;
}> => {
const query = new URLSearchParams();

  if (chainId) {
    query.set("chainId", String(chainId));
  }

  if (ownerWallet) {
    query.set("ownerWallet", ownerWallet);
  }

  const response = await fetchBackendJson<ActivityFeedResponse>({
    path: `/activity${query.size > 0 ? `?${query.toString()}` : ""}`,
    fallbackMessage: "Activity is not available right now.",
  });

  if (response.status !== "success" || !response.data) {
    return {
      status: response.status,
      data: null,
      message: response.message,
    };
  }

  return {
    status: "success",
    data: parseActivityFeedResponse(response.data).items,
    message: null,
  };
};

export const fetchVaultActivityFeed = async ({
  chainId,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
}): Promise<{
  status: "success" | "unavailable" | "error" | "not_found";
  data: VaultActivityItem[] | null;
  message: string | null;
}> => {
  const response = await fetchBackendJson<VaultActivityResponse>({
    path: `/vaults/${vaultAddress}/activity?chainId=${chainId}`,
    fallbackMessage: "Vault activity is not available right now.",
  });

  if (response.status !== "success" || !response.data) {
    return {
      status: response.status,
      data: null,
      message: response.message,
    };
  }

  return {
    status: "success",
    data: parseVaultActivityResponse(response.data).items,
    message: null,
  };
};

export const createActivityDedupeKey = ({
  txHash,
  type,
  vaultAddress,
}: {
  txHash?: `0x${string}`;
  type: VaultActivityEvent["type"];
  vaultAddress: Address;
}) => `${vaultAddress.toLowerCase()}:${type}:${txHash?.toLowerCase() ?? "local"}`;

export const mapActivityItemToViewEvent = (item: VaultActivityItem): VaultActivityEvent => {
  const messages = getCurrentMessages();
  const goalName = item.displayName ?? messages.activityFeed.fallbackGoalName;
  const amount = item.amountAtomic ? Number(item.amountAtomic) / 1_000_000 : undefined;

  if (item.eventType === "deposit_confirmed") {
    return {
      id: item.id,
      vaultAddress: item.vaultAddress,
      chainId: item.chainId,
      type: "deposit",
      title: messages.deposit.activityTitle,
      subtitle: interpolate(messages.deposit.activitySubtitle, { goal: goalName }),
      occurredAt: item.occurredAt,
      amount,
      txHash: item.txHash,
      source: "indexed",
    };
  }

  if (item.eventType === "withdrawal_confirmed") {
    return {
      id: item.id,
      vaultAddress: item.vaultAddress,
      chainId: item.chainId,
      type: "withdrawal",
      title: messages.withdraw.activityTitle,
      subtitle: interpolate(messages.withdraw.activitySubtitle, {
        goal: goalName,
        amount: formatUsdc(amount ?? 0),
      }),
      occurredAt: item.occurredAt,
      amount,
      txHash: item.txHash,
      source: "indexed",
    };
  }

  return {
    id: item.id,
    vaultAddress: item.vaultAddress,
    chainId: item.chainId,
    type: "created",
    title: messages.activityFeed.createdTitle,
    subtitle: interpolate(messages.activityFeed.createdSubtitle, { goal: goalName }),
    occurredAt: item.occurredAt,
    txHash: item.txHash,
    source: "indexed",
  };
};
