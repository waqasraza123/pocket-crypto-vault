import type { ErrorClass } from "@pocket-vault/shared";

export const classifyObservedError = (error: unknown): ErrorClass => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("user rejected") || message.includes("user denied")) {
    return "wallet_rejected";
  }

  if (message.includes("unsupported")) {
    return "unsupported_network";
  }

  if (message.includes("timeout")) {
    return "timeout";
  }

  if (message.includes("network")) {
    return "network_error";
  }

  if (message.includes("metadata")) {
    return "metadata_sync_delayed";
  }

  if (message.includes("config") || message.includes("missing")) {
    return "config_missing";
  }

  if (message.includes("api")) {
    return "api_unavailable";
  }

  return "unknown";
};
