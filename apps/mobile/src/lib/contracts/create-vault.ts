import type { CreateVaultFormInput, CreateVaultReviewModel, VaultMetadataPayload } from "@goal-vault/shared";
import { prepareCreateVaultWriteRequest, readFactoryVaultAddresses } from "@goal-vault/contracts-sdk";
import { createWalletClient, custom, type Address, type EIP1193Provider, type Hash, type TransactionReceipt } from "viem";

import { getReadClient } from "../blockchain/read-client";
import { goalVaultSupportedViemChains } from "../blockchain/chains";
import { buildCreateVaultReviewModel } from "./mappers";
import { getFactoryAddressForChain } from "./registry";
import { resolveCreatedVaultAddress } from "./resolve-created-vault";

export interface CreateVaultTransactionResult {
  txHash: Hash;
  receipt: TransactionReceipt;
  resolution: Awaited<ReturnType<typeof resolveCreatedVaultAddress>>;
  review: CreateVaultReviewModel;
}

export const buildCreateVaultMetadataPayload = ({
  chainId,
  ownerAddress,
  vaultAddress,
  review,
}: {
  chainId: 8453 | 84532;
  ownerAddress: Address;
  vaultAddress: Address;
  review: CreateVaultReviewModel;
}): VaultMetadataPayload => ({
  contractAddress: vaultAddress,
  chainId,
  ownerWallet: ownerAddress,
  displayName: review.goalName,
  category: review.category,
  note: review.note || undefined,
  accentTheme: review.accentTheme,
  targetAmount: review.targetAmount.toString(),
  unlockDate: review.unlockDate,
});

export const createVaultTransaction = async ({
  provider,
  ownerAddress,
  chainId,
  values,
  onSubmitted,
  onConfirming,
}: {
  provider: EIP1193Provider;
  ownerAddress: Address;
  chainId: 8453 | 84532;
  values: CreateVaultFormInput;
  onSubmitted?: (txHash: Hash) => void;
  onConfirming?: (txHash: Hash) => void;
}): Promise<CreateVaultTransactionResult> => {
  const review = buildCreateVaultReviewModel({
    chainId,
    values,
  });
  const knownVaultsResult = await readFactoryVaultAddresses({
    client: getReadClient(chainId),
    factoryAddress: getFactoryAddressForChain(chainId),
    ownerAddress,
  });
  const requestResult = prepareCreateVaultWriteRequest({
    chainId,
    targetAmount: review.targetAmountAtomic,
    unlockAt: review.unlockTimestamp,
  });

  if (requestResult.status !== "ready") {
    throw new Error(requestResult.message);
  }

  const publicClient = getReadClient(chainId);

  if (!publicClient) {
    throw new Error("A Base RPC URL is required before vault creation can run.");
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
  const resolution = await resolveCreatedVaultAddress({
    chainId,
    ownerAddress,
    receipt,
    knownVaultAddresses: knownVaultsResult.status === "success" ? knownVaultsResult.data : undefined,
  });

  return {
    txHash,
    receipt,
    resolution,
    review,
  };
};
