import type { Address } from "viem";

import { getUsdcAddress } from "../addresses";
import { buildApproveErc20WriteRequest, type ApproveErc20WriteRequest } from "./erc20";
import { buildDepositVaultWriteRequest, type DepositVaultWriteRequest } from "./vault";
import type { SupportedChainId } from "@goal-vault/shared";

type PreparedWriteResult<T> =
  | {
      status: "ready";
      request: T;
      message: null;
    }
  | {
      status: "unavailable";
      request: null;
      message: string;
    };

export const prepareApproveUsdcForVaultWriteRequest = ({
  chainId,
  vaultAddress,
  amount,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
  amount: bigint;
}): PreparedWriteResult<ApproveErc20WriteRequest> => {
  if (amount <= 0n) {
    return {
      status: "unavailable",
      request: null,
      message: "Enter a USDC amount before approving.",
    };
  }

  return {
    status: "ready",
    request: buildApproveErc20WriteRequest({
      chainId,
      tokenAddress: getUsdcAddress(chainId),
      spenderAddress: vaultAddress,
      amount,
    }),
    message: null,
  };
};

export const prepareDepositToVaultWriteRequest = ({
  chainId,
  vaultAddress,
  amount,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
  amount: bigint;
}): PreparedWriteResult<DepositVaultWriteRequest> => {
  if (amount <= 0n) {
    return {
      status: "unavailable",
      request: null,
      message: "Enter a USDC amount before depositing.",
    };
  }

  return {
    status: "ready",
    request: buildDepositVaultWriteRequest({
      chainId,
      vaultAddress,
      amount,
    }),
    message: null,
  };
};
