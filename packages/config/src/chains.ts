import type { Chain } from "viem";
import { base, baseSepolia } from "viem/chains";

import type { SupportedChain, SupportedChainId } from "@goal-vault/shared";

export const supportedChainIds = [8453, 84532] as const satisfies readonly SupportedChainId[];

export const supportedChains: Record<SupportedChainId, SupportedChain> = {
  8453: {
    id: 8453,
    name: "Base",
    shortName: "Base",
    isTestnet: false,
    blockExplorerUrl: "https://basescan.org",
    nativeCurrencySymbol: "ETH",
  },
  84532: {
    id: 84532,
    name: "Base Sepolia",
    shortName: "Base Sepolia",
    isTestnet: true,
    blockExplorerUrl: "https://sepolia.basescan.org",
    nativeCurrencySymbol: "ETH",
  },
};

export const supportedViemChains: Record<SupportedChainId, Chain> = {
  8453: base,
  84532: baseSepolia,
};

export const supportedViemChainList = [supportedViemChains[84532], supportedViemChains[8453]] as const;

export const defaultSupportedChainId: SupportedChainId = 84532;
