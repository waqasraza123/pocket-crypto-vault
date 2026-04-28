import type { SupportedChainId } from "@pocket-vault/shared";

import { classifyObservedError } from "../../lib/observability/event-classification";
import { logObservabilitySignal } from "../../lib/observability/logger";
import type { IndexerContext } from "./context";
import { normalizeVaultCreatedLogs } from "./event-normalizer";
import { createFactorySyncStateKey } from "./sync-state.service";

export const syncFactoryEventsForChain = async (context: IndexerContext, chainId: SupportedChainId) => {
  const client = context.clients[chainId];
  const chainConfig = context.env.chains[chainId];
  const stateKey = createFactorySyncStateKey(chainId);
  const previousState = await context.store.getSyncState(stateKey);

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
    logObservabilitySignal(context.logger, {
      domain: "indexer",
      action: "factory_sync",
      status: "failed",
      message: "Factory sync is blocked by missing chain configuration.",
      chainId,
      errorClass: "config_missing",
    });
    return;
  }

  logObservabilitySignal(context.logger, {
    domain: "indexer",
    action: "factory_sync",
    status: "started",
    message: "Factory sync started.",
    chainId,
  });

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
    const fromBlock = BigInt(chainConfig.startBlock);
    const rawLogs = await client.getLogs({
      address: chainConfig.factoryAddress,
      fromBlock,
      toBlock: BigInt(latestChainBlock),
    });
    const currentVaults = new Map(
      (await context.store.listVaults())
        .filter((vault) => vault.chainId === chainId)
        .map((vault) => [vault.contractAddress.toLowerCase(), vault] as const),
    );
    const normalized = normalizeVaultCreatedLogs({
      chainId,
      logs: rawLogs,
      currentVaults,
    });

    for (const item of normalized) {
      await context.store.upsertEvent(item.event);
      await context.store.upsertVault(item.vault);
      currentVaults.set(item.vault.contractAddress.toLowerCase(), item.vault);
    }

    const lastLog = normalized.at(-1)?.event ?? null;
    await context.store.upsertSyncState({
      key: stateKey,
      chainId,
      streamType: "factory",
      scopeKey: "factory",
      lifecycle: "idle",
      latestIndexedBlock: lastLog?.blockNumber ?? previousState?.latestIndexedBlock ?? chainConfig.startBlock,
      latestIndexedLogIndex: lastLog?.logIndex ?? previousState?.latestIndexedLogIndex ?? null,
      latestChainBlock,
      lastSyncedAt: new Date().toISOString(),
      errorMessage: null,
    });
    logObservabilitySignal(context.logger, {
      domain: "indexer",
      action: "factory_sync",
      status: "succeeded",
      message: "Factory sync completed.",
      chainId,
      count: normalized.length,
      metadata: {
        latestChainBlock,
      },
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
    logObservabilitySignal(context.logger, {
      domain: "indexer",
      action: "factory_sync",
      status: "failed",
      message: "Factory sync failed.",
      chainId,
      errorClass: classifyObservedError(error),
      metadata: {
        latestChainBlock,
      },
    });
  }
};
