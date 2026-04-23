import {
  parseVaultDepositEvent,
  parseVaultWithdrawalEvent,
  prepareDepositToVaultWriteRequest,
  prepareWithdrawFromVaultWriteRequest,
} from "@goal-vault/contracts-sdk";
import { createWalletClient, custom, type Address, type EIP1193Provider, type Hash, type TransactionReceipt } from "viem";

import type { SupportedChainId } from "../../types";
import { goalVaultSupportedViemChains } from "../blockchain/chains";
import { getReadClient } from "../blockchain/read-client";

export interface DepositToVaultResult {
  txHash: Hash;
  receipt: TransactionReceipt;
  event: ReturnType<typeof parseVaultDepositEvent>;
}

export interface WithdrawFromVaultResult {
  txHash: Hash;
  receipt: TransactionReceipt;
  event: ReturnType<typeof parseVaultWithdrawalEvent>;
}

export const depositToVault = async ({
  provider,
  chainId,
  ownerAddress,
  vaultAddress,
  amount,
  onSubmitted,
}: {
  provider: EIP1193Provider;
  chainId: SupportedChainId;
  ownerAddress: Address;
  vaultAddress: Address;
  amount: bigint;
  onSubmitted?: (txHash: Hash) => void;
}): Promise<DepositToVaultResult> => {
  const requestResult = prepareDepositToVaultWriteRequest({
    chainId,
    vaultAddress,
    amount,
  });

  if (requestResult.status !== "ready") {
    throw new Error(requestResult.message);
  }

  const publicClient = getReadClient(chainId);

  if (!publicClient) {
    throw new Error("A Base RPC URL is required before deposits can run.");
  }

  const walletClient = createWalletClient({
    chain: goalVaultSupportedViemChains[chainId],
    transport: custom(provider),
  });

  const txHash = await walletClient.writeContract({
    ...requestResult.request,
    account: ownerAddress,
  });

  onSubmitted?.(txHash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    timeout: 120000,
  });

  return {
    txHash,
    receipt,
    event: parseVaultDepositEvent({
      receipt,
      vaultAddress,
    }),
  };
};

export const withdrawFromVault = async ({
  provider,
  chainId,
  ownerAddress,
  vaultAddress,
  amount,
  to,
  onSubmitted,
  onConfirming,
}: {
  provider: EIP1193Provider;
  chainId: SupportedChainId;
  ownerAddress: Address;
  vaultAddress: Address;
  amount: bigint;
  to: Address;
  onSubmitted?: (txHash: Hash) => void;
  onConfirming?: (txHash: Hash) => void;
}): Promise<WithdrawFromVaultResult> => {
  const requestResult = prepareWithdrawFromVaultWriteRequest({
    chainId,
    vaultAddress,
    amount,
    to,
  });

  if (requestResult.status !== "ready") {
    throw new Error(requestResult.message);
  }

  const publicClient = getReadClient(chainId);

  if (!publicClient) {
    throw new Error("A Base RPC URL is required before withdrawals can run.");
  }

  const walletClient = createWalletClient({
    chain: goalVaultSupportedViemChains[chainId],
    transport: custom(provider),
  });

  const txHash = await walletClient.writeContract({
    ...requestResult.request,
    account: ownerAddress,
  });

  onSubmitted?.(txHash);
  onConfirming?.(txHash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    timeout: 120000,
  });

  return {
    txHash,
    receipt,
    event: parseVaultWithdrawalEvent({
      receipt,
      vaultAddress,
    }),
  };
};
