import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { VaultDetail, WithdrawFlowState } from "../types";
import { triggerIndexerSync } from "../lib/api/sync-status";
import { useWalletConnection } from "./useWalletConnection";
import { useWalletWriteProvider } from "../lib/blockchain/wallet";
import { getCurrentMessages, useI18n } from "../lib/i18n";
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
  const { connectionState } = useWalletConnection();
  const provider = useWalletWriteProvider();
  const eligibility = useWithdrawEligibility(vault);
  const mountedRef = useRef(true);
  const [amountInput, setAmountInputState] = useState("");
  const [flowState, setFlowState] = useState<WithdrawFlowState>(initialWithdrawFlowState);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

    try {
      const withdrawal = await withdrawFromVault({
        provider,
        chainId: connectionState.session.chain.id,
        ownerAddress: connectionState.session.address,
        vaultAddress: vault.address,
        amount: amountAtomic,
        to: connectionState.session.address,
        onSubmitted: (txHash) => {
          applyState(
            createWithdrawFlowState({
              status: "submitting",
              amountAtomic,
              withdrawTxHash: txHash,
              intentConfirmed: true,
            }),
          );
        },
        onConfirming: (txHash) => {
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

      return result;
    } catch (error) {
      applyState(
        createWithdrawFlowState({
          status: "failed",
          amountAtomic,
          isRetryable: true,
          intentConfirmed: true,
          errorMessage: getWithdrawErrorMessage(error),
        }),
      );

      return null;
    }
  }, [
    amountAtomic,
    amountDecimal,
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
    amountAtomic,
    applyState,
    derivedState.status,
    eligibility?.message,
    messages.withdraw.flow.invalidDescription,
    messages.withdraw.flow.lockedDescription,
    validationMessage,
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
    if (eligibility?.canWithdraw && amountAtomic !== null) {
      return executeWithdraw();
    }

    requestConfirmation();
    return null;
  }, [amountAtomic, eligibility?.canWithdraw, executeWithdraw, requestConfirmation]);

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
