import {
  buildApproveUnlockVaultWriteRequest,
  buildCancelUnlockVaultWriteRequest,
  buildRejectUnlockVaultWriteRequest,
  buildRequestUnlockVaultWriteRequest,
  parseGuardianApprovalEvent,
  parseVaultDepositEvent,
  type ParsedVaultUnlockEvent,
  parseVaultUnlockCanceledEvent,
  parseVaultUnlockRequestedEvent,
  parseVaultWithdrawalEvent,
  prepareDepositToVaultWriteRequest,
  prepareWithdrawFromVaultWriteRequest,
} from "@pocket-vault/contracts-sdk";
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

export interface UnlockVaultResult {
  txHash: Hash;
  receipt: TransactionReceipt;
  event: ParsedVaultUnlockEvent;
}

export interface GuardianDecisionResult {
  txHash: Hash;
  receipt: TransactionReceipt;
  event: ReturnType<typeof parseGuardianApprovalEvent>;
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

export const requestUnlockFromVault = async ({
  provider,
  chainId,
  actorAddress,
  vaultAddress,
  onSubmitted,
}: {
  provider: EIP1193Provider;
  chainId: SupportedChainId;
  actorAddress: Address;
  vaultAddress: Address;
  onSubmitted?: (txHash: Hash) => void;
}): Promise<UnlockVaultResult> => {
  const publicClient = getReadClient(chainId);

  if (!publicClient) {
    throw new Error("A Base RPC URL is required before unlock requests can run.");
  }

  const walletClient = createWalletClient({
    chain: goalVaultSupportedViemChains[chainId],
    transport: custom(provider),
  });

  const txHash = await walletClient.writeContract({
    ...buildRequestUnlockVaultWriteRequest({
      chainId,
      vaultAddress,
    }),
    account: actorAddress,
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
    event: parseVaultUnlockRequestedEvent({
      receipt,
      vaultAddress,
    }),
  };
};

export const cancelUnlockRequestOnVault = async ({
  provider,
  chainId,
  actorAddress,
  vaultAddress,
  onSubmitted,
}: {
  provider: EIP1193Provider;
  chainId: SupportedChainId;
  actorAddress: Address;
  vaultAddress: Address;
  onSubmitted?: (txHash: Hash) => void;
}): Promise<UnlockVaultResult> => {
  const publicClient = getReadClient(chainId);

  if (!publicClient) {
    throw new Error("A Base RPC URL is required before canceling unlock requests can run.");
  }

  const walletClient = createWalletClient({
    chain: goalVaultSupportedViemChains[chainId],
    transport: custom(provider),
  });

  const txHash = await walletClient.writeContract({
    ...buildCancelUnlockVaultWriteRequest({
      chainId,
      vaultAddress,
    }),
    account: actorAddress,
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
    event: parseVaultUnlockCanceledEvent({
      receipt,
      vaultAddress,
    }),
  };
};

export const approveUnlockOnVault = async ({
  provider,
  chainId,
  actorAddress,
  vaultAddress,
  eventName,
  onSubmitted,
}: {
  provider: EIP1193Provider;
  chainId: SupportedChainId;
  actorAddress: Address;
  vaultAddress: Address;
  eventName: "GuardianApproved" | "GuardianRejected";
  onSubmitted?: (txHash: Hash) => void;
}): Promise<GuardianDecisionResult> => {
  const publicClient = getReadClient(chainId);

  if (!publicClient) {
    throw new Error("A Base RPC URL is required before guardian actions can run.");
  }

  const walletClient = createWalletClient({
    chain: goalVaultSupportedViemChains[chainId],
    transport: custom(provider),
  });

  const txHash = await walletClient.writeContract({
    ...(eventName === "GuardianApproved"
      ? buildApproveUnlockVaultWriteRequest({
          chainId,
          vaultAddress,
        })
      : buildRejectUnlockVaultWriteRequest({
          chainId,
          vaultAddress,
        })),
    account: actorAddress,
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
    event: parseGuardianApprovalEvent({
      receipt,
      vaultAddress,
      eventName,
    }),
  };
};
