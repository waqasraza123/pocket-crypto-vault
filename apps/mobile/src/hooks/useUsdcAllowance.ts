import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";

import type { AllowanceState, SupportedChainId } from "../types";
import { readUsdcAllowanceState } from "../lib/contracts/erc20-reads";

const createIdleAllowanceState = (requiredAmountAtomic: bigint | null): AllowanceState => ({
  status: "idle",
  allowanceAtomic: null,
  decimals: null,
  approvalRequirement: "unknown",
  requiredAmountAtomic,
  errorMessage: null,
  updatedAt: null,
});

export const useUsdcAllowance = ({
  chainId,
  walletAddress,
  vaultAddress,
  requiredAmountAtomic,
  allowanceOverrideAtomic,
}: {
  chainId: SupportedChainId | null;
  walletAddress: Address | null;
  vaultAddress: Address | null;
  requiredAmountAtomic: bigint | null;
  allowanceOverrideAtomic?: bigint | null;
}) => {
  const [state, setState] = useState<AllowanceState>(createIdleAllowanceState(requiredAmountAtomic));
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!chainId || !walletAddress || !vaultAddress) {
      setState(createIdleAllowanceState(requiredAmountAtomic));
      return;
    }

    setState((current) => ({
      ...current,
      status: "loading",
      requiredAmountAtomic,
      errorMessage: null,
    }));

    void readUsdcAllowanceState({
      chainId,
      walletAddress,
      vaultAddress,
      requiredAmountAtomic,
      allowanceOverrideAtomic,
    }).then((nextState) => {
      if (isActive) {
        setState(nextState);
      }
    });

    return () => {
      isActive = false;
    };
  }, [allowanceOverrideAtomic, chainId, requiredAmountAtomic, vaultAddress, walletAddress, refreshKey]);

  return {
    ...state,
    isLoading: state.status === "loading",
    refetch,
  };
};
