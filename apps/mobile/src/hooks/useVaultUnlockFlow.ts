import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { VaultDetail } from "../types";
import { createConnectionAnalyticsContext, trackTransactionLifecycle } from "../lib/analytics";
import { useAnalytics } from "./useAnalytics";
import { useWalletConnection } from "./useWalletConnection";
import { useWalletWriteProvider } from "../lib/blockchain/wallet";
import { classifyAnalyticsError } from "../lib/errors/analytics";
import { createUnlockActivityEvent, getUnlockActionLabel, type VaultUnlockAction } from "../lib/contracts/unlock-flow";
import { approveUnlockOnVault, cancelUnlockRequestOnVault, requestUnlockFromVault } from "../lib/contracts/vault-writes";
import { runPostTransactionRefresh } from "../lib/data/refresh-strategy";
import { buildTransactionRecoveryRecord, createRecoveryId } from "../lib/recovery/records";
import { removeTransactionRecoveryRecord, updateTransactionRecoveryRecord, upsertTransactionRecoveryRecord } from "../lib/recovery/store";
import { createUnlockFlowState, initialUnlockFlowState, upsertSessionVaultActivity } from "../state";
import { useWithdrawEligibility } from "./useWithdrawEligibility";

const isWalletRejectedError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string | number }).code) : "";

  return code === "4001" || message.includes("user rejected") || message.includes("user denied");
};

const getUnlockErrorMessage = (error: unknown) => {
  if (isWalletRejectedError(error)) {
    return "The wallet request was canceled before Pocket Vault could update this rule.";
  }

  return error instanceof Error ? error.message : "Pocket Vault could not update this rule right now.";
};

const isActionAllowed = ({
  action,
  canCancelUnlockRequest,
  canGuardianApprove,
  canGuardianReject,
  canRequestUnlock,
}: {
  action: VaultUnlockAction;
  canRequestUnlock: boolean;
  canCancelUnlockRequest: boolean;
  canGuardianApprove: boolean;
  canGuardianReject: boolean;
}) =>
  (action === "request" && canRequestUnlock) ||
  (action === "cancel" && canCancelUnlockRequest) ||
  (action === "approve" && canGuardianApprove) ||
  (action === "reject" && canGuardianReject);

export const useVaultUnlockFlow = (vault: VaultDetail | null) => {
  const { track } = useAnalytics();
  const { connectionState } = useWalletConnection();
  const provider = useWalletWriteProvider();
  const eligibility = useWithdrawEligibility(vault);
  const mountedRef = useRef(true);
  const previousConnectionStatusRef = useRef(connectionState.status);
  const retryActionRef = useRef<VaultUnlockAction | null>(null);
  const [state, setState] = useState(initialUnlockFlowState);
  const analyticsContext = useMemo(
    () => createConnectionAnalyticsContext(connectionState),
    [connectionState],
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (
      previousConnectionStatusRef.current === "ready" &&
      (connectionState.status === "disconnected" || connectionState.status === "walletUnavailable") &&
      (state.status === "awaiting_wallet_confirmation" ||
        state.status === "submitting" ||
        state.status === "confirming")
    ) {
      track(
        "degraded_state_viewed",
        {
          surface: "vault_detail",
          degradedEvent: "wallet_disconnected_mid_flow",
        },
        {
          ...analyticsContext,
          vaultAddress: vault?.address ?? null,
        },
      );
    }

    previousConnectionStatusRef.current = connectionState.status;
  }, [analyticsContext, connectionState.status, state.status, track, vault?.address]);

  useEffect(() => {
    retryActionRef.current = null;
    setState(initialUnlockFlowState);
  }, [connectionState.session?.address, connectionState.session?.chain?.id, vault?.address]);

  const applyState = useCallback((nextState: typeof initialUnlockFlowState) => {
    if (mountedRef.current) {
      setState(nextState);
    }
  }, []);

  const runAction = useCallback(
    async (action: VaultUnlockAction) => {
      let submittedTxHash: `0x${string}` | null = null;
      let recoveryId: string | null = null;

      retryActionRef.current = action;

      if (!vault || !eligibility) {
        applyState(
          createUnlockFlowState({
            status: "failed",
            action,
            errorMessage: "This vault action is not available right now.",
            isRetryable: true,
          }),
        );

        return null;
      }

      if (
        !isActionAllowed({
          action,
          canRequestUnlock: eligibility.canRequestUnlock,
          canCancelUnlockRequest: eligibility.canCancelUnlockRequest,
          canGuardianApprove: eligibility.canGuardianApprove,
          canGuardianReject: eligibility.canGuardianReject,
        })
      ) {
        applyState(
          createUnlockFlowState({
            status: "failed",
            action,
            errorMessage: eligibility.message,
            isRetryable: false,
          }),
        );

        return null;
      }

      if (!provider || connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
        applyState(
          createUnlockFlowState({
            status: "failed",
            action,
            errorMessage: "Connect a supported wallet before continuing.",
            isRetryable: true,
          }),
        );

        return null;
      }

      applyState(
        createUnlockFlowState({
          status: "awaiting_wallet_confirmation",
          action,
        }),
      );
      trackTransactionLifecycle({
        track,
        flow: "withdraw",
        lifecycle: "wallet_confirmation_requested",
        vaultAddress: vault.address,
        context: {
          ...analyticsContext,
          chainId: connectionState.session.chain.id,
        },
      });

      try {
        const result =
          action === "request"
            ? await requestUnlockFromVault({
                provider,
                chainId: connectionState.session.chain.id,
                actorAddress: connectionState.session.address,
                vaultAddress: vault.address,
                onSubmitted: (txHash) => {
                  submittedTxHash = txHash;
                  recoveryId = createRecoveryId({
                    kind: "unlock",
                    txHash,
                  });
                  void upsertTransactionRecoveryRecord(
                    buildTransactionRecoveryRecord({
                      kind: "unlock",
                      status: "submitted",
                      action: "wait",
                      chainId: connectionState.session!.chain!.id,
                      ownerAddress: connectionState.session!.address,
                      vaultAddress: vault.address,
                      txHash,
                      metadata: null,
                    }),
                  );
                  applyState(
                    createUnlockFlowState({
                      status: "confirming",
                      action,
                      txHash,
                    }),
                  );
                  trackTransactionLifecycle({
                    track,
                    flow: "withdraw",
                    lifecycle: "submitted",
                    vaultAddress: vault.address,
                    txHash,
                    context: {
                      ...analyticsContext,
                      chainId: connectionState.session!.chain!.id,
                    },
                  });
                },
              })
            : action === "cancel"
              ? await cancelUnlockRequestOnVault({
                  provider,
                  chainId: connectionState.session.chain.id,
                  actorAddress: connectionState.session.address,
                  vaultAddress: vault.address,
                  onSubmitted: (txHash) => {
                    submittedTxHash = txHash;
                    recoveryId = createRecoveryId({
                      kind: "unlock",
                      txHash,
                    });
                    void upsertTransactionRecoveryRecord(
                      buildTransactionRecoveryRecord({
                        kind: "unlock",
                        status: "submitted",
                        action: "wait",
                        chainId: connectionState.session!.chain!.id,
                        ownerAddress: connectionState.session!.address,
                        vaultAddress: vault.address,
                        txHash,
                        metadata: null,
                      }),
                    );
                    applyState(
                      createUnlockFlowState({
                        status: "confirming",
                        action,
                        txHash,
                      }),
                    );
                    trackTransactionLifecycle({
                      track,
                      flow: "withdraw",
                      lifecycle: "submitted",
                      vaultAddress: vault.address,
                      txHash,
                      context: {
                        ...analyticsContext,
                        chainId: connectionState.session!.chain!.id,
                      },
                    });
                  },
                })
              : await approveUnlockOnVault({
                  provider,
                  chainId: connectionState.session.chain.id,
                  actorAddress: connectionState.session.address,
                  vaultAddress: vault.address,
                  eventName: action === "approve" ? "GuardianApproved" : "GuardianRejected",
                  onSubmitted: (txHash) => {
                    submittedTxHash = txHash;
                    recoveryId = createRecoveryId({
                      kind: "unlock",
                      txHash,
                    });
                    void upsertTransactionRecoveryRecord(
                      buildTransactionRecoveryRecord({
                        kind: "unlock",
                        status: "submitted",
                        action: "wait",
                        chainId: connectionState.session!.chain!.id,
                        ownerAddress: connectionState.session!.address,
                        vaultAddress: vault.address,
                        txHash,
                        metadata: null,
                      }),
                    );
                    applyState(
                      createUnlockFlowState({
                        status: "confirming",
                        action,
                        txHash,
                      }),
                    );
                    trackTransactionLifecycle({
                      track,
                      flow: "withdraw",
                      lifecycle: "submitted",
                      vaultAddress: vault.address,
                      txHash,
                      context: {
                        ...analyticsContext,
                        chainId: connectionState.session!.chain!.id,
                      },
                    });
                  },
                });

        const occurredAt = result.event.occurredAt ?? new Date().toISOString();

        upsertSessionVaultActivity({
          chainId: connectionState.session.chain.id,
          ownerAddress: vault.ownerAddress,
          event: createUnlockActivityEvent({
            action,
            chainId: connectionState.session.chain.id,
            ownerAddress: vault.ownerAddress,
            txHash: result.txHash,
            vault,
            occurredAt,
          }),
        });
        trackTransactionLifecycle({
          track,
          flow: "withdraw",
          lifecycle: "syncing",
          vaultAddress: vault.address,
          txHash: result.txHash,
          context: {
            ...analyticsContext,
            chainId: connectionState.session.chain.id,
          },
          syncFreshness: "syncing",
        });
        await runPostTransactionRefresh({
          chainId: connectionState.session.chain.id,
          ownerAddress: vault.ownerAddress,
          vaultAddress: vault.address,
          flow: "withdraw",
          txHash: result.txHash,
        });

        applyState(
          createUnlockFlowState({
            status: "success",
            action,
            txHash: result.txHash,
            didConfirmOnchain: true,
          }),
        );
        trackTransactionLifecycle({
          track,
          flow: "withdraw",
          lifecycle: "completed",
          vaultAddress: vault.address,
          txHash: result.txHash,
          context: {
            ...analyticsContext,
            chainId: connectionState.session.chain.id,
          },
          syncFreshness: "current",
        });

        void removeTransactionRecoveryRecord(createRecoveryId({ kind: "unlock", txHash: result.txHash }));
        return result;
      } catch (error) {
        if (recoveryId && submittedTxHash) {
          void updateTransactionRecoveryRecord(recoveryId, (current) => ({
            ...current,
            status: "confirming",
            syncStatus: "pending",
            didConfirmOnchain: false,
            updatedAt: new Date().toISOString(),
          }));
        }

        applyState(
          createUnlockFlowState({
            status: "failed",
            action,
            txHash: submittedTxHash,
            errorMessage: getUnlockErrorMessage(error),
            isRetryable: true,
            didConfirmOnchain: Boolean(submittedTxHash),
          }),
        );
        trackTransactionLifecycle({
          track,
          flow: "withdraw",
          lifecycle: "failed",
          vaultAddress: vault?.address ?? null,
          txHash: submittedTxHash,
          errorClass: classifyAnalyticsError(error),
          context: {
            ...analyticsContext,
            chainId: connectionState.session?.chain?.id ?? null,
          },
        });

        return null;
      }
    },
    [analyticsContext, applyState, connectionState, eligibility, provider, track, vault],
  );

  const retry = useCallback(async () => {
    if (!retryActionRef.current) {
      return null;
    }

    track(
      "transaction_recovery_action",
      {
        flow: "withdraw",
        action: "retry",
      },
      {
        ...analyticsContext,
        vaultAddress: vault?.address ?? null,
      },
    );

    return runAction(retryActionRef.current);
  }, [analyticsContext, runAction, track, vault?.address]);

  const reset = useCallback(() => {
    retryActionRef.current = null;
    applyState(initialUnlockFlowState);
  }, [applyState]);

  return {
    state,
    status: state.status,
    message:
      state.status === "failed"
        ? state.errorMessage
        : state.status === "success" && state.action
          ? getUnlockActionLabel(state.action)
          : state.status === "awaiting_wallet_confirmation"
            ? "Confirm the wallet request to update this vault rule."
            : state.status === "confirming" || state.status === "submitting"
              ? "Pocket Vault is confirming the latest vault rule update."
              : null,
    txHash: state.txHash,
    isBusy:
      state.status === "awaiting_wallet_confirmation" ||
      state.status === "submitting" ||
      state.status === "confirming",
    canRequestUnlock: Boolean(eligibility?.canRequestUnlock),
    canCancelUnlockRequest: Boolean(eligibility?.canCancelUnlockRequest),
    canGuardianApprove: Boolean(eligibility?.canGuardianApprove),
    canGuardianReject: Boolean(eligibility?.canGuardianReject),
    requestUnlock: () => runAction("request"),
    cancelUnlockRequest: () => runAction("cancel"),
    approveUnlock: () => runAction("approve"),
    rejectUnlock: () => runAction("reject"),
    retry,
    reset,
  };
};
