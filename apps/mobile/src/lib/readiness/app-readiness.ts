import type { AppReadinessIssue, AppReadinessState } from "@pocket-vault/shared";

import type { AppConnectionState } from "../../types";
import { envDiagnostics, hasApiBaseUrl, hasFactoryAddressForChain, hasRpcUrlForChain } from "../env/client";

const createIssue = ({
  code,
  severity,
  title,
  description,
  action,
}: AppReadinessIssue): AppReadinessIssue => ({
  code,
  severity,
  title,
  description,
  action,
});

export const createBaseReadinessState = (): AppReadinessState => ({
  status: "ready",
  wallet: "disconnected",
  network: "unknown",
  configurationStatus: envDiagnostics.configState.status,
  api: {
    status: hasApiBaseUrl() ? "healthy" : "unavailable",
    checkedAt: null,
    message: hasApiBaseUrl() ? "Pocket Vault services are available." : "Pocket Vault services are running without a backend connection.",
    checks: [],
    chains: [],
  },
  staging: {
    status: "degraded",
    message: "Staging readiness is still being checked.",
    checks: [],
  },
  issues: [],
});

export const buildAppReadinessState = ({
  apiHealth,
  connectionState,
  staging,
}: {
  apiHealth: AppReadinessState["api"] | null;
  connectionState: AppConnectionState;
  staging?: AppReadinessState["staging"] | null;
}): AppReadinessState => {
  const state = createBaseReadinessState();
  const issues: AppReadinessIssue[] = [];
  const chainId = connectionState.session?.chain?.id ?? 84532;

  if (connectionState.status === "walletUnavailable") {
    issues.push(
      createIssue({
        code: "wallet_unavailable",
        severity: "blocking",
        title: "Wallet setup is incomplete",
        description: "Wallet connectivity needs runtime configuration before Pocket Vault can accept wallet actions.",
        action: "review_status",
      }),
    );
    state.wallet = "unavailable";
  } else if (connectionState.status === "connecting") {
    issues.push(
      createIssue({
        code: "wallet_connecting",
        severity: "info",
        title: "Wallet is connecting",
        description: "Finish the wallet prompt to continue.",
        action: "wait",
      }),
    );
    state.wallet = "connecting";
  } else if (connectionState.status === "disconnected") {
    issues.push(
      createIssue({
        code: "wallet_disconnected",
        severity: "warning",
        title: "Wallet is disconnected",
        description: "Connect a wallet to create vaults, deposit, and withdraw.",
        action: "connect_wallet",
      }),
    );
    state.wallet = "disconnected";
  } else {
    state.wallet = "ready";
  }

  if (connectionState.status === "unsupportedNetwork") {
    issues.push(
      createIssue({
        code: "unsupported_network",
        severity: "blocking",
        title: "Unsupported network",
        description: "Switch to Base or Base Sepolia to continue.",
        action: "switch_network",
      }),
    );
    state.network = "unsupported";
  } else if (connectionState.status === "ready") {
    state.network = "supported";
  }

  if (!hasRpcUrlForChain(chainId)) {
    issues.push(
      createIssue({
        code: "missing_rpc",
        severity: "blocking",
        title: "This app is not fully configured right now",
        description: "Chain services for the active network are still being prepared.",
        action: "review_status",
      }),
    );
  }

  if (!hasFactoryAddressForChain(chainId)) {
    issues.push(
      createIssue({
        code: "missing_factory_address",
        severity: "warning",
        title: "Some vault actions are still being prepared",
        description: "Vault reads can continue, but the full write path is not ready for this network yet.",
        action: "review_status",
      }),
    );
  }

  if (envDiagnostics.validationErrors.length > 0) {
    issues.push(
      createIssue({
        code: "invalid_configuration",
        severity: "blocking",
        title: "This app is not fully configured right now",
        description: envDiagnostics.releaseReadiness.message,
        action: "review_status",
      }),
    );
    state.configurationStatus = "invalid";
  }

  if (apiHealth) {
    state.api = apiHealth;

    if (apiHealth.status === "unavailable") {
      issues.push(
        createIssue({
          code: "backend_unavailable",
          severity: "warning",
          title: "Backend sync is unavailable",
          description: apiHealth.message ?? "The app can continue with chain truth, but activity and vault details may take longer to refresh.",
          action: "retry",
        }),
      );
    } else if (apiHealth.status === "degraded") {
      issues.push(
        createIssue({
          code: "backend_degraded",
          severity: "warning",
          title: "Backend sync is catching up",
          description: apiHealth.message ?? "Some vault details may still be syncing.",
          action: "wait",
        }),
      );
    }
  }

  if (staging) {
    state.staging = staging;
  }

  state.issues = issues;
  state.status = issues.some((issue) => issue.severity === "blocking")
    ? "blocked"
    : issues.some((issue) => issue.severity === "warning")
      ? "degraded"
      : "ready";

  return state;
};
