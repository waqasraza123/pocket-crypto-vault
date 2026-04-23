import { createWalletClient, custom, type Address, type EIP1193Provider, type Hash, type TransactionReceipt } from "viem";

import { goalVaultSupportedViemChains } from "../blockchain/chains";
import { getReadClient } from "../blockchain/read-client";
import { prepareApproveUsdcForVaultWriteRequest } from "./writes";
import type { SupportedChainId } from "../../types";

export interface ApproveUsdcForVaultResult {
  txHash: Hash;
  receipt: TransactionReceipt;
}

export const approveUsdcForVault = async ({
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
}): Promise<ApproveUsdcForVaultResult> => {
  const requestResult = prepareApproveUsdcForVaultWriteRequest({
    chainId,
    vaultAddress,
    amount,
  });

  if (requestResult.status !== "ready") {
    throw new Error(requestResult.message);
  }

  const publicClient = getReadClient(chainId);

  if (!publicClient) {
    throw new Error("A Base RPC URL is required before approvals can run.");
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
  };
};
