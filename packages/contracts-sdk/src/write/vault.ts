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
