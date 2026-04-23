import type { Address } from "viem";
import { isAddress } from "viem";
import { z } from "zod";

import type { SupportedChainId } from "@goal-vault/shared";

const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalAddressSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal("").transform(() => undefined))
  .refine((value) => !value || isAddress(value), "Expected a valid EVM address.");

const runtimeEnvSchema = z.object({
  EXPO_PUBLIC_REOWN_PROJECT_ID: z.string().trim().optional(),
  EXPO_PUBLIC_WALLETCONNECT_METADATA_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_RPC_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_FACTORY_ADDRESS: optionalAddressSchema,
  EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS: optionalAddressSchema,
  EXPO_PUBLIC_API_BASE_URL: optionalUrlSchema,
});

export interface AppRuntimeEnv {
  reownProjectId: string | null;
  walletMetadataUrl: string;
  rpcUrls: Record<SupportedChainId, string | null>;
  factoryAddresses: Record<SupportedChainId, Address | null>;
  apiBaseUrl: string | null;
  validationErrors: string[];
}

export const readAppRuntimeEnv = (
  source: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): AppRuntimeEnv => {
  const parsed = runtimeEnvSchema.safeParse(source);

  if (!parsed.success) {
    return {
      reownProjectId: null,
      walletMetadataUrl: "https://github.com/waqasraza123/goal-vault-usdc",
      rpcUrls: {
        8453: null,
        84532: null,
      },
      factoryAddresses: {
        8453: null,
        84532: null,
      },
      apiBaseUrl: null,
      validationErrors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return {
    reownProjectId: parsed.data.EXPO_PUBLIC_REOWN_PROJECT_ID?.trim() || null,
    walletMetadataUrl:
      parsed.data.EXPO_PUBLIC_WALLETCONNECT_METADATA_URL || "https://github.com/waqasraza123/goal-vault-usdc",
    rpcUrls: {
      8453: parsed.data.EXPO_PUBLIC_BASE_RPC_URL || null,
      84532: parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL || null,
    },
    factoryAddresses: {
      8453: (parsed.data.EXPO_PUBLIC_BASE_FACTORY_ADDRESS as Address | undefined) || null,
      84532: (parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS as Address | undefined) || null,
    },
    apiBaseUrl: parsed.data.EXPO_PUBLIC_API_BASE_URL || null,
    validationErrors: [],
  };
};

export const appRuntimeEnv = readAppRuntimeEnv();
