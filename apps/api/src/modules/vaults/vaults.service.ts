import type { SupportedChainId } from "@pocket-vault/shared";
import type { Address } from "viem";

import type { IndexerContext } from "../indexer/context";
import { getChainFreshnessSnapshot } from "../indexer/freshness";
import { saveVaultMetadata } from "../indexer/reconciliation.service";

export const getVaultsByOwner = async ({
  context,
  chainId,
  ownerWallet,
}: {
  context: IndexerContext;
  chainId: SupportedChainId;
  ownerWallet: Address;
}) => {
  const [storedVaults, storedEvents] = await Promise.all([context.store.listVaults(), context.store.listEvents()]);
  const freshness = await getChainFreshnessSnapshot(context, chainId);
  const vaults = storedVaults
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
      events: storedEvents
        .filter((event) => event.chainId === chainId && event.vaultAddress.toLowerCase() === vault.contractAddress.toLowerCase()),
      freshness,
    })),
  };
};

export const getVaultDetailByAddress = async ({
  context,
  chainId,
  vaultAddress,
}: {
  context: IndexerContext;
  chainId: SupportedChainId;
  vaultAddress: Address;
}) => {
  const vault = await context.store.getVault(chainId, vaultAddress);

  if (!vault) {
    return null;
  }

  const storedEvents = await context.store.listEvents();
  const freshness = await getChainFreshnessSnapshot(context, chainId);

  return {
    vault,
    events: storedEvents
      .filter((event) => event.chainId === chainId && event.vaultAddress.toLowerCase() === vaultAddress.toLowerCase())
      .sort((left, right) => {
        if (left.blockNumber === right.blockNumber) {
          return right.logIndex - left.logIndex;
        }

        return right.blockNumber - left.blockNumber;
      }),
    freshness,
  };
};

export { saveVaultMetadata };
