import { useEffect, useMemo, useState } from "react";

import type { VaultDetail } from "../types";
import { useWalletConnection } from "./useWalletConnection";
import { buildWithdrawEligibility } from "../lib/contracts/withdraw-flow";

export const useWithdrawEligibility = (vault: VaultDetail | null) => {
  const { connectionState } = useWalletConnection();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!vault) {
      return;
    }

    const nextUnlockMs =
      vault.ruleSummary.type === "timeLock"
        ? Date.parse(vault.ruleSummary.unlockDate)
        : vault.ruleSummary.type === "cooldownUnlock"
          ? vault.ruleSummary.unlockEligibleTimestampMs ?? 0
          : 0;

    if (!Number.isFinite(nextUnlockMs) || nextUnlockMs <= nowMs) {
      return;
    }

    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [nowMs, vault]);

  return useMemo(
    () =>
      buildWithdrawEligibility({
        vault,
        connectionStatus: connectionState.status,
        connectedAddress: connectionState.session?.address ?? null,
        activeChainId: connectionState.session?.chain?.id ?? null,
        nowMs,
      }),
    [connectionState.session?.address, connectionState.session?.chain?.id, connectionState.status, nowMs, vault],
  );
};
