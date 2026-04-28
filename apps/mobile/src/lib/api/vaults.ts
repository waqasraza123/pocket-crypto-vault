import {
  parseVaultDetailPayload,
  parseVaultDetailResponse,
  parseVaultListPayload,
  parseVaultListResponse,
  parseVaultMetadataSavePayload,
} from "@pocket-vault/api-client";
import type {
  MetadataSaveResult,
  SupportedChainId,
  VaultDetailApiModel,
  VaultMetadataPayload,
  VaultMetadataWriteRequest,
  VaultSummaryApiModel,
} from "@pocket-vault/shared";
import * as metadataAuthModule from "@pocket-vault/shared/src/validation/metadataAuth";
import type { Address, EIP1193Provider } from "viem";

import { signWalletMessage } from "../blockchain/wallet/sign-message";
import { getBackendBaseUrl } from "../env/client";
import { fetchBackendJson } from "./client";

const metadataAuthExports = metadataAuthModule as typeof metadataAuthModule & {
  default?: {
    buildVaultMetadataAuthorizationMessage?: typeof metadataAuthModule.buildVaultMetadataAuthorizationMessage;
  };
};
const buildVaultMetadataAuthorizationMessage =
  metadataAuthExports.buildVaultMetadataAuthorizationMessage ??
  metadataAuthExports.default?.buildVaultMetadataAuthorizationMessage;

const normalizePayload = (payload: VaultMetadataPayload) => ({
  contractAddress: payload.contractAddress,
  chainId: payload.chainId,
  ownerWallet: payload.ownerWallet,
  createdTxHash: payload.createdTxHash,
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

const buildVaultMetadataWriteRequest = async ({
  payload,
  provider,
}: {
  payload: VaultMetadataPayload;
  provider: EIP1193Provider;
}): Promise<VaultMetadataWriteRequest> => {
  const issuedAt = new Date().toISOString();
  const signature = await signWalletMessage({
    account: payload.ownerWallet,
    message: buildVaultMetadataAuthorizationMessage({
      metadata: payload,
      issuedAt,
    }),
    provider,
  });

  return {
    metadata: payload,
    auth: {
      issuedAt,
      signature,
    },
  };
};

export const saveVaultMetadata = async ({
  payload,
  provider,
}: {
  payload: VaultMetadataPayload;
  provider: EIP1193Provider | null;
}): Promise<MetadataSaveResult> => {
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

  if (!provider) {
    return {
      status: "failed",
      persistence: "backend",
      message: "Reconnect your wallet before saving vault details to Pocket Vault.",
      retryable: true,
      responseStatus: null,
    };
  }

  let requestBody: VaultMetadataWriteRequest;

  try {
    requestBody = await buildVaultMetadataWriteRequest({
      payload,
      provider,
    });
  } catch (error) {
    return {
      status: "failed",
      persistence: "backend",
      message: error instanceof Error ? error.message : "Vault details still need wallet authorization.",
      retryable: true,
      responseStatus: null,
    };
  }

  const response = await fetch(`${backendBaseUrl}/vaults`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      metadata: normalizePayload(requestBody.metadata),
      auth: requestBody.auth,
    }),
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

  if (response.ok) {
    try {
      parseVaultMetadataSavePayload(await response.json());
    } catch {}
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
