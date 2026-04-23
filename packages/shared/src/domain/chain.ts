export type SupportedChainId = 8453 | 84532;

export type ChainSupportStatus = "supported" | "unsupported" | "unknown";

export interface SupportedChain {
  id: SupportedChainId;
  name: string;
  shortName: string;
  isTestnet: boolean;
  blockExplorerUrl: string;
  nativeCurrencySymbol: string;
}
