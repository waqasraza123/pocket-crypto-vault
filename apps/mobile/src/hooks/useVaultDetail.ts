import { useEffect, useMemo, useState } from "react";

import type { VaultDetail, VaultDetailApiModel, VaultSummary } from "@pocket-vault/shared";

import { fetchVaultDetail } from "../lib/api/vaults";
import { readVaultDetailByAddress, type VaultQueryResult } from "../lib/contracts/queries";
import { mergeVaultDetailRecord } from "../lib/data/source-of-truth";
import { settlePostTransactionRefreshIfCurrent } from "../lib/data/refresh-strategy";
import { useI18n } from "../lib/i18n";
import {
  getPostTransactionRefreshState,
  getSessionVaultActivities,
  getSessionVaultMetadata,
  useVaultStoreVersion,
} from "../state/vault-store";
import { useSyncFreshness } from "./useSyncFreshness";
import { useWalletConnection } from "./useWalletConnection";

type VaultDetailReadState = {
  status: "success" | "empty" | "unavailable" | "error" | "not_found";
  data: VaultDetail | VaultDetailApiModel | null;
  source: "backend" | "fallback" | null;
  message: string | null;
};

export const useVaultDetail = (vaultAddress: VaultSummary["address"]) => {
  const { messages } = useI18n();
  const { connectionState } = useWalletConnection();
  const vaultStoreVersion = useVaultStoreVersion();
  const [result, setResult] = useState<VaultDetailReadState>({
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
      const backendResult = await fetchVaultDetail({
        chainId: connectionState.session.chain.id,
        vaultAddress,
      });

      if (backendResult.status === "success" && backendResult.data && isActive) {
        setResult({
          status: "success",
          data: backendResult.data,
          source: "backend",
          message: null,
        });
        setIsLoading(false);
        return;
      }

      const chainResult: VaultQueryResult<VaultDetail> = await readVaultDetailByAddress({
        chainId: connectionState.session.chain.id,
        vaultAddress,
      });

      if (!isActive) {
        return;
      }

      setResult({
        status: backendResult.status === "not_found" ? "not_found" : chainResult.status,
        data: chainResult.data,
        source: chainResult.status === "success" ? "fallback" : null,
        message: backendResult.message ?? chainResult.message,
      });
      setIsLoading(false);
    };

    void loadVault();

    return () => {
      isActive = false;
    };
  }, [connectionState, vaultAddress, vaultStoreVersion]);

  const sessionMetadata = useMemo(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain) {
      return null;
    }

    return getSessionVaultMetadata({
      chainId: connectionState.session.chain.id,
      vaultAddress,
    });
  }, [connectionState, vaultAddress, vaultStoreVersion]);

  const sessionEvents = useMemo(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain) {
      return [];
    }

    return getSessionVaultActivities({
      chainId: connectionState.session.chain.id,
      ownerAddress: connectionState.session.address,
      vaultAddress,
    });
  }, [connectionState, vaultAddress, vaultStoreVersion]);

  const refreshState = useMemo(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain) {
      return null;
    }

    return (
      getPostTransactionRefreshState({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        vaultAddress,
      }) ??
      getPostTransactionRefreshState({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
      })
    );
  }, [connectionState, vaultAddress, vaultStoreVersion]);

  const vault = useMemo(
    () =>
      mergeVaultDetailRecord({
        backendVault: result.source === "backend" ? (result.data as VaultDetailApiModel | null) : null,
        fallbackVault: result.source === "fallback" ? (result.data as VaultDetail | null) : null,
        sessionMetadata,
        sessionEvents,
        refreshState,
      }),
    [refreshState, result.data, result.source, sessionEvents, sessionMetadata],
  );

  useEffect(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain || !vault) {
      return;
    }

    settlePostTransactionRefreshIfCurrent({
      chainId: connectionState.session.chain.id,
      ownerAddress: connectionState.session.address,
      vaultAddress,
      freshness: vault.freshness,
      metadataStatus: vault.metadataStatus,
    });
  }, [connectionState, vault, vaultAddress]);

  const syncState = useSyncFreshness({
    freshness: vault?.freshness ?? null,
    metadataStatus: sessionMetadata?.metadataStatus ?? vault?.metadataStatus,
    hasPartialData: result.source === "fallback",
    notFound: !vault && !isLoading && result.status === "not_found",
    refreshState,
  });
  const notice =
    sessionMetadata?.metadataStatus === "failed"
      ? messages.feedback.metadataFailedDescription
      : sessionMetadata?.metadataStatus === "pending"
        ? messages.feedback.metadataPendingDescription
        : syncState.description ?? result.message;

  return {
    connectionState,
    isLoading,
    vault,
    queryStatus: vault ? "success" : result.status,
    dataSource: result.source ?? (vault ? "session" : null),
    degradedState: syncState.state,
    notice,
  };
};
