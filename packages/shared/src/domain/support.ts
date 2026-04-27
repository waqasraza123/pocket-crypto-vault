import type { Address } from "viem";

import type { SupportedChainId } from "./chain";
import type { AppEnvironment, DeploymentTarget } from "./deployment";
import type { AppConnectionStatus } from "./wallet";

export const supportRequestCategories = [
  "transaction",
  "vault_data",
  "wallet",
  "access",
  "security",
  "feedback",
  "other",
] as const;

export const supportRequestPriorities = ["normal", "urgent"] as const;

export const supportRequestStatuses = ["open", "triage", "closed"] as const;

export type SupportRequestCategory = (typeof supportRequestCategories)[number];
export type SupportRequestPriority = (typeof supportRequestPriorities)[number];
export type SupportRequestStatus = (typeof supportRequestStatuses)[number];

export interface SupportRequestContext {
  route: string | null;
  environment: AppEnvironment;
  deploymentTarget: DeploymentTarget;
  chainId?: SupportedChainId | null;
  walletStatus?: AppConnectionStatus | null;
  vaultAddress?: Address | null;
}

export interface SupportRequestInput {
  category: SupportRequestCategory;
  priority: SupportRequestPriority;
  subject: string;
  message: string;
  reporterWallet?: Address | null;
  contactEmail?: string | null;
  context: SupportRequestContext;
}

export interface SupportRequestRecord extends SupportRequestInput {
  id: string;
  status: SupportRequestStatus;
  createdAt: string;
  userAgent: string | null;
  requesterIpHash: string | null;
}

export interface SupportRequestResponse {
  id: string;
  status: SupportRequestStatus;
  receivedAt: string;
  message: string;
}

export interface SupportRequestListFilters {
  status?: SupportRequestStatus;
  category?: SupportRequestCategory;
  priority?: SupportRequestPriority;
  limit: number;
}

export interface SupportRequestListResponse {
  items: SupportRequestRecord[];
  filters: SupportRequestListFilters;
  generatedAt: string;
}

export interface SupportRequestDetailResponse {
  item: SupportRequestRecord;
}

export interface SupportRequestStatusUpdate {
  status: SupportRequestStatus;
}
