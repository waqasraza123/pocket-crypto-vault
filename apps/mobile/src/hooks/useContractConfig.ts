import { getContractConfigForChain } from "../lib/contracts/registry";
import { useWalletConnection } from "./useWalletConnection";

export const useContractConfig = () => {
  const { connectionState } = useWalletConnection();
  const chainId = connectionState.session?.chain?.id;

  return {
    chainId: chainId ?? null,
    config: chainId ? getContractConfigForChain(chainId) : null,
  };
};
