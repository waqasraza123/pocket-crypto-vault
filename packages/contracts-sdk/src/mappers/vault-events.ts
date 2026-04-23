import { parseEventLogs, type Address, type Hash, type TransactionReceipt } from "viem";

import { goalVaultFactoryAbi } from "../abi";
import { goalVaultAbi } from "../abi";
import type { VaultCreatedResolution } from "@goal-vault/shared";

export const parseVaultCreatedResolution = ({
  receipt,
  factoryAddress,
}: {
  receipt: TransactionReceipt;
  factoryAddress?: `0x${string}` | null;
}): VaultCreatedResolution => {
  try {
    const [eventLog] = parseEventLogs({
      abi: goalVaultFactoryAbi,
      logs: receipt.logs,
      eventName: "VaultCreated",
      strict: false,
    }).filter((log) => (factoryAddress ? log.address.toLowerCase() === factoryAddress.toLowerCase() : true));

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
