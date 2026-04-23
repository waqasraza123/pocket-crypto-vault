import { useWalletConnection } from "./useWalletConnection";

export const useWalletAccount = () => {
  const { session } = useWalletConnection();

  return {
    accountAddress: session?.address ?? null,
    session,
  };
};
