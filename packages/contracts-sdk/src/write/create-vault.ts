import type { CreateVaultWriteRequest } from "./factory";
import { buildCreateVaultWriteRequest } from "./factory";
import { getGoalVaultFactoryAddress } from "../addresses";
import type { SupportedChainId } from "@goal-vault/shared";

export interface CreateVaultContractWriteInput {
  chainId: SupportedChainId;
  targetAmount: bigint;
  unlockAt: bigint;
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
  unlockAt,
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
      unlockAt,
    }),
    message: null,
  };
};
