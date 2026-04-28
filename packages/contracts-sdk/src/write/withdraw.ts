import type { Address } from "viem";

import { buildWithdrawVaultWriteRequest, type WithdrawVaultWriteRequest } from "./vault";
import type { SupportedChainId } from "@pocket-vault/shared";

export type WithdrawVaultWriteRequestResult =
  | {
      status: "ready";
      request: WithdrawVaultWriteRequest;
      message: null;
    }
  | {
      status: "unavailable";
      request: null;
      message: string;
    };

export const prepareWithdrawFromVaultWriteRequest = ({
  chainId,
  vaultAddress,
  amount,
  to,
}: {
  chainId: SupportedChainId;
  vaultAddress: Address;
  amount: bigint;
  to: Address;
}): WithdrawVaultWriteRequestResult => {
  if (amount <= 0n) {
    return {
      status: "unavailable",
      request: null,
      message: "Enter a USDC amount before withdrawing.",
    };
  }

  return {
    status: "ready",
    request: buildWithdrawVaultWriteRequest({
      chainId,
      vaultAddress,
      amount,
      to,
    }),
    message: null,
  };
};
