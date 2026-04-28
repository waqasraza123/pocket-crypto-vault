import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { Platform } from "react-native";

import type {
  AnalyticsBatchRequest,
  AnalyticsContext,
  AnalyticsEventName,
  AnalyticsEventPayload,
  AnalyticsProviderState,
} from "@pocket-vault/shared";
import { analyticsEventCategoryMap } from "@pocket-vault/shared";

import { clientEnv } from "../env/client";

type TrackAnalyticsEvent = <Name extends AnalyticsEventName>(
  name: Name,
  payload: AnalyticsEventPayload<Name>,
  context?: Partial<AnalyticsContext>,
) => void;

interface AnalyticsContextValue {
  providerState: AnalyticsProviderState;
  trackEvent: TrackAnalyticsEvent;
}

const AnalyticsContextObject = createContext<AnalyticsContextValue | null>(null);

const createBaseContext = (context?: Partial<AnalyticsContext>): AnalyticsContext => ({
  platform: Platform.OS === "ios" || Platform.OS === "android" || Platform.OS === "web" ? Platform.OS : "web",
  route: context?.route ?? "/",
  environment: clientEnv.environment,
  deploymentTarget: clientEnv.deploymentTarget,
  chainId: context?.chainId ?? null,
  walletStatus: context?.walletStatus ?? null,
  syncFreshness: context?.syncFreshness ?? null,
  vaultAddress: context?.vaultAddress ?? null,
  txHash: context?.txHash ?? null,
});

export const AnalyticsProvider = ({ children }: PropsWithChildren) => {
  const [lastError, setLastError] = useState<string | null>(null);

  const providerState = useMemo<AnalyticsProviderState>(
    () => ({
      status: clientEnv.analyticsMode,
      enabled: clientEnv.analyticsEnabled,
      endpoint: clientEnv.analyticsEndpoint,
      lastError,
    }),
    [lastError],
  );

  const trackEvent = useCallback<TrackAnalyticsEvent>(
    (name, payload, context) => {
      const envelope = {
        name,
        category: analyticsEventCategoryMap[name],
        occurredAt: new Date().toISOString(),
        context: createBaseContext(context),
        payload,
      };

      if (!clientEnv.analyticsEnabled || clientEnv.analyticsMode === "disabled") {
        return;
      }

      if (clientEnv.analyticsMode === "local_log" || !clientEnv.analyticsEndpoint) {
        console.info("[pocket-vault-analytics]", envelope);
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), clientEnv.apiTimeoutMs);
      const body: AnalyticsBatchRequest = {
        events: [envelope],
      };

      void fetch(clientEnv.analyticsEndpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Analytics request failed with ${response.status}.`);
          }

          if (lastError) {
            setLastError(null);
          }
        })
        .catch((error) => {
          setLastError(error instanceof Error ? error.message : "Analytics request failed.");
        })
        .finally(() => {
          clearTimeout(timeout);
        });
    },
    [lastError],
  );

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      providerState,
      trackEvent,
    }),
    [providerState, trackEvent],
  );

  return <AnalyticsContextObject.Provider value={value}>{children}</AnalyticsContextObject.Provider>;
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContextObject);

  if (!context) {
    throw new Error("Analytics provider is missing.");
  }

  return context;
};
