import type { SyncFreshnessSnapshot, SupportedChainId } from "@goal-vault/shared";

import type { IndexerContext } from "./context";
import { getChainSyncStatuses } from "./sync-state.service";

export const getChainFreshnessSnapshot = (
  context: IndexerContext,
  chainId: SupportedChainId,
): SyncFreshnessSnapshot => {
  const statuses = getChainSyncStatuses(context, chainId);
  const latest = statuses.sort((left, right) => (left.lastSyncedAt ?? "").localeCompare(right.lastSyncedAt ?? "")).at(-1);

  return {
    freshness: latest?.freshness ?? "unavailable",
    lastSyncedAt: latest?.lastSyncedAt ?? null,
    latestIndexedBlock: latest?.latestIndexedBlock ?? null,
    latestChainBlock: latest?.latestChainBlock ?? null,
    lagBlocks: latest?.lagBlocks ?? null,
  };
};
