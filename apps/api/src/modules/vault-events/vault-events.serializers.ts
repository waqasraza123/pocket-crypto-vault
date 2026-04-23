import { formatUnits } from "viem";

import type { ApiVaultActivityItem, ActivityFeedResponse, VaultActivityResponse } from "@goal-vault/api-client";
import type { SyncFreshnessSnapshot, SupportedChainId } from "@goal-vault/shared";

import type { PersistedVaultEventRecord, PersistedVaultRecord } from "../indexer/indexer-store";

export const serializeVaultActivityItem = ({
  event,
  vault,
}: {
  event: PersistedVaultEventRecord;
  vault: PersistedVaultRecord | null;
}): ApiVaultActivityItem => ({
  id: event.id,
  chainId: event.chainId,
  txHash: event.txHash,
  blockNumber: event.blockNumber,
  logIndex: event.logIndex,
  vaultAddress: event.vaultAddress,
  ownerAddress: event.ownerAddress,
  actorAddress: event.actorAddress,
  eventType: event.eventType,
  amountAtomic: event.amountAtomic,
  occurredAt: event.occurredAt,
  indexedAt: event.indexedAt,
  displayName: vault?.displayName ?? null,
  metadataStatus: vault?.metadataStatus ?? "pending",
});

export const serializeVaultActivityResponse = ({
  chainId,
  freshness,
  items,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  freshness: SyncFreshnessSnapshot;
  items: ApiVaultActivityItem[];
  vaultAddress: `0x${string}`;
}): VaultActivityResponse => ({
  items,
  hasMore: false,
  vaultAddress,
  chainId,
  freshness,
});

export const serializeActivityFeedResponse = ({ items }: { items: ApiVaultActivityItem[] }): ActivityFeedResponse => ({
  items,
  hasMore: false,
});

export const toDisplayAmount = (amountAtomic: string | null) => (amountAtomic ? Number(formatUnits(BigInt(amountAtomic), 6)) : null);
