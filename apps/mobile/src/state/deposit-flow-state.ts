import type {
  ApprovalRequirement,
  DepositFlowState,
  DepositFlowStatus,
} from "../types";
import { getCurrentMessages } from "../lib/i18n";

export const initialDepositFlowState: DepositFlowState = {
  status: "idle",
  errorMessage: null,
  approvalTxHash: null,
  depositTxHash: null,
  amountAtomic: null,
  isRetryable: false,
  approvalCompleted: false,
  result: null,
};

export const createDepositFlowState = ({
  status,
  errorMessage = null,
  approvalTxHash = null,
  depositTxHash = null,
  amountAtomic = null,
  isRetryable = false,
  approvalCompleted = false,
  result = null,
}: {
  status: DepositFlowStatus;
  errorMessage?: string | null;
  approvalTxHash?: DepositFlowState["approvalTxHash"];
  depositTxHash?: DepositFlowState["depositTxHash"];
  amountAtomic?: DepositFlowState["amountAtomic"];
  isRetryable?: boolean;
  approvalCompleted?: boolean;
  result?: DepositFlowState["result"];
}): DepositFlowState => ({
  status,
  errorMessage,
  approvalTxHash,
  depositTxHash,
  amountAtomic,
  isRetryable,
  approvalCompleted,
  result,
});

export const mapDepositFlowState = ({
  currentState,
  hasAmountInput,
  validationMessage,
  approvalRequirement,
  amountAtomic,
}: {
  currentState: DepositFlowState;
  hasAmountInput: boolean;
  validationMessage: string | null;
  approvalRequirement: ApprovalRequirement;
  amountAtomic: bigint | null;
}): DepositFlowState => {
  const messages = getCurrentMessages().deposit;

  if (
    currentState.status === "approving" ||
    currentState.status === "approval_confirming" ||
    currentState.status === "depositing" ||
    currentState.status === "deposit_confirming" ||
    currentState.status === "success" ||
    currentState.status === "failed"
  ) {
    return currentState;
  }

  if (!hasAmountInput) {
    return initialDepositFlowState;
  }

  if (validationMessage) {
    return createDepositFlowState({
      status: "invalid",
      errorMessage: validationMessage,
      amountAtomic,
      approvalCompleted: currentState.approvalCompleted,
      approvalTxHash: currentState.approvalTxHash,
    });
  }

  if (approvalRequirement === "required") {
    return createDepositFlowState({
      status: "ready_for_approval",
      amountAtomic,
      approvalCompleted: currentState.approvalCompleted,
      approvalTxHash: currentState.approvalTxHash,
    });
  }

  if (approvalRequirement === "not_required") {
    return createDepositFlowState({
      status: "ready_for_deposit",
      amountAtomic,
      approvalCompleted: currentState.approvalCompleted,
      approvalTxHash: currentState.approvalTxHash,
    });
  }

  return createDepositFlowState({
    status: "invalid",
    errorMessage: messages.readinessLoading,
    amountAtomic,
    approvalCompleted: currentState.approvalCompleted,
    approvalTxHash: currentState.approvalTxHash,
  });
};

export const getDepositFlowStatusCopy = (state: DepositFlowState) => {
  const messages = getCurrentMessages().deposit;

  switch (state.status) {
    case "invalid":
      return {
        title: messages.flow.invalidTitle,
        description: state.errorMessage ?? messages.flow.invalidDescription,
      };
    case "ready_for_approval":
      return {
        title: messages.flow.readyForApprovalTitle,
        description: messages.flow.readyForApprovalDescription,
      };
    case "approving":
      return {
        title: messages.flow.approvingTitle,
        description: messages.flow.approvingDescription,
      };
    case "approval_confirming":
      return {
        title: messages.flow.approvalConfirmingTitle,
        description: messages.flow.approvalConfirmingDescription,
      };
    case "ready_for_deposit":
      return {
        title: messages.flow.readyForDepositTitle,
        description: state.approvalCompleted ? messages.flow.readyAfterApprovalDescription : messages.flow.readyForDepositDescription,
      };
    case "depositing":
      return {
        title: messages.flow.depositingTitle,
        description: messages.flow.depositingDescription,
      };
    case "deposit_confirming":
      return {
        title: messages.flow.depositConfirmingTitle,
        description: messages.flow.depositConfirmingDescription,
      };
    case "success":
      return {
        title: messages.flow.successTitle,
        description: messages.flow.successDescription,
      };
    case "failed":
      return {
        title: state.approvalCompleted ? messages.flow.failedAfterApprovalTitle : messages.flow.failedTitle,
        description:
          state.errorMessage ??
          (state.approvalCompleted ? messages.flow.failedAfterApprovalDescription : messages.flow.failedDescription),
      };
    case "idle":
    default:
      return {
        title: messages.flow.idleTitle,
        description: messages.flow.idleDescription,
      };
  }
};
