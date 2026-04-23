export type WalletConnectionState = "disconnected" | "connecting" | "connected";

export type WalletNetworkState = "supported" | "unsupported";

export interface WalletPlaceholderState {
  connectionState: WalletConnectionState;
  networkState: WalletNetworkState;
  accountLabel: string | null;
  chainLabel: string;
}
