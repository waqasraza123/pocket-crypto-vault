import { useCallback, useEffect, useRef, useState } from "react";

import type { CreateVaultInput, CreateVaultResult, CreateVaultTransactionState, MetadataSaveResult } from "../types";
import { useWalletConnection } from "./useWalletConnection";
import { useWalletWriteProvider } from "../lib/blockchain/wallet";
import { buildCreateVaultMetadataPayload, createVaultTransaction } from "../lib/contracts/create-vault";
import { saveVaultMetadata } from "../lib/api/vaults";
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
  const { connectionState } = useWalletConnection();
  const provider = useWalletWriteProvider();
  const [state, setState] = useState<CreateVaultTransactionState>(initialCreateVaultTransactionState);
  const [result, setResult] = useState<CreateVaultResult | null>(null);
  const retryStateRef = useRef<RetryState>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

      const metadataSave = await saveVaultMetadata(payload);

      markSessionVaultMetadata({
        chainId: payload.chainId,
        vaultAddress: payload.contractAddress,
        status: metadataSave.status,
      });
      invalidateVaultQueries();

      return metadataSave;
    },
    [applyState],
  );

  const submit = useCallback(
    async (values: CreateVaultInput) => {
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

      try {
        const txResult = await createVaultTransaction({
          provider,
          ownerAddress: connectionState.session.address,
          chainId: connectionState.session.chain.id,
          values,
          onSubmitted: (txHash) => {
            applyState(
              createVaultTransactionState({
                status: "submitting",
                txHash,
              }),
            );
          },
          onConfirming: (txHash) => {
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

        return nextResult;
      } catch (error) {
        applyState(
          createVaultTransactionState({
            status: "failed",
            errorMessage: getErrorMessage(error),
            isRetryable: true,
          }),
        );

        return null;
      }
    },
    [applyState, connectionState, persistMetadata, provider, state.status],
  );

  const retry = useCallback(async () => {
    const retryState = retryStateRef.current;
    const messages = getCurrentMessages().pages.createVault.runtime;

    if (!retryState) {
      return null;
    }

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

    return nextResult;
  }, [applyState, connectionState, persistMetadata, submit]);

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
