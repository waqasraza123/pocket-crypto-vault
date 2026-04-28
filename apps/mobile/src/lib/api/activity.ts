import {
  parseActivityFeedPayload,
  parseActivityFeedResponse,
  parseVaultActivityPayload,
  parseVaultActivityResponse,
} from "@pocket-vault/api-client";
import type { SupportedChainId, VaultActivityItem } from "@pocket-vault/shared";
import type { Address } from "viem";

import { fetchBackendJson } from "./client";
export { createActivityDedupeKey, mapActivityItemToViewEvent, mapActivityItemsToPreview } from "./mappers";

export const fetchOwnerActivityFeed = async ({
  chainId,
  ownerWallet,
}: {
  chainId?: SupportedChainId;
  ownerWallet?: Address | null;
}): Promise<{
  status: "success" | "unavailable" | "error" | "not_found";
  data:
    | {
        items: VaultActivityItem[];
        freshness: {
          freshness: "current" | "syncing" | "lagging" | "unavailable";
          lastSyncedAt: string | null;
          latestIndexedBlock: number | null;
          latestChainBlock: number | null;
          lagBlocks: number | null;
        };
      }
    | null;
  message: string | null;
}> => {
  const query = new URLSearchParams();

  if (chainId) {
    query.set("chainId", String(chainId));
  }

  if (ownerWallet) {
    query.set("ownerWallet", ownerWallet);
  }

  const response = await fetchBackendJson({
    path: `/activity${query.size > 0 ? `?${query.toString()}` : ""}`,
    fallbackMessage: "Activity is not available right now.",
    parse: parseActivityFeedPayload,
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
    data: {
      items: parseActivityFeedResponse(response.data).items,
      freshness: response.data.freshness,
    },
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
  const response = await fetchBackendJson({
    path: `/vaults/${vaultAddress}/activity?chainId=${chainId}`,
    fallbackMessage: "Vault activity is not available right now.",
    parse: parseVaultActivityPayload,
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
