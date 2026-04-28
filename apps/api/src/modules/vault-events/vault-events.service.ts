import type { SupportedChainId, SyncFreshnessSnapshot } from "@pocket-vault/shared";
import type { Address } from "viem";

import type { IndexerContext } from "../indexer/context";
import { getChainFreshnessSnapshot } from "../indexer/freshness";

export const getVaultActivity = async ({
  context,
  chainId,
  vaultAddress,
}: {
  context: IndexerContext;
  chainId: SupportedChainId;
  vaultAddress: Address;
}) => {
  const storedEvents = await context.store.listEvents();
  const items = storedEvents
    .filter((event) => event.chainId === chainId && event.vaultAddress.toLowerCase() === vaultAddress.toLowerCase())
    .sort((left, right) => {
      if (left.blockNumber === right.blockNumber) {
        return right.logIndex - left.logIndex;
      }

      return right.blockNumber - left.blockNumber;
    });

  return {
    items,
    freshness: await getChainFreshnessSnapshot(context, chainId),
  };
};

export const getOwnerActivity = async ({
  context,
  chainId,
  ownerWallet,
}: {
  context: IndexerContext;
  chainId?: SupportedChainId;
  ownerWallet?: Address;
}) => {
  const [storedVaults, storedEvents] = await Promise.all([context.store.listVaults(), context.store.listEvents()]);
  const vaultsByKey = new Map(
    storedVaults.map((vault) => [`${vault.chainId}:${vault.contractAddress.toLowerCase()}`, vault] as const),
  );
  const items = storedEvents
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
      ? await getChainFreshnessSnapshot(context, chainId)
      : ({
          freshness: "unavailable",
          lastSyncedAt: null,
          latestIndexedBlock: null,
          latestChainBlock: null,
          lagBlocks: null,
        } satisfies SyncFreshnessSnapshot),
  };
};
