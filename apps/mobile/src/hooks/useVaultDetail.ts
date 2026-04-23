import { useEffect, useState } from "react";

import type { VaultDetail, VaultSummary } from "@goal-vault/shared";

import { readVaultDetailByAddress, type VaultQueryResult } from "../lib/contracts/queries";
import { useWalletConnection } from "./useWalletConnection";

export const useVaultDetail = (vaultAddress: VaultSummary["address"]) => {
  const { connectionState } = useWalletConnection();
  const [result, setResult] = useState<VaultQueryResult<VaultDetail>>({
    status: "empty",
    data: null,
    source: null,
    message: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadVault = async () => {
      if (connectionState.status !== "ready" || !connectionState.session?.chain) {
        setIsLoading(false);
        setResult({
          status: "empty",
          data: null,
          source: null,
          message: null,
        });
        return;
      }

      setIsLoading(true);
      const nextResult = await readVaultDetailByAddress({
        chainId: connectionState.session.chain.id,
        vaultAddress,
      });

      if (isActive) {
        setResult(nextResult);
        setIsLoading(false);
      }
    };

    void loadVault();

    return () => {
      isActive = false;
    };
  }, [connectionState, vaultAddress]);

  return {
    connectionState,
    isLoading,
    vault: result.data,
    queryStatus: result.status,
    dataSource: result.source,
    notice: result.message,
  };
};
