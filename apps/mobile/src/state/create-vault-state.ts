import type { AppTransactionStatus, CreateVaultTransactionState, MetadataSaveResult, VaultAddress } from "@goal-vault/shared";
import type { Hash } from "viem";

import { getCurrentMessages } from "../lib/i18n";

export const initialCreateVaultTransactionState: CreateVaultTransactionState = {
  status: "idle",
  txHash: null,
  vaultAddress: null,
  errorMessage: null,
  didOnchainSucceed: false,
  isRetryable: false,
  metadataSave: null,
};

export const createVaultTransactionState = ({
  status,
  txHash = null,
  vaultAddress = null,
  errorMessage = null,
  didOnchainSucceed = false,
  isRetryable = false,
  metadataSave = null,
}: {
  status: AppTransactionStatus;
  txHash?: Hash | null;
  vaultAddress?: VaultAddress | null;
  errorMessage?: string | null;
  didOnchainSucceed?: boolean;
  isRetryable?: boolean;
  metadataSave?: MetadataSaveResult | null;
}): CreateVaultTransactionState => ({
  status,
  txHash,
  vaultAddress,
  errorMessage,
  didOnchainSucceed,
  isRetryable,
  metadataSave,
});

export const getTransactionStatusCopy = (state: CreateVaultTransactionState) => {
  const messages = getCurrentMessages().createVaultState;

  switch (state.status) {
    case "validating":
      return {
        title: messages.validatingTitle,
        description: messages.validatingDescription,
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
    case "confirmed":
      return {
        title: messages.confirmedTitle,
        description: messages.confirmedDescription,
      };
    case "metadata_saving":
      return {
        title: messages.metadataSavingTitle,
        description: messages.metadataSavingDescription,
      };
    case "success":
      return {
        title: messages.successTitle,
        description: messages.successDescription,
      };
    case "failed":
      return {
        title: state.didOnchainSucceed ? messages.failedOnchainTitle : messages.failedTitle,
        description:
          state.errorMessage ??
          (state.didOnchainSucceed ? messages.failedOnchainDescription : messages.failedDescription),
      };
    case "idle":
    default:
      return {
        title: messages.idleTitle,
        description: messages.idleDescription,
      };
  }
};
