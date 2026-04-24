import type { CreateVaultWriteRequest } from "./factory";
import { buildCreateVaultWriteRequest } from "./factory";
import { getGoalVaultFactoryAddress } from "../addresses";
import type { Address } from "viem";

import type { SupportedChainId, VaultRuleType } from "@goal-vault/shared";

export interface CreateVaultContractWriteInput {
  chainId: SupportedChainId;
  targetAmount: bigint;
  ruleType: VaultRuleType;
  unlockAt: bigint | null;
  cooldownDuration: bigint | null;
  guardian: Address | null;
}

export type CreateVaultWriteRequestResult =
  | {
      status: "ready";
      request: CreateVaultWriteRequest;
      message: null;
    }
  | {
      status: "unavailable";
      request: null;
      message: string;
    };

export const prepareCreateVaultWriteRequest = ({
  chainId,
  targetAmount,
  ruleType,
  unlockAt,
  cooldownDuration,
  guardian,
}: CreateVaultContractWriteInput): CreateVaultWriteRequestResult => {
  const factoryAddress = getGoalVaultFactoryAddress(chainId);

  if (!factoryAddress) {
    return {
      status: "unavailable",
      request: null,
      message: "Goal Vault is not configured for this network yet.",
    };
  }

  return {
    status: "ready",
    request: buildCreateVaultWriteRequest({
      chainId,
      factoryAddress,
      targetAmount,
      ruleType,
      unlockAt,
      cooldownDuration,
      guardian,
    }),
    message: null,
  };
};
