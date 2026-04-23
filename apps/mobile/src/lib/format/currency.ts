import { getCurrentLocaleTag } from "../i18n";

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat(getCurrentLocaleTag(), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);

export const formatUsdc = (value: number): string => `${formatCurrency(value)} USDC`;
