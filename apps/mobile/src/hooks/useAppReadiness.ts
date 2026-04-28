import { useEffect, useMemo, useState } from "react";

import type { AppReadinessState } from "@pocket-vault/shared";

import { fetchApiHealth } from "../lib/api/health";
import { buildAppReadinessState, createBaseReadinessState } from "../lib/readiness/app-readiness";
import { useWalletConnection } from "./useWalletConnection";

export const useAppReadiness = () => {
  const { connectionState } = useWalletConnection();
  const [apiState, setApiState] = useState<AppReadinessState["api"] | null>(null);
  const [stagingState, setStagingState] = useState<AppReadinessState["staging"] | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadHealth = async () => {
      const result = await fetchApiHealth();

      if (!isActive) {
        return;
      }

      if (result.status === "success" && result.data) {
        setApiState(result.data.api);
        setStagingState(result.data.staging);
        return;
      }

      const baseState = createBaseReadinessState();
      setApiState({
        ...baseState.api,
        status: result.status === "unavailable" ? "unavailable" : "degraded",
        message: result.message,
      });
      setStagingState(baseState.staging);
    };

    void loadHealth();

    return () => {
      isActive = false;
    };
  }, []);

  const readiness = useMemo(
    () =>
      buildAppReadinessState({
        apiHealth: apiState,
        connectionState,
        staging: stagingState,
      }),
    [apiState, connectionState, stagingState],
  );

  return {
    readiness,
    primaryIssue: readiness.issues[0] ?? null,
  };
};
