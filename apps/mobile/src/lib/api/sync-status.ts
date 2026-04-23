import type { SupportedChainId } from "@goal-vault/shared";

import { clientEnv } from "../env/client";

export const triggerIndexerSync = async ({
  chainId,
  mode = "all",
}: {
  chainId?: SupportedChainId;
  mode?: "all" | "factory" | "vaults" | "reconcile";
}) => {
  if (!clientEnv.apiBaseUrl) {
    return false;
  }

  try {
    const response = await fetch(`${clientEnv.apiBaseUrl}/internal/indexer/sync`, {
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
