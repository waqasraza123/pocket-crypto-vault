import { useEffect, useRef } from "react";

import type { AnalyticsContext, AnalyticsEventName, AnalyticsEventPayload } from "@goal-vault/shared";

import { useAnalytics } from "../../hooks/useAnalytics";

export const useScreenTracking = <Name extends AnalyticsEventName>(
  name: Name,
  payload: AnalyticsEventPayload<Name>,
  key: string,
  context?: Partial<AnalyticsContext>,
) => {
  const { track } = useAnalytics();
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastKeyRef.current === key) {
      return;
    }

    lastKeyRef.current = key;
    track(name, payload, context);
  }, [context, key, name, payload, track]);
};

export const useTrackEventWhen = <Name extends AnalyticsEventName>({
  name,
  payload,
  when,
  key,
  context,
}: {
  name: Name;
  payload: AnalyticsEventPayload<Name>;
  when: boolean;
  key: string;
  context?: Partial<AnalyticsContext>;
}) => {
  const { track } = useAnalytics();
  const firedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!when || firedKeysRef.current.has(key)) {
      return;
    }

    firedKeysRef.current.add(key);
    track(name, payload, context);
  }, [context, key, name, payload, track, when]);
};
