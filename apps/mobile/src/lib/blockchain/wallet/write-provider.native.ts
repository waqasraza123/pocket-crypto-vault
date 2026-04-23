import { useProvider } from "@reown/appkit-react-native";
import type { EIP1193Provider } from "viem";

export const useWalletWriteProvider = (): EIP1193Provider | null => {
  const { provider } = useProvider();

  return (provider as EIP1193Provider | undefined) ?? null;
};
