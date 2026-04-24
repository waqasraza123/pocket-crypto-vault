import {
  parseVaultDetailPayload,
  parseVaultDetailResponse,
  parseVaultListPayload,
  parseVaultListResponse,
  parseVaultMetadataSavePayload,
} from "@goal-vault/api-client";
import type { MetadataSaveResult, SupportedChainId, VaultDetailApiModel, VaultMetadataPayload, VaultSummaryApiModel } from "@goal-vault/shared";
import type { Address } from "viem";

import { getBackendBaseUrl } from "../env/client";
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
  ruleType: payload.ruleType,
  unlockDate: payload.unlockDate || null,
  cooldownDurationSeconds: payload.cooldownDurationSeconds ?? null,
  guardianAddress: payload.guardianAddress ?? null,
});

export const saveVaultMetadata = async (payload: VaultMetadataPayload): Promise<MetadataSaveResult> => {
  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    return {
      status: "saved",
      persistence: "local_cache",
      message: null,
      retryable: true,
      responseStatus: null,
    };
  }

  const response = await fetch(`${backendBaseUrl}/vaults`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(normalizePayload(payload)),
  }).catch(() => null);

  if (!response) {
    return {
      status: "failed",
      persistence: "backend",
      message: "Vault details are still syncing into the app.",
      retryable: true,
      responseStatus: null,
    };
  }

  if (response.ok || response.status === 409) {
    if (response.status !== 409) {
      try {
        parseVaultMetadataSavePayload(await response.json());
      } catch {}
    }
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
  data: VaultSummaryApiModel[] | null;
  message: string | null;
}> => {
  const response = await fetchBackendJson({
    path: `/vaults?chainId=${chainId}&ownerWallet=${ownerWallet}`,
    fallbackMessage: "Vault list is not available right now.",
    parse: parseVaultListPayload,
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
  data: VaultDetailApiModel | null;
  message: string | null;
}> => {
  const response = await fetchBackendJson({
    path: `/vaults/${vaultAddress}?chainId=${chainId}`,
    fallbackMessage: "Vault detail is not available right now.",
    parse: parseVaultDetailPayload,
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
