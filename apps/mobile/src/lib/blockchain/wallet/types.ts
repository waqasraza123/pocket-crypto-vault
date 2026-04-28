import type { AppConnectionState, SupportedChainId, WalletSession } from "@pocket-vault/shared";

export interface WalletRuntimeStatus {
  isEnabled: boolean;
  projectId?: string;
  metadataUrl?: string;
}

export interface WalletContextValue {
  session: WalletSession | null;
  connectionState: AppConnectionState;
  runtimeStatus: WalletRuntimeStatus;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId?: SupportedChainId) => Promise<void>;
}
