import type { Address, Hash } from "viem";

import type { SupportedChainId } from "./chain";
import type { VaultAddress, VaultMetadataStatus } from "./vault";

export type NormalizedVaultEventType =
  | "vault_created"
  | "deposit_confirmed"
  | "withdrawal_confirmed"
  | "unlock_requested"
  | "unlock_canceled"
  | "guardian_approved"
  | "guardian_rejected";

export interface NormalizedVaultEvent {
  id: string;
  chainId: SupportedChainId;
  txHash: Hash;
  blockNumber: number;
  logIndex: number;
  vaultAddress: VaultAddress;
  ownerAddress: Address | null;
  actorAddress: Address | null;
  eventType: NormalizedVaultEventType;
  amountAtomic: bigint | null;
  occurredAt: string;
  indexedAt: string;
}

export interface VaultActivityItem extends NormalizedVaultEvent {
  displayName: string | null;
  metadataStatus: VaultMetadataStatus;
}

export interface ActivityFeedResult {
  items: VaultActivityItem[];
  hasMore: boolean;
}
