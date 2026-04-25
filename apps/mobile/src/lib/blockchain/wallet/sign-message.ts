import { createWalletClient, custom, type Address, type EIP1193Provider } from "viem";

export const signWalletMessage = async ({
  account,
  message,
  provider,
}: {
  account: Address;
  message: string;
  provider: EIP1193Provider;
}) => {
  const walletClient = createWalletClient({
    transport: custom(provider),
  });

  return walletClient.signMessage({
    account,
    message,
  });
};
