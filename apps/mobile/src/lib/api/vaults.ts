import {
  parseVaultDetailResponse,
  parseVaultListResponse,
  type VaultDetailResponse,
  type VaultListResponse,
} from "@goal-vault/api-client";
import type { MetadataSaveResult, SupportedChainId, VaultDetailEnriched, VaultMetadataPayload, VaultSummaryEnriched } from "@goal-vault/shared";
import type { Address } from "viem";

import { clientEnv } from "../env/client";
import { fetchBackendJson } from "./client";

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

export const fetchOwnerVaults = async ({
  chainId,
  ownerWallet,
}: {
  chainId: SupportedChainId;
  ownerWallet: Address;
}): Promise<{
  status: "success" | "unavailable" | "error" | "not_found";
  data: VaultSummaryEnriched[] | null;
  message: string | null;
}> => {
  const response = await fetchBackendJson<VaultListResponse>({
    path: `/vaults?chainId=${chainId}&ownerWallet=${ownerWallet}`,
    fallbackMessage: "Vault list is not available right now.",
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
    data: parseVaultListResponse(response.data).items,
    message: null,
  };
};

export const fetchVaultDetail = async ({
  chainId,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
}): Promise<{
  status: "success" | "unavailable" | "error" | "not_found";
  data: VaultDetailEnriched | null;
  message: string | null;
}> => {
  const response = await fetchBackendJson<VaultDetailResponse>({
    path: `/vaults/${vaultAddress}?chainId=${chainId}`,
    fallbackMessage: "Vault detail is not available right now.",
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
    data: parseVaultDetailResponse(response.data).item,
    message: null,
  };
};
