import type { Address } from "viem";

import type { AppConnectionState, SupportedChainId, WalletConnectionStatus, WalletSession } from "@pocket-vault/shared";

import { getSupportedChain, toSupportedChainId } from "../chains";

export const formatWalletAddress = (address: string | null | undefined): string => {
  if (!address) {
    return "Wallet";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const createWalletSession = ({
  address,
  chainId,
  caipNetworkId,
}: {
  address: string | undefined;
  chainId: number | string | null | undefined;
  caipNetworkId: string | null;
}): WalletSession | null => {
  if (!address) {
    return null;
  }

  const supportedChainId = toSupportedChainId(chainId);

  return {
    address: address as Address,
    chainId: typeof chainId === "number" ? chainId : chainId ? Number(chainId) : null,
    caipNetworkId,
    chain: supportedChainId ? getSupportedChain(supportedChainId) : null,
  };
};

export const createConnectionState = ({
  isWalletEnabled,
  walletStatus,
  session,
}: {
  isWalletEnabled: boolean;
  walletStatus: WalletConnectionStatus;
  session: WalletSession | null;
}): AppConnectionState => {
  if (!isWalletEnabled) {
    return {
      status: "walletUnavailable",
      walletStatus: "unconfigured",
      chainSupportStatus: "unknown",
      session: null,
      isReadyForReads: false,
      isReadyForWrites: false,
      reason: "Wallet connectivity requires a Reown project ID and metadata URL.",
    };
  }

  if (walletStatus === "connecting") {
    return {
      status: "connecting",
      walletStatus,
      chainSupportStatus: "unknown",
      session,
      isReadyForReads: false,
      isReadyForWrites: false,
      reason: "Waiting for wallet connection.",
    };
  }

  if (!session || walletStatus === "disconnected") {
    return {
      status: "disconnected",
      walletStatus: walletStatus === "unconfigured" ? "disconnected" : walletStatus,
      chainSupportStatus: "unknown",
      session: null,
      isReadyForReads: false,
      isReadyForWrites: false,
      reason: "Connect a wallet to read vaults on Base.",
    };
  }

  if (!session.chain) {
    return {
      status: "unsupportedNetwork",
      walletStatus: "connected",
      chainSupportStatus: "unsupported",
      session,
      isReadyForReads: false,
      isReadyForWrites: false,
      reason: "Switch to Base or Base Sepolia to continue.",
    };
  }

  return {
    status: "ready",
    walletStatus: "connected",
    chainSupportStatus: "supported",
    session,
    isReadyForReads: true,
    isReadyForWrites: true,
    reason: null,
  };
};

export const getPreferredSupportedChainId = (chainId?: SupportedChainId): SupportedChainId => chainId ?? 84532;
