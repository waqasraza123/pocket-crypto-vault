import { Platform } from "react-native";
import Constants from "expo-constants";
import type { EIP1193Provider } from "viem";

import { walletRuntimeConfig } from "../config";
import { isNativeWalletRuntimeSupported } from "./native-runtime";

export const useWalletWriteProvider = (): EIP1193Provider | null => {
  if (Platform.OS === "web") {
    const { useWalletWriteProvider: useWebWalletWriteProvider } = require("./write-provider.web") as typeof import("./write-provider.web");

    return useWebWalletWriteProvider();
  }

  if (!walletRuntimeConfig.isEnabled || !walletRuntimeConfig.projectId || !isNativeWalletRuntimeSupported(Constants)) {
    return null;
  }

  const { useWalletWriteProvider: useNativeWalletWriteProvider } = require("./write-provider.native") as typeof import("./write-provider.native");

  return useNativeWalletWriteProvider();
};
