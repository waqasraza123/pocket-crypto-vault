import type { Address } from "viem";

import type { SupportedChainId } from "@goal-vault/shared";

export const usdcTokenAddresses: Record<SupportedChainId, Address> = {
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

export const usdcTokenConfig = {
  symbol: "USDC",
  decimals: 6,
  addresses: usdcTokenAddresses,
} as const;
