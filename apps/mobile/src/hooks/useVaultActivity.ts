import { useMemo } from "react";

import { mockActivity } from "../features/activity/mockActivity";
import { useI18n } from "../lib/i18n";
import { getSessionVaultActivities, useVaultStoreVersion } from "../state/vault-store";
import { useWalletConnection } from "./useWalletConnection";

export const useVaultActivity = () => {
  const { messages } = useI18n();
  const { connectionState } = useWalletConnection();
  const vaultStoreVersion = useVaultStoreVersion();

  const events = useMemo(() => {
    const fallbackEvents =
      connectionState.status === "ready" && connectionState.session?.chain
        ? mockActivity.filter((event) => event.chainId === connectionState.session?.chain?.id)
        : mockActivity;

    const sessionEvents =
      connectionState.status === "ready" && connectionState.session?.chain
        ? getSessionVaultActivities({
            chainId: connectionState.session.chain.id,
            ownerAddress: connectionState.session.address,
          })
        : [];
    const eventMap = new Map<string, (typeof fallbackEvents)[number]>();

    for (const event of fallbackEvents) {
      eventMap.set(event.id, event);
    }

    for (const event of sessionEvents) {
      eventMap.set(event.id, event);
    }

    return Array.from(eventMap.values()).sort((left, right) => (left.occurredAt < right.occurredAt ? 1 : -1));
  }, [connectionState, vaultStoreVersion]);

  return {
    connectionState,
    events,
    isLoading: false,
    dataSource: events.some((event) => event.source === "session") ? ("session" as const) : ("fallback" as const),
    notice:
      events.some((event) => event.source === "session")
        ? messages.pages.activity.description
        : messages.pages.activity.emptyDescription,
  };
};
