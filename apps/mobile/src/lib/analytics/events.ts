import type {
  AnalyticsContext,
  AnalyticsEventPayloadMap,
  AppConnectionState,
  SupportedChainId,
  SyncFreshnessState,
  WithdrawalAvailability,
} from "@goal-vault/shared";

export const createConnectionAnalyticsContext = (
  connectionState: AppConnectionState,
): Partial<AnalyticsContext> => ({
  chainId: connectionState.session?.chain?.id ?? connectionState.session?.chainId ?? null,
  walletStatus: connectionState.status,
});

export const getAmountBucket = (amount: number) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "0";
  }

  if (amount < 100) {
    return "0_99";
  }

  if (amount < 500) {
    return "100_499";
  }

  if (amount < 1_000) {
    return "500_999";
  }

  if (amount < 5_000) {
    return "1000_4999";
  }

  return "5000_plus";
};

export const getUnlockLeadDaysBucket = (unlockDate: string) => {
  const unlockAt = new Date(unlockDate).getTime();

  if (Number.isNaN(unlockAt)) {
    return "unknown";
  }

  const leadDays = Math.max(Math.round((unlockAt - Date.now()) / 86_400_000), 0);

  if (leadDays <= 7) {
    return "0_7";
  }

  if (leadDays <= 30) {
    return "8_30";
  }

  if (leadDays <= 90) {
    return "31_90";
  }

  if (leadDays <= 365) {
    return "91_365";
  }

  return "365_plus";
};

export const getSavedAmountBucket = (amount: number) => getAmountBucket(amount);

export const getSyncFreshnessFromState = (state: SyncFreshnessState | null | undefined) => state ?? null;

export const normalizeAnalyticsDataSource = (
  value: string | null | undefined,
): AnalyticsEventPayloadMap["dashboard_viewed"]["dataSource"] => {
  if (value === "backend" || value === "fallback" || value === "session") {
    return value;
  }

  return "none";
};

export const normalizeWithdrawAvailability = (
  value: WithdrawalAvailability | null | undefined,
): AnalyticsEventPayloadMap["withdraw_flow_opened"]["availability"] => {
  if (value === "locked" || value === "ready" || value === "owner_only" || value === "empty") {
    return value;
  }

  return "unavailable";
};

export const normalizeChainId = (chainId: number | null | undefined): SupportedChainId | null =>
  chainId === 8453 || chainId === 84532 ? chainId : null;
