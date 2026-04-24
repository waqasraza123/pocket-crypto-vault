export type { HealthStatus, VaultActivityItem, VaultDetailApiModel, VaultSummaryApiModel } from "@goal-vault/shared";
export type {
  ActivityFeedResponse,
  ApiVaultActivityItem,
  ApiVaultDetailItem,
  ApiVaultSummaryItem,
  HealthResponse,
  VaultActivityResponse,
  VaultDetailResponse,
  VaultListResponse,
  VaultMetadataSaveResponse,
} from "@goal-vault/api-client";

export type ApiReadStatus = "success" | "unavailable" | "error" | "not_found";
