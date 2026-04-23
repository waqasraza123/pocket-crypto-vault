import type {
  WithdrawEligibility,
  WithdrawFlowState,
  WithdrawFlowStatus,
} from "../types";
import { getCurrentMessages } from "../lib/i18n";

export const initialWithdrawFlowState: WithdrawFlowState = {
  status: "idle",
  errorMessage: null,
  withdrawTxHash: null,
  amountAtomic: null,
  isRetryable: false,
  intentConfirmed: false,
  result: null,
};

export const createWithdrawFlowState = ({
  status,
  errorMessage = null,
  withdrawTxHash = null,
  amountAtomic = null,
  isRetryable = false,
  intentConfirmed = false,
  result = null,
}: {
  status: WithdrawFlowStatus;
  errorMessage?: string | null;
  withdrawTxHash?: WithdrawFlowState["withdrawTxHash"];
  amountAtomic?: WithdrawFlowState["amountAtomic"];
  isRetryable?: boolean;
  intentConfirmed?: boolean;
  result?: WithdrawFlowState["result"];
}): WithdrawFlowState => ({
  status,
  errorMessage,
  withdrawTxHash,
  amountAtomic,
  isRetryable,
  intentConfirmed,
  result,
});

export const mapWithdrawFlowState = ({
  currentState,
  eligibility,
  hasAmountInput,
  validationMessage,
  amountAtomic,
}: {
  currentState: WithdrawFlowState;
  eligibility: WithdrawEligibility | null;
  hasAmountInput: boolean;
  validationMessage: string | null;
  amountAtomic: bigint | null;
}): WithdrawFlowState => {
  if (
    currentState.status === "confirming_intent" ||
    currentState.status === "awaiting_wallet_confirmation" ||
    currentState.status === "submitting" ||
    currentState.status === "confirming" ||
    currentState.status === "success" ||
    currentState.status === "failed"
  ) {
    return currentState;
  }

  if (!eligibility || !eligibility.canWithdraw) {
    return createWithdrawFlowState({
      status: "locked",
      errorMessage: eligibility?.message ?? getCurrentMessages().withdraw.flow.lockedDescription,
      amountAtomic,
    });
  }

  if (!hasAmountInput) {
    return initialWithdrawFlowState;
  }

  if (validationMessage) {
    return createWithdrawFlowState({
      status: "invalid",
      errorMessage: validationMessage,
      amountAtomic,
    });
  }

  return createWithdrawFlowState({
    status: "ready",
    amountAtomic,
  });
};

export const getWithdrawFlowStatusCopy = (state: WithdrawFlowState) => {
  const messages = getCurrentMessages().withdraw.flow;

  switch (state.status) {
    case "invalid":
      return {
        title: messages.invalidTitle,
        description: state.errorMessage ?? messages.invalidDescription,
      };
    case "locked":
      return {
        title: messages.lockedTitle,
        description: state.errorMessage ?? messages.lockedDescription,
      };
    case "ready":
      return {
        title: messages.readyTitle,
        description: messages.readyDescription,
      };
    case "confirming_intent":
      return {
        title: messages.confirmingIntentTitle,
        description: messages.confirmingIntentDescription,
      };
    case "awaiting_wallet_confirmation":
      return {
        title: messages.awaitingWalletTitle,
        description: messages.awaitingWalletDescription,
      };
    case "submitting":
      return {
        title: messages.submittingTitle,
        description: messages.submittingDescription,
      };
    case "confirming":
      return {
        title: messages.confirmingTitle,
        description: messages.confirmingDescription,
      };
    case "success":
      return {
        title: messages.successTitle,
        description: messages.successDescription,
      };
    case "failed":
      return {
        title: messages.failedTitle,
        description: state.errorMessage ?? messages.failedDescription,
      };
    case "idle":
    default:
      return {
        title: messages.idleTitle,
        description: messages.idleDescription,
      };
  }
};
