import type { Address } from "viem";

import { goalVaultFactoryAbi } from "../abi";
import type { SupportedChainId } from "@goal-vault/shared";

export interface CreateVaultWriteRequest {
  chainId: SupportedChainId;
  address: Address;
  abi: typeof goalVaultFactoryAbi;
  functionName: "createVault";
  args: readonly [bigint, bigint];
}

export const buildCreateVaultWriteRequest = ({
  chainId,
  factoryAddress,
  targetAmount,
  unlockAt,
}: {
  chainId: SupportedChainId;
  factoryAddress: Address;
  targetAmount: bigint;
  unlockAt: bigint;
}): CreateVaultWriteRequest => ({
  chainId,
  address: factoryAddress,
  abi: goalVaultFactoryAbi,
  functionName: "createVault",
  args: [targetAmount, unlockAt],
});
