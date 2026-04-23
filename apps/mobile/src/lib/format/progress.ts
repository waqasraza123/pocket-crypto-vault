import { getCurrentLocaleTag } from "../i18n";

export const formatProgress = (ratio: number): string =>
  new Intl.NumberFormat(getCurrentLocaleTag(), {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(ratio);
