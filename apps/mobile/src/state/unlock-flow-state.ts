import type { Hash } from "viem";

import type { VaultUnlockAction } from "../lib/contracts/unlock-flow";

export type UnlockFlowStatus =
  | "idle"
  | "awaiting_wallet_confirmation"
  | "submitting"
  | "confirming"
  | "success"
  | "failed";

export interface UnlockFlowState {
  status: UnlockFlowStatus;
  action: VaultUnlockAction | null;
  txHash: Hash | null;
  errorMessage: string | null;
  isRetryable: boolean;
  didConfirmOnchain: boolean;
}

export const initialUnlockFlowState: UnlockFlowState = {
  status: "idle",
  action: null,
  txHash: null,
  errorMessage: null,
  isRetryable: false,
  didConfirmOnchain: false,
};

export const createUnlockFlowState = ({
  status,
  action = null,
  txHash = null,
  errorMessage = null,
  isRetryable = false,
  didConfirmOnchain = false,
}: {
  status: UnlockFlowStatus;
  action?: VaultUnlockAction | null;
  txHash?: Hash | null;
  errorMessage?: string | null;
  isRetryable?: boolean;
  didConfirmOnchain?: boolean;
}): UnlockFlowState => ({
  status,
  action,
  txHash,
  errorMessage,
  isRetryable,
  didConfirmOnchain,
});
