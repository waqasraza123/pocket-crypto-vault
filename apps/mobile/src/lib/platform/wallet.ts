import type { WalletPlaceholderState } from "../../types";

export const defaultWalletPlaceholderState: WalletPlaceholderState = {
  connectionState: "disconnected",
  networkState: "supported",
  accountLabel: null,
  chainLabel: "Base",
};
