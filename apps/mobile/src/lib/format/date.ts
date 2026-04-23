import { getCurrentLocaleTag } from "../i18n";

export const formatLongDate = (value: string): string =>
  new Intl.DateTimeFormat(getCurrentLocaleTag(), {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
