import { formatUnits, parseUnits } from "viem";

import {
  getAmountFractionLength,
  hasDecimalAmountShape,
  normalizeAmountInput,
  parseAmountInput,
} from "@pocket-vault/shared";

export interface ParsedTokenAmount {
  normalized: string;
  atomic: bigint;
  decimal: number;
}

export type ParsedTokenAmountResult =
  | {
      status: "ready";
      value: ParsedTokenAmount;
      message: null;
    }
  | {
      status: "invalid";
      value: null;
      message: string;
    };

const stripTrailingZeros = (value: string) => value.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "").replace(/\.$/u, "");

export const formatTokenAmount = ({
  value,
  decimals,
}: {
  value: bigint;
  decimals: number;
}): string => stripTrailingZeros(formatUnits(value, decimals));

export const formatTokenAmountNumber = ({
  value,
  decimals,
}: {
  value: bigint;
  decimals: number;
}): number => Number.parseFloat(formatUnits(value, decimals));

export const parseTokenAmount = ({
  value,
  decimals,
  symbol = "token",
}: {
  value: string;
  decimals: number;
  symbol?: string;
}): ParsedTokenAmountResult => {
  const normalized = normalizeAmountInput(value);

  if (!normalized) {
    return {
      status: "invalid",
      value: null,
      message: `Enter an amount of ${symbol}.`,
    };
  }

  if (!hasDecimalAmountShape(normalized)) {
    return {
      status: "invalid",
      value: null,
      message: `Enter a valid ${symbol} amount.`,
    };
  }

  if (getAmountFractionLength(normalized) > decimals) {
    return {
      status: "invalid",
      value: null,
      message: `${symbol} supports up to ${decimals} decimal places.`,
    };
  }

  try {
    const atomic = parseUnits(normalized, decimals);
    const decimal = parseAmountInput(normalized);

    if (!Number.isFinite(decimal) || decimal <= 0) {
      return {
        status: "invalid",
        value: null,
        message: `Enter an amount greater than zero.`,
      };
    }

    return {
      status: "ready",
      value: {
        normalized,
        atomic,
        decimal,
      },
      message: null,
    };
  } catch {
    return {
      status: "invalid",
      value: null,
      message: `Enter a valid ${symbol} amount.`,
    };
  }
};
