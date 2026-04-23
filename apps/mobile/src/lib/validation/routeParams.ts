import { isAddress } from "viem";
import { z } from "zod";

import type { VaultAddress } from "../../types";

const vaultAddressSchema = z.object({
  vaultAddress: z.string().refine((value) => isAddress(value), {
    message: "Vault address must be a valid EVM address.",
  }),
});

export const parseVaultRouteParams = (
  params: Record<string, string | string[] | undefined>,
): { vaultAddress: VaultAddress } => {
  const parsed = vaultAddressSchema.parse({
    vaultAddress: Array.isArray(params.vaultAddress) ? params.vaultAddress[0] : params.vaultAddress,
  });

  return {
    vaultAddress: parsed.vaultAddress as VaultAddress,
  };
};
