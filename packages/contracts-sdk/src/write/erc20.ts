import type { Address } from "viem";

import { erc20Abi } from "../abi";
import type { SupportedChainId } from "@goal-vault/shared";

export interface ApproveErc20WriteRequest {
  chainId: SupportedChainId;
  address: Address;
  abi: typeof erc20Abi;
  functionName: "approve";
  args: readonly [Address, bigint];
}

export const buildApproveErc20WriteRequest = ({
  chainId,
  tokenAddress,
  spenderAddress,
  amount,
}: {
  chainId: SupportedChainId;
  tokenAddress: Address;
  spenderAddress: Address;
  amount: bigint;
}): ApproveErc20WriteRequest => ({
  chainId,
  address: tokenAddress,
  abi: erc20Abi,
  functionName: "approve",
  args: [spenderAddress, amount],
});
