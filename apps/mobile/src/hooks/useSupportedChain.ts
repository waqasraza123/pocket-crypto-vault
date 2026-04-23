import { useWalletConnection } from "./useWalletConnection";

export const useSupportedChain = () => {
  const { connectionState } = useWalletConnection();

  return {
    chain: connectionState.session?.chain ?? null,
    isSupportedChain: connectionState.chainSupportStatus === "supported",
  };
};
