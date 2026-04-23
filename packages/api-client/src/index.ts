import type { VaultDetail, VaultSummary } from "@goal-vault/shared";

export interface VaultListResponse {
  items: VaultSummary[];
}

export interface VaultDetailResponse {
  item: VaultDetail;
}

export const apiClientPlaceholder = {
  status: "not-configured",
} as const;
