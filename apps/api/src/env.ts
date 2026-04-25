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

const optionalBooleanSchema = z
  .enum(["true", "false", "1", "0", "yes", "no"])
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
  API_PUBLIC_BASE_URL: optionalUrlSchema,
  API_DATA_DIR: z.string().trim().min(1).optional(),
  API_SYNC_INTERVAL_MS: z.coerce.number().int().min(0).optional(),
  API_ENABLE_INDEXER: optionalBooleanSchema,
  API_ENABLE_ANALYTICS: optionalBooleanSchema,
  API_INTERNAL_TOKEN: z.string().trim().min(1).optional(),
  API_SIGNED_REQUEST_MAX_AGE_SECONDS: z.coerce.number().int().positive().optional(),
  API_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
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
  environment: "development" | "staging" | "production";
  deploymentTarget: "local" | "staging" | "production";
  host: string;
  port: number;
  version: string;
  publicBaseUrl: string | null;
  dataDir: string;
  syncIntervalMs: number;
  indexerEnabled: boolean;
  analyticsEnabled: boolean;
  internalToken: string | null;
  signedRequestMaxAgeSeconds: number;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  chains: Record<SupportedChainId, ApiChainRuntimeConfig>;
  validationErrors: string[];
}

const resolveEnvironment = (source: Record<string, string | undefined>): ApiRuntimeEnv["environment"] => {
  const appEnv = source.EXPO_PUBLIC_APP_ENV || source.APP_ENV || source.NODE_ENV;

  if (appEnv === "staging") {
    return "staging";
  }

  if (appEnv === "production") {
    return "production";
  }

  return "development";
};

const resolveDeploymentTarget = (
  environment: ApiRuntimeEnv["environment"],
): ApiRuntimeEnv["deploymentTarget"] => (environment === "development" ? "local" : environment);

const parseBoolean = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  return ["true", "1", "yes"].includes(value);
};

const isLocalUrl = (value: string | null) => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
};

export const readApiRuntimeEnv = (
  source: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): ApiRuntimeEnv => {
  const parsed = runtimeEnvSchema.safeParse(source);
  const environment = resolveEnvironment(source);
  const deploymentTarget = resolveDeploymentTarget(environment);
  const validationErrors: string[] = [];

  if (source.APP_ENV && source.EXPO_PUBLIC_APP_ENV && source.APP_ENV !== source.EXPO_PUBLIC_APP_ENV) {
    validationErrors.push("APP_ENV and EXPO_PUBLIC_APP_ENV must match when both are set.");
  }

  if (!parsed.success) {
    validationErrors.push(...parsed.error.issues.map((issue) => issue.message));

    return {
      environment,
      deploymentTarget,
      host: "127.0.0.1",
      port: 3001,
      version: source.npm_package_version?.trim() || "0.1.0",
      publicBaseUrl: null,
      dataDir: path.resolve(process.cwd(), ".data"),
      syncIntervalMs: 30_000,
      indexerEnabled: true,
      analyticsEnabled: true,
      internalToken: null,
      signedRequestMaxAgeSeconds: 900,
      logLevel: "info",
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
      validationErrors,
    };
  }

  const publicBaseUrl = parsed.data.API_PUBLIC_BASE_URL || null;
  const rpcUrls = {
    8453: parsed.data.EXPO_PUBLIC_BASE_RPC_URL || null,
    84532: parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL || null,
  } satisfies Record<SupportedChainId, string | null>;
  const factoryAddresses = {
    8453: (parsed.data.EXPO_PUBLIC_BASE_FACTORY_ADDRESS as Address | undefined) || null,
    84532: (parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS as Address | undefined) || null,
  } satisfies Record<SupportedChainId, Address | null>;

  if (environment !== "development" && !publicBaseUrl) {
    validationErrors.push("API_PUBLIC_BASE_URL is required for staging and production deployment.");
  }

  if (environment !== "development" && publicBaseUrl && !publicBaseUrl.startsWith("https://")) {
    validationErrors.push("API_PUBLIC_BASE_URL must use https outside development.");
  }

  if (environment === "production" && isLocalUrl(publicBaseUrl)) {
    validationErrors.push("API_PUBLIC_BASE_URL cannot point to localhost in production.");
  }

  if (environment !== "development" && !parsed.data.API_INTERNAL_TOKEN) {
    validationErrors.push("API_INTERNAL_TOKEN is required outside development.");
  }

  return {
    environment,
    deploymentTarget,
    host: parsed.data.API_HOST || "127.0.0.1",
    port: parsed.data.API_PORT ?? 3001,
    version: source.npm_package_version?.trim() || "0.1.0",
    publicBaseUrl,
    dataDir: parsed.data.API_DATA_DIR || path.resolve(process.cwd(), ".data"),
    syncIntervalMs: parsed.data.API_SYNC_INTERVAL_MS ?? 30_000,
    indexerEnabled: parseBoolean(parsed.data.API_ENABLE_INDEXER) ?? true,
    analyticsEnabled: parseBoolean(parsed.data.API_ENABLE_ANALYTICS) ?? true,
    internalToken: parsed.data.API_INTERNAL_TOKEN ?? null,
    signedRequestMaxAgeSeconds: parsed.data.API_SIGNED_REQUEST_MAX_AGE_SECONDS ?? 900,
    logLevel: parsed.data.API_LOG_LEVEL || "info",
    chains: {
      8453: {
        chainId: 8453,
        rpcUrl: rpcUrls[8453],
        factoryAddress: factoryAddresses[8453],
        startBlock: parsed.data.API_BASE_START_BLOCK ?? 0,
      },
      84532: {
        chainId: 84532,
        rpcUrl: rpcUrls[84532],
        factoryAddress: factoryAddresses[84532],
        startBlock: parsed.data.API_BASE_SEPOLIA_START_BLOCK ?? 0,
      },
    },
    validationErrors,
  };
};
