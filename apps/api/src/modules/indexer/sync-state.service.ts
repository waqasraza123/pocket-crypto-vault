import type { ChainSyncStatus, SyncFreshnessState, SupportedChainId } from "@goal-vault/shared";
import type { Address } from "viem";

import type { IndexerContext } from "./context";
import type { PersistedSyncStateRecord } from "../persistence/ports";

export const createFactorySyncStateKey = (chainId: SupportedChainId) => `factory:${chainId}`;

export const createVaultSyncStateKey = (chainId: SupportedChainId, vaultAddress: Address) =>
  `vault:${chainId}:${vaultAddress.toLowerCase()}`;

export const isLogAfterCursor = ({
  blockNumber,
  logIndex,
  cursor,
}: {
  blockNumber: number;
  logIndex: number;
  cursor: Pick<PersistedSyncStateRecord, "latestIndexedBlock" | "latestIndexedLogIndex"> | null;
}) => {
  if (!cursor?.latestIndexedBlock) {
    return true;
  }

  if (blockNumber > cursor.latestIndexedBlock) {
    return true;
  }

  if (blockNumber < cursor.latestIndexedBlock) {
    return false;
  }

  return logIndex > (cursor.latestIndexedLogIndex ?? -1);
};

export const getSyncFreshness = ({
  latestChainBlock,
  latestIndexedBlock,
}: {
  latestChainBlock: number | null;
  latestIndexedBlock: number | null;
}): SyncFreshnessState => {
  if (latestChainBlock === null || latestIndexedBlock === null) {
    return "unavailable";
  }

  const lagBlocks = latestChainBlock - latestIndexedBlock;

  if (lagBlocks <= 2) {
    return "current";
  }

  if (lagBlocks <= 24) {
    return "syncing";
  }

  return "lagging";
};

export const serializeSyncState = (state: PersistedSyncStateRecord): ChainSyncStatus => ({
  key: state.key,
  chainId: state.chainId,
  streamType: state.streamType,
  scopeKey: state.scopeKey,
  lifecycle: state.lifecycle,
  freshness: getSyncFreshness({
    latestChainBlock: state.latestChainBlock,
    latestIndexedBlock: state.latestIndexedBlock,
  }),
  latestIndexedBlock: state.latestIndexedBlock,
  latestIndexedLogIndex: state.latestIndexedLogIndex,
  latestChainBlock: state.latestChainBlock,
  lagBlocks:
    state.latestChainBlock === null || state.latestIndexedBlock === null
      ? null
      : Math.max(state.latestChainBlock - state.latestIndexedBlock, 0),
  lastSyncedAt: state.lastSyncedAt,
  errorMessage: state.errorMessage,
});

export const getChainSyncStatuses = (context: IndexerContext, chainId?: SupportedChainId) =>
  context.store
    .listSyncStates()
    .filter((state) => (chainId ? state.chainId === chainId : true))
    .map(serializeSyncState)
    .sort((left, right) => left.key.localeCompare(right.key));
