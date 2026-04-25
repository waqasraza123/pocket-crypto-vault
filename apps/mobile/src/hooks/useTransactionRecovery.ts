import { useCallback, useEffect, useMemo } from "react";

import type { TransactionRecoveryRecord, TransactionRecoveryState } from "@goal-vault/shared";

import { createConnectionAnalyticsContext, trackTransactionLifecycle } from "../lib/analytics";
import { saveVaultMetadata } from "../lib/api/vaults";
import { runPostTransactionRefresh } from "../lib/data/refresh-strategy";
import { useWalletWriteProvider } from "../lib/blockchain/wallet";
import { getReadClient } from "../lib/blockchain/read-client";
import { resolveCreatedVaultAddress } from "../lib/contracts/resolve-created-vault";
import {
  getTransactionRecoveryRecords,
  removeTransactionRecoveryRecord,
  updateTransactionRecoveryRecord,
  upsertTransactionRecoveryRecord,
  useHydrateTransactionRecoveryStore,
  useTransactionRecoveryStoreVersion,
} from "../lib/recovery/store";
import { useAnalytics } from "./useAnalytics";
import { markSessionVaultMetadata, upsertSessionVaultMetadata } from "../state";
import { useWalletConnection } from "./useWalletConnection";

export const useTransactionRecovery = ({
  ownerAddress,
  vaultAddress,
}: {
  ownerAddress?: string | null;
  vaultAddress?: string | null;
} = {}) => {
  const { track } = useAnalytics();
  const { connectionState } = useWalletConnection();
  const provider = useWalletWriteProvider();
  const analyticsContext = useMemo(
    () => createConnectionAnalyticsContext(connectionState),
    [connectionState],
  );
  const version = useTransactionRecoveryStoreVersion();
  useHydrateTransactionRecoveryStore();

  const getRecoveryFlow = useCallback(
    (kind: TransactionRecoveryRecord["kind"]) =>
      kind === "create_vault" ? "create_vault" : kind === "deposit" ? "deposit" : "withdraw",
    [],
  );

  const items = useMemo(() => {
    return getTransactionRecoveryRecords().filter((item) => {
      if (ownerAddress && item.ownerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        return false;
      }

      if (vaultAddress && item.vaultAddress?.toLowerCase() !== vaultAddress.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [ownerAddress, vaultAddress, version]);

  useEffect(() => {
    const recover = async () => {
      if (connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
        return;
      }

      const session = connectionState.session;

      if (!session.chain) {
        return;
      }

      const sessionChain = session.chain;

      const recoverableItems = getTransactionRecoveryRecords().filter(
        (item) =>
          item.ownerAddress.toLowerCase() === session.address.toLowerCase() &&
          item.chainId === sessionChain.id &&
          (item.status === "submitted" || item.status === "confirming" || item.status === "confirmed" || item.status === "syncing"),
      );

      for (const item of recoverableItems) {
        const client = getReadClient(item.chainId);

        if (!client) {
          continue;
        }

        try {
          const receipt = await client.getTransactionReceipt({
            hash: item.txHash,
          });

          await updateTransactionRecoveryRecord(item.id, (current) => ({
            ...current,
            status: "syncing",
            syncStatus: "pending",
            didConfirmOnchain: receipt.status === "success",
            updatedAt: new Date().toISOString(),
          }));
          trackTransactionLifecycle({
            track,
            flow: getRecoveryFlow(item.kind),
            lifecycle: "syncing",
            vaultAddress: item.vaultAddress ?? null,
            txHash: item.txHash,
            context: {
              ...analyticsContext,
              chainId: item.chainId,
            },
            syncFreshness: "syncing",
          });

          if (item.kind === "create_vault" && !item.vaultAddress) {
            const resolution = await resolveCreatedVaultAddress({
              chainId: item.chainId,
              ownerAddress: item.ownerAddress,
              receipt,
            });

            if (resolution.status === "resolved" && resolution.vaultAddress && item.metadata) {
              upsertSessionVaultMetadata({
                contractAddress: resolution.vaultAddress,
                chainId: item.chainId,
                ownerWallet: item.ownerAddress,
                createdTxHash: item.txHash,
                displayName: item.metadata.displayName ?? "Goal Vault",
                category: item.metadata.category ?? undefined,
                note: item.metadata.note ?? undefined,
                accentTheme: item.metadata.accentTheme ?? undefined,
                targetAmount: item.metadata.targetAmount ?? "0",
                ruleType: item.metadata.ruleType ?? "timeLock",
                unlockDate: item.metadata.unlockDate ?? null,
                cooldownDurationSeconds: item.metadata.cooldownDurationSeconds ?? null,
                guardianAddress: item.metadata.guardianAddress ?? null,
                accentTone: item.metadata.accentTone ?? "#1E2B26",
              });
              const metadataResult = await saveVaultMetadata({
                payload: {
                  contractAddress: resolution.vaultAddress,
                  chainId: item.chainId,
                  ownerWallet: item.ownerAddress,
                  createdTxHash: item.txHash,
                  displayName: item.metadata.displayName ?? "Goal Vault",
                  category: item.metadata.category ?? undefined,
                  note: item.metadata.note ?? undefined,
                  accentTheme: item.metadata.accentTheme ?? undefined,
                  targetAmount: item.metadata.targetAmount ?? "0",
                  ruleType: item.metadata.ruleType ?? "timeLock",
                  unlockDate: item.metadata.unlockDate ?? null,
                  cooldownDurationSeconds: item.metadata.cooldownDurationSeconds ?? null,
                  guardianAddress: item.metadata.guardianAddress ?? null,
                },
                provider,
              });
              markSessionVaultMetadata({
                chainId: item.chainId,
                vaultAddress: resolution.vaultAddress,
                status: metadataResult.status,
              });

              await updateTransactionRecoveryRecord(item.id, (current) => ({
                ...current,
                vaultAddress: resolution.vaultAddress,
                syncStatus: metadataResult.status === "saved" ? "synced" : "failed",
                status: metadataResult.status === "saved" ? "completed" : "syncing",
                updatedAt: new Date().toISOString(),
              }));
              trackTransactionLifecycle({
                track,
                flow: "create_vault",
                lifecycle: metadataResult.status === "saved" ? "completed" : "partial_success",
                vaultAddress: resolution.vaultAddress,
                txHash: item.txHash,
                context: {
                  ...analyticsContext,
                  chainId: item.chainId,
                },
                partialSuccess: metadataResult.status !== "saved",
                syncFreshness: metadataResult.status === "saved" ? "current" : "syncing",
              });
            }
          }

          await runPostTransactionRefresh({
            chainId: item.chainId,
            ownerAddress: item.ownerAddress,
            vaultAddress: item.vaultAddress ?? null,
            flow: getRecoveryFlow(item.kind),
            txHash: item.txHash,
          });
        } catch {
          continue;
        }
      }
    };

    void recover();
  }, [analyticsContext, connectionState, getRecoveryFlow, provider, track, version]);

  const state: TransactionRecoveryState = useMemo(() => {
    if (items.length === 0) {
      return {
        status: "idle",
        items,
      };
    }

    if (items.some((item) => item.status === "failed")) {
      return {
        status: "action_required",
        items,
      };
    }

    if (items.every((item) => item.status === "completed")) {
      return {
        status: "completed",
        items,
      };
    }

    return {
      status: "recovering",
      items,
    };
  }, [items]);

  return {
    state,
    items,
    dismiss: async (id: string) => {
      const item = getTransactionRecoveryRecords().find((record) => record.id === id) ?? null;

      if (item) {
        track(
          "transaction_recovery_action",
          {
            flow: getRecoveryFlow(item.kind),
            action: "dismiss",
          },
          {
            ...analyticsContext,
            chainId: item.chainId,
            vaultAddress: item.vaultAddress ?? null,
            txHash: item.txHash,
          },
        );
      }

      return removeTransactionRecoveryRecord(id);
    },
    persist: async (record: TransactionRecoveryRecord) => upsertTransactionRecoveryRecord(record),
  };
};
