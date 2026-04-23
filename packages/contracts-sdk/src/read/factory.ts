import type { Address, PublicClient } from "viem";

import { goalVaultFactoryAbi } from "../abi";
import type { VaultAddress, VaultReadResult } from "@goal-vault/shared";

export const readFactoryVaultAddresses = async ({
  client,
  factoryAddress,
  ownerAddress,
}: {
  client: PublicClient | null;
  factoryAddress: Address | null;
  ownerAddress: Address;
}): Promise<VaultReadResult<VaultAddress[]>> => {
  if (!client) {
    return {
      status: "unavailable",
      data: null,
      error: {
        code: "missing_rpc",
        message: "A chain RPC URL is required before vault reads can run.",
      },
    };
  }

  if (!factoryAddress) {
    return {
      status: "unavailable",
      data: null,
      error: {
        code: "missing_factory_address",
        message: "GoalVaultFactory is not configured for this chain yet.",
      },
    };
  }

  try {
    const vaultAddresses = (await client.readContract({
      address: factoryAddress,
      abi: goalVaultFactoryAbi,
      functionName: "getVaultsByOwner",
      args: [ownerAddress],
    })) as VaultAddress[];

    if (vaultAddresses.length === 0) {
      return {
        status: "empty",
        data: null,
        error: null,
      };
    }

    return {
      status: "success",
      data: vaultAddresses,
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: {
        code: "read_failed",
        message: error instanceof Error ? error.message : "Vault factory read failed.",
      },
    };
  }
};
