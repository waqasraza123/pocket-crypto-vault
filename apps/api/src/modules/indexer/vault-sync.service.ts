import type { Address } from "viem";

import type { SupportedChainId } from "@goal-vault/shared";

import { readGoalVaultSummaryForIndexer } from "../../lib/contracts";
import type { IndexerContext } from "./context";
import { normalizeVaultDepositLogs, normalizeVaultWithdrawalLogs } from "./event-normalizer";
import type { PersistedVaultEventRecord } from "./indexer-store";
import { mergeVaultRecord } from "./reconciliation.service";
import { createVaultSyncStateKey, isLogAfterCursor } from "./sync-state.service";

const sortEventRecords = (items: PersistedVaultEventRecord[]): PersistedVaultEventRecord[] =>
  [...items].sort((left, right) => {
    if (left.blockNumber === right.blockNumber) {
      return left.logIndex - right.logIndex;
    }

    return left.blockNumber - right.blockNumber;
  });

const syncVaultAddress = async ({
  context,
  chainId,
  latestChainBlock,
  vaultAddress,
  ownerAddress,
}: {
  context: IndexerContext;
  chainId: SupportedChainId;
  latestChainBlock: number;
  vaultAddress: Address;
  ownerAddress: Address | null;
}) => {
  const client = context.clients[chainId];
  const previousState = context.store.getSyncState(createVaultSyncStateKey(chainId, vaultAddress));
  const stateKey = createVaultSyncStateKey(chainId, vaultAddress);
  const chainConfig = context.env.chains[chainId];

  if (!client) {
    await context.store.upsertSyncState({
      key: stateKey,
      chainId,
      streamType: "vault",
      scopeKey: vaultAddress.toLowerCase(),
      lifecycle: "error",
      latestIndexedBlock: previousState?.latestIndexedBlock ?? null,
      latestIndexedLogIndex: previousState?.latestIndexedLogIndex ?? null,
      latestChainBlock,
      lastSyncedAt: previousState?.lastSyncedAt ?? null,
      errorMessage: "RPC URL is missing for this chain.",
    });
    return;
  }

  await context.store.upsertSyncState({
    key: stateKey,
    chainId,
    streamType: "vault",
    scopeKey: vaultAddress.toLowerCase(),
    lifecycle: "running",
    latestIndexedBlock: previousState?.latestIndexedBlock ?? null,
    latestIndexedLogIndex: previousState?.latestIndexedLogIndex ?? null,
    latestChainBlock,
    lastSyncedAt: previousState?.lastSyncedAt ?? null,
    errorMessage: null,
  });

  try {
    const fromBlock = BigInt(
      Math.max(
        chainConfig.startBlock,
        previousState?.latestIndexedBlock ? Math.max(previousState.latestIndexedBlock - 1, chainConfig.startBlock) : chainConfig.startBlock,
      ),
    );
    const rawLogs = await client.getLogs({
      address: vaultAddress,
      fromBlock,
      toBlock: BigInt(latestChainBlock),
    });
    const deposits = normalizeVaultDepositLogs({
      chainId,
      vaultAddress,
      ownerAddress,
      logs: rawLogs,
    }).filter((item) =>
      isLogAfterCursor({
        blockNumber: item.blockNumber,
        logIndex: item.logIndex,
        cursor: previousState,
      }),
    );
    const withdrawals = normalizeVaultWithdrawalLogs({
      chainId,
      vaultAddress,
      ownerAddress,
      logs: rawLogs,
    }).filter((item) =>
      isLogAfterCursor({
        blockNumber: item.blockNumber,
        logIndex: item.logIndex,
        cursor: previousState,
      }),
    );
    const events = sortEventRecords([...deposits, ...withdrawals]);

    for (const event of events) {
      await context.store.upsertEvent(event);
    }

    const summary = await readGoalVaultSummaryForIndexer({
      client: client as Parameters<typeof readGoalVaultSummaryForIndexer>[0]["client"],
      vaultAddress,
    });
    if (summary) {
      const currentVault = context.store.getVault(chainId, vaultAddress);
      const nextVault = mergeVaultRecord({
        current: currentVault,
        patch: {
          chainId,
          contractAddress: vaultAddress,
          ownerWallet: summary.owner,
          assetAddress: summary.asset,
          targetAmountAtomic: summary.targetAmount.toString(),
          unlockDate: new Date(Number(summary.unlockAt) * 1000).toISOString(),
          totalDepositedAtomic: summary.totalDeposited.toString(),
          totalWithdrawnAtomic: summary.totalWithdrawn.toString(),
          currentBalanceAtomic: summary.currentBalance.toString(),
          lastActivityAt: events.at(-1)?.occurredAt ?? currentVault?.lastActivityAt ?? currentVault?.createdAt ?? null,
          lastIndexedAt: new Date().toISOString(),
          onchainFound: true,
        },
      });
      await context.store.upsertVault(nextVault);
    }

    const lastEvent = events.at(-1);
    await context.store.upsertSyncState({
      key: stateKey,
      chainId,
      streamType: "vault",
      scopeKey: vaultAddress.toLowerCase(),
      lifecycle: "idle",
      latestIndexedBlock: lastEvent?.blockNumber ?? previousState?.latestIndexedBlock ?? chainConfig.startBlock,
      latestIndexedLogIndex: lastEvent?.logIndex ?? previousState?.latestIndexedLogIndex ?? null,
      latestChainBlock,
      lastSyncedAt: new Date().toISOString(),
      errorMessage: null,
    });
  } catch (error) {
    await context.store.upsertSyncState({
      key: stateKey,
      chainId,
      streamType: "vault",
      scopeKey: vaultAddress.toLowerCase(),
      lifecycle: "error",
      latestIndexedBlock: previousState?.latestIndexedBlock ?? null,
      latestIndexedLogIndex: previousState?.latestIndexedLogIndex ?? null,
      latestChainBlock,
      lastSyncedAt: previousState?.lastSyncedAt ?? null,
      errorMessage: error instanceof Error ? error.message : "Vault sync failed.",
    });
  }
};

export const syncVaultEventsForChain = async (context: IndexerContext, chainId: SupportedChainId) => {
  const client = context.clients[chainId];

  if (!client) {
    return;
  }

  const latestChainBlock = Number(await client.getBlockNumber());
  const vaults = context.store
    .listVaults()
    .filter((vault) => vault.chainId === chainId && vault.onchainFound)
    .sort((left, right) => left.contractAddress.localeCompare(right.contractAddress));

  for (const vault of vaults) {
    await syncVaultAddress({
      context,
      chainId,
      latestChainBlock,
      vaultAddress: vault.contractAddress,
      ownerAddress: vault.ownerWallet,
    });
  }
};
