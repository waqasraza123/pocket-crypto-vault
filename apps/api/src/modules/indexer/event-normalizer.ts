import { parseEventLogs, type Address, type Log } from "viem";

import type { SupportedChainId } from "@goal-vault/shared";

import { goalVaultAbi } from "../../lib/contracts";
import type { PersistedVaultEventRecord, PersistedVaultRecord } from "./indexer-store";
import { mergeVaultRecord } from "./reconciliation.service";

const createEventId = (chainId: SupportedChainId, transactionHash: `0x${string}`, logIndex: number) =>
  `${chainId}:${transactionHash.toLowerCase()}:${logIndex}`;

const sortLogs = <T extends { blockNumber?: bigint | null; logIndex?: number | null }>(logs: readonly T[]): T[] =>
  [...logs].sort((left, right) => {
    const leftBlock = Number(left.blockNumber ?? 0n);
    const rightBlock = Number(right.blockNumber ?? 0n);

    if (leftBlock === rightBlock) {
      return (left.logIndex ?? 0) - (right.logIndex ?? 0);
    }

    return leftBlock - rightBlock;
  });

export const normalizeVaultCreatedLogs = ({
  chainId,
  logs,
  currentVaults,
}: {
  chainId: SupportedChainId;
  logs: Array<
    Log & {
      args: {
        asset?: Address;
        createdAt?: bigint;
        owner?: Address;
        targetAmount?: bigint;
        unlockAt?: bigint;
        vault?: Address;
      };
    }
  >;
  currentVaults: Map<string, PersistedVaultRecord>;
}) =>
  sortLogs(logs).flatMap((log) => {
    if (!log.transactionHash || log.logIndex === null || !log.args.vault || !log.args.owner || !log.args.asset) {
      return [];
    }

    const current = currentVaults.get(log.args.vault.toLowerCase()) ?? null;
    const occurredAt = new Date(Number(log.args.createdAt ?? 0n) * 1000).toISOString();
    const event: PersistedVaultEventRecord = {
      id: createEventId(chainId, log.transactionHash, log.logIndex ?? 0),
      chainId,
      txHash: log.transactionHash,
      blockNumber: Number(log.blockNumber ?? 0n),
      logIndex: log.logIndex ?? 0,
      vaultAddress: log.args.vault,
      ownerAddress: log.args.owner,
      actorAddress: log.args.owner,
      eventType: "vault_created",
      amountAtomic: null,
      occurredAt,
      indexedAt: new Date().toISOString(),
    };
    const vault = mergeVaultRecord({
      current,
      patch: {
        chainId,
        contractAddress: log.args.vault,
        ownerWallet: log.args.owner,
        assetAddress: log.args.asset,
        targetAmountAtomic: log.args.targetAmount?.toString() ?? null,
        unlockDate: new Date(Number(log.args.unlockAt ?? 0n) * 1000).toISOString(),
        createdAt: occurredAt,
        createdTxHash: log.transactionHash,
        lastActivityAt: occurredAt,
        lastIndexedAt: new Date().toISOString(),
        onchainFound: true,
      },
    });

    return [{ event, vault }];
  });

export const normalizeVaultDepositLogs = ({
  chainId,
  vaultAddress,
  ownerAddress,
  logs,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
  ownerAddress: Address | null;
  logs: Log[];
}) =>
  sortLogs(
    parseEventLogs({
      abi: goalVaultAbi,
      logs,
      eventName: "Deposited",
      strict: false,
    }),
  ).flatMap((log) => {
    if (!log.transactionHash || log.logIndex === null || !log.args.from) {
      return [];
    }

    return [
      {
        id: createEventId(chainId, log.transactionHash, log.logIndex ?? 0),
        chainId,
        txHash: log.transactionHash,
        blockNumber: Number(log.blockNumber ?? 0n),
        logIndex: log.logIndex ?? 0,
        vaultAddress,
        ownerAddress,
        actorAddress: log.args.from,
        eventType: "deposit_confirmed" as const,
        amountAtomic: log.args.amount?.toString() ?? null,
        occurredAt: new Date(Number(log.args.timestamp ?? 0n) * 1000).toISOString(),
        indexedAt: new Date().toISOString(),
      },
    ];
  });

export const normalizeVaultWithdrawalLogs = ({
  chainId,
  vaultAddress,
  ownerAddress,
  logs,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
  ownerAddress: Address | null;
  logs: Log[];
}) =>
  sortLogs(
    parseEventLogs({
      abi: goalVaultAbi,
      logs,
      eventName: "Withdrawn",
      strict: false,
    }),
  ).flatMap((log) => {
    if (!log.transactionHash || log.logIndex === null || !log.args.to) {
      return [];
    }

    return [
      {
        id: createEventId(chainId, log.transactionHash, log.logIndex ?? 0),
        chainId,
        txHash: log.transactionHash,
        blockNumber: Number(log.blockNumber ?? 0n),
        logIndex: log.logIndex ?? 0,
        vaultAddress,
        ownerAddress,
        actorAddress: log.args.to,
        eventType: "withdrawal_confirmed" as const,
        amountAtomic: log.args.amount?.toString() ?? null,
        occurredAt: new Date(Number(log.args.timestamp ?? 0n) * 1000).toISOString(),
        indexedAt: new Date().toISOString(),
      },
    ];
  });
