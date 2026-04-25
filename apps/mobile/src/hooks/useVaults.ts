import { useEffect, useMemo, useState } from "react";

import type { VaultSummary, VaultSummaryApiModel, VaultSummaryViewModel } from "@goal-vault/shared";

import { fetchOwnerVaults } from "../lib/api/vaults";
import { readVaultSummariesByOwner, type VaultQueryResult } from "../lib/contracts/queries";
import { mergeVaultSummaries } from "../lib/data/source-of-truth";
import { settlePostTransactionRefreshIfCurrent } from "../lib/data/refresh-strategy";
import { useI18n } from "../lib/i18n";
import {
  getPostTransactionRefreshState,
  getSessionVaultActivities,
  getSessionVaultsByOwner,
  useVaultStoreVersion,
} from "../state/vault-store";
import { useSyncFreshness } from "./useSyncFreshness";
import { useWalletConnection } from "./useWalletConnection";

type VaultReadState = {
  status: "success" | "empty" | "unavailable" | "error" | "not_found";
  data: Array<VaultSummary | VaultSummaryApiModel> | null;
  source: "backend" | "fallback" | null;
  message: string | null;
};

export const useVaults = () => {
  const { messages } = useI18n();
  const { connectionState } = useWalletConnection();
  const vaultStoreVersion = useVaultStoreVersion();
  const [result, setResult] = useState<VaultReadState>({
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
      const backendResult = await fetchOwnerVaults({
        chainId: connectionState.session.chain.id,
        ownerWallet: connectionState.session.address,
      });

      if (backendResult.status === "success" && isActive) {
        setResult({
          status: backendResult.data && backendResult.data.length > 0 ? "success" : "empty",
          data: backendResult.data,
          source: "backend",
          message: null,
        });
        setIsLoading(false);
        return;
      }

      const chainResult: VaultQueryResult<VaultSummary[]> = await readVaultSummariesByOwner({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
      });

      if (!isActive) {
        return;
      }

      setResult({
        status: chainResult.status,
        data: chainResult.data,
        source: chainResult.status === "success" ? "fallback" : null,
        message: backendResult.message ?? chainResult.message,
      });
      setIsLoading(false);
    };

    void loadVaults();

    return () => {
      isActive = false;
    };
  }, [connectionState, vaultStoreVersion]);

  const sessionVaults = useMemo(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
      return [];
    }

    return getSessionVaultsByOwner({
      chainId: connectionState.session.chain.id,
      ownerWallet: connectionState.session.address,
    });
  }, [connectionState, vaultStoreVersion]);

  const refreshState = useMemo(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
      return null;
    }

    return getPostTransactionRefreshState({
      chainId: connectionState.session.chain.id,
      ownerAddress: connectionState.session.address,
    });
  }, [connectionState, vaultStoreVersion]);

  const sessionEvents = useMemo(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
      return [];
    }

    return getSessionVaultActivities({
      chainId: connectionState.session.chain.id,
      ownerAddress: connectionState.session.address,
    });
  }, [connectionState, vaultStoreVersion]);

  const vaults = useMemo<VaultSummaryViewModel[]>(
    () =>
      mergeVaultSummaries({
        backendVaults: result.source === "backend" ? (result.data as VaultSummaryApiModel[] | null) : null,
        fallbackVaults: result.source === "fallback" ? (result.data as VaultSummary[] | null) : null,
        sessionEvents,
        sessionMetadata: sessionVaults,
        refreshState,
      }),
    [refreshState, result.data, result.source, sessionEvents, sessionVaults],
  );

  const backendFreshness = vaults.find((vault) => vault.source === "backend")?.freshness ?? null;
  const metadataStatus =
    sessionVaults.find((record) => record.metadataStatus === "failed")?.metadataStatus ??
    sessionVaults.find((record) => record.metadataStatus === "pending")?.metadataStatus;

  useEffect(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain) {
      return;
    }

    settlePostTransactionRefreshIfCurrent({
      chainId: connectionState.session.chain.id,
      ownerAddress: connectionState.session.address,
      freshness: backendFreshness,
      metadataStatus,
    });
  }, [backendFreshness, connectionState, metadataStatus]);

  const syncState = useSyncFreshness({
    freshness: backendFreshness,
    metadataStatus,
    hasPartialData: result.source === "fallback",
    refreshState,
  });

  const sessionNotice =
    sessionVaults.find((record) => record.metadataStatus === "failed")?.metadataStatus === "failed"
      ? messages.feedback.metadataFailedDescription
      : sessionVaults.find((record) => record.metadataStatus === "pending")
        ? messages.feedback.metadataPendingDescription
        : null;
  const queryStatus = vaults.length > 0 ? "success" : result.status === "success" ? "empty" : result.status;
  const dataSource = result.source ?? (vaults.length > 0 ? "session" : null);
  const notice = sessionNotice ?? syncState.description ?? result.message;

  return {
    connectionState,
    isLoading,
    vaults,
    queryStatus,
    dataSource,
    degradedState: syncState.state,
    notice,
  };
};
