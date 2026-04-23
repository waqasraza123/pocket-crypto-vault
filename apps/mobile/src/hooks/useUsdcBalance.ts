import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";

import type { SupportedChainId, TokenBalanceState } from "../types";
import { readUsdcBalanceState } from "../lib/contracts/erc20-reads";

const idleTokenBalanceState: TokenBalanceState = {
  status: "idle",
  balanceAtomic: null,
  decimals: null,
  symbol: "USDC",
  errorMessage: null,
  updatedAt: null,
};

export const useUsdcBalance = ({
  chainId,
  walletAddress,
}: {
  chainId: SupportedChainId | null;
  walletAddress: Address | null;
}) => {
  const [state, setState] = useState<TokenBalanceState>(idleTokenBalanceState);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!chainId || !walletAddress) {
      setState(idleTokenBalanceState);
      return;
    }

    setState((current) => ({
      ...current,
      status: "loading",
      errorMessage: null,
    }));

    void readUsdcBalanceState({
      chainId,
      walletAddress,
    }).then((nextState) => {
      if (isActive) {
        setState(nextState);
      }
    });

    return () => {
      isActive = false;
    };
  }, [chainId, walletAddress, refreshKey]);

  return {
    ...state,
    isLoading: state.status === "loading",
    refetch,
  };
};
