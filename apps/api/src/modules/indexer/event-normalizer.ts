import { parseEventLogs, type Address, type Log } from "viem";

import type { GuardianApprovalState, SupportedChainId, UnlockRequestStatus } from "@pocket-vault/shared";

import { goalVaultAbi, goalVaultFactoryAbi } from "../../lib/contracts";
import type { PersistedVaultEventRecord, PersistedVaultRecord } from "../persistence/ports";
import { mergeVaultRecord } from "./reconciliation.service";

const createEventId = (chainId: SupportedChainId, transactionHash: `0x${string}`, logIndex: number) =>
  `${chainId}:${transactionHash.toLowerCase()}:${logIndex}`;

const sortLogs = <T extends { blockNumber?: bigint | number | null; logIndex?: number | null }>(logs: readonly T[]): T[] =>
  [...logs].sort((left, right) => {
    const leftBlock = Number(left.blockNumber ?? 0);
    const rightBlock = Number(right.blockNumber ?? 0);

    if (leftBlock === rightBlock) {
      return (left.logIndex ?? 0) - (right.logIndex ?? 0);
    }

    return leftBlock - rightBlock;
  });

const parseRuleType = (value?: bigint | number) => {
  if (value === 1 || value === 1n) {
    return "cooldownUnlock" as const;
  }

  if (value === 2 || value === 2n) {
    return "guardianApproval" as const;
  }

  return "timeLock" as const;
};

const parseGuardianDecision = (value?: bigint | number) => {
  if (value === 1 || value === 1n) {
    return "pending" as const;
  }

  if (value === 2 || value === 2n) {
    return "approved" as const;
  }

  if (value === 3 || value === 3n) {
    return "rejected" as const;
  }

  return "not_requested" as const;
};

export const normalizeVaultCreatedLogs = ({
  chainId,
  logs,
  currentVaults,
}: {
  chainId: SupportedChainId;
  logs: Log[];
  currentVaults: Map<string, PersistedVaultRecord>;
}) => {
  const legacyLogs = parseEventLogs({
    abi: goalVaultFactoryAbi,
    logs,
    eventName: "VaultCreated",
    strict: false,
  });
  const nextLogs = parseEventLogs({
    abi: goalVaultFactoryAbi,
    logs,
    eventName: "VaultCreatedV2",
    strict: false,
  });
  const nextLogKeys = new Set(
    nextLogs
      .filter((log) => log.transactionHash && log.args.vault)
      .map((log) => `${log.transactionHash!.toLowerCase()}:${log.args.vault!.toLowerCase()}`),
  );

  return sortLogs([
    ...legacyLogs.filter((log) => {
      if (!log.transactionHash || !log.args.vault) {
        return true;
      }

      return !nextLogKeys.has(`${log.transactionHash.toLowerCase()}:${log.args.vault.toLowerCase()}`);
    }),
    ...nextLogs,
  ]).flatMap((log) => {
    const args = log.args as {
      asset?: Address;
      createdAt?: bigint;
      owner?: Address;
      targetAmount?: bigint;
      unlockAt?: bigint;
      vault?: Address;
      ruleType?: bigint;
      cooldownDuration?: bigint;
      guardian?: Address;
    };

    if (!log.transactionHash || log.logIndex === null || !args.vault || !args.owner || !args.asset) {
      return [];
    }

    const current = currentVaults.get(args.vault.toLowerCase()) ?? null;
    const occurredAt = new Date(Number(args.createdAt ?? 0n) * 1000).toISOString();
    const ruleType = log.eventName === "VaultCreatedV2" ? parseRuleType(args.ruleType) : "timeLock";
    const event: PersistedVaultEventRecord = {
      id: createEventId(chainId, log.transactionHash, log.logIndex ?? 0),
      chainId,
      txHash: log.transactionHash,
      blockNumber: Number(log.blockNumber ?? 0n),
      logIndex: log.logIndex ?? 0,
      vaultAddress: args.vault,
      ownerAddress: args.owner,
      actorAddress: args.owner,
      eventType: "vault_created",
      amountAtomic: null,
      occurredAt,
      indexedAt: new Date().toISOString(),
    };
    const vault = mergeVaultRecord({
      current,
      patch: {
        chainId,
        contractAddress: args.vault,
        ownerWallet: args.owner,
        assetAddress: args.asset,
        targetAmountAtomic: args.targetAmount?.toString() ?? null,
        ruleType,
        unlockDate: ruleType === "timeLock" ? new Date(Number(args.unlockAt ?? 0n) * 1000).toISOString() : null,
        cooldownDurationSeconds: ruleType === "cooldownUnlock" ? Number(args.cooldownDuration ?? 0n) : null,
        guardianAddress: ruleType === "guardianApproval" ? (args.guardian ?? null) : null,
        guardianApprovalState: ruleType === "guardianApproval" ? "not_requested" : "not_required",
        createdAt: occurredAt,
        createdTxHash: log.transactionHash,
        lastActivityAt: occurredAt,
        lastIndexedAt: new Date().toISOString(),
        onchainFound: true,
      },
    });

    return [{ event, vault }];
  });
};

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

export const normalizeVaultUnlockLifecycleLogs = ({
  chainId,
  vaultAddress,
  ownerAddress,
  logs,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
  ownerAddress: Address | null;
  logs: Log[];
}) => {
  const unlockRequested = parseEventLogs({
    abi: goalVaultAbi,
    logs,
    eventName: "UnlockRequested",
    strict: false,
  }).flatMap((log) => {
    if (!log.transactionHash || log.logIndex === null || !log.args.requestedBy) {
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
        actorAddress: log.args.requestedBy,
        eventType: "unlock_requested" as const,
        amountAtomic: null,
        occurredAt: new Date(Number(log.args.timestamp ?? 0n) * 1000).toISOString(),
        indexedAt: new Date().toISOString(),
      },
    ];
  });

  const unlockCanceled = parseEventLogs({
    abi: goalVaultAbi,
    logs,
    eventName: "UnlockCanceled",
    strict: false,
  }).flatMap((log) => {
    if (!log.transactionHash || log.logIndex === null || !log.args.canceledBy) {
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
        actorAddress: log.args.canceledBy,
        eventType: "unlock_canceled" as const,
        amountAtomic: null,
        occurredAt: new Date(Number(log.args.timestamp ?? 0n) * 1000).toISOString(),
        indexedAt: new Date().toISOString(),
      },
    ];
  });

  const guardianApproved = parseEventLogs({
    abi: goalVaultAbi,
    logs,
    eventName: "GuardianApproved",
    strict: false,
  }).flatMap((log) => {
    if (!log.transactionHash || log.logIndex === null || !log.args.guardian) {
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
        actorAddress: log.args.guardian,
        eventType: "guardian_approved" as const,
        amountAtomic: null,
        occurredAt: new Date(Number(log.args.timestamp ?? 0n) * 1000).toISOString(),
        indexedAt: new Date().toISOString(),
      },
    ];
  });

  const guardianRejected = parseEventLogs({
    abi: goalVaultAbi,
    logs,
    eventName: "GuardianRejected",
    strict: false,
  }).flatMap((log) => {
    if (!log.transactionHash || log.logIndex === null || !log.args.guardian) {
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
        actorAddress: log.args.guardian,
        eventType: "guardian_rejected" as const,
        amountAtomic: null,
        occurredAt: new Date(Number(log.args.timestamp ?? 0n) * 1000).toISOString(),
        indexedAt: new Date().toISOString(),
      },
    ];
  });

  return sortLogs([...unlockRequested, ...unlockCanceled, ...guardianApproved, ...guardianRejected]);
};

export const getRuleStatePatchFromSummary = ({
  summary,
}: {
  summary: {
    ruleType: bigint;
    unlockAt: bigint;
    cooldownDuration: bigint;
    guardian: Address | null;
    unlockRequestedAt: bigint;
    guardianDecision: bigint;
    guardianDecisionAt: bigint;
    unlockEligibleAt: bigint;
  };
}): Pick<
  PersistedVaultRecord,
  | "ruleType"
  | "unlockDate"
  | "cooldownDurationSeconds"
  | "guardianAddress"
  | "unlockRequestedAt"
  | "unlockEligibleAt"
  | "unlockRequestStatus"
  | "guardianApprovalState"
  | "guardianDecisionAt"
> => {
  const ruleType = parseRuleType(summary.ruleType);
  const guardianDecision: GuardianApprovalState = parseGuardianDecision(summary.guardianDecision);
  const unlockRequestStatus: UnlockRequestStatus =
    ruleType === "timeLock"
      ? summary.unlockAt > 0n && summary.unlockAt <= BigInt(Math.floor(Date.now() / 1000))
        ? "approved"
        : "not_requested"
      : ruleType === "cooldownUnlock"
        ? summary.unlockRequestedAt === 0n
          ? "not_requested"
          : summary.unlockEligibleAt > 0n && summary.unlockEligibleAt <= BigInt(Math.floor(Date.now() / 1000))
            ? "matured"
            : "pending"
        : guardianDecision === "approved"
          ? "approved"
          : guardianDecision === "rejected"
            ? "rejected"
            : guardianDecision === "pending"
              ? "pending"
              : "not_requested";

  return {
    ruleType,
    unlockDate: ruleType === "timeLock" ? new Date(Number(summary.unlockAt) * 1000).toISOString() : null,
    cooldownDurationSeconds: ruleType === "cooldownUnlock" ? Number(summary.cooldownDuration) : null,
    guardianAddress: ruleType === "guardianApproval" ? summary.guardian : null,
    unlockRequestedAt: summary.unlockRequestedAt > 0n ? new Date(Number(summary.unlockRequestedAt) * 1000).toISOString() : null,
    unlockEligibleAt: summary.unlockEligibleAt > 0n ? new Date(Number(summary.unlockEligibleAt) * 1000).toISOString() : null,
    unlockRequestStatus,
    guardianApprovalState: ruleType === "guardianApproval" ? guardianDecision : "not_required",
    guardianDecisionAt: summary.guardianDecisionAt > 0n ? new Date(Number(summary.guardianDecisionAt) * 1000).toISOString() : null,
  };
};
