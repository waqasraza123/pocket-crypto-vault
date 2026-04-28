import { useEffect, useMemo, useState } from "react";

import type { SyncFreshnessSnapshot, VaultActivityItem } from "@pocket-vault/shared";

import { fetchOwnerActivityFeed } from "../lib/api/activity";
import { mergeOwnerActivityFeed } from "../lib/data/source-of-truth";
import { settlePostTransactionRefreshIfCurrent } from "../lib/data/refresh-strategy";
import { useI18n } from "../lib/i18n";
import { getPostTransactionRefreshState, getSessionVaultActivities, useVaultStoreVersion } from "../state/vault-store";
import { useWalletConnection } from "./useWalletConnection";

export const useVaultActivity = () => {
  const { messages } = useI18n();
  const { connectionState } = useWalletConnection();
  const vaultStoreVersion = useVaultStoreVersion();
  const [backendEvents, setBackendEvents] = useState<{
    items: VaultActivityItem[];
    freshness: SyncFreshnessSnapshot | null;
  } | null>(null);
  const [backendStatus, setBackendStatus] = useState<"idle" | "loading" | "success" | "error" | "unavailable">("idle");
  const [backendMessage, setBackendMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadActivity = async () => {
      if (connectionState.status !== "ready" || !connectionState.session?.chain) {
        setBackendEvents(null);
        setBackendStatus("idle");
        setBackendMessage(null);
        return;
      }

      setBackendStatus("loading");
      const response = await fetchOwnerActivityFeed({
        chainId: connectionState.session.chain.id,
        ownerWallet: connectionState.session.address,
      });

      if (!isActive) {
        return;
      }

      if (response.status === "success" && response.data) {
        setBackendEvents({
          items: response.data.items,
          freshness: response.data.freshness,
        });
        setBackendStatus("success");
        setBackendMessage(null);
        return;
      }

      setBackendEvents(null);
      setBackendStatus(response.status === "unavailable" ? "unavailable" : "error");
      setBackendMessage(response.message);
    };

    void loadActivity();

    return () => {
      isActive = false;
    };
  }, [connectionState, vaultStoreVersion]);

  const sessionEvents = useMemo(
    () =>
      connectionState.status === "ready" && connectionState.session?.chain
        ? getSessionVaultActivities({
            chainId: connectionState.session.chain.id,
            ownerAddress: connectionState.session.address,
          })
        : [],
    [connectionState, vaultStoreVersion],
  );

  const refreshState = useMemo(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
      return null;
    }

    return getPostTransactionRefreshState({
      chainId: connectionState.session.chain.id,
      ownerAddress: connectionState.session.address,
    });
  }, [connectionState, vaultStoreVersion]);

  const events = useMemo(
    () =>
      mergeOwnerActivityFeed({
        backendItems: backendEvents?.items ?? null,
        sessionEvents,
        refreshState,
      }),
    [backendEvents?.items, refreshState, sessionEvents],
  );

  useEffect(() => {
    if (connectionState.status !== "ready" || !connectionState.session?.chain) {
      return;
    }

    settlePostTransactionRefreshIfCurrent({
      chainId: connectionState.session.chain.id,
      ownerAddress: connectionState.session.address,
      freshness: backendEvents?.freshness ?? null,
    });
  }, [backendEvents?.freshness, connectionState]);

  const notice =
    refreshState?.status === "catching_up"
      ? messages.feedback.activityUpdatingDescription
      : refreshState?.status === "refreshing"
        ? messages.feedback.transactionRefreshingDescription
        : backendStatus === "success"
          ? messages.pages.activity.description
          : backendMessage ??
            (events.some((event) => event.source === "session")
              ? messages.feedback.activityUpdatingDescription
              : messages.pages.activity.emptyDescription);

  return {
    connectionState,
    events,
    isLoading: backendStatus === "loading",
    dataSource:
      backendStatus === "success"
        ? ("backend" as const)
        : events.some((event) => event.source === "session")
          ? ("session" as const)
          : ("fallback" as const),
    notice,
  };
};
