import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CreateVaultInput, CreateVaultResult, CreateVaultTransactionState, MetadataSaveResult } from "../types";
import { createConnectionAnalyticsContext, trackTransactionLifecycle } from "../lib/analytics";
import { useWalletConnection } from "./useWalletConnection";
import { useAnalytics } from "./useAnalytics";
import { useWalletWriteProvider } from "../lib/blockchain/wallet";
import { buildCreateVaultMetadataPayload, createVaultTransaction } from "../lib/contracts/create-vault";
import { buildCreateVaultReviewModel } from "../lib/contracts/mappers";
import { saveVaultMetadata } from "../lib/api/vaults";
import { runPostTransactionRefresh } from "../lib/data/refresh-strategy";
import { buildTransactionRecoveryRecord, createRecoveryId } from "../lib/recovery/records";
import { removeTransactionRecoveryRecord, updateTransactionRecoveryRecord, upsertTransactionRecoveryRecord } from "../lib/recovery/store";
import {
  getTransactionStatusCopy,
  createVaultTransactionState,
  initialCreateVaultTransactionState,
} from "../state/create-vault-state";
import {
  invalidateVaultQueries,
  markSessionVaultMetadata,
  upsertSessionVaultMetadata,
} from "../state/vault-store";
import { resolveCreatedVaultAddress } from "../lib/contracts/resolve-created-vault";
import { classifyAnalyticsError } from "../lib/errors/analytics";
import { getCurrentMessages } from "../lib/i18n";
import type { Hash, TransactionReceipt } from "viem";

type CreateVaultResultWithoutMetadata = Omit<CreateVaultResult, "metadataSave">;

type RetryState =
  | {
      kind: "create";
      values: CreateVaultInput;
    }
  | {
      kind: "resolution";
      values: CreateVaultInput;
      txHash: Hash;
      receipt: TransactionReceipt;
      review: CreateVaultResult["review"];
    }
  | {
      kind: "metadata";
      result: CreateVaultResultWithoutMetadata;
      payload: ReturnType<typeof buildCreateVaultMetadataPayload>;
    }
  | null;

const isWalletRejectedError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string | number }).code) : "";

  return code === "4001" || message.includes("user rejected") || message.includes("user denied");
};

const getErrorMessage = (error: unknown) => {
  const messages = getCurrentMessages().pages.createVault.runtime;

  if (isWalletRejectedError(error)) {
    return messages.walletRejected;
  }

  return error instanceof Error ? error.message : messages.createFailed;
};

export const useCreateVaultMutation = () => {
  const { track } = useAnalytics();
  const { connectionState } = useWalletConnection();
  const provider = useWalletWriteProvider();
  const [state, setState] = useState<CreateVaultTransactionState>(initialCreateVaultTransactionState);
  const [result, setResult] = useState<CreateVaultResult | null>(null);
  const retryStateRef = useRef<RetryState>(null);
  const mountedRef = useRef(true);
  const previousConnectionStatusRef = useRef(connectionState.status);
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
        state.status === "confirming" ||
        state.status === "metadata_saving")
    ) {
      track(
        "degraded_state_viewed",
        {
          surface: "create_vault",
          degradedEvent: "wallet_disconnected_mid_flow",
        },
        analyticsContext,
      );
    }

    previousConnectionStatusRef.current = connectionState.status;
  }, [analyticsContext, connectionState.status, state.status, track]);

  const applyState = useCallback((nextState: CreateVaultTransactionState) => {
    if (mountedRef.current) {
      setState(nextState);
    }
  }, []);

  const persistMetadata = useCallback(
    async ({
      payload,
      txHash,
      review,
    }: {
      payload: ReturnType<typeof buildCreateVaultMetadataPayload>;
      txHash: Hash;
      review: CreateVaultResult["review"];
    }): Promise<MetadataSaveResult> => {
      upsertSessionVaultMetadata({
        ...payload,
        txHash,
        accentTone: review.accentTone,
      });
      invalidateVaultQueries();

      applyState(
        createVaultTransactionState({
          status: "metadata_saving",
          txHash,
          vaultAddress: payload.contractAddress,
          didOnchainSucceed: true,
        }),
      );
      trackTransactionLifecycle({
        track,
        flow: "create_vault",
        lifecycle: "syncing",
        vaultAddress: payload.contractAddress,
        txHash,
        context: {
          ...analyticsContext,
          chainId: payload.chainId,
        },
        syncFreshness: "syncing",
      });

      const metadataSave = await saveVaultMetadata(payload);

      markSessionVaultMetadata({
        chainId: payload.chainId,
        vaultAddress: payload.contractAddress,
        status: metadataSave.status,
      });
      await runPostTransactionRefresh({
        chainId: payload.chainId,
        ownerAddress: payload.ownerWallet,
        vaultAddress: payload.contractAddress,
        flow: "create_vault",
        txHash,
      });

      return metadataSave;
    },
    [analyticsContext, applyState, track],
  );

  const submit = useCallback(
    async (values: CreateVaultInput) => {
      let submittedTxHash: Hash | null = null;
      let recoveryId: string | null = null;

      if (
        state.status === "awaiting_wallet_confirmation" ||
        state.status === "submitting" ||
        state.status === "confirming" ||
        state.status === "metadata_saving"
      ) {
        return null;
      }

      retryStateRef.current = {
        kind: "create",
        values,
      };

      if (connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
        const messages = getCurrentMessages().pages.createVault.runtime;

        applyState(
          createVaultTransactionState({
            status: "failed",
            errorMessage: messages.connectBeforeCreate,
            isRetryable: false,
          }),
        );

        return null;
      }

      if (!provider) {
        const messages = getCurrentMessages().pages.createVault.runtime;

        applyState(
          createVaultTransactionState({
            status: "failed",
            errorMessage: messages.providerUnavailable,
            isRetryable: true,
          }),
        );

        return null;
      }

      applyState(
        createVaultTransactionState({
          status: "validating",
        }),
      );
      trackTransactionLifecycle({
        track,
        flow: "create_vault",
        lifecycle: "started",
        context: analyticsContext,
      });
      trackTransactionLifecycle({
        track,
        flow: "create_vault",
        lifecycle: "wallet_confirmation_requested",
        context: analyticsContext,
      });

      try {
        const recoveryReview = buildCreateVaultReviewModel({
          chainId: connectionState.session.chain.id,
          values,
        });
        const txResult = await createVaultTransaction({
          provider,
          ownerAddress: connectionState.session.address,
          chainId: connectionState.session.chain.id,
          values,
          onSubmitted: (txHash) => {
            submittedTxHash = txHash;
            recoveryId = createRecoveryId({
              kind: "create_vault",
              txHash,
            });
            void upsertTransactionRecoveryRecord(
              buildTransactionRecoveryRecord({
                kind: "create_vault",
                status: "submitted",
                action: "wait",
                chainId: connectionState.session!.chain!.id,
                ownerAddress: connectionState.session!.address,
                txHash,
                amountAtomic: null,
                vaultAddress: null,
                metadata: {
                  displayName: recoveryReview.goalName,
                  category: recoveryReview.category ?? null,
                  note: recoveryReview.note || null,
                  accentTheme: recoveryReview.accentTheme ?? null,
                  accentTone: recoveryReview.accentTone,
                  targetAmount: recoveryReview.targetAmount.toString(),
                  unlockDate: recoveryReview.unlockDate,
                },
              }),
            );
            trackTransactionLifecycle({
              track,
              flow: "create_vault",
              lifecycle: "submitted",
              txHash,
              context: {
                ...analyticsContext,
                chainId: connectionState.session!.chain!.id,
              },
            });
            applyState(
              createVaultTransactionState({
                status: "submitting",
                txHash,
              }),
            );
          },
          onConfirming: (txHash) => {
            const nextRecoveryId = createRecoveryId({
              kind: "create_vault",
              txHash,
            });
            recoveryId = nextRecoveryId;
            void updateTransactionRecoveryRecord(nextRecoveryId, (current) => ({
              ...current,
              status: "confirming",
              syncStatus: "pending",
              updatedAt: new Date().toISOString(),
            }));
            trackTransactionLifecycle({
              track,
              flow: "create_vault",
              lifecycle: "confirming",
              txHash,
              context: {
                ...analyticsContext,
                chainId: connectionState.session!.chain!.id,
              },
            });
            applyState(
              createVaultTransactionState({
                status: "confirming",
                txHash,
              }),
            );
          },
        });

        applyState(
          createVaultTransactionState({
            status: "confirmed",
            txHash: txResult.txHash,
            didOnchainSucceed: true,
          }),
        );

        if (txResult.resolution.status !== "resolved" || !txResult.resolution.vaultAddress) {
          const messages = getCurrentMessages().pages.createVault.runtime;

          retryStateRef.current = {
            kind: "resolution",
            values,
            txHash: txResult.txHash,
            receipt: txResult.receipt,
            review: txResult.review,
          };

          applyState(
            createVaultTransactionState({
              status: "failed",
              txHash: txResult.txHash,
              didOnchainSucceed: true,
              isRetryable: true,
              errorMessage: txResult.resolution.message ?? messages.resolutionPending,
            }),
          );
          trackTransactionLifecycle({
            track,
            flow: "create_vault",
            lifecycle: "partial_success",
            txHash: txResult.txHash,
            errorClass: "onchain_resolution_failed",
            partialSuccess: true,
            context: {
              ...analyticsContext,
              chainId: connectionState.session.chain.id,
            },
          });

          void updateTransactionRecoveryRecord(createRecoveryId({ kind: "create_vault", txHash: txResult.txHash }), (current) => ({
            ...current,
            status: "confirmed",
            syncStatus: "pending",
            didConfirmOnchain: true,
            updatedAt: new Date().toISOString(),
          }));
          return null;
        }

        const payload = buildCreateVaultMetadataPayload({
          chainId: connectionState.session.chain.id,
          ownerAddress: connectionState.session.address,
          vaultAddress: txResult.resolution.vaultAddress,
          review: txResult.review,
        });
        const metadataSave = await persistMetadata({
          payload,
          txHash: txResult.txHash,
          review: txResult.review,
        });

        const nextResult: CreateVaultResult = {
          chainId: connectionState.session.chain.id,
          ownerAddress: connectionState.session.address,
          txHash: txResult.txHash,
          vaultAddress: txResult.resolution.vaultAddress,
          review: txResult.review,
          resolution: txResult.resolution,
          metadataSave,
        };

        setResult(nextResult);
        track(
          "vault_created_confirmed",
          {
            vaultAddress: nextResult.vaultAddress,
            metadataStatus: metadataSave.status === "saved" ? "saved" : "failed",
          },
          {
            ...analyticsContext,
            chainId: connectionState.session.chain.id,
            vaultAddress: nextResult.vaultAddress,
            txHash: nextResult.txHash,
          },
        );

        if (metadataSave.status === "failed") {
          const messages = getCurrentMessages().pages.createVault.runtime;
          const { metadataSave: _metadataSave, ...resultWithoutMetadata } = nextResult;
          retryStateRef.current = {
            kind: "metadata",
            result: resultWithoutMetadata,
            payload,
          };

          applyState(
            createVaultTransactionState({
              status: "failed",
              txHash: nextResult.txHash,
              vaultAddress: nextResult.vaultAddress,
              didOnchainSucceed: true,
              isRetryable: true,
              errorMessage: metadataSave.message ?? messages.metadataPending,
              metadataSave,
            }),
          );
          trackTransactionLifecycle({
            track,
            flow: "create_vault",
            lifecycle: "partial_success",
            vaultAddress: nextResult.vaultAddress,
            txHash: nextResult.txHash,
            errorClass: "metadata_sync_delayed",
            partialSuccess: true,
            context: {
              ...analyticsContext,
              chainId: connectionState.session.chain.id,
            },
            syncFreshness: "syncing",
          });

          void updateTransactionRecoveryRecord(createRecoveryId({ kind: "create_vault", txHash: nextResult.txHash }), (current) => ({
            ...current,
            vaultAddress: nextResult.vaultAddress,
            status: "syncing",
            syncStatus: "failed",
            didConfirmOnchain: true,
            updatedAt: new Date().toISOString(),
          }));
          return nextResult;
        }

        retryStateRef.current = null;
        void removeTransactionRecoveryRecord(createRecoveryId({ kind: "create_vault", txHash: nextResult.txHash }));
        applyState(
          createVaultTransactionState({
            status: "success",
            txHash: nextResult.txHash,
            vaultAddress: nextResult.vaultAddress,
            didOnchainSucceed: true,
            metadataSave,
          }),
        );
        trackTransactionLifecycle({
          track,
          flow: "create_vault",
          lifecycle: "completed",
          vaultAddress: nextResult.vaultAddress,
          txHash: nextResult.txHash,
          context: {
            ...analyticsContext,
            chainId: connectionState.session.chain.id,
          },
          syncFreshness: metadataSave.status === "saved" ? "current" : "syncing",
        });

        return nextResult;
      } catch (error) {
        if (recoveryId && submittedTxHash) {
          void updateTransactionRecoveryRecord(recoveryId, (current) => ({
            ...current,
            status: "confirming",
            syncStatus: "pending",
            updatedAt: new Date().toISOString(),
          }));
        }
        applyState(
          createVaultTransactionState({
            status: "failed",
            errorMessage: getErrorMessage(error),
            isRetryable: true,
          }),
        );
        trackTransactionLifecycle({
          track,
          flow: "create_vault",
          lifecycle: "failed",
          txHash: submittedTxHash,
          errorClass: classifyAnalyticsError(error),
          context: analyticsContext,
        });

        return null;
      }
    },
    [analyticsContext, applyState, connectionState, persistMetadata, provider, state.status, track],
  );

  const retry = useCallback(async () => {
    const retryState = retryStateRef.current;
    const messages = getCurrentMessages().pages.createVault.runtime;

    if (!retryState) {
      return null;
    }

    track(
      "transaction_recovery_action",
      {
        flow: "create_vault",
        action: "retry",
      },
      analyticsContext,
    );

    if (retryState.kind === "create") {
      return submit(retryState.values);
    }

    if (connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
      applyState(
        createVaultTransactionState({
          status: "failed",
          didOnchainSucceed: true,
          errorMessage: messages.connectBeforeCreate,
          isRetryable: true,
        }),
      );
      trackTransactionLifecycle({
        track,
        flow: "create_vault",
        lifecycle: "failed",
        errorClass: "wallet_unavailable",
        context: analyticsContext,
      });

      return null;
    }

    if (retryState.kind === "resolution") {
      applyState(
        createVaultTransactionState({
          status: "confirmed",
          txHash: retryState.txHash,
          didOnchainSucceed: true,
        }),
      );

      const resolution = await resolveCreatedVaultAddress({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        receipt: retryState.receipt,
      });

      if (resolution.status !== "resolved" || !resolution.vaultAddress) {
        applyState(
          createVaultTransactionState({
            status: "failed",
            txHash: retryState.txHash,
            didOnchainSucceed: true,
            isRetryable: true,
            errorMessage: resolution.message ?? messages.resolutionPending,
          }),
        );
        trackTransactionLifecycle({
          track,
          flow: "create_vault",
          lifecycle: "partial_success",
          txHash: retryState.txHash,
          errorClass: "onchain_resolution_failed",
          partialSuccess: true,
          context: analyticsContext,
        });

        return null;
      }

      const payload = buildCreateVaultMetadataPayload({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        vaultAddress: resolution.vaultAddress,
        review: retryState.review,
      });
      const metadataSave = await persistMetadata({
        payload,
        txHash: retryState.txHash,
        review: retryState.review,
      });
      const nextResult: CreateVaultResult = {
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        txHash: retryState.txHash,
        vaultAddress: resolution.vaultAddress,
        review: retryState.review,
        resolution,
        metadataSave,
      };

      setResult(nextResult);
      track(
        "vault_created_confirmed",
        {
          vaultAddress: nextResult.vaultAddress,
          metadataStatus: metadataSave.status === "saved" ? "saved" : "failed",
        },
        {
          ...analyticsContext,
          chainId: connectionState.session.chain.id,
          vaultAddress: nextResult.vaultAddress,
          txHash: retryState.txHash,
        },
      );

      if (metadataSave.status === "failed") {
        const { metadataSave: _metadataSave, ...resultWithoutMetadata } = nextResult;
        retryStateRef.current = {
          kind: "metadata",
          result: resultWithoutMetadata,
          payload,
        };

        applyState(
          createVaultTransactionState({
            status: "failed",
            txHash: nextResult.txHash,
            vaultAddress: nextResult.vaultAddress,
            didOnchainSucceed: true,
            isRetryable: true,
            errorMessage: metadataSave.message ?? messages.metadataPending,
            metadataSave,
          }),
        );
        trackTransactionLifecycle({
          track,
          flow: "create_vault",
          lifecycle: "partial_success",
          vaultAddress: nextResult.vaultAddress,
          txHash: retryState.txHash,
          errorClass: "metadata_sync_delayed",
          partialSuccess: true,
          context: analyticsContext,
          syncFreshness: "syncing",
        });

        return nextResult;
      }

      retryStateRef.current = null;
      applyState(
        createVaultTransactionState({
          status: "success",
          txHash: nextResult.txHash,
          vaultAddress: nextResult.vaultAddress,
          didOnchainSucceed: true,
          metadataSave,
        }),
      );
      trackTransactionLifecycle({
        track,
        flow: "create_vault",
        lifecycle: "completed",
        vaultAddress: nextResult.vaultAddress,
        txHash: retryState.txHash,
        context: analyticsContext,
        syncFreshness: metadataSave.status === "saved" ? "current" : "syncing",
      });

      return nextResult;
    }

    const metadataSave = await persistMetadata({
      payload: retryState.payload,
      txHash: retryState.result.txHash,
      review: retryState.result.review,
    });
    const nextResult: CreateVaultResult = {
      ...retryState.result,
      metadataSave,
    };

    setResult(nextResult);

    if (metadataSave.status === "failed") {
      applyState(
        createVaultTransactionState({
          status: "failed",
          txHash: nextResult.txHash,
          vaultAddress: nextResult.vaultAddress,
          didOnchainSucceed: true,
          isRetryable: true,
          errorMessage: metadataSave.message ?? messages.metadataPending,
          metadataSave,
        }),
      );
      trackTransactionLifecycle({
        track,
        flow: "create_vault",
        lifecycle: "partial_success",
        vaultAddress: nextResult.vaultAddress,
        txHash: nextResult.txHash,
        errorClass: "metadata_sync_delayed",
        partialSuccess: true,
        context: analyticsContext,
        syncFreshness: "syncing",
      });

      return nextResult;
    }

    retryStateRef.current = null;
    void removeTransactionRecoveryRecord(createRecoveryId({ kind: "create_vault", txHash: nextResult.txHash }));
    applyState(
      createVaultTransactionState({
        status: "success",
        txHash: nextResult.txHash,
        vaultAddress: nextResult.vaultAddress,
        didOnchainSucceed: true,
        metadataSave,
      }),
    );
    trackTransactionLifecycle({
      track,
      flow: "create_vault",
      lifecycle: "completed",
      vaultAddress: nextResult.vaultAddress,
      txHash: nextResult.txHash,
      context: analyticsContext,
      syncFreshness: "current",
    });

    return nextResult;
  }, [analyticsContext, applyState, connectionState, persistMetadata, submit, track]);

  const reset = useCallback(() => {
    retryStateRef.current = null;
    setResult(null);
    applyState(initialCreateVaultTransactionState);
  }, [applyState]);

  return {
    state,
    statusCopy: getTransactionStatusCopy(state),
    result,
    submit,
    retry,
    reset,
    isBusy:
      state.status === "validating" ||
      state.status === "awaiting_wallet_confirmation" ||
      state.status === "submitting" ||
      state.status === "confirming" ||
      state.status === "metadata_saving",
  };
};
