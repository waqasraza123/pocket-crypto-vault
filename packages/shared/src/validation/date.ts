export const isFutureDate = (value: string): boolean => {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return timestamp > Date.now();
};
