export const parseAmountInput = (value: string): number => {
  const normalized = Number.parseFloat(value);
  return Number.isFinite(normalized) ? normalized : Number.NaN;
};

export const isPositiveAmount = (value: string): boolean => parseAmountInput(value) > 0;
