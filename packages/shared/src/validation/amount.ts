export const normalizeAmountInput = (value: string): string => value.replaceAll(",", "").trim();

export const hasDecimalAmountShape = (value: string): boolean => /^\d*(?:\.\d*)?$/.test(normalizeAmountInput(value));

export const getAmountFractionLength = (value: string): number => {
  const normalized = normalizeAmountInput(value);
  const [, fraction = ""] = normalized.split(".");
  return fraction.length;
};

export const parseAmountInput = (value: string): number => {
  const normalized = normalizeAmountInput(value);
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const isPositiveAmount = (value: string): boolean => parseAmountInput(value) > 0;
