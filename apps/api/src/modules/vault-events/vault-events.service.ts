import type { SupportedChainId, SyncFreshnessSnapshot } from "@goal-vault/shared";
import type { Address } from "viem";

import type { IndexerContext } from "../indexer/context";
import { getChainSyncStatuses } from "../indexer/sync-state.service";

const getFreshnessSnapshot = (context: IndexerContext, chainId: SupportedChainId): SyncFreshnessSnapshot => {
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

export const getVaultActivity = ({
  context,
  chainId,
  vaultAddress,
}: {
  context: IndexerContext;
  chainId: SupportedChainId;
  vaultAddress: Address;
}) => {
  const items = context.store
    .listEvents()
    .filter((event) => event.chainId === chainId && event.vaultAddress.toLowerCase() === vaultAddress.toLowerCase())
    .sort((left, right) => {
      if (left.blockNumber === right.blockNumber) {
        return right.logIndex - left.logIndex;
      }

      return right.blockNumber - left.blockNumber;
    });

  return {
    items,
    freshness: getFreshnessSnapshot(context, chainId),
  };
};

export const getOwnerActivity = ({
  context,
  chainId,
  ownerWallet,
}: {
  context: IndexerContext;
  chainId?: SupportedChainId;
  ownerWallet?: Address;
}) => {
  const vaultsByKey = new Map(
    context.store.listVaults().map((vault) => [`${vault.chainId}:${vault.contractAddress.toLowerCase()}`, vault] as const),
  );
  const items = context.store
    .listEvents()
    .filter((event) => {
      if (chainId && event.chainId !== chainId) {
        return false;
      }

      if (!ownerWallet) {
        return true;
      }

      const vault = vaultsByKey.get(`${event.chainId}:${event.vaultAddress.toLowerCase()}`);
      return vault?.ownerWallet?.toLowerCase() === ownerWallet.toLowerCase();
    })
    .sort((left, right) => {
      if (left.blockNumber === right.blockNumber) {
        return right.logIndex - left.logIndex;
      }

      return right.blockNumber - left.blockNumber;
    });

  return {
    items,
    freshness: chainId
      ? getFreshnessSnapshot(context, chainId)
      : ({
          freshness: "unavailable",
          lastSyncedAt: null,
          latestIndexedBlock: null,
          latestChainBlock: null,
          lagBlocks: null,
        } satisfies SyncFreshnessSnapshot),
  };
};
