import { useEffect, useMemo, useState } from "react";

import type { SyncFreshnessSnapshot, VaultActivityItem, VaultDetail, VaultSummary } from "@goal-vault/shared";

import { createActivityDedupeKey, mapActivityItemToViewEvent } from "../lib/api/activity";
import { fetchVaultDetail } from "../lib/api/vaults";
import { readVaultDetailByAddress, type VaultQueryResult } from "../lib/contracts/queries";
import { createSessionVaultDetail, mergeVaultSummaryWithMetadata } from "../lib/contracts/mappers";
import { useI18n } from "../lib/i18n";
import { getSessionVaultActivities, getSessionVaultMetadata, useVaultStoreVersion } from "../state/vault-store";
import { useWalletConnection } from "./useWalletConnection";

export const useVaultDetail = (vaultAddress: VaultSummary["address"]) => {
  const { messages } = useI18n();
  const { connectionState } = useWalletConnection();
  const vaultStoreVersion = useVaultStoreVersion();
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
      const backendResult = await fetchVaultDetail({
        chainId: connectionState.session.chain.id,
        vaultAddress,
      });
      let nextResult: VaultQueryResult<VaultDetail>;

      if (backendResult.status === "success" && backendResult.data) {
        nextResult = {
          status: "success",
          data: backendResult.data,
          source: "backend",
          message: null,
        };
      } else {
        const chainResult = await readVaultDetailByAddress({
          chainId: connectionState.session.chain.id,
          vaultAddress,
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

  const vault = useMemo(() => {
    if (result.data && sessionMetadata) {
      return {
        ...result.data,
        ...mergeVaultSummaryWithMetadata({
          vault: result.data,
          metadata: sessionMetadata,
        }),
      };
    }

    if (result.data) {
      return result.data;
    }

    if (sessionMetadata) {
      return createSessionVaultDetail(sessionMetadata);
    }

    return null;
  }, [result.data, sessionMetadata]);
  const backendDetail =
    result.source === "backend"
      ? (result.data as (VaultDetail & { normalizedActivity?: VaultActivityItem[]; freshness?: SyncFreshnessSnapshot }) | null)
      : null;

  const activityPreview = useMemo(() => {
    const backendEvents = backendDetail?.normalizedActivity
      ? backendDetail.normalizedActivity.map(mapActivityItemToViewEvent)
      : vault?.activityPreview ?? [];
    const activityMap = new Map<string, VaultDetail["activityPreview"][number]>();

    for (const event of backendEvents) {
      activityMap.set(
        createActivityDedupeKey({
          txHash: event.txHash,
          type: event.type,
          vaultAddress: event.vaultAddress,
        }),
        event,
      );
    }

    if (connectionState.status === "ready" && connectionState.session?.chain) {
      const sessionEvents = getSessionVaultActivities({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        vaultAddress,
      });

      for (const event of sessionEvents) {
        activityMap.set(
          createActivityDedupeKey({
            txHash: event.txHash,
            type: event.type,
            vaultAddress: event.vaultAddress,
          }),
          event,
        );
      }
    }

    return Array.from(activityMap.values())
      .sort((left, right) => (left.occurredAt < right.occurredAt ? 1 : -1))
      .slice(0, 6);
  }, [backendDetail?.normalizedActivity, connectionState, vault, vaultAddress, vaultStoreVersion]);

  const freshnessNotice =
    backendDetail?.freshness && backendDetail.freshness.freshness !== "current"
      ? messages.feedback.activityUpdatingDescription
      : null;
  const notice =
    sessionMetadata?.metadataStatus === "failed"
      ? messages.feedback.metadataFailedDescription
      : sessionMetadata?.metadataStatus === "pending"
        ? messages.feedback.metadataPendingDescription
        : freshnessNotice ?? result.message;

  return {
    connectionState,
    isLoading,
    vault: vault
      ? {
          ...vault,
          activityPreview,
        }
      : null,
    queryStatus: vault ? "success" : result.status,
    dataSource: result.source ?? (vault ? "session" : null),
    notice,
  };
};
