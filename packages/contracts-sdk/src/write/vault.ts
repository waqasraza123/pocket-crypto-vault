import type { Address } from "viem";

import { goalVaultAbi } from "../abi";
import type { SupportedChainId } from "@goal-vault/shared";

export interface DepositVaultWriteRequest {
  chainId: SupportedChainId;
  address: Address;
  abi: typeof goalVaultAbi;
  functionName: "deposit";
  args: readonly [bigint];
}

export interface WithdrawVaultWriteRequest {
  chainId: SupportedChainId;
  address: Address;
  abi: typeof goalVaultAbi;
  functionName: "withdraw";
  args: readonly [bigint, Address];
}

export interface RequestUnlockVaultWriteRequest {
  chainId: SupportedChainId;
  address: Address;
  abi: typeof goalVaultAbi;
  functionName: "requestUnlock";
  args: readonly [];
}

export interface CancelUnlockVaultWriteRequest {
  chainId: SupportedChainId;
  address: Address;
  abi: typeof goalVaultAbi;
  functionName: "cancelUnlockRequest";
  args: readonly [];
}

export interface ApproveUnlockVaultWriteRequest {
  chainId: SupportedChainId;
  address: Address;
  abi: typeof goalVaultAbi;
  functionName: "approveUnlock";
  args: readonly [];
}

export interface RejectUnlockVaultWriteRequest {
  chainId: SupportedChainId;
  address: Address;
  abi: typeof goalVaultAbi;
  functionName: "rejectUnlock";
  args: readonly [];
}

export const buildDepositVaultWriteRequest = ({
  chainId,
  vaultAddress,
  amount,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
  amount: bigint;
}): DepositVaultWriteRequest => ({
  chainId,
  address: vaultAddress,
  abi: goalVaultAbi,
  functionName: "deposit",
  args: [amount],
});

export const buildWithdrawVaultWriteRequest = ({
  chainId,
  vaultAddress,
  amount,
  to,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
  amount: bigint;
  to: Address;
}): WithdrawVaultWriteRequest => ({
  chainId,
  address: vaultAddress,
  abi: goalVaultAbi,
  functionName: "withdraw",
  args: [amount, to],
});

export const buildRequestUnlockVaultWriteRequest = ({
  chainId,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
}): RequestUnlockVaultWriteRequest => ({
  chainId,
  address: vaultAddress,
  abi: goalVaultAbi,
  functionName: "requestUnlock",
  args: [],
});

export const buildCancelUnlockVaultWriteRequest = ({
  chainId,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
}): CancelUnlockVaultWriteRequest => ({
  chainId,
  address: vaultAddress,
  abi: goalVaultAbi,
  functionName: "cancelUnlockRequest",
  args: [],
});

export const buildApproveUnlockVaultWriteRequest = ({
  chainId,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
}): ApproveUnlockVaultWriteRequest => ({
  chainId,
  address: vaultAddress,
  abi: goalVaultAbi,
  functionName: "approveUnlock",
  args: [],
});

export const buildRejectUnlockVaultWriteRequest = ({
  chainId,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
}): RejectUnlockVaultWriteRequest => ({
  chainId,
  address: vaultAddress,
  abi: goalVaultAbi,
  functionName: "rejectUnlock",
  args: [],
});
