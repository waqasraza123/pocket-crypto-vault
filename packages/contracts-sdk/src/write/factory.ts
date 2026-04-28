import type { Address } from "viem";

import { goalVaultFactoryAbi } from "../abi";
import type { SupportedChainId, VaultRuleType } from "@pocket-vault/shared";

export interface CreateVaultWriteRequest {
  chainId: SupportedChainId;
  address: Address;
  abi: typeof goalVaultFactoryAbi;
  functionName: "createVault";
  args: readonly [bigint, number, bigint, bigint, Address];
}

export const buildCreateVaultWriteRequest = ({
  chainId,
  factoryAddress,
  targetAmount,
  ruleType,
  unlockAt,
  cooldownDuration,
  guardian,
}: {
  chainId: SupportedChainId;
  factoryAddress: Address;
  targetAmount: bigint;
  ruleType: VaultRuleType;
  unlockAt: bigint | null;
  cooldownDuration: bigint | null;
  guardian: Address | null;
}): CreateVaultWriteRequest => ({
  chainId,
  address: factoryAddress,
  abi: goalVaultFactoryAbi,
  functionName: "createVault",
  args: [
    targetAmount,
    ruleType === "timeLock" ? 0 : ruleType === "cooldownUnlock" ? 1 : 2,
    unlockAt ?? 0n,
    cooldownDuration ?? 0n,
    guardian ?? "0x0000000000000000000000000000000000000000",
  ],
});
