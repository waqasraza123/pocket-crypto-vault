import { useMemo } from "react";

import type { PostTransactionRefreshState, SyncFreshnessSnapshot } from "@pocket-vault/shared";

import { useI18n } from "../lib/i18n";
import { getVaultDegradedState } from "../lib/sync/freshness";

export const useSyncFreshness = ({
  freshness,
  metadataStatus,
  notFound,
  hasPartialData,
  refreshState,
}: {
  freshness?: SyncFreshnessSnapshot | null;
  metadataStatus?: "pending" | "saved" | "failed";
  notFound?: boolean;
  hasPartialData?: boolean;
  refreshState?: PostTransactionRefreshState | null;
}) => {
  const { messages } = useI18n();

  return useMemo(() => {
    const state = getVaultDegradedState({
      freshness,
      metadataStatus,
      notFound,
      hasPartialData,
    });

    switch (state) {
      case "missing_metadata":
        return {
          state,
          title: messages.feedback.metadataLiveTitle,
          description: messages.feedback.metadataFailedDescription,
        };
      case "syncing":
        return {
          state,
          title: messages.feedback.syncingTitle,
          description:
            refreshState?.status === "catching_up"
              ? messages.feedback.activityUpdatingDescription
              : refreshState?.status === "refreshing"
                ? messages.feedback.transactionRefreshingDescription
                : metadataStatus === "pending"
              ? messages.feedback.metadataPendingDescription
              : freshness?.freshness === "lagging"
                ? messages.feedback.activityUpdatingDescription
                : messages.feedback.vaultSyncingDescription,
        };
      case "partial":
        return {
          state,
          title: messages.feedback.partialStateTitle,
          description: messages.feedback.partialStateDescription,
        };
      case "not_found":
        return {
          state,
          title: messages.pages.vaultDetail.notAvailableTitle,
          description: messages.pages.vaultDetail.notAvailableDescription,
        };
      case "error":
        return {
          state,
          title: messages.feedback.dataUnavailableTitle,
          description: messages.feedback.dataUnavailableDescription,
        };
      default:
        return {
          state,
          title: null,
          description: null,
        };
    }
  }, [freshness, hasPartialData, messages, metadataStatus, notFound, refreshState]);
};
