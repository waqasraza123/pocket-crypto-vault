import type { PropsWithChildren } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";

import { walletRuntimeConfig } from "../config";
import { isNativeWalletRuntimeSupported } from "./native-runtime";
import { UnconfiguredWalletProvider } from "./unconfigured-provider";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  if (Platform.OS === "web") {
    const { WalletProvider: WebWalletProvider } = require("./provider.web") as typeof import("./provider.web");

    return <WebWalletProvider>{children}</WebWalletProvider>;
  }

  if (!walletRuntimeConfig.isEnabled || !walletRuntimeConfig.projectId || !isNativeWalletRuntimeSupported(Constants)) {
    return <UnconfiguredWalletProvider>{children}</UnconfiguredWalletProvider>;
  }

  const { WalletProvider: NativeWalletProvider } = require("./provider.native") as typeof import("./provider.native");

  return <NativeWalletProvider>{children}</NativeWalletProvider>;
};
