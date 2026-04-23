import { useMemo, type PropsWithChildren } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppKit as ReownNativeModal,
  AppKitProvider as ReownNativeProvider,
  createAppKit,
  useAccount,
  useAppKit,
  useAppKitState,
  useWalletInfo,
} from "@reown/appkit-react-native";
import { EthersAdapter } from "@reown/appkit-ethers-react-native";
import type { Network, Storage } from "@reown/appkit-common-react-native";

import { walletMetadata, walletRuntimeConfig } from "../config";
import { goalVaultSupportedViemChainList, goalVaultSupportedViemChains } from "../chains";
import { clientEnv } from "../../env/client";
import { createConnectionState, createWalletSession, getPreferredSupportedChainId } from "./helpers";
import { WalletContext } from "./state";
import type { WalletContextValue } from "./types";

const toNativeNetwork = (chain: (typeof goalVaultSupportedViemChainList)[number]): Network => ({
  id: chain.id,
  name: chain.name,
  chainNamespace: "eip155",
  caipNetworkId: `eip155:${chain.id}`,
  nativeCurrency: chain.nativeCurrency,
  rpcUrls: {
    default: {
      http: [clientEnv.rpcUrls[chain.id as keyof typeof clientEnv.rpcUrls] ?? chain.rpcUrls.default.http[0] ?? ""],
    },
  },
  blockExplorers: chain.blockExplorers
    ? {
        default: {
          name: chain.blockExplorers.default.name,
          url: chain.blockExplorers.default.url,
        },
      }
    : undefined,
  testnet: Boolean(chain.testnet),
});

const nativeNetworks = goalVaultSupportedViemChainList.map(toNativeNetwork);

const parseStoredValue = <T,>(value: string | null): T | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
};

const nativeStorage: Storage = {
  getKeys: async () => [...(await AsyncStorage.getAllKeys())],
  getEntries: async <T,>() => {
    const keys = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(keys);

    return entries
      .filter((entry): entry is [string, string] => Boolean(entry[0]) && typeof entry[1] === "string")
      .map(([key, value]) => [key, parseStoredValue<T>(value) as T]);
  },
  getItem: async <T,>(key: string) => {
    const value = await AsyncStorage.getItem(key);
    return parseStoredValue<T>(value);
  },
  setItem: async <T,>(key: string, value: T) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: async (key) => {
    await AsyncStorage.removeItem(key);
  },
};

const nativeWalletInstance =
  walletRuntimeConfig.isEnabled && walletRuntimeConfig.projectId
    ? createAppKit({
        adapters: [new EthersAdapter()],
        defaultNetwork: nativeNetworks[0],
        metadata: walletMetadata,
        networks: nativeNetworks,
        projectId: walletRuntimeConfig.projectId,
        storage: nativeStorage,
        themeMode: "light",
      })
    : null;

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
  const { address, chainId, isConnected } = useAccount();
  const { open, disconnect, switchNetwork } = useAppKit();
  const { isLoading } = useAppKitState();
  const { walletInfo } = useWalletInfo();

  const session = useMemo(
    () =>
      createWalletSession({
        address: isConnected ? address : undefined,
        chainId,
        caipNetworkId: chainId ? `eip155:${chainId}` : null,
      }),
    [address, chainId, isConnected],
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
        walletStatus: isLoading ? "connecting" : isConnected && address ? "connected" : "disconnected",
        session,
      }),
      connect: async () => {
        await open({ view: "Connect" });
      },
      disconnect: async () => {
        disconnect("eip155");
      },
      switchNetwork: async (preferredChainId) => {
        const targetChainId = getPreferredSupportedChainId(preferredChainId);
        await switchNetwork(`eip155:${goalVaultSupportedViemChains[targetChainId].id}`);
      },
    }),
    [address, disconnect, isConnected, isLoading, open, session, switchNetwork, walletInfo],
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
      <ReownNativeModal />
    </WalletContext.Provider>
  );
};

export const WalletProvider = ({ children }: PropsWithChildren) => {
  if (!nativeWalletInstance) {
    return <UnconfiguredWalletProvider>{children}</UnconfiguredWalletProvider>;
  }

  return (
    <ReownNativeProvider instance={nativeWalletInstance}>
      <ConnectedWalletBridge>{children}</ConnectedWalletBridge>
    </ReownNativeProvider>
  );
};
