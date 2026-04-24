import type { Address } from "viem";
import { isAddress } from "viem";
import { z } from "zod";

import type {
  AppConfigState,
  AppEnvironment,
  ChainConfigState,
  ReleaseReadinessCheck,
  ReleaseReadinessState,
  SupportedChainId,
} from "@goal-vault/shared";

import { supportedChains } from "./chains";
import { getReleaseStatus, resolveAppEnvironment, resolveDeploymentTarget } from "./deployment";

const walletMetadataDefaultUrl = "https://github.com/waqasraza123/goal-vault-usdc";
const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalPositiveIntSchema = z.coerce
  .number()
  .int()
  .positive()
  .optional();

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
  APP_ENV: z.enum(["development", "staging", "production"]).optional(),
  EXPO_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]).optional(),
  EXPO_PUBLIC_APP_URL: optionalUrlSchema,
  EXPO_PUBLIC_REOWN_PROJECT_ID: z.string().trim().optional(),
  EXPO_PUBLIC_WALLETCONNECT_METADATA_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_RPC_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL: optionalUrlSchema,
  EXPO_PUBLIC_BASE_FACTORY_ADDRESS: optionalAddressSchema,
  EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS: optionalAddressSchema,
  EXPO_PUBLIC_API_BASE_URL: optionalUrlSchema,
  EXPO_PUBLIC_API_TIMEOUT_MS: optionalPositiveIntSchema,
  EXPO_PUBLIC_ANALYTICS_ENABLED: optionalBooleanSchema,
});

export interface GoalVaultDeploymentEnv {
  environment: AppEnvironment;
  deploymentTarget: "local" | "staging" | "production";
  appUrl: string | null;
  walletMetadataUrl: string;
  rpcUrls: Record<SupportedChainId, string | null>;
  factoryAddresses: Record<SupportedChainId, Address | null>;
  chainStates: ChainConfigState[];
  validationErrors: string[];
}

export interface AppRuntimeEnv {
  environment: AppEnvironment;
  deploymentTarget: "local" | "staging" | "production";
  reownProjectId: string | null;
  appUrl: string | null;
  walletMetadataUrl: string;
  rpcUrls: Record<SupportedChainId, string | null>;
  factoryAddresses: Record<SupportedChainId, Address | null>;
  apiBaseUrl: string | null;
  apiTimeoutMs: number;
  analyticsEnabled: boolean;
  analyticsMode: "disabled" | "local_log" | "backend";
  analyticsEndpoint: string | null;
  expectedLaunchChainId: SupportedChainId;
  configState: AppConfigState;
  releaseReadiness: ReleaseReadinessState;
  validationErrors: string[];
}

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

const isHttpsUrl = (value: string | null) => {
  if (!value) {
    return false;
  }

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const parseBoolean = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  return ["true", "1", "yes"].includes(value);
};

const buildChainStates = ({
  environment,
  rpcUrls,
  factoryAddresses,
}: {
  environment: AppEnvironment;
  rpcUrls: Record<SupportedChainId, string | null>;
  factoryAddresses: Record<SupportedChainId, Address | null>;
}): ChainConfigState[] =>
  ([8453, 84532] as const).map((chainId) => {
    const rpcConfigured = Boolean(rpcUrls[chainId]);
    const factoryConfigured = Boolean(factoryAddresses[chainId]);

    return {
      chainId,
      label: supportedChains[chainId].shortName,
      rpcConfigured,
      factoryConfigured,
      readsReady: rpcConfigured,
      writesReady: rpcConfigured && factoryConfigured,
      expectedForEnvironment: environment === "production" ? chainId === 8453 : chainId === 84532,
    };
  });

export const readGoalVaultDeploymentEnv = (
  source: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): GoalVaultDeploymentEnv => {
  const parsed = runtimeEnvSchema.safeParse(source);
  const parseErrors = parsed.success ? [] : parsed.error.issues.map((issue) => issue.message);
  const environment = resolveAppEnvironment({
    appEnv: source.APP_ENV ?? null,
    publicAppEnv: source.EXPO_PUBLIC_APP_ENV ?? null,
    nodeEnv: source.NODE_ENV ?? null,
  });
  const deploymentTarget = resolveDeploymentTarget(environment);
  const baseValidationErrors = [...parseErrors];

  if (source.APP_ENV && source.EXPO_PUBLIC_APP_ENV && source.APP_ENV !== source.EXPO_PUBLIC_APP_ENV) {
    baseValidationErrors.push("APP_ENV and EXPO_PUBLIC_APP_ENV must match when both are set.");
  }

  if (!parsed.success) {
    const chainStates = buildChainStates({
      environment,
      rpcUrls: {
        8453: null,
        84532: null,
      },
      factoryAddresses: {
        8453: null,
        84532: null,
      },
    });

    return {
      environment,
      deploymentTarget,
      appUrl: null,
      walletMetadataUrl: walletMetadataDefaultUrl,
      rpcUrls: {
        8453: null,
        84532: null,
      },
      factoryAddresses: {
        8453: null,
        84532: null,
      },
      chainStates,
      validationErrors: baseValidationErrors,
    };
  }

  const rpcUrls = {
    8453: parsed.data.EXPO_PUBLIC_BASE_RPC_URL || null,
    84532: parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL || null,
  } satisfies Record<SupportedChainId, string | null>;
  const factoryAddresses = {
    8453: (parsed.data.EXPO_PUBLIC_BASE_FACTORY_ADDRESS as Address | undefined) || null,
    84532: (parsed.data.EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS as Address | undefined) || null,
  } satisfies Record<SupportedChainId, Address | null>;
  const appUrl = parsed.data.EXPO_PUBLIC_APP_URL || null;
  const walletMetadataUrl = parsed.data.EXPO_PUBLIC_WALLETCONNECT_METADATA_URL || appUrl || walletMetadataDefaultUrl;

  return {
    environment,
    deploymentTarget,
    appUrl,
    walletMetadataUrl,
    rpcUrls,
    factoryAddresses,
    chainStates: buildChainStates({
      environment,
      rpcUrls,
      factoryAddresses,
    }),
    validationErrors: baseValidationErrors,
  };
};

export const readAppRuntimeEnv = (
  source: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): AppRuntimeEnv => {
  const deploymentEnv = readGoalVaultDeploymentEnv(source);
  const parsed = runtimeEnvSchema.safeParse(source);
  const validationErrors = [...deploymentEnv.validationErrors];
  const apiBaseUrl = parsed.success ? parsed.data.EXPO_PUBLIC_API_BASE_URL || null : null;
  const analyticsEnabled = parsed.success ? parseBoolean(parsed.data.EXPO_PUBLIC_ANALYTICS_ENABLED) ?? Boolean(apiBaseUrl) : false;
  const analyticsMode: AppRuntimeEnv["analyticsMode"] = !analyticsEnabled
    ? "disabled"
    : apiBaseUrl
      ? "backend"
      : deploymentEnv.environment === "development"
        ? "local_log"
        : "disabled";

  if (deploymentEnv.environment !== "development" && !deploymentEnv.appUrl) {
    validationErrors.push("EXPO_PUBLIC_APP_URL is required for staging and production packaging.");
  }

  if (deploymentEnv.environment !== "development" && !apiBaseUrl) {
    validationErrors.push("EXPO_PUBLIC_API_BASE_URL is required for staging and production.");
  }

  if (deploymentEnv.environment !== "development" && !isHttpsUrl(deploymentEnv.appUrl)) {
    validationErrors.push("EXPO_PUBLIC_APP_URL must use https outside development.");
  }

  if (deploymentEnv.environment !== "development" && !isHttpsUrl(deploymentEnv.walletMetadataUrl)) {
    validationErrors.push("EXPO_PUBLIC_WALLETCONNECT_METADATA_URL must use https outside development.");
  }

  if (deploymentEnv.environment === "production" && isLocalUrl(apiBaseUrl)) {
    validationErrors.push("EXPO_PUBLIC_API_BASE_URL cannot point to localhost in production.");
  }

  if (deploymentEnv.environment === "production" && isLocalUrl(deploymentEnv.appUrl)) {
    validationErrors.push("EXPO_PUBLIC_APP_URL cannot point to localhost in production.");
  }

  const configState: AppConfigState = {
    environment: deploymentEnv.environment,
    deploymentTarget: deploymentEnv.deploymentTarget,
    status: validationErrors.length > 0 ? "invalid" : "valid",
    issues: validationErrors,
    chainStates: deploymentEnv.chainStates,
  };

  const expectedLaunchChainId: SupportedChainId = deploymentEnv.environment === "production" ? 8453 : 84532;
  const expectedChain = deploymentEnv.chainStates.find((chain) => chain.chainId === expectedLaunchChainId) ?? deploymentEnv.chainStates[0];
  const releaseChecks: ReleaseReadinessCheck[] = [
    {
      key: "app-url",
      label: "App URL",
      status:
        deploymentEnv.environment === "development"
          ? deploymentEnv.appUrl
            ? "ready"
            : "warning"
          : deploymentEnv.appUrl
            ? isHttpsUrl(deploymentEnv.appUrl)
              ? "ready"
              : "blocked"
            : "blocked",
      message:
        deploymentEnv.appUrl
          ? `App URL is set to ${deploymentEnv.appUrl}.`
          : deploymentEnv.environment === "development"
            ? "App URL is optional during local development."
            : "Set EXPO_PUBLIC_APP_URL before staging or production packaging.",
    },
    {
      key: "api-base-url",
      label: "API base URL",
      status:
        deploymentEnv.environment === "development"
          ? apiBaseUrl
            ? "ready"
            : "warning"
          : apiBaseUrl
            ? deploymentEnv.environment === "production" && isLocalUrl(apiBaseUrl)
              ? "blocked"
              : "ready"
            : "blocked",
      message:
        apiBaseUrl
          ? `API base URL is set to ${apiBaseUrl}.`
          : deploymentEnv.environment === "development"
            ? "API base URL is optional during local development."
            : "Set EXPO_PUBLIC_API_BASE_URL before staging or production packaging.",
    },
    {
      key: "wallet-metadata",
      label: "Wallet metadata URL",
      status:
        deploymentEnv.environment === "development"
          ? "ready"
          : isHttpsUrl(deploymentEnv.walletMetadataUrl)
            ? "ready"
            : "blocked",
      message:
        deploymentEnv.environment === "development"
          ? `Wallet metadata URL defaults to ${deploymentEnv.walletMetadataUrl}.`
          : `Wallet metadata URL resolves to ${deploymentEnv.walletMetadataUrl}.`,
    },
    {
      key: "wallet-project-id",
      label: "Wallet project ID",
      status:
        deploymentEnv.environment === "development"
          ? parsed.success && parsed.data.EXPO_PUBLIC_REOWN_PROJECT_ID
            ? "ready"
            : "warning"
          : parsed.success && parsed.data.EXPO_PUBLIC_REOWN_PROJECT_ID
            ? "ready"
            : "blocked",
      message:
        parsed.success && parsed.data.EXPO_PUBLIC_REOWN_PROJECT_ID
          ? "Wallet project ID is configured."
          : deploymentEnv.environment === "development"
            ? "Wallet project ID is optional for local UI work."
            : "Set EXPO_PUBLIC_REOWN_PROJECT_ID before staging or production builds.",
    },
    {
      key: `launch-chain-${expectedLaunchChainId}`,
      label: `${expectedChain.label} launch path`,
      status:
        expectedChain.writesReady
          ? "ready"
          : expectedChain.readsReady
            ? "warning"
            : deploymentEnv.environment === "development"
              ? "warning"
              : "blocked",
      message: expectedChain.writesReady
        ? `${expectedChain.label} has RPC and factory configuration.`
        : expectedChain.readsReady
          ? `${expectedChain.label} can read chain data, but vault writes still need the factory address.`
          : `${expectedChain.label} still needs RPC and contract configuration.`,
    },
  ];
  const releaseStatus = getReleaseStatus(releaseChecks);
  const releaseReadiness: ReleaseReadinessState = {
    environment: deploymentEnv.environment,
    status: releaseStatus,
    message:
      releaseStatus === "ready"
        ? "Release packaging configuration is ready."
        : releaseStatus === "degraded"
          ? "Release packaging is usable with a few remaining setup items."
          : "Release packaging is blocked by missing or unsafe configuration.",
    checks: releaseChecks,
  };

  return {
    environment: deploymentEnv.environment,
    deploymentTarget: deploymentEnv.deploymentTarget,
    reownProjectId: parsed.success ? parsed.data.EXPO_PUBLIC_REOWN_PROJECT_ID?.trim() || null : null,
    appUrl: deploymentEnv.appUrl,
    walletMetadataUrl: deploymentEnv.walletMetadataUrl,
    rpcUrls: deploymentEnv.rpcUrls,
    factoryAddresses: deploymentEnv.factoryAddresses,
    apiBaseUrl,
    apiTimeoutMs: parsed.success ? parsed.data.EXPO_PUBLIC_API_TIMEOUT_MS ?? 8_000 : 8_000,
    analyticsEnabled,
    analyticsMode,
    analyticsEndpoint: analyticsMode === "backend" && apiBaseUrl ? `${apiBaseUrl.replace(/\/+$/, "")}/analytics/events` : null,
    expectedLaunchChainId,
    configState,
    releaseReadiness,
    validationErrors,
  };
};

export const appRuntimeEnv = readAppRuntimeEnv();
