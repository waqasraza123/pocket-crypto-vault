import { parseEventLogs } from "viem";

import type { SupportedChainId } from "@goal-vault/shared";

import { goalVaultFactoryAbi } from "../../lib/contracts";
import type { IndexerContext } from "./context";
import { normalizeVaultCreatedLogs } from "./event-normalizer";
import { createFactorySyncStateKey, isLogAfterCursor } from "./sync-state.service";

export const syncFactoryEventsForChain = async (context: IndexerContext, chainId: SupportedChainId) => {
  const client = context.clients[chainId];
  const chainConfig = context.env.chains[chainId];
  const stateKey = createFactorySyncStateKey(chainId);
  const previousState = context.store.getSyncState(stateKey);

  if (!client || !chainConfig.factoryAddress) {
    await context.store.upsertSyncState({
      key: stateKey,
      chainId,
      streamType: "factory",
      scopeKey: "factory",
      lifecycle: "error",
      latestIndexedBlock: previousState?.latestIndexedBlock ?? null,
      latestIndexedLogIndex: previousState?.latestIndexedLogIndex ?? null,
      latestChainBlock: previousState?.latestChainBlock ?? null,
      lastSyncedAt: previousState?.lastSyncedAt ?? null,
      errorMessage: "RPC URL or factory address is missing for this chain.",
    });
    return;
  }

  const latestChainBlock = Number(await client.getBlockNumber());
  await context.store.upsertSyncState({
    key: stateKey,
    chainId,
    streamType: "factory",
    scopeKey: "factory",
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
      address: chainConfig.factoryAddress,
      fromBlock,
      toBlock: BigInt(latestChainBlock),
    });
    const parsedLogs = parseEventLogs({
      abi: goalVaultFactoryAbi,
      logs: rawLogs,
      eventName: "VaultCreated",
      strict: false,
    }).filter(
      (log) =>
        isLogAfterCursor({
          blockNumber: Number(log.blockNumber ?? 0n),
          logIndex: log.logIndex ?? 0,
          cursor: previousState,
        }),
    );
    const currentVaults = new Map(
      context.store
        .listVaults()
        .filter((vault) => vault.chainId === chainId)
        .map((vault) => [vault.contractAddress.toLowerCase(), vault] as const),
    );
    const normalized = normalizeVaultCreatedLogs({
      chainId,
      logs: parsedLogs,
      currentVaults,
    });

    for (const item of normalized) {
      await context.store.upsertEvent(item.event);
      await context.store.upsertVault(item.vault);
    }

    const lastLog = parsedLogs.at(-1);
    await context.store.upsertSyncState({
      key: stateKey,
      chainId,
      streamType: "factory",
      scopeKey: "factory",
      lifecycle: "idle",
      latestIndexedBlock: lastLog ? Number(lastLog.blockNumber ?? 0n) : previousState?.latestIndexedBlock ?? chainConfig.startBlock,
      latestIndexedLogIndex: lastLog?.logIndex ?? previousState?.latestIndexedLogIndex ?? null,
      latestChainBlock,
      lastSyncedAt: new Date().toISOString(),
      errorMessage: null,
    });
  } catch (error) {
    await context.store.upsertSyncState({
      key: stateKey,
      chainId,
      streamType: "factory",
      scopeKey: "factory",
      lifecycle: "error",
      latestIndexedBlock: previousState?.latestIndexedBlock ?? null,
      latestIndexedLogIndex: previousState?.latestIndexedLogIndex ?? null,
      latestChainBlock,
      lastSyncedAt: previousState?.lastSyncedAt ?? null,
      errorMessage: error instanceof Error ? error.message : "Factory sync failed.",
    });
  }
};
