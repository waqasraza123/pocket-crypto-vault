import { z } from "zod";

import type { VaultAddress } from "../../types";

const vaultAddressSchema = z.object({
  vaultAddress: z.string().regex(/^0x[a-fA-F0-9]{8,}$/),
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
