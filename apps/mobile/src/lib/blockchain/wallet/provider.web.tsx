import { useMemo, type PropsWithChildren } from "react";

import {
  AppKitProvider as ReownAppKitProvider,
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitState,
  useDisconnect,
  useWalletInfo,
} from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";

import { walletMetadata, walletRuntimeConfig } from "../config";
import {
  defaultGoalVaultChainId,
  goalVaultSupportedViemChainList,
  goalVaultSupportedViemChains,
} from "../chains";
import { createConnectionState, createWalletSession, getPreferredSupportedChainId } from "./helpers";
import { WalletContext } from "./state";
import type { WalletContextValue } from "./types";

const adapter = new EthersAdapter();

const walletNetworks = goalVaultSupportedViemChainList as unknown as [
  (typeof goalVaultSupportedViemChainList)[number],
  ...(typeof goalVaultSupportedViemChainList)[number][],
];

const UnconfiguredWalletProvider = ({ children }: PropsWithChildren) => {
  const value = useMemo<WalletContextValue>(
    () => ({
      session: null,
      runtimeStatus: {
        isEnabled: false,
        projectId: walletRuntimeConfig.projectId ?? undefined,
        metadataUrl: walletRuntimeConfig.metadataUrl ?? undefined,
      },
      connectionState: createConnectionState({
        isWalletEnabled: false,
        walletStatus: "unconfigured",
        session: null,
      }),
      connect: async () => undefined,
      disconnect: async () => undefined,
      switchNetwork: async () => undefined,
    }),
    [],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

const ConnectedWalletBridge = ({ children }: PropsWithChildren) => {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAppKitAccount({ namespace: "eip155" });
  const { caipNetworkId, chainId, switchNetwork } = useAppKitNetwork();
  const { walletInfo } = useWalletInfo("eip155");
  const { loading } = useAppKitState();

  const session = useMemo(
    () =>
      createWalletSession({
        address: isConnected ? address : undefined,
        chainId,
        caipNetworkId: caipNetworkId ?? null,
      }),
    [address, caipNetworkId, chainId, isConnected],
  );

  const value = useMemo<WalletContextValue>(
    () => ({
      session,
      runtimeStatus: {
        isEnabled: true,
        projectId: walletRuntimeConfig.projectId ?? undefined,
        metadataUrl: walletRuntimeConfig.metadataUrl ?? undefined,
      },
      connectionState: createConnectionState({
        isWalletEnabled: true,
        walletStatus: loading ? "connecting" : isConnected && address ? "connected" : "disconnected",
        session,
      }),
      connect: async () => {
        await open();
      },
      disconnect: async () => {
        await disconnect({ namespace: "eip155" });
      },
      switchNetwork: async (preferredChainId) => {
        const targetChainId = getPreferredSupportedChainId(preferredChainId ?? defaultGoalVaultChainId);
        await switchNetwork(goalVaultSupportedViemChains[targetChainId]);
      },
    }),
    [address, disconnect, isConnected, loading, open, session, switchNetwork, walletInfo],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const WalletProvider = ({ children }: PropsWithChildren) => {
  if (!walletRuntimeConfig.isEnabled || !walletRuntimeConfig.projectId) {
    return <UnconfiguredWalletProvider>{children}</UnconfiguredWalletProvider>;
  }

  return (
    <ReownAppKitProvider
      adapters={[adapter]}
      allowUnsupportedChain
      defaultNetwork={goalVaultSupportedViemChains[defaultGoalVaultChainId]}
      metadata={walletMetadata}
      networks={walletNetworks}
      projectId={walletRuntimeConfig.projectId}
      themeMode="light"
    >
      <ConnectedWalletBridge>{children}</ConnectedWalletBridge>
    </ReownAppKitProvider>
  );
};
