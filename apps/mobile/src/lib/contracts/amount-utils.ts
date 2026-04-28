import {
  formatTokenAmount,
  formatTokenAmountNumber,
  type ParsedTokenAmountResult,
  getUsdcAddress,
  parseTokenAmount,
} from "@pocket-vault/contracts-sdk";

import type { DepositPreview, SupportedChainId, VaultSummary, WithdrawPreview } from "../../types";

export const usdcSymbol = "USDC";

export const getUsdcAddressForChain = (chainId: SupportedChainId) => getUsdcAddress(chainId);

export const formatTokenAmountForInput = ({
  value,
  decimals,
}: {
  value: bigint;
  decimals: number;
}) =>
  formatTokenAmount({
    value,
    decimals,
  });

export const formatAtomicUsdcToNumber = ({
  value,
  decimals,
}: {
  value: bigint;
  decimals: number;
}) =>
  formatTokenAmountNumber({
    value,
    decimals,
  });

export const parseUsdcAmountInput = ({
  value,
  decimals,
  messages,
}: {
  value: string;
  decimals: number;
  messages?: {
    amountPrompt: string;
    amountInvalid: string;
    amountDecimals: string;
    amountPositive: string;
  };
}): ParsedTokenAmountResult => {
  const result = parseTokenAmount({
    value,
    decimals,
    symbol: usdcSymbol,
  });

  if (result.status !== "invalid" || !messages) {
    return result;
  }

  const normalizedMessage =
    result.message === `Enter an amount of ${usdcSymbol}.`
      ? messages.amountPrompt
      : result.message === `Enter a valid ${usdcSymbol} amount.`
        ? messages.amountInvalid
        : result.message === `${usdcSymbol} supports up to ${decimals} decimal places.`
          ? messages.amountDecimals
          : result.message === "Enter an amount greater than zero."
            ? messages.amountPositive
            : result.message;

  return {
    ...result,
    message: normalizedMessage,
  };
};

export const buildDepositPreview = ({
  vault,
  amountAtomic,
  decimals,
}: {
  vault: Pick<VaultSummary, "savedAmountAtomic" | "targetAmountAtomic">;
  amountAtomic: bigint;
  decimals: number;
}): DepositPreview => {
  const resultingSavedAmountAtomic = vault.savedAmountAtomic + amountAtomic;
  const remainingAtomic = vault.targetAmountAtomic > resultingSavedAmountAtomic ? vault.targetAmountAtomic - resultingSavedAmountAtomic : 0n;
  const depositAmount = formatAtomicUsdcToNumber({
    value: amountAtomic,
    decimals,
  });
  const resultingSavedAmount = formatAtomicUsdcToNumber({
    value: resultingSavedAmountAtomic,
    decimals,
  });
  const targetAmount = formatAtomicUsdcToNumber({
    value: vault.targetAmountAtomic,
    decimals,
  });
  const resultingRemainingAmount = formatAtomicUsdcToNumber({
    value: remainingAtomic,
    decimals,
  });

  return {
    depositAmount,
    resultingSavedAmount,
    resultingProgressRatio: targetAmount > 0 ? Math.min(resultingSavedAmount / targetAmount, 1) : 0,
    resultingRemainingAmount,
  };
};

export const buildWithdrawPreview = ({
  vault,
  amountAtomic,
  decimals,
}: {
  vault: Pick<VaultSummary, "savedAmountAtomic" | "targetAmountAtomic" | "currentBalanceAtomic">;
  amountAtomic: bigint;
  decimals: number;
}): WithdrawPreview => {
  const resultingSavedAmountAtomic = vault.savedAmountAtomic > amountAtomic ? vault.savedAmountAtomic - amountAtomic : 0n;
  const remainingAtomic = vault.targetAmountAtomic > resultingSavedAmountAtomic ? vault.targetAmountAtomic - resultingSavedAmountAtomic : 0n;
  const withdrawAmount = formatAtomicUsdcToNumber({
    value: amountAtomic,
    decimals,
  });
  const resultingSavedAmount = formatAtomicUsdcToNumber({
    value: resultingSavedAmountAtomic,
    decimals,
  });
  const targetAmount = formatAtomicUsdcToNumber({
    value: vault.targetAmountAtomic,
    decimals,
  });
  const resultingRemainingAmount = formatAtomicUsdcToNumber({
    value: remainingAtomic,
    decimals,
  });

  return {
    withdrawAmount,
    resultingSavedAmount,
    resultingProgressRatio: targetAmount > 0 ? Math.min(resultingSavedAmount / targetAmount, 1) : 0,
    resultingRemainingAmount,
  };
};

export const isAllowanceSufficient = ({
  allowanceAtomic,
  amountAtomic,
}: {
  allowanceAtomic: bigint | null;
  amountAtomic: bigint | null;
}) => {
  if (allowanceAtomic === null || amountAtomic === null || amountAtomic <= 0n) {
    return false;
  }

  return allowanceAtomic >= amountAtomic;
};
