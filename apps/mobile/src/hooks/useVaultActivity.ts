import { mockActivity } from "../features/activity/mockActivity";
import { useWalletConnection } from "./useWalletConnection";

export const useVaultActivity = () => {
  const { connectionState } = useWalletConnection();

  return {
    connectionState,
    events: mockActivity,
    isLoading: false,
    dataSource: "fallback" as const,
    notice: "Indexed activity remains partially mocked until backend indexing lands in a later phase.",
  };
};
