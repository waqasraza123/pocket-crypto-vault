import type { Address } from "viem";

import type { SupportedChainId } from "@goal-vault/shared";

import { readGoalVaultSummaryForIndexer } from "../../lib/contracts";
import { classifyObservedError } from "../../lib/observability/event-classification";
import { logObservabilitySignal } from "../../lib/observability/logger";
import type { IndexerContext } from "./context";
import {
  getRuleStatePatchFromSummary,
  normalizeVaultDepositLogs,
  normalizeVaultUnlockLifecycleLogs,
  normalizeVaultWithdrawalLogs,
} from "./event-normalizer";
import type { PersistedVaultEventRecord } from "../persistence/ports";
import { mergeVaultRecord } from "./reconciliation.service";
import { createVaultSyncStateKey, isLogAfterCursor } from "./sync-state.service";

const sortEventRecords = (items: PersistedVaultEventRecord[]): PersistedVaultEventRecord[] =>
  [...items].sort((left, right) => {
    if (left.blockNumber === right.blockNumber) {
      return left.logIndex - right.logIndex;
    }

    return left.blockNumber - right.blockNumber;
  });

export const syncVaultAddressForChain = async ({
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
    logObservabilitySignal(context.logger, {
      domain: "indexer",
      action: "vault_sync",
      status: "failed",
      message: "Vault sync is blocked by missing RPC configuration.",
      chainId,
      vaultAddress,
      errorClass: "config_missing",
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
    const unlockLifecycleEvents = normalizeVaultUnlockLifecycleLogs({
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
    const events = sortEventRecords([...deposits, ...withdrawals, ...unlockLifecycleEvents]);

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
          totalDepositedAtomic: summary.totalDeposited.toString(),
          totalWithdrawnAtomic: summary.totalWithdrawn.toString(),
          currentBalanceAtomic: summary.currentBalance.toString(),
          lastActivityAt: events.at(-1)?.occurredAt ?? currentVault?.lastActivityAt ?? currentVault?.createdAt ?? null,
          lastIndexedAt: new Date().toISOString(),
          onchainFound: true,
          ...getRuleStatePatchFromSummary({
            summary: {
              ruleType: summary.ruleType,
              unlockAt: summary.unlockAt,
              cooldownDuration: summary.cooldownDuration,
              guardian: summary.guardian,
              unlockRequestedAt: summary.unlockRequestedAt,
              guardianDecision: summary.guardianDecision,
              guardianDecisionAt: summary.guardianDecisionAt,
              unlockEligibleAt: summary.unlockEligibleAt,
            },
          }),
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
    logObservabilitySignal(context.logger, {
      domain: "indexer",
      action: "vault_sync",
      status: "succeeded",
      message: "Vault sync completed.",
      chainId,
      vaultAddress,
      count: events.length,
      metadata: {
        latestChainBlock,
      },
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
    logObservabilitySignal(context.logger, {
      domain: "indexer",
      action: "vault_sync",
      status: "failed",
      message: "Vault sync failed.",
      chainId,
      vaultAddress,
      errorClass: classifyObservedError(error),
      metadata: {
        latestChainBlock,
      },
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

  logObservabilitySignal(context.logger, {
    domain: "indexer",
    action: "vault_sync_batch",
    status: "started",
    message: "Vault sync batch started.",
    chainId,
    count: vaults.length,
  });

  for (const vault of vaults) {
    await syncVaultAddressForChain({
      context,
      chainId,
      latestChainBlock,
      vaultAddress: vault.contractAddress,
      ownerAddress: vault.ownerWallet,
    });
  }

  logObservabilitySignal(context.logger, {
    domain: "indexer",
    action: "vault_sync_batch",
    status: "succeeded",
    message: "Vault sync batch completed.",
    chainId,
    count: vaults.length,
  });
};
