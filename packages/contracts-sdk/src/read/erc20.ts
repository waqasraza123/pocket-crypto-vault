import type { Address, PublicClient } from "viem";

import { erc20Abi } from "../abi";
import type { TokenReadResult } from "@pocket-vault/shared";

export const readErc20Balance = async ({
  client,
  tokenAddress,
  ownerAddress,
}: {
  client: PublicClient | null;
  tokenAddress: Address;
  ownerAddress: Address;
}): Promise<TokenReadResult<bigint>> => {
  if (!client) {
    return {
      status: "unavailable",
      data: null,
      error: {
        code: "missing_rpc",
        message: "A chain RPC URL is required before token reads can run.",
      },
    };
  }

  try {
    const balance = (await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [ownerAddress],
    })) as bigint;

    return {
      status: "success",
      data: balance,
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: {
        code: "read_failed",
        message: error instanceof Error ? error.message : "Token balance read failed.",
      },
    };
  }
};

export const readErc20Allowance = async ({
  client,
  tokenAddress,
  ownerAddress,
  spenderAddress,
}: {
  client: PublicClient | null;
  tokenAddress: Address;
  ownerAddress: Address;
  spenderAddress: Address;
}): Promise<TokenReadResult<bigint>> => {
  if (!client) {
    return {
      status: "unavailable",
      data: null,
      error: {
        code: "missing_rpc",
        message: "A chain RPC URL is required before token reads can run.",
      },
    };
  }

  try {
    const allowance = (await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [ownerAddress, spenderAddress],
    })) as bigint;

    return {
      status: "success",
      data: allowance,
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: {
        code: "read_failed",
        message: error instanceof Error ? error.message : "Token allowance read failed.",
      },
    };
  }
};

export const readErc20Decimals = async ({
  client,
  tokenAddress,
}: {
  client: PublicClient | null;
  tokenAddress: Address;
}): Promise<TokenReadResult<number>> => {
  if (!client) {
    return {
      status: "unavailable",
      data: null,
      error: {
        code: "missing_rpc",
        message: "A chain RPC URL is required before token reads can run.",
      },
    };
  }

  try {
    const decimals = (await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    })) as number;

    return {
      status: "success",
      data: decimals,
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: {
        code: "read_failed",
        message: error instanceof Error ? error.message : "Token decimals read failed.",
      },
    };
  }
};

export const readErc20Symbol = async ({
  client,
  tokenAddress,
}: {
  client: PublicClient | null;
  tokenAddress: Address;
}): Promise<TokenReadResult<string>> => {
  if (!client) {
    return {
      status: "unavailable",
      data: null,
      error: {
        code: "missing_rpc",
        message: "A chain RPC URL is required before token reads can run.",
      },
    };
  }

  try {
    const symbol = (await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "symbol",
    })) as string;

    return {
      status: "success",
      data: symbol,
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: {
        code: "read_failed",
        message: error instanceof Error ? error.message : "Token symbol read failed.",
      },
    };
  }
};
