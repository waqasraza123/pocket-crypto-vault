import type { TransactionRecoveryKind, TransactionRecoveryLifecycle } from "@goal-vault/shared";

import { getCurrentMessages } from "../i18n";

export const getTransactionRecoveryCopy = ({
  kind,
  status,
}: {
  kind: TransactionRecoveryKind;
  status: TransactionRecoveryLifecycle;
}) => {
  const messages = getCurrentMessages();

  if (kind === "create_vault") {
    switch (status) {
      case "submitted":
      case "confirming":
        return {
          title: messages.feedback.transactionPendingTitle,
          description: messages.feedback.transactionPendingDescription,
        };
      case "confirmed":
      case "syncing":
        return {
          title: messages.feedback.transactionRefreshingTitle,
          description: messages.feedback.transactionRefreshingDescription,
        };
      case "failed":
        return {
          title: messages.pages.createVault.error.failedTitle,
          description: messages.pages.createVault.error.failedDescription,
        };
      default:
        return {
          title: messages.pages.createVault.success.eyebrow,
          description: messages.pages.createVault.success.description,
        };
    }
  }

  if (kind === "deposit") {
    switch (status) {
      case "submitted":
      case "confirming":
        return {
          title: messages.feedback.transactionPendingTitle,
          description: messages.feedback.transactionPendingDescription,
        };
      case "confirmed":
      case "syncing":
        return {
          title: messages.deposit.successTitle,
          description: messages.feedback.transactionRefreshingDescription,
        };
      case "failed":
        return {
          title: messages.deposit.flow.failedTitle,
          description: messages.deposit.flow.failedDescription,
        };
      default:
        return {
          title: messages.deposit.successTitle,
          description: messages.deposit.successDescription,
        };
    }
  }

  if (kind === "unlock") {
    switch (status) {
      case "submitted":
      case "confirming":
        return {
          title: messages.feedback.transactionPendingTitle,
          description: messages.feedback.transactionPendingDescription,
        };
      case "confirmed":
      case "syncing":
        return {
          title: messages.feedback.transactionRefreshingTitle,
          description: messages.feedback.transactionRefreshingDescription,
        };
      case "failed":
        return {
          title: messages.feedback.dataUnavailableTitle,
          description: messages.feedback.dataUnavailableDescription,
        };
      default:
        return {
          title: messages.feedback.transactionRefreshingTitle,
          description: messages.feedback.transactionRefreshingDescription,
        };
    }
  }

  switch (status) {
    case "submitted":
    case "confirming":
      return {
        title: messages.feedback.transactionPendingTitle,
        description: messages.feedback.transactionPendingDescription,
      };
    case "confirmed":
    case "syncing":
      return {
        title: messages.withdraw.successTitle,
        description: messages.feedback.transactionRefreshingDescription,
      };
    case "failed":
      return {
        title: messages.withdraw.flow.failedTitle,
        description: messages.withdraw.flow.failedDescription,
      };
    default:
      return {
        title: messages.withdraw.successTitle,
        description: messages.withdraw.successDescription,
      };
  }
};
