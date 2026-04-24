import type { SupportedChainId, SyncFreshnessSnapshot, VaultMetadataStatus, VaultAddress } from "@goal-vault/shared";
import type { Address, Hash } from "viem";

import { triggerIndexerSync } from "../api/sync-status";
import {
  advancePostTransactionRefresh,
  completePostTransactionRefresh,
  invalidateVaultQueries,
  startPostTransactionRefresh,
} from "../../state/vault-store";
import { queryKeys } from "./query-keys";

const refreshTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

const clearRefreshTimers = (scopeKey: string) => {
  const timers = refreshTimers.get(scopeKey) ?? [];

  for (const timer of timers) {
    clearTimeout(timer);
  }

  refreshTimers.delete(scopeKey);
};

const createScopeKey = ({
  chainId,
  ownerAddress,
  vaultAddress,
}: {
  chainId: SupportedChainId;
  ownerAddress?: Address | null;
  vaultAddress?: VaultAddress | null;
}) =>
  vaultAddress
    ? queryKeys.vaultDetail({
        chainId,
        vaultAddress,
      })
    : queryKeys.ownerVaults({
        chainId,
        ownerAddress: (ownerAddress ?? "0x0000000000000000000000000000000000000000") as Address,
      });

export const runPostTransactionRefresh = async ({
  chainId,
  ownerAddress,
  vaultAddress,
  flow,
  txHash,
}: {
  chainId: SupportedChainId;
  ownerAddress?: Address | null;
  vaultAddress?: VaultAddress | null;
  flow: "create_vault" | "deposit" | "withdraw";
  txHash?: Hash | null;
}) => {
  const scopeKey = createScopeKey({
    chainId,
    ownerAddress,
    vaultAddress,
  });

  clearRefreshTimers(scopeKey);
  startPostTransactionRefresh({
    chainId,
    ownerAddress: ownerAddress ?? null,
    vaultAddress: vaultAddress ?? null,
    flow,
    txHash: txHash ?? null,
  });
  invalidateVaultQueries();
  await triggerIndexerSync({
    chainId,
    mode: "all",
  });

  const timers = [
    setTimeout(() => {
      advancePostTransactionRefresh({
        chainId,
        ownerAddress,
        vaultAddress,
      });
      invalidateVaultQueries();
    }, 1500),
    setTimeout(() => {
      completePostTransactionRefresh({
        chainId,
        ownerAddress,
        vaultAddress,
      });
      invalidateVaultQueries();
      clearRefreshTimers(scopeKey);
    }, 6500),
  ];

  refreshTimers.set(scopeKey, timers);
};

export const settlePostTransactionRefreshIfCurrent = ({
  chainId,
  ownerAddress,
  vaultAddress,
  freshness,
  metadataStatus,
}: {
  chainId?: SupportedChainId | null;
  ownerAddress?: Address | null;
  vaultAddress?: VaultAddress | null;
  freshness?: SyncFreshnessSnapshot | null;
  metadataStatus?: VaultMetadataStatus;
}) => {
  if (!chainId || !freshness || freshness.freshness !== "current" || metadataStatus === "pending") {
    return;
  }

  const scopeKey = createScopeKey({
    chainId,
    ownerAddress,
    vaultAddress,
  });

  clearRefreshTimers(scopeKey);
  completePostTransactionRefresh({
    chainId,
    ownerAddress,
    vaultAddress,
  });
  invalidateVaultQueries();
};
