import type { Address } from "viem";

import type { ChainSupportStatus, SupportedChain } from "./chain";

export type WalletConnectionStatus = "unconfigured" | "disconnected" | "connecting" | "connected";

export interface WalletSession {
  address: Address;
  chainId: number | null;
  caipNetworkId: string | null;
  chain: SupportedChain | null;
}

export type AppConnectionStatus =
  | "walletUnavailable"
  | "disconnected"
  | "connecting"
  | "unsupportedNetwork"
  | "ready";

export interface AppConnectionState {
  status: AppConnectionStatus;
  walletStatus: WalletConnectionStatus;
  chainSupportStatus: ChainSupportStatus;
  session: WalletSession | null;
  isReadyForReads: boolean;
  isReadyForWrites: boolean;
  reason: string | null;
}
