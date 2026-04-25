import type { Address, Hash } from "viem";

import type { SupportedChainId } from "./chain";
import type { UserFacingRecoveryAction } from "./app-readiness";
import type { VaultAccentTheme, VaultAddress, VaultRuleType } from "./vault";

export type TransactionRecoveryKind = "create_vault" | "deposit" | "withdraw" | "unlock";
export type TransactionRecoveryLifecycle = "submitted" | "confirming" | "confirmed" | "syncing" | "failed" | "completed";
export type TransactionRecoverySyncStatus = "idle" | "pending" | "synced" | "failed";

export interface TransactionRecoveryMetadata {
  displayName: string | null;
  category: string | null;
  note: string | null;
  accentTheme: VaultAccentTheme | null;
  accentTone: string | null;
  targetAmount: string | null;
  ruleType: VaultRuleType | null;
  unlockDate: string | null;
  cooldownDurationSeconds: number | null;
  guardianAddress: Address | null;
}

export interface TransactionRecoveryRecord {
  id: string;
  kind: TransactionRecoveryKind;
  chainId: SupportedChainId;
  ownerAddress: Address;
  vaultAddress: VaultAddress | null;
  txHash: Hash;
  amountAtomic: string | null;
  status: TransactionRecoveryLifecycle;
  syncStatus: TransactionRecoverySyncStatus;
  title: string;
  description: string;
  action: UserFacingRecoveryAction | null;
  didConfirmOnchain: boolean;
  message: string | null;
  metadata: TransactionRecoveryMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRecoveryState {
  status: "idle" | "recovering" | "action_required" | "completed";
  items: TransactionRecoveryRecord[];
}
