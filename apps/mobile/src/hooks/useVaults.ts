import { useEffect, useState } from "react";

import type { VaultSummary } from "@goal-vault/shared";

import { readVaultSummariesByOwner, type VaultQueryResult } from "../lib/contracts/queries";
import { useWalletConnection } from "./useWalletConnection";

export const useVaults = () => {
  const { connectionState } = useWalletConnection();
  const [result, setResult] = useState<VaultQueryResult<VaultSummary[]>>({
    status: "empty",
    data: null,
    source: null,
    message: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadVaults = async () => {
      if (connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
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
      const nextResult = await readVaultSummariesByOwner({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
      });

      if (isActive) {
        setResult(nextResult);
        setIsLoading(false);
      }
    };

    void loadVaults();

    return () => {
      isActive = false;
    };
  }, [connectionState]);

  return {
    connectionState,
    isLoading,
    vaults: result.data ?? [],
    queryStatus: result.status,
    dataSource: result.source,
    notice: result.message,
  };
};
