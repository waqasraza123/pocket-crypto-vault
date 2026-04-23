import { useEffect, useMemo, useState } from "react";

import type { VaultActivityEvent } from "../types";
import { mockActivity } from "../features/activity/mockActivity";
import { createActivityDedupeKey, fetchOwnerActivityFeed, mapActivityItemToViewEvent } from "../lib/api/activity";
import { useI18n } from "../lib/i18n";
import { getSessionVaultActivities, useVaultStoreVersion } from "../state/vault-store";
import { useWalletConnection } from "./useWalletConnection";

export const useVaultActivity = () => {
  const { messages } = useI18n();
  const { connectionState } = useWalletConnection();
  const vaultStoreVersion = useVaultStoreVersion();
  const [backendEvents, setBackendEvents] = useState<VaultActivityEvent[] | null>(null);
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
        setBackendEvents(response.data.map(mapActivityItemToViewEvent));
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

  const events = useMemo(() => {
    const fallbackEvents =
      backendEvents ??
      (connectionState.status === "ready" && connectionState.session?.chain
        ? mockActivity.filter((event) => event.chainId === connectionState.session?.chain?.id)
        : mockActivity);

    const sessionEvents =
      connectionState.status === "ready" && connectionState.session?.chain
        ? getSessionVaultActivities({
            chainId: connectionState.session.chain.id,
            ownerAddress: connectionState.session.address,
          })
        : [];
    const eventMap = new Map<string, VaultActivityEvent>();

    for (const event of fallbackEvents) {
      eventMap.set(
        createActivityDedupeKey({
          txHash: event.txHash,
          type: event.type,
          vaultAddress: event.vaultAddress,
        }),
        event,
      );
    }

    for (const event of sessionEvents) {
      eventMap.set(
        createActivityDedupeKey({
          txHash: event.txHash,
          type: event.type,
          vaultAddress: event.vaultAddress,
        }),
        event,
      );
    }

    return Array.from(eventMap.values()).sort((left, right) => (left.occurredAt < right.occurredAt ? 1 : -1));
  }, [backendEvents, connectionState, vaultStoreVersion]);

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
    notice:
      backendStatus === "success"
        ? messages.pages.activity.description
        : backendMessage ?? (events.some((event) => event.source === "session") ? messages.pages.activity.description : messages.pages.activity.emptyDescription),
  };
};
