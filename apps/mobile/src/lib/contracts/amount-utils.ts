import {
  formatTokenAmount,
  formatTokenAmountNumber,
  getUsdcAddress,
  parseTokenAmount,
} from "@goal-vault/contracts-sdk";

import type { DepositPreview, SupportedChainId, VaultSummary } from "../../types";

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
}: {
  value: string;
  decimals: number;
}) =>
  parseTokenAmount({
    value,
    decimals,
    symbol: usdcSymbol,
  });

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
