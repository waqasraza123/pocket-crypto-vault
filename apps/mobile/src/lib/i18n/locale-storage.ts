import type { AppLocale } from "./index";

export const isAppLocale = (value: string | null | undefined): value is AppLocale => value === "en" || value === "ar";

export const resolveInitialLocale = (storedLocale: string | null | undefined): AppLocale =>
  isAppLocale(storedLocale) ? storedLocale : "en";

export const shouldApplyHydratedLocale = ({
  hydratedLocale,
  hasManualSelection,
}: {
  hydratedLocale: string | null | undefined;
  hasManualSelection: boolean;
}): boolean => isAppLocale(hydratedLocale) && !hasManualSelection;
