import type { PropsWithChildren } from "react";
import { Platform } from "react-native";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const ProviderComponent =
    Platform.OS === "web"
      ? require("./provider.web").WalletProvider
      : require("./provider.native").WalletProvider;

  return <ProviderComponent>{children}</ProviderComponent>;
};
