import type { MetadataSaveResult, VaultMetadataPayload } from "@goal-vault/shared";

import { clientEnv } from "../env/client";

const normalizePayload = (payload: VaultMetadataPayload) => ({
  contractAddress: payload.contractAddress,
  chainId: payload.chainId,
  ownerWallet: payload.ownerWallet,
  displayName: payload.displayName,
  category: payload.category || null,
  note: payload.note || null,
  accentTheme: payload.accentTheme || null,
  targetAmount: payload.targetAmount,
  unlockDate: payload.unlockDate,
});

export const saveVaultMetadata = async (payload: VaultMetadataPayload): Promise<MetadataSaveResult> => {
  if (!clientEnv.apiBaseUrl) {
    return {
      status: "saved",
      persistence: "local_cache",
      message: null,
      retryable: true,
      responseStatus: null,
    };
  }

  const response = await fetch(`${clientEnv.apiBaseUrl}/vaults`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(normalizePayload(payload)),
  });

  if (response.ok || response.status === 409) {
    return {
      status: "saved",
      persistence: "backend",
      message: null,
      retryable: false,
      responseStatus: response.status,
    };
  }

  let message = "Vault details could not be saved yet.";

  try {
    const responseBody = (await response.json()) as { message?: string };
    if (responseBody.message) {
      message = responseBody.message;
    }
  } catch {}

  return {
    status: "failed",
    persistence: "backend",
    message,
    retryable: true,
    responseStatus: response.status,
  };
};
