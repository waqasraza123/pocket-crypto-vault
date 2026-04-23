import { useContext } from "react";

import { WalletContext } from "./state";

export const useWalletContext = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider.");
  }

  return context;
};
