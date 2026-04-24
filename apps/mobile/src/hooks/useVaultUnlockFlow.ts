import { useCallback, useMemo, useState } from "react";

import type { VaultDetail } from "../types";
import type { VaultActivityEventType } from "@goal-vault/shared";
import { useWalletConnection } from "./useWalletConnection";
import { useWalletWriteProvider } from "../lib/blockchain/wallet";
import { approveUnlockOnVault, cancelUnlockRequestOnVault, requestUnlockFromVault } from "../lib/contracts/vault-writes";
import { runPostTransactionRefresh } from "../lib/data/refresh-strategy";
import { upsertSessionVaultActivity } from "../state";

type UnlockFlowStatus = "idle" | "submitting" | "success" | "failed";

export const useVaultUnlockFlow = (vault: VaultDetail | null) => {
  const { connectionState } = useWalletConnection();
  const provider = useWalletWriteProvider();
  const [status, setStatus] = useState<UnlockFlowStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const recordSessionEvent = useCallback(
    ({
      type,
      occurredAt,
      txHash: nextTxHash,
    }: {
      type: VaultActivityEventType;
      occurredAt: string;
      txHash: `0x${string}`;
    }) => {
      if (!vault || connectionState.status !== "ready" || !connectionState.session?.chain) {
        return;
      }

      upsertSessionVaultActivity({
        chainId: connectionState.session.chain.id,
        ownerAddress: vault.ownerAddress,
        event: {
          id: `${nextTxHash.toLowerCase()}:${type}`,
          vaultAddress: vault.address,
          chainId: connectionState.session.chain.id,
          type,
          title:
            type === "unlock_requested"
              ? "Unlock requested"
              : type === "unlock_canceled"
                ? "Unlock request canceled"
                : type === "guardian_approved"
                  ? "Guardian approved"
                  : "Guardian rejected",
          subtitle: vault.goalName,
          occurredAt,
          txHash: nextTxHash,
          source: "session",
        },
      });
    },
    [connectionState, vault],
  );

  const runAction = useCallback(
    async ({
      action,
    }: {
      action: "request" | "cancel" | "approve" | "reject";
    }) => {
      if (!vault || connectionState.status !== "ready" || !connectionState.session?.chain || !provider) {
        setStatus("failed");
        setMessage("Connect a supported wallet before continuing.");
        return null;
      }

      setStatus("submitting");
      setMessage(null);
      setTxHash(null);

      try {
        const result =
          action === "request"
            ? await requestUnlockFromVault({
                provider,
                chainId: connectionState.session.chain.id,
                actorAddress: connectionState.session.address,
                vaultAddress: vault.address,
              })
            : action === "cancel"
              ? await cancelUnlockRequestOnVault({
                  provider,
                  chainId: connectionState.session.chain.id,
                  actorAddress: connectionState.session.address,
                  vaultAddress: vault.address,
                })
              : await approveUnlockOnVault({
                  provider,
                  chainId: connectionState.session.chain.id,
                  actorAddress: connectionState.session.address,
                  vaultAddress: vault.address,
                  eventName: action === "approve" ? "GuardianApproved" : "GuardianRejected",
                });

        setTxHash(result.txHash);
        setStatus("success");
        setMessage(
          action === "request"
            ? "Unlock requested."
            : action === "cancel"
              ? "Unlock request canceled."
              : action === "approve"
                ? "Guardian approval submitted."
                : "Guardian rejection submitted.",
        );

        const occurredAt = result.event.occurredAt ?? new Date().toISOString();

        recordSessionEvent({
          type:
            action === "request"
              ? "unlock_requested"
              : action === "cancel"
                ? "unlock_canceled"
                : action === "approve"
                  ? "guardian_approved"
                  : "guardian_rejected",
          occurredAt,
          txHash: result.txHash,
        });

        await runPostTransactionRefresh({
          chainId: connectionState.session.chain.id,
          ownerAddress: vault.ownerAddress,
          vaultAddress: vault.address,
          flow: "withdraw",
          txHash: result.txHash,
        });

        return result;
      } catch (error) {
        setStatus("failed");
        setMessage(error instanceof Error ? error.message : "This action could not be completed right now.");
        return null;
      }
    },
    [connectionState, provider, recordSessionEvent, vault],
  );

  return {
    status,
    message,
    txHash,
    isBusy: status === "submitting",
    canRequestUnlock: Boolean(vault?.withdrawEligibility.canRequestUnlock),
    canCancelUnlockRequest: Boolean(vault?.withdrawEligibility.canCancelUnlockRequest),
    canGuardianApprove: Boolean(vault?.withdrawEligibility.canGuardianApprove),
    canGuardianReject: Boolean(vault?.withdrawEligibility.canGuardianReject),
    requestUnlock: () => runAction({ action: "request" }),
    cancelUnlockRequest: () => runAction({ action: "cancel" }),
    approveUnlock: () => runAction({ action: "approve" }),
    rejectUnlock: () => runAction({ action: "reject" }),
    reset: () => {
      setStatus("idle");
      setMessage(null);
      setTxHash(null);
    },
  };
};
