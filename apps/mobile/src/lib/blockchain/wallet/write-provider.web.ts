import { useAppKitProvider } from "@reown/appkit/react";
import type { EIP1193Provider } from "viem";

export const useWalletWriteProvider = (): EIP1193Provider | null => {
  const { walletProvider } = useAppKitProvider<EIP1193Provider>("eip155");

  return walletProvider ?? null;
};
