import type { ErrorClass } from "@pocket-vault/shared";

const hasCode = (error: unknown, code: string) =>
  typeof error === "object" && error !== null && "code" in error && String((error as { code?: string | number }).code) === code;

export const classifyAnalyticsError = (error: unknown): ErrorClass => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (hasCode(error, "4001") || message.includes("user rejected") || message.includes("user denied")) {
    return "wallet_rejected";
  }

  if (message.includes("unsupported")) {
    return "unsupported_network";
  }

  if (message.includes("timeout") || message.includes("too long")) {
    return "timeout";
  }

  if (message.includes("network")) {
    return "network_error";
  }

  if (message.includes("metadata")) {
    return "metadata_sync_delayed";
  }

  if (message.includes("provider")) {
    return "wallet_unavailable";
  }

  if (message.includes("config")) {
    return "config_missing";
  }

  return "unknown";
};
