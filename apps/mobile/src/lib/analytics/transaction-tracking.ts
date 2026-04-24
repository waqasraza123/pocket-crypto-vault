import type {
  AnalyticsContext,
  AnalyticsEventName,
  AnalyticsEventPayload,
  ErrorClass,
  TransactionFlow,
  TransactionLifecycleEvent,
} from "@goal-vault/shared";

type TrackEvent = <Name extends AnalyticsEventName>(
  name: Name,
  payload: AnalyticsEventPayload<Name>,
  context?: Partial<AnalyticsContext>,
) => void;

export const trackTransactionLifecycle = ({
  track,
  flow,
  lifecycle,
  context,
  vaultAddress = null,
  txHash = null,
  errorClass = null,
  partialSuccess = false,
  syncFreshness = null,
}: {
  track: TrackEvent;
  flow: TransactionFlow;
  lifecycle: TransactionLifecycleEvent;
  context?: Partial<AnalyticsContext>;
  vaultAddress?: `0x${string}` | null;
  txHash?: `0x${string}` | null;
  errorClass?: ErrorClass | null;
  partialSuccess?: boolean;
  syncFreshness?: "current" | "syncing" | "lagging" | "unavailable" | null;
}) => {
  track(
    "transaction_lifecycle_updated",
    {
      flow,
      lifecycle,
      vaultAddress,
      txHash,
      errorClass,
      partialSuccess,
      syncFreshness,
    },
    {
      ...context,
      vaultAddress,
      txHash,
      syncFreshness,
    },
  );
};
