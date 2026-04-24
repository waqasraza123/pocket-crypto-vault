import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DepositFlowState, VaultDetail } from "../types";
import { createConnectionAnalyticsContext, trackTransactionLifecycle } from "../lib/analytics";
import { triggerIndexerSync } from "../lib/api/sync-status";
import { useAnalytics } from "./useAnalytics";
import { useWalletConnection } from "./useWalletConnection";
import { useWalletWriteProvider } from "../lib/blockchain/wallet";
import { classifyAnalyticsError } from "../lib/errors/analytics";
import { getCurrentMessages, useI18n } from "../lib/i18n";
import { buildTransactionRecoveryRecord, createRecoveryId } from "../lib/recovery/records";
import { removeTransactionRecoveryRecord, updateTransactionRecoveryRecord, upsertTransactionRecoveryRecord } from "../lib/recovery/store";
import { useUsdcAllowance } from "./useUsdcAllowance";
import { useUsdcBalance } from "./useUsdcBalance";
import {
  createDepositActivityEvent,
  createDepositResult,
  getApprovalRequirement,
  vaultSupportsUsdcDeposits,
} from "../lib/contracts/deposit-flow";
import {
  buildDepositPreview,
  formatAtomicUsdcToNumber,
  formatTokenAmountForInput,
  parseUsdcAmountInput,
} from "../lib/contracts/amount-utils";
import { approveUsdcForVault } from "../lib/contracts/erc20-writes";
import { depositToVault } from "../lib/contracts/vault-writes";
import {
  createDepositFlowState,
  getDepositFlowStatusCopy,
  initialDepositFlowState,
  invalidateVaultQueries,
  mapDepositFlowState,
  upsertSessionVaultActivity,
} from "../state";

const isWalletRejectedError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string | number }).code) : "";

  return code === "4001" || message.includes("user rejected") || message.includes("user denied");
};

const getApprovalErrorMessage = (error: unknown) => {
  const messages = getCurrentMessages().deposit.errors;

  if (isWalletRejectedError(error)) {
    return messages.approvalRejected;
  }

  return error instanceof Error ? error.message : messages.approvalFailed;
};

const getDepositErrorMessage = (error: unknown) => {
  const messages = getCurrentMessages().deposit.errors;

  if (isWalletRejectedError(error)) {
    return messages.depositRejected;
  }

  return error instanceof Error ? error.message : messages.depositFailed;
};

export const useVaultDepositFlow = (vault: VaultDetail | null) => {
  const { messages } = useI18n();
  const { track } = useAnalytics();
  const { connectionState } = useWalletConnection();
  const provider = useWalletWriteProvider();
  const mountedRef = useRef(true);
  const approvalRequirementTrackedRef = useRef<Set<string>>(new Set());
  const previousConnectionStatusRef = useRef(connectionState.status);
  const [amountInput, setAmountInputState] = useState("");
  const [flowState, setFlowState] = useState<DepositFlowState>(initialDepositFlowState);
  const [allowanceOverrideAtomic, setAllowanceOverrideAtomic] = useState<bigint | null>(null);
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
      (flowState.status === "approving" ||
        flowState.status === "approval_confirming" ||
        flowState.status === "depositing" ||
        flowState.status === "deposit_confirming")
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

  const chainId = connectionState.status === "ready" && connectionState.session?.chain ? connectionState.session.chain.id : null;
  const ownerAddress = connectionState.status === "ready" ? connectionState.session?.address ?? null : null;

  useEffect(() => {
    setAllowanceOverrideAtomic(null);
    setAmountInputState("");
    setFlowState(initialDepositFlowState);
  }, [chainId, ownerAddress, vault?.address]);

  const balance = useUsdcBalance({
    chainId,
    walletAddress: ownerAddress,
  });

  const parsedAmount = useMemo(() => {
    if (!amountInput.trim() || balance.decimals === null) {
      return null;
    }

    return parseUsdcAmountInput({
      value: amountInput,
      decimals: balance.decimals,
    });
  }, [amountInput, balance.decimals]);

  const amountAtomic = parsedAmount?.status === "ready" ? parsedAmount.value.atomic : null;
  const amountDecimal = parsedAmount?.status === "ready" ? parsedAmount.value.decimal : null;

  const allowance = useUsdcAllowance({
    chainId,
    walletAddress: ownerAddress,
    vaultAddress: vault?.address ?? null,
    requiredAmountAtomic: amountAtomic,
    allowanceOverrideAtomic,
  });

  const availabilityMessage = useMemo(() => {
    if (!vault) {
      return messages.pages.vaultDetail.notAvailableDescription;
    }

    if (connectionState.status === "walletUnavailable" || connectionState.status === "disconnected") {
      return messages.deposit.walletToDeposit;
    }

    if (connectionState.status === "unsupportedNetwork") {
      return messages.deposit.switchNetwork;
    }

    if (connectionState.status !== "ready" || !chainId || !ownerAddress) {
      return messages.deposit.walletLoading;
    }

    if (vault.chainId !== chainId) {
      return messages.deposit.openOnSameNetwork;
    }

    if (!vaultSupportsUsdcDeposits({ chainId, assetAddress: vault.assetAddress })) {
      return messages.deposit.unsupportedAsset;
    }

    if (balance.status === "error" || balance.status === "unavailable") {
      return balance.errorMessage ?? messages.deposit.balanceUnavailable;
    }

    if (allowance.status === "error" || allowance.status === "unavailable") {
      return allowance.errorMessage ?? messages.deposit.approvalUnavailable;
    }

    if (balance.status === "loading" || allowance.status === "loading") {
      return messages.deposit.readinessLoading;
    }

    return null;
  }, [
    allowance.errorMessage,
    allowance.status,
    balance.errorMessage,
    balance.status,
    chainId,
    connectionState.status,
    messages,
    ownerAddress,
    vault,
  ]);

  const validationMessage = useMemo(() => {
    if (!amountInput.trim()) {
      return availabilityMessage;
    }

    if (availabilityMessage) {
      return availabilityMessage;
    }

    if (parsedAmount?.status === "invalid") {
      return parsedAmount.message;
    }

    if (amountAtomic !== null && balance.balanceAtomic !== null && amountAtomic > balance.balanceAtomic) {
      return messages.deposit.amountTooHigh;
    }

    return null;
  }, [amountAtomic, amountInput, availabilityMessage, balance.balanceAtomic, messages.deposit.amountTooHigh, parsedAmount]);

  const approvalRequirement = useMemo(() => {
    if (allowance.status === "ready") {
      return allowance.approvalRequirement;
    }

    return getApprovalRequirement({
      allowanceAtomic: allowance.allowanceAtomic,
      amountAtomic,
    });
  }, [allowance.allowanceAtomic, allowance.approvalRequirement, allowance.status, amountAtomic]);

  const derivedState = useMemo(
    () =>
      mapDepositFlowState({
        currentState: flowState,
        hasAmountInput: amountInput.trim().length > 0,
        validationMessage,
        approvalRequirement,
        amountAtomic,
      }),
    [amountAtomic, amountInput, approvalRequirement, flowState, validationMessage],
  );

  const depositPreview = useMemo(() => {
    if (!vault || amountAtomic === null || balance.decimals === null || validationMessage) {
      return null;
    }

    return buildDepositPreview({
      vault,
      amountAtomic,
      decimals: balance.decimals,
    });
  }, [amountAtomic, balance.decimals, validationMessage, vault]);

  const statusCopy = useMemo(() => getDepositFlowStatusCopy(derivedState), [derivedState]);

  useEffect(() => {
    if (derivedState.status !== "ready_for_approval" || amountAtomic === null || !vault) {
      return;
    }

    const key = `${vault.address}:${amountAtomic.toString()}`;

    if (approvalRequirementTrackedRef.current.has(key)) {
      return;
    }

    approvalRequirementTrackedRef.current.add(key);
    track(
      "deposit_approval_required",
      {
        vaultAddress: vault.address,
      },
      {
        ...analyticsContext,
        vaultAddress: vault.address,
      },
    );
    trackTransactionLifecycle({
      track,
      flow: "deposit",
      lifecycle: "approval_required",
      vaultAddress: vault.address,
      context: analyticsContext,
    });
  }, [amountAtomic, analyticsContext, derivedState.status, track, vault]);

  const applyState = useCallback((nextState: DepositFlowState) => {
    if (mountedRef.current) {
      setFlowState(nextState);
    }
  }, []);

  const refetchBalances = useCallback(() => {
    balance.refetch();
    allowance.refetch();
  }, [allowance, balance]);

  const submitApproval = useCallback(async () => {
    if (!vault || !provider || connectionState.status !== "ready" || !chainId || !ownerAddress || amountAtomic === null) {
      applyState(
        createDepositFlowState({
          status: "failed",
          errorMessage: messages.deposit.errors.connectBeforeApprove,
          amountAtomic,
          isRetryable: true,
        }),
      );

      return null;
    }

    applyState(
      createDepositFlowState({
        status: "approving",
        amountAtomic,
      }),
    );
    trackTransactionLifecycle({
      track,
      flow: "deposit",
      lifecycle: "wallet_confirmation_requested",
      vaultAddress: vault.address,
      context: {
        ...analyticsContext,
        chainId,
      },
    });

    try {
      const approval = await approveUsdcForVault({
        provider,
        chainId,
        ownerAddress,
        vaultAddress: vault.address,
        amount: amountAtomic,
        onSubmitted: (txHash) => {
          applyState(
            createDepositFlowState({
              status: "approval_confirming",
              amountAtomic,
              approvalTxHash: txHash,
            }),
          );
        },
      });

      setAllowanceOverrideAtomic(amountAtomic);
      refetchBalances();

      applyState(
        createDepositFlowState({
          status: "ready_for_deposit",
          amountAtomic,
          approvalCompleted: true,
          approvalTxHash: approval.txHash,
        }),
      );
      track(
        "deposit_approved",
        {
          vaultAddress: vault.address,
          approvalTxHash: approval.txHash,
        },
        {
          ...analyticsContext,
          chainId,
          vaultAddress: vault.address,
          txHash: approval.txHash,
        },
      );
      trackTransactionLifecycle({
        track,
        flow: "deposit",
        lifecycle: "approval_confirmed",
        vaultAddress: vault.address,
        txHash: approval.txHash,
        context: {
          ...analyticsContext,
          chainId,
        },
      });

      return approval;
    } catch (error) {
      applyState(
        createDepositFlowState({
          status: "failed",
          amountAtomic,
          isRetryable: true,
          errorMessage: getApprovalErrorMessage(error),
        }),
      );
      trackTransactionLifecycle({
        track,
        flow: "deposit",
        lifecycle: "failed",
        vaultAddress: vault.address,
        errorClass: classifyAnalyticsError(error),
        context: {
          ...analyticsContext,
          chainId,
        },
      });

      return null;
    }
  }, [amountAtomic, analyticsContext, applyState, chainId, connectionState.status, messages.deposit.errors.connectBeforeApprove, ownerAddress, provider, refetchBalances, track, vault]);

  const submitDeposit = useCallback(async () => {
    let submittedTxHash: `0x${string}` | null = null;
    let recoveryId: string | null = null;

    if (!vault || !provider || connectionState.status !== "ready" || !chainId || !ownerAddress || amountAtomic === null) {
      applyState(
        createDepositFlowState({
          status: "failed",
          errorMessage: messages.deposit.errors.connectBeforeDeposit,
          amountAtomic,
          approvalCompleted: flowState.approvalCompleted,
          approvalTxHash: flowState.approvalTxHash,
          isRetryable: true,
        }),
      );

      return null;
    }

    applyState(
      createDepositFlowState({
        status: "depositing",
        amountAtomic,
        approvalCompleted: flowState.approvalCompleted,
        approvalTxHash: flowState.approvalTxHash,
      }),
    );
    trackTransactionLifecycle({
      track,
      flow: "deposit",
      lifecycle: "wallet_confirmation_requested",
      vaultAddress: vault.address,
      context: {
        ...analyticsContext,
        chainId,
      },
    });

    try {
      const deposit = await depositToVault({
        provider,
        chainId,
        ownerAddress,
        vaultAddress: vault.address,
        amount: amountAtomic,
        onSubmitted: (txHash) => {
          submittedTxHash = txHash;
          recoveryId = createRecoveryId({
            kind: "deposit",
            txHash,
          });
          void upsertTransactionRecoveryRecord(
              buildTransactionRecoveryRecord({
                kind: "deposit",
                status: "submitted",
                action: "wait",
                chainId,
                ownerAddress,
                vaultAddress: vault.address,
                txHash,
                amountAtomic: amountAtomic.toString(),
                metadata: null,
              }),
            );
          applyState(
            createDepositFlowState({
              status: "deposit_confirming",
              amountAtomic,
              approvalCompleted: flowState.approvalCompleted,
              approvalTxHash: flowState.approvalTxHash,
              depositTxHash: txHash,
            }),
          );
          trackTransactionLifecycle({
            track,
            flow: "deposit",
            lifecycle: "submitted",
            vaultAddress: vault.address,
            txHash,
            context: {
              ...analyticsContext,
              chainId,
            },
          });
        },
      });

      const confirmedAt = deposit.event.status === "resolved" && deposit.event.occurredAt ? deposit.event.occurredAt : new Date().toISOString();
      const depositedAmount =
        amountDecimal ??
        (balance.decimals !== null
          ? formatAtomicUsdcToNumber({
              value: amountAtomic,
              decimals: balance.decimals,
            })
          : 0);
      const activityEvent = createDepositActivityEvent({
        chainId,
        ownerAddress,
        vault,
        amount: depositedAmount,
        confirmedAt,
        txHash: deposit.txHash,
      });

      upsertSessionVaultActivity({
        chainId,
        ownerAddress,
        event: activityEvent,
      });
      trackTransactionLifecycle({
        track,
        flow: "deposit",
        lifecycle: "syncing",
        vaultAddress: vault.address,
        txHash: deposit.txHash,
        context: {
          ...analyticsContext,
          chainId,
        },
        syncFreshness: "syncing",
      });
      await triggerIndexerSync({
        chainId,
        mode: "all",
      });
      invalidateVaultQueries();
      setAllowanceOverrideAtomic(null);
      refetchBalances();
      setAmountInputState("");

      const result = createDepositResult({
        chainId,
        ownerAddress,
        vaultAddress: vault.address,
        amountAtomic,
        approvalTxHash: flowState.approvalTxHash,
        depositTxHash: deposit.txHash,
        confirmedAt,
      });

      applyState(
        createDepositFlowState({
          status: "success",
          amountAtomic,
          approvalCompleted: flowState.approvalCompleted,
          approvalTxHash: flowState.approvalTxHash,
          depositTxHash: deposit.txHash,
          result,
        }),
      );
      track(
        "deposit_confirmed",
        {
          vaultAddress: vault.address,
          depositTxHash: deposit.txHash,
          firstDeposit: vault.savedAmount <= 0,
        },
        {
          ...analyticsContext,
          chainId,
          vaultAddress: vault.address,
          txHash: deposit.txHash,
        },
      );
      trackTransactionLifecycle({
        track,
        flow: "deposit",
        lifecycle: "completed",
        vaultAddress: vault.address,
        txHash: deposit.txHash,
        context: {
          ...analyticsContext,
          chainId,
        },
        syncFreshness: "current",
      });

      void removeTransactionRecoveryRecord(createRecoveryId({ kind: "deposit", txHash: deposit.txHash }));
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
        createDepositFlowState({
          status: "failed",
          amountAtomic,
          approvalCompleted: flowState.approvalCompleted,
          approvalTxHash: flowState.approvalTxHash,
          isRetryable: true,
          errorMessage: getDepositErrorMessage(error),
        }),
      );
      trackTransactionLifecycle({
        track,
        flow: "deposit",
        lifecycle: "failed",
        vaultAddress: vault.address,
        txHash: submittedTxHash,
        errorClass: classifyAnalyticsError(error),
        context: {
          ...analyticsContext,
          chainId,
        },
      });

      return null;
    }
  }, [
    amountAtomic,
    amountDecimal,
    analyticsContext,
    applyState,
    balance.decimals,
    chainId,
    connectionState.status,
    flowState.approvalCompleted,
    flowState.approvalTxHash,
    messages.deposit.errors.connectBeforeDeposit,
    ownerAddress,
    provider,
    refetchBalances,
    track,
    vault,
  ]);

  const submit = useCallback(async () => {
    if (derivedState.status === "approving" || derivedState.status === "approval_confirming" || derivedState.status === "depositing" || derivedState.status === "deposit_confirming") {
      return null;
    }

    if (derivedState.status === "ready_for_approval") {
      return submitApproval();
    }

    if (derivedState.status === "ready_for_deposit") {
      return submitDeposit();
    }

    if (derivedState.status === "failed" && (flowState.approvalCompleted || allowance.approvalRequirement === "not_required")) {
      return submitDeposit();
    }

    applyState(
      createDepositFlowState({
        status: "invalid",
        errorMessage: validationMessage ?? messages.deposit.flow.invalidDescription,
        amountAtomic,
        approvalCompleted: flowState.approvalCompleted,
        approvalTxHash: flowState.approvalTxHash,
      }),
    );

    return null;
  }, [
    allowance.approvalRequirement,
    amountAtomic,
    applyState,
    derivedState.status,
    flowState.approvalCompleted,
    flowState.approvalTxHash,
    submitApproval,
    submitDeposit,
    messages.deposit.flow.invalidDescription,
    validationMessage,
  ]);

  const trackedRetry = useCallback(async () => {
    track(
      "transaction_recovery_action",
      {
        flow: "deposit",
        action: "retry",
      },
      {
        ...analyticsContext,
        vaultAddress: vault?.address ?? null,
      },
    );

    return submit();
  }, [analyticsContext, submit, track, vault?.address]);

  const reset = useCallback(() => {
    setAllowanceOverrideAtomic(null);
    setAmountInputState("");
    applyState(initialDepositFlowState);
  }, [applyState]);

  const dismissSuccess = useCallback(() => {
    applyState(initialDepositFlowState);
  }, [applyState]);

  const setAmountInput = useCallback(
    (nextAmount: string) => {
      setAmountInputState(nextAmount);

      if (
        flowState.status === "failed" ||
        flowState.status === "success" ||
        flowState.status === "ready_for_deposit" ||
        flowState.status === "ready_for_approval" ||
        flowState.status === "invalid"
      ) {
        applyState(
          createDepositFlowState({
            status: "idle",
            approvalCompleted: flowState.approvalCompleted,
            approvalTxHash: flowState.approvalTxHash,
          }),
        );
      }
    },
    [applyState, flowState.approvalCompleted, flowState.approvalTxHash, flowState.status],
  );

  const setMaxAmount = useCallback(() => {
    if (balance.balanceAtomic === null || balance.decimals === null) {
      return;
    }

    setAmountInput(
      formatTokenAmountForInput({
        value: balance.balanceAtomic,
        decimals: balance.decimals,
      }),
    );
  }, [balance.balanceAtomic, balance.decimals, setAmountInput]);

  const primaryActionLabel = useMemo(() => {
    switch (derivedState.status) {
      case "ready_for_approval":
        return messages.deposit.actions.approve;
      case "approving":
      case "approval_confirming":
        return messages.deposit.actions.approving;
      case "ready_for_deposit":
        return messages.deposit.actions.deposit;
      case "depositing":
      case "deposit_confirming":
        return messages.deposit.actions.depositing;
      case "success":
        return messages.deposit.actions.depositAnother;
      case "failed":
        return flowState.approvalCompleted || allowance.approvalRequirement === "not_required"
          ? messages.deposit.actions.retryDeposit
          : messages.deposit.actions.retry;
      default:
        return messages.deposit.actions.deposit;
    }
  }, [allowance.approvalRequirement, derivedState.status, flowState.approvalCompleted, messages.deposit.actions]);

  return {
    allowance,
    amountInput,
    balance,
    depositPreview,
    dismissSuccess,
    isBusy:
      derivedState.status === "approving" ||
      derivedState.status === "approval_confirming" ||
      derivedState.status === "depositing" ||
      derivedState.status === "deposit_confirming",
    primaryActionLabel,
    reset,
    retry: trackedRetry,
    setAmountInput,
    setMaxAmount,
    state: derivedState,
    statusCopy,
    submit,
    validationMessage: amountInput.trim() ? validationMessage : availabilityMessage,
  };
};

export type VaultDepositFlowController = ReturnType<typeof useVaultDepositFlow>;
