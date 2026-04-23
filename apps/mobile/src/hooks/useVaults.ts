import { useEffect, useMemo, useState } from "react";

import type { SyncFreshnessSnapshot, VaultSummary } from "@goal-vault/shared";

import { fetchOwnerVaults } from "../lib/api/vaults";
import { readVaultSummariesByOwner, type VaultQueryResult } from "../lib/contracts/queries";
import { createSessionVaultSummary, mergeVaultSummaryWithMetadata } from "../lib/contracts/mappers";
import { useI18n } from "../lib/i18n";
import { getSessionVaultsByOwner, useVaultStoreVersion } from "../state/vault-store";
import { useWalletConnection } from "./useWalletConnection";

export const useVaults = () => {
  const { messages } = useI18n();
  const { connectionState } = useWalletConnection();
  const vaultStoreVersion = useVaultStoreVersion();
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
      const backendResult = await fetchOwnerVaults({
        chainId: connectionState.session.chain.id,
        ownerWallet: connectionState.session.address,
      });
      let nextResult: VaultQueryResult<VaultSummary[]>;

      if (backendResult.status === "success" && backendResult.data) {
        nextResult = {
          status: backendResult.data.length > 0 ? "success" : "empty",
          data: backendResult.data.length > 0 ? backendResult.data : null,
          source: "backend",
          message: null,
        };
      } else {
        const chainResult = await readVaultSummariesByOwner({
          chainId: connectionState.session.chain.id,
          ownerAddress: connectionState.session.address,
        });
        nextResult = {
          ...chainResult,
          message: backendResult.message ?? chainResult.message,
        };
      }

      if (isActive) {
        setResult(nextResult);
        setIsLoading(false);
      }
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

  const mergedVaults = useMemo(() => {
    const vaultMap = new Map<string, VaultSummary>();

    for (const vault of result.data ?? []) {
      const metadata = sessionVaults.find((record) => record.contractAddress.toLowerCase() === vault.address.toLowerCase()) ?? null;
      vaultMap.set(vault.address.toLowerCase(), mergeVaultSummaryWithMetadata({ vault, metadata }));
    }

    for (const sessionVault of sessionVaults) {
      const key = sessionVault.contractAddress.toLowerCase();
      if (!vaultMap.has(key)) {
        vaultMap.set(key, createSessionVaultSummary(sessionVault));
      }
    }

    return Array.from(vaultMap.values()).sort((left, right) => (left.unlockDate > right.unlockDate ? 1 : -1));
  }, [result.data, sessionVaults]);

  const sessionNotice =
    sessionVaults.find((record) => record.metadataStatus === "failed")?.metadataStatus === "failed"
      ? messages.feedback.metadataFailedDescription
      : sessionVaults.find((record) => record.metadataStatus === "pending")
        ? messages.feedback.metadataPendingDescription
        : null;
  const freshnessNotice =
    result.source === "backend" &&
    (result.data ?? []).some(
      (vault) =>
        "freshness" in vault &&
        ((vault.freshness as SyncFreshnessSnapshot).freshness === "syncing" ||
          (vault.freshness as SyncFreshnessSnapshot).freshness === "lagging"),
    )
      ? messages.feedback.vaultSyncingDescription
      : null;

  const queryStatus =
    mergedVaults.length > 0 ? "success" : result.status === "success" ? "empty" : result.status;
  const dataSource = result.source ?? (mergedVaults.length > 0 ? "session" : null);
  const notice = sessionNotice ?? freshnessNotice ?? result.message;

  return {
    connectionState,
    isLoading,
    vaults: mergedVaults,
    queryStatus,
    dataSource,
    notice,
  };
};
