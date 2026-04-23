import { Platform } from "react-native";
import type { EIP1193Provider } from "viem";

export const useWalletWriteProvider = (): EIP1193Provider | null => {
  if (Platform.OS === "web") {
    return require("./write-provider.web").useWalletWriteProvider();
  }

  return require("./write-provider.native").useWalletWriteProvider();
};
