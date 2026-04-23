import { useState } from "react";

import { defaultWalletPlaceholderState } from "../lib/platform";
import type { WalletPlaceholderState } from "../types";

export const useWalletPlaceholderState = (): {
  walletState: WalletPlaceholderState;
} => {
  const [walletState] = useState(defaultWalletPlaceholderState);

  return {
    walletState,
  };
};
