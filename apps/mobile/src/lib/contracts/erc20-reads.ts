import {
  readErc20Allowance,
  readErc20Balance,
  readErc20Decimals,
  readErc20Symbol,
} from "@pocket-vault/contracts-sdk";
import type { Address } from "viem";

import type { AllowanceState, SupportedChainId, TokenBalanceState } from "../../types";
import { getReadClient } from "../blockchain/read-client";
import { getUsdcAddressForChain, isAllowanceSufficient } from "./amount-utils";

const usdcSymbolFallback = "USDC";

const createUnavailableTokenBalanceState = (message: string): TokenBalanceState => ({
  status: "unavailable",
  balanceAtomic: null,
  decimals: null,
  symbol: usdcSymbolFallback,
  errorMessage: message,
  updatedAt: null,
});

const createUnavailableAllowanceState = (message: string, requiredAmountAtomic: bigint | null): AllowanceState => ({
  status: "unavailable",
  allowanceAtomic: null,
  decimals: null,
  approvalRequirement: "unknown",
  requiredAmountAtomic,
  errorMessage: message,
  updatedAt: null,
});

const readUsdcMetadata = async (chainId: SupportedChainId) => {
  const client = getReadClient(chainId);
  const tokenAddress = getUsdcAddressForChain(chainId);
  const [decimalsResult, symbolResult] = await Promise.all([
    readErc20Decimals({
      client,
      tokenAddress,
    }),
    readErc20Symbol({
      client,
      tokenAddress,
    }),
  ]);

  if (decimalsResult.status !== "success") {
    return {
      status: decimalsResult.status,
      decimals: null,
      symbol: usdcSymbolFallback,
      message: decimalsResult.error.message,
    } as const;
  }

  return {
    status: "success",
    decimals: decimalsResult.data,
    symbol: symbolResult.status === "success" ? symbolResult.data : usdcSymbolFallback,
    message: symbolResult.status === "success" ? null : symbolResult.error.message,
  } as const;
};

export const readUsdcBalanceState = async ({
  chainId,
  walletAddress,
}: {
  chainId: SupportedChainId;
  walletAddress: Address;
}): Promise<TokenBalanceState> => {
  const client = getReadClient(chainId);

  if (!client) {
    return createUnavailableTokenBalanceState("A Base RPC URL is required before USDC balances can load.");
  }

  const tokenAddress = getUsdcAddressForChain(chainId);
  const metadata = await readUsdcMetadata(chainId);

  if (metadata.status !== "success" || metadata.decimals === null) {
    return {
      status: metadata.status,
      balanceAtomic: null,
      decimals: null,
      symbol: metadata.symbol,
      errorMessage: metadata.message,
      updatedAt: null,
    };
  }

  const balanceResult = await readErc20Balance({
    client,
    tokenAddress,
    ownerAddress: walletAddress,
  });

  if (balanceResult.status !== "success") {
    return {
      status: balanceResult.status,
      balanceAtomic: null,
      decimals: metadata.decimals,
      symbol: metadata.symbol,
      errorMessage: balanceResult.error.message,
      updatedAt: null,
    };
  }

  return {
    status: "ready",
    balanceAtomic: balanceResult.data,
    decimals: metadata.decimals,
    symbol: metadata.symbol,
    errorMessage: metadata.message,
    updatedAt: new Date().toISOString(),
  };
};

export const readUsdcAllowanceState = async ({
  chainId,
  walletAddress,
  vaultAddress,
  requiredAmountAtomic,
  allowanceOverrideAtomic,
}: {
  chainId: SupportedChainId;
  walletAddress: Address;
  vaultAddress: Address;
  requiredAmountAtomic: bigint | null;
  allowanceOverrideAtomic?: bigint | null;
}): Promise<AllowanceState> => {
  const client = getReadClient(chainId);

  if (!client) {
    return createUnavailableAllowanceState("A Base RPC URL is required before USDC approval checks can load.", requiredAmountAtomic);
  }

  const tokenAddress = getUsdcAddressForChain(chainId);
  const decimalsResult = await readErc20Decimals({
    client,
    tokenAddress,
  });

  if (decimalsResult.status !== "success") {
    return {
      status: decimalsResult.status,
      allowanceAtomic: allowanceOverrideAtomic ?? null,
      decimals: null,
      approvalRequirement: "unknown",
      requiredAmountAtomic,
      errorMessage: decimalsResult.error.message,
      updatedAt: null,
    };
  }

  const allowanceResult = await readErc20Allowance({
    client,
    tokenAddress,
    ownerAddress: walletAddress,
    spenderAddress: vaultAddress,
  });

  if (allowanceResult.status !== "success") {
    return {
      status: allowanceResult.status,
      allowanceAtomic: allowanceOverrideAtomic ?? null,
      decimals: decimalsResult.data,
      approvalRequirement: "unknown",
      requiredAmountAtomic,
      errorMessage: allowanceResult.error.message,
      updatedAt: null,
    };
  }

  const allowanceAtomic =
    allowanceOverrideAtomic !== null && allowanceOverrideAtomic !== undefined && allowanceOverrideAtomic > allowanceResult.data
      ? allowanceOverrideAtomic
      : allowanceResult.data;

  return {
    status: "ready",
    allowanceAtomic,
    decimals: decimalsResult.data,
    approvalRequirement:
      requiredAmountAtomic === null
        ? "unknown"
        : isAllowanceSufficient({
              allowanceAtomic,
              amountAtomic: requiredAmountAtomic,
            })
          ? "not_required"
          : "required",
    requiredAmountAtomic,
    errorMessage: null,
    updatedAt: new Date().toISOString(),
  };
};
