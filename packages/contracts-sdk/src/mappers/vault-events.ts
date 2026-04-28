import { parseEventLogs, type Address, type Hash, type TransactionReceipt } from "viem";

import { goalVaultFactoryAbi } from "../abi";
import { goalVaultAbi } from "../abi";
import type { VaultCreatedResolution } from "@pocket-vault/shared";

export const parseVaultCreatedResolution = ({
  receipt,
  factoryAddress,
}: {
  receipt: TransactionReceipt;
  factoryAddress?: `0x${string}` | null;
}): VaultCreatedResolution => {
  try {
    const legacyLog = parseEventLogs({
      abi: goalVaultFactoryAbi,
      logs: receipt.logs,
      eventName: "VaultCreated",
      strict: false,
    }).find((log) => (factoryAddress ? log.address.toLowerCase() === factoryAddress.toLowerCase() : true));
    const nextLog = parseEventLogs({
      abi: goalVaultFactoryAbi,
      logs: receipt.logs,
      eventName: "VaultCreatedV2",
      strict: false,
    }).find((log) => (factoryAddress ? log.address.toLowerCase() === factoryAddress.toLowerCase() : true));
    const eventLog = nextLog ?? legacyLog;

    if (!eventLog?.args.vault) {
      return {
        status: "unresolved",
        strategy: null,
        vaultAddress: null,
        message: "The vault address could not be read from the confirmed transaction receipt.",
      };
    }

    return {
      status: "resolved",
      strategy: "receipt_event",
      vaultAddress: eventLog.args.vault,
      message: null,
    };
  } catch (error) {
    return {
      status: "unresolved",
      strategy: null,
      vaultAddress: null,
      message: error instanceof Error ? error.message : "The vault creation event could not be parsed.",
    };
  }
};

export interface ParsedVaultDepositEvent {
  status: "resolved" | "unresolved";
  amount: bigint | null;
  from: Address | null;
  occurredAt: string | null;
  txHash: Hash | null;
  message: string | null;
}

export interface ParsedVaultWithdrawalEvent {
  status: "resolved" | "unresolved";
  amount: bigint | null;
  to: Address | null;
  occurredAt: string | null;
  txHash: Hash | null;
  message: string | null;
}

export interface ParsedVaultUnlockEvent {
  status: "resolved" | "unresolved";
  occurredAt: string | null;
  actor: Address | null;
  txHash: Hash | null;
  message: string | null;
}

export const parseVaultDepositEvent = ({
  receipt,
  vaultAddress,
}: {
  receipt: TransactionReceipt;
  vaultAddress: Address;
}): ParsedVaultDepositEvent => {
  try {
    const [eventLog] = parseEventLogs({
      abi: goalVaultAbi,
      logs: receipt.logs,
      eventName: "Deposited",
      strict: false,
    }).filter((log) => log.address.toLowerCase() === vaultAddress.toLowerCase());

    if (!eventLog?.args.amount || !eventLog.args.from || !eventLog.args.timestamp) {
      return {
        status: "unresolved",
        amount: null,
        from: null,
        occurredAt: null,
        txHash: receipt.transactionHash,
        message: "The deposit confirmation event could not be parsed from the receipt.",
      };
    }

    return {
      status: "resolved",
      amount: eventLog.args.amount,
      from: eventLog.args.from,
      occurredAt: new Date(Number(eventLog.args.timestamp) * 1000).toISOString(),
      txHash: receipt.transactionHash,
      message: null,
    };
  } catch (error) {
    return {
      status: "unresolved",
      amount: null,
      from: null,
      occurredAt: null,
      txHash: receipt.transactionHash,
      message: error instanceof Error ? error.message : "The deposit event could not be parsed.",
    };
  }
};

export const parseVaultWithdrawalEvent = ({
  receipt,
  vaultAddress,
}: {
  receipt: TransactionReceipt;
  vaultAddress: Address;
}): ParsedVaultWithdrawalEvent => {
  try {
    const [eventLog] = parseEventLogs({
      abi: goalVaultAbi,
      logs: receipt.logs,
      eventName: "Withdrawn",
      strict: false,
    }).filter((log) => log.address.toLowerCase() === vaultAddress.toLowerCase());

    if (!eventLog?.args.amount || !eventLog.args.to || !eventLog.args.timestamp) {
      return {
        status: "unresolved",
        amount: null,
        to: null,
        occurredAt: null,
        txHash: receipt.transactionHash,
        message: "The withdrawal confirmation event could not be parsed from the receipt.",
      };
    }

    return {
      status: "resolved",
      amount: eventLog.args.amount,
      to: eventLog.args.to,
      occurredAt: new Date(Number(eventLog.args.timestamp) * 1000).toISOString(),
      txHash: receipt.transactionHash,
      message: null,
    };
  } catch (error) {
    return {
      status: "unresolved",
      amount: null,
      to: null,
      occurredAt: null,
      txHash: receipt.transactionHash,
      message: error instanceof Error ? error.message : "The withdrawal event could not be parsed.",
    };
  }
};

export const parseVaultUnlockRequestedEvent = ({
  receipt,
  vaultAddress,
}: {
  receipt: TransactionReceipt;
  vaultAddress: Address;
}): ParsedVaultUnlockEvent => {
  try {
    const [eventLog] = parseEventLogs({
      abi: goalVaultAbi,
      logs: receipt.logs,
      eventName: "UnlockRequested",
      strict: false,
    }).filter((log) => log.address.toLowerCase() === vaultAddress.toLowerCase());

    if (!eventLog?.args.timestamp || !eventLog.args.requestedBy) {
      return {
        status: "unresolved",
        occurredAt: null,
        actor: null,
        txHash: receipt.transactionHash,
        message: "The unlock request event could not be parsed from the receipt.",
      };
    }

    return {
      status: "resolved",
      actor: eventLog.args.requestedBy,
      occurredAt: new Date(Number(eventLog.args.timestamp) * 1000).toISOString(),
      txHash: receipt.transactionHash,
      message: null,
    };
  } catch (error) {
    return {
      status: "unresolved",
      occurredAt: null,
      actor: null,
      txHash: receipt.transactionHash,
      message: error instanceof Error ? error.message : "The unlock request event could not be parsed.",
    };
  }
};

export const parseVaultUnlockCanceledEvent = ({
  receipt,
  vaultAddress,
}: {
  receipt: TransactionReceipt;
  vaultAddress: Address;
}): ParsedVaultUnlockEvent => {
  try {
    const [eventLog] = parseEventLogs({
      abi: goalVaultAbi,
      logs: receipt.logs,
      eventName: "UnlockCanceled",
      strict: false,
    }).filter((log) => log.address.toLowerCase() === vaultAddress.toLowerCase());

    if (!eventLog?.args.timestamp || !eventLog.args.canceledBy) {
      return {
        status: "unresolved",
        occurredAt: null,
        actor: null,
        txHash: receipt.transactionHash,
        message: "The unlock cancel event could not be parsed from the receipt.",
      };
    }

    return {
      status: "resolved",
      actor: eventLog.args.canceledBy,
      occurredAt: new Date(Number(eventLog.args.timestamp) * 1000).toISOString(),
      txHash: receipt.transactionHash,
      message: null,
    };
  } catch (error) {
    return {
      status: "unresolved",
      occurredAt: null,
      actor: null,
      txHash: receipt.transactionHash,
      message: error instanceof Error ? error.message : "The unlock cancel event could not be parsed.",
    };
  }
};

export const parseGuardianApprovalEvent = ({
  receipt,
  vaultAddress,
  eventName,
}: {
  receipt: TransactionReceipt;
  vaultAddress: Address;
  eventName: "GuardianApproved" | "GuardianRejected";
}): ParsedVaultUnlockEvent => {
  try {
    const [eventLog] = parseEventLogs({
      abi: goalVaultAbi,
      logs: receipt.logs,
      eventName,
      strict: false,
    }).filter((log) => log.address.toLowerCase() === vaultAddress.toLowerCase());

    if (!eventLog?.args.timestamp || !eventLog.args.guardian) {
      return {
        status: "unresolved",
        occurredAt: null,
        actor: null,
        txHash: receipt.transactionHash,
        message: "The guardian decision event could not be parsed from the receipt.",
      };
    }

    return {
      status: "resolved",
      actor: eventLog.args.guardian,
      occurredAt: new Date(Number(eventLog.args.timestamp) * 1000).toISOString(),
      txHash: receipt.transactionHash,
      message: null,
    };
  } catch (error) {
    return {
      status: "unresolved",
      occurredAt: null,
      actor: null,
      txHash: receipt.transactionHash,
      message: error instanceof Error ? error.message : "The guardian decision event could not be parsed.",
    };
  }
};
