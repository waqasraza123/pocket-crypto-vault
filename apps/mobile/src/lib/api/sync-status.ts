import type { SupportedChainId } from "@pocket-vault/shared";

import { getBackendBaseUrl } from "../env/client";

export const triggerIndexerSync = async ({
  chainId,
  mode = "all",
}: {
  chainId?: SupportedChainId;
  mode?: "all" | "factory" | "vaults" | "reconcile";
}) => {
  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    return false;
  }

  try {
    const response = await fetch(`${backendBaseUrl}/internal/indexer/sync`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        chainId,
        mode,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
};
