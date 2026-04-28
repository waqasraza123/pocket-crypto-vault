import { usePathname } from "expo-router";
import { useCallback } from "react";

import type { AnalyticsContext, AnalyticsEventName, AnalyticsEventPayload } from "@pocket-vault/shared";

import { useAnalyticsContext } from "../lib/analytics/provider";

export const useAnalytics = () => {
  const pathname = usePathname();
  const { providerState, trackEvent } = useAnalyticsContext();

  const track = useCallback(
    <Name extends AnalyticsEventName>(
      name: Name,
      payload: AnalyticsEventPayload<Name>,
      context?: Partial<AnalyticsContext>,
    ) => {
      trackEvent(name, payload, {
        route: pathname || "/",
        ...context,
      });
    },
    [pathname, trackEvent],
  );

  return {
    providerState,
    track,
  };
};
