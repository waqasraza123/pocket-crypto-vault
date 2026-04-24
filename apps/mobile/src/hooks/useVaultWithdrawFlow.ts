import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { VaultDetail, WithdrawFlowState } from "../types";
import { createConnectionAnalyticsContext, trackTransactionLifecycle } from "../lib/analytics";
import { triggerIndexerSync } from "../lib/api/sync-status";
import { useAnalytics } from "./useAnalytics";
import { useWalletConnection } from "./useWalletConnection";
import { useWalletWriteProvider } from "../lib/blockchain/wallet";
import { classifyAnalyticsError } from "../lib/errors/analytics";
import { getCurrentMessages, useI18n } from "../lib/i18n";
import { buildTransactionRecoveryRecord, createRecoveryId } from "../lib/recovery/records";
import { removeTransactionRecoveryRecord, updateTransactionRecoveryRecord, upsertTransactionRecoveryRecord } from "../lib/recovery/store";
import { useWithdrawEligibility } from "./useWithdrawEligibility";
import {
  buildWithdrawPreview,
  formatAtomicUsdcToNumber,
  formatTokenAmountForInput,
  parseUsdcAmountInput,
} from "../lib/contracts/amount-utils";
import { createWithdrawResult, createWithdrawalActivityEvent } from "../lib/contracts/withdraw-flow";
import { withdrawFromVault } from "../lib/contracts/vault-writes";
import {
  createWithdrawFlowState,
  getWithdrawFlowStatusCopy,
  initialWithdrawFlowState,
  invalidateVaultQueries,
  mapWithdrawFlowState,
  upsertSessionVaultActivity,
} from "../state";

const isWalletRejectedError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string | number }).code) : "";

  return code === "4001" || message.includes("user rejected") || message.includes("user denied");
};

const getWithdrawErrorMessage = (error: unknown) => {
  const messages = getCurrentMessages().withdraw.errors;

  if (isWalletRejectedError(error)) {
    return messages.rejected;
  }

  return error instanceof Error ? error.message : messages.failed;
};

export const useVaultWithdrawFlow = (vault: VaultDetail | null) => {
  const { messages } = useI18n();
  const { track } = useAnalytics();
  const { connectionState } = useWalletConnection();
  const provider = useWalletWriteProvider();
  const eligibility = useWithdrawEligibility(vault);
  const mountedRef = useRef(true);
  const previousConnectionStatusRef = useRef(connectionState.status);
  const [amountInput, setAmountInputState] = useState("");
  const [flowState, setFlowState] = useState<WithdrawFlowState>(initialWithdrawFlowState);
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
      (flowState.status === "awaiting_wallet_confirmation" ||
        flowState.status === "submitting" ||
        flowState.status === "confirming")
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
  }, [analyticsContext, connectionState.status, flowState.status, track, vault?.address]);

  useEffect(() => {
    setAmountInputState("");
    setFlowState(initialWithdrawFlowState);
  }, [connectionState.session?.address, connectionState.session?.chain?.id, vault?.address]);

  const parsedAmount = useMemo(() => {
    return parseUsdcAmountInput({
      value: amountInput,
      decimals: 6,
      messages: {
        amountPrompt: messages.withdraw.amountPrompt,
        amountInvalid: messages.withdraw.amountInvalid,
        amountDecimals: messages.withdraw.amountDecimals,
        amountPositive: messages.withdraw.amountPositive,
      },
    });
  }, [
    amountInput,
    messages.withdraw.amountDecimals,
    messages.withdraw.amountInvalid,
    messages.withdraw.amountPositive,
    messages.withdraw.amountPrompt,
  ]);

  const amountAtomic = parsedAmount.status === "ready" ? parsedAmount.value.atomic : null;
  const amountDecimal = parsedAmount.status === "ready" ? parsedAmount.value.decimal : null;

  const validationMessage = useMemo(() => {
    if (!eligibility) {
      return messages.pages.vaultDetail.notAvailableDescription;
    }

    if (!amountInput.trim()) {
      return eligibility.canWithdraw ? messages.withdraw.amountHelper : eligibility.message;
    }

    if (!eligibility.canWithdraw) {
      return eligibility.message;
    }

    if (parsedAmount.status === "invalid") {
      return parsedAmount.message;
    }

    if (amountAtomic !== null && amountAtomic > eligibility.availableAmountAtomic) {
      return messages.withdraw.amountTooHigh;
    }

    return null;
  }, [
    amountAtomic,
    amountInput,
    eligibility,
    messages.pages.vaultDetail.notAvailableDescription,
    messages.withdraw.amountHelper,
    messages.withdraw.amountTooHigh,
    parsedAmount,
  ]);

  const derivedState = useMemo(
    () =>
      mapWithdrawFlowState({
        currentState: flowState,
        eligibility,
        hasAmountInput: amountInput.trim().length > 0,
        validationMessage: amountInput.trim().length > 0 ? validationMessage : null,
        amountAtomic,
      }),
    [amountAtomic, amountInput, eligibility, flowState, validationMessage],
  );

  const withdrawPreview = useMemo(() => {
    if (!vault || !eligibility?.canWithdraw || amountAtomic === null || validationMessage) {
      return null;
    }

    return buildWithdrawPreview({
      vault,
      amountAtomic,
      decimals: 6,
    });
  }, [amountAtomic, eligibility?.canWithdraw, validationMessage, vault]);

  const statusCopy = useMemo(() => getWithdrawFlowStatusCopy(derivedState), [derivedState]);

  const applyState = useCallback((nextState: WithdrawFlowState) => {
    if (mountedRef.current) {
      setFlowState(nextState);
    }
  }, []);

  const executeWithdraw = useCallback(async () => {
    let submittedTxHash: `0x${string}` | null = null;
    let recoveryId: string | null = null;

    if (!vault || !eligibility || !eligibility.canWithdraw) {
      applyState(
        createWithdrawFlowState({
          status: "failed",
          errorMessage: eligibility?.message ?? messages.withdraw.errors.locked,
          amountAtomic,
          isRetryable: true,
        }),
      );

      return null;
    }

    if (connectionState.status !== "ready" || !connectionState.session?.chain || !connectionState.session.address) {
      applyState(
        createWithdrawFlowState({
          status: "failed",
          errorMessage: messages.withdraw.errors.connectBeforeWithdraw,
          amountAtomic,
          isRetryable: true,
        }),
      );

      return null;
    }

    if (!provider) {
      applyState(
        createWithdrawFlowState({
          status: "failed",
          errorMessage: messages.withdraw.errors.providerUnavailable,
          amountAtomic,
          isRetryable: true,
        }),
      );

      return null;
    }

    if (amountAtomic === null) {
      applyState(
        createWithdrawFlowState({
          status: "invalid",
          errorMessage: validationMessage ?? messages.withdraw.flow.invalidDescription,
          amountAtomic,
        }),
      );

      return null;
    }

    applyState(
      createWithdrawFlowState({
        status: "awaiting_wallet_confirmation",
        amountAtomic,
        intentConfirmed: true,
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
      const withdrawal = await withdrawFromVault({
        provider,
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        vaultAddress: vault.address,
        amount: amountAtomic,
        to: connectionState.session.address,
        onSubmitted: (txHash) => {
          submittedTxHash = txHash;
          recoveryId = createRecoveryId({
            kind: "withdraw",
            txHash,
          });
          void upsertTransactionRecoveryRecord(
            buildTransactionRecoveryRecord({
              kind: "withdraw",
              status: "submitted",
              action: "wait",
              chainId: connectionState.session!.chain!.id,
              ownerAddress: connectionState.session!.address,
              vaultAddress: vault.address,
              txHash,
              amountAtomic: amountAtomic.toString(),
              metadata: null,
            }),
          );
          applyState(
            createWithdrawFlowState({
              status: "submitting",
              amountAtomic,
              withdrawTxHash: txHash,
              intentConfirmed: true,
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
        onConfirming: (txHash) => {
          void updateTransactionRecoveryRecord(createRecoveryId({ kind: "withdraw", txHash }), (current) => ({
            ...current,
            status: "confirming",
            syncStatus: "pending",
            updatedAt: new Date().toISOString(),
          }));
          trackTransactionLifecycle({
            track,
            flow: "withdraw",
            lifecycle: "confirming",
            vaultAddress: vault.address,
            txHash,
            context: {
              ...analyticsContext,
              chainId: connectionState.session!.chain!.id,
            },
          });
          applyState(
            createWithdrawFlowState({
              status: "confirming",
              amountAtomic,
              withdrawTxHash: txHash,
              intentConfirmed: true,
            }),
          );
        },
      });

      const confirmedAt =
        withdrawal.event.status === "resolved" && withdrawal.event.occurredAt ? withdrawal.event.occurredAt : new Date().toISOString();
      const withdrawnAmount =
        amountDecimal ??
        formatAtomicUsdcToNumber({
          value: amountAtomic,
          decimals: 6,
        });
      const activityEvent = createWithdrawalActivityEvent({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        vault,
        amount: withdrawnAmount,
        confirmedAt,
        txHash: withdrawal.txHash,
      });

      upsertSessionVaultActivity({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        event: activityEvent,
      });
      trackTransactionLifecycle({
        track,
        flow: "withdraw",
        lifecycle: "syncing",
        vaultAddress: vault.address,
        txHash: withdrawal.txHash,
        context: {
          ...analyticsContext,
          chainId: connectionState.session.chain.id,
        },
        syncFreshness: "syncing",
      });
      await triggerIndexerSync({
        chainId: connectionState.session.chain.id,
        mode: "all",
      });
      invalidateVaultQueries();
      setAmountInputState("");

      const result = createWithdrawResult({
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        vaultAddress: vault.address,
        amountAtomic,
        withdrawTxHash: withdrawal.txHash,
        confirmedAt,
      });

      applyState(
        createWithdrawFlowState({
          status: "success",
          amountAtomic,
          withdrawTxHash: withdrawal.txHash,
          intentConfirmed: true,
          result,
        }),
      );
      track(
        "withdraw_confirmed",
        {
          vaultAddress: vault.address,
          withdrawTxHash: withdrawal.txHash,
        },
        {
          ...analyticsContext,
          chainId: connectionState.session.chain.id,
          vaultAddress: vault.address,
          txHash: withdrawal.txHash,
        },
      );
      trackTransactionLifecycle({
        track,
        flow: "withdraw",
        lifecycle: "completed",
        vaultAddress: vault.address,
        txHash: withdrawal.txHash,
        context: {
          ...analyticsContext,
          chainId: connectionState.session.chain.id,
        },
        syncFreshness: "current",
      });

      void removeTransactionRecoveryRecord(createRecoveryId({ kind: "withdraw", txHash: withdrawal.txHash }));
      return result;
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
        createWithdrawFlowState({
          status: "failed",
          amountAtomic,
          isRetryable: true,
          intentConfirmed: true,
          errorMessage: getWithdrawErrorMessage(error),
        }),
      );
      trackTransactionLifecycle({
        track,
        flow: "withdraw",
        lifecycle: "failed",
        vaultAddress: vault.address,
        txHash: submittedTxHash,
        errorClass: classifyAnalyticsError(error),
        context: {
          ...analyticsContext,
          chainId: connectionState.session?.chain?.id ?? null,
        },
      });

      return null;
    }
  }, [
    amountAtomic,
    amountDecimal,
    analyticsContext,
    applyState,
    connectionState.session?.address,
    connectionState.session?.chain,
    connectionState.status,
    eligibility,
    messages.withdraw.errors.connectBeforeWithdraw,
    messages.withdraw.errors.locked,
    messages.withdraw.errors.providerUnavailable,
    messages.withdraw.flow.invalidDescription,
    provider,
    track,
    validationMessage,
    vault,
  ]);

  const requestConfirmation = useCallback(() => {
    if (derivedState.status === "ready") {
      applyState(
        createWithdrawFlowState({
          status: "confirming_intent",
          amountAtomic,
        }),
      );
      return;
    }

    if (derivedState.status === "locked") {
      if (vault && eligibility?.availability === "locked") {
        track(
          "withdraw_blocked_by_lock",
          {
            vaultAddress: vault.address,
            unlockDate: vault.unlockDate,
          },
          {
            ...analyticsContext,
            vaultAddress: vault.address,
          },
        );
      }
      applyState(
        createWithdrawFlowState({
          status: "locked",
          errorMessage: eligibility?.message ?? messages.withdraw.flow.lockedDescription,
          amountAtomic,
        }),
      );
      return;
    }

    applyState(
      createWithdrawFlowState({
        status: "invalid",
        errorMessage: validationMessage ?? messages.withdraw.flow.invalidDescription,
        amountAtomic,
      }),
    );
  }, [
    analyticsContext,
    amountAtomic,
    applyState,
    derivedState.status,
    eligibility?.message,
    eligibility?.availability,
    messages.withdraw.flow.invalidDescription,
    messages.withdraw.flow.lockedDescription,
    track,
    validationMessage,
    vault,
  ]);

  const cancelConfirmation = useCallback(() => {
    applyState(
      createWithdrawFlowState({
        status: amountInput.trim() ? "ready" : "idle",
        amountAtomic,
      }),
    );
  }, [amountAtomic, amountInput, applyState]);

  const retry = useCallback(async () => {
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

    if (eligibility?.canWithdraw && amountAtomic !== null) {
      return executeWithdraw();
    }

    requestConfirmation();
    return null;
  }, [amountAtomic, analyticsContext, eligibility?.canWithdraw, executeWithdraw, requestConfirmation, track, vault?.address]);

  const reset = useCallback(() => {
    setAmountInputState("");
    applyState(initialWithdrawFlowState);
  }, [applyState]);

  const dismissSuccess = useCallback(() => {
    applyState(initialWithdrawFlowState);
  }, [applyState]);

  const setAmountInput = useCallback(
    (nextAmount: string) => {
      setAmountInputState(nextAmount);

      if (
        flowState.status === "invalid" ||
        flowState.status === "ready" ||
        flowState.status === "confirming_intent" ||
        flowState.status === "failed" ||
        flowState.status === "success"
      ) {
        applyState(initialWithdrawFlowState);
      }
    },
    [applyState, flowState.status],
  );

  const setMaxAmount = useCallback(() => {
    if (!eligibility || eligibility.availableAmountAtomic <= 0n) {
      return;
    }

    setAmountInput(
      formatTokenAmountForInput({
        value: eligibility.availableAmountAtomic,
        decimals: 6,
      }),
    );
  }, [eligibility, setAmountInput]);

  const primaryActionLabel = useMemo(() => {
    switch (derivedState.status) {
      case "confirming_intent":
        return messages.withdraw.actions.confirm;
      case "awaiting_wallet_confirmation":
      case "submitting":
      case "confirming":
        return messages.withdraw.actions.withdrawing;
      case "success":
        return messages.common.buttons.withdrawAgain;
      case "failed":
        return messages.withdraw.actions.retry;
      case "ready":
      default:
        return messages.withdraw.actions.review;
    }
  }, [
    derivedState.status,
    messages.common.buttons.withdrawAgain,
    messages.withdraw.actions.confirm,
    messages.withdraw.actions.review,
    messages.withdraw.actions.retry,
    messages.withdraw.actions.withdrawing,
  ]);

  return {
    amountInput,
    dismissSuccess,
    eligibility,
    isBusy:
      derivedState.status === "awaiting_wallet_confirmation" ||
      derivedState.status === "submitting" ||
      derivedState.status === "confirming",
    primaryActionLabel,
    requestConfirmation,
    cancelConfirmation,
    confirmWithdrawal: executeWithdraw,
    reset,
    retry,
    setAmountInput,
    setMaxAmount,
    state: derivedState,
    statusCopy,
    validationMessage: amountInput.trim() ? validationMessage : eligibility?.message ?? null,
    withdrawPreview,
  };
};

export type VaultWithdrawFlowController = ReturnType<typeof useVaultWithdrawFlow>;
