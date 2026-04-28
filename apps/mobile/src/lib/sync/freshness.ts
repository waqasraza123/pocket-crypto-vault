import type { SyncFreshnessSnapshot, VaultDegradedState } from "@pocket-vault/shared";

export const getVaultDegradedState = ({
  freshness,
  metadataStatus,
  notFound,
  hasPartialData,
}: {
  freshness?: SyncFreshnessSnapshot | null;
  metadataStatus?: "pending" | "saved" | "failed";
  notFound?: boolean;
  hasPartialData?: boolean;
}): VaultDegradedState => {
  if (notFound) {
    return "not_found";
  }

  if (metadataStatus === "failed") {
    return "missing_metadata";
  }

  if (metadataStatus === "pending" || freshness?.freshness === "syncing" || freshness?.freshness === "lagging") {
    return "syncing";
  }

  if (hasPartialData) {
    return "partial";
  }

  if (freshness?.freshness === "unavailable") {
    return "error";
  }

  return "healthy";
};
