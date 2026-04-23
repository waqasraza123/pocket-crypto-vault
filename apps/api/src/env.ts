import path from "node:path";

import type { SupportedChainId } from "@goal-vault/shared";
import type { Address } from "viem";
import { isAddress } from "viem";
import { z } from "zod";

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
  EXPO_PUBLIC_BASE_RPC_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_FACTORY_ADDRESS: optionalAddressSchema,
  EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS: optionalAddressSchema,
  API_HOST: z.string().trim().min(1).optional(),
  API_PORT: z.coerce.number().int().positive().optional(),
  API_DATA_DIR: z.string().trim().min(1).optional(),
  API_SYNC_INTERVAL_MS: z.coerce.number().int().min(0).optional(),
  API_BASE_START_BLOCK: z.coerce.number().int().min(0).optional(),
  API_BASE_SEPOLIA_START_BLOCK: z.coerce.number().int().min(0).optional(),
});

export interface ApiChainRuntimeConfig {
  chainId: SupportedChainId;
  rpcUrl: string | null;
  factoryAddress: Address | null;
  startBlock: number;
}

export interface ApiRuntimeEnv {
  host: string;
  port: number;
  dataDir: string;
  syncIntervalMs: number;
  chains: Record<SupportedChainId, ApiChainRuntimeConfig>;
  validationErrors: string[];
}

export const readApiRuntimeEnv = (
  source: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): ApiRuntimeEnv => {
  const parsed = runtimeEnvSchema.safeParse(source);

  if (!parsed.success) {
    return {
      host: "127.0.0.1",
      port: 3001,
      dataDir: path.resolve(process.cwd(), ".data"),
      syncIntervalMs: 30_000,
      chains: {
        8453: {
          chainId: 8453,
          rpcUrl: null,
          factoryAddress: null,
          startBlock: 0,
        },
        84532: {
          chainId: 84532,
          rpcUrl: null,
          factoryAddress: null,
          startBlock: 0,
        },
      },
      validationErrors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return {
    host: parsed.data.API_HOST || "127.0.0.1",
    port: parsed.data.API_PORT ?? 3001,
    dataDir: parsed.data.API_DATA_DIR || path.resolve(process.cwd(), ".data"),
    syncIntervalMs: parsed.data.API_SYNC_INTERVAL_MS ?? 30_000,
    chains: {
      8453: {
        chainId: 8453,
        rpcUrl: parsed.data.EXPO_PUBLIC_BASE_RPC_URL || null,
        factoryAddress: (parsed.data.EXPO_PUBLIC_BASE_FACTORY_ADDRESS as Address | undefined) || null,
        startBlock: parsed.data.API_BASE_START_BLOCK ?? 0,
      },
      84532: {
        chainId: 84532,
        rpcUrl: parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL || null,
        factoryAddress: (parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS as Address | undefined) || null,
        startBlock: parsed.data.API_BASE_SEPOLIA_START_BLOCK ?? 0,
      },
    },
    validationErrors: [],
  };
};
