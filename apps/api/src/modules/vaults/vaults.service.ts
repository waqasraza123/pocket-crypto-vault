import type { SyncFreshnessSnapshot, SupportedChainId } from "@goal-vault/shared";
import type { Address } from "viem";

import type { IndexerContext } from "../indexer/context";
import { saveVaultMetadata } from "../indexer/reconciliation.service";
import { getChainSyncStatuses } from "../indexer/sync-state.service";

const buildFreshnessSnapshot = (context: IndexerContext, chainId: SupportedChainId): SyncFreshnessSnapshot => {
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

export const getVaultsByOwner = ({
  context,
  chainId,
  ownerWallet,
}: {
  context: IndexerContext;
  chainId: SupportedChainId;
  ownerWallet: Address;
}) => {
  const vaults = context.store
    .listVaults()
    .filter(
      (vault) => vault.chainId === chainId && vault.ownerWallet?.toLowerCase() === ownerWallet.toLowerCase(),
    )
    .sort((left, right) => {
      const leftDate = left.lastActivityAt ?? left.createdAt ?? "";
      const rightDate = right.lastActivityAt ?? right.createdAt ?? "";
      return rightDate.localeCompare(leftDate);
    });

  return {
    items: vaults.map((vault) => ({
      vault,
      events: context.store
        .listEvents()
        .filter((event) => event.chainId === chainId && event.vaultAddress.toLowerCase() === vault.contractAddress.toLowerCase()),
      freshness: buildFreshnessSnapshot(context, chainId),
    })),
  };
};

export const getVaultDetailByAddress = ({
  context,
  chainId,
  vaultAddress,
}: {
  context: IndexerContext;
  chainId: SupportedChainId;
  vaultAddress: Address;
}) => {
  const vault = context.store.getVault(chainId, vaultAddress);

  if (!vault) {
    return null;
  }

  return {
    vault,
    events: context.store
      .listEvents()
      .filter((event) => event.chainId === chainId && event.vaultAddress.toLowerCase() === vaultAddress.toLowerCase())
      .sort((left, right) => {
        if (left.blockNumber === right.blockNumber) {
          return right.logIndex - left.logIndex;
        }

        return right.blockNumber - left.blockNumber;
      }),
    freshness: buildFreshnessSnapshot(context, chainId),
  };
};

export { saveVaultMetadata };
