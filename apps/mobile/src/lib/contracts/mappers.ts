import { mapVaultDetail, mapVaultSummary } from "@goal-vault/contracts-sdk";
import type { CreateVaultFormInput, CreateVaultReviewModel, VaultAccentTheme, VaultDetail, VaultMetadataRecord, VaultSummary } from "@goal-vault/shared";
import { parseAmountInput } from "@goal-vault/shared";
import { parseUnits } from "viem";

import { formatLongDate, formatUsdc } from "../format";
import { getCurrentMessages } from "../i18n";
import { getContractConfigForChain } from "./registry";

export { mapVaultDetail, mapVaultSummary };

const vaultAccentThemeTones: Record<VaultAccentTheme, string> = {
  sand: "#87684f",
  sage: "#66735c",
  sky: "#5f7f96",
  terracotta: "#9a5f4d",
};

export const getVaultAccentThemeOptions = (): Array<{ value: VaultAccentTheme; label: string; tone: string }> => {
  const messages = getCurrentMessages().pages.createVault.accentThemes;

  return [
    { value: "sand", label: messages.sand, tone: vaultAccentThemeTones.sand },
    { value: "sage", label: messages.sage, tone: vaultAccentThemeTones.sage },
    { value: "sky", label: messages.sky, tone: vaultAccentThemeTones.sky },
    { value: "terracotta", label: messages.terracotta, tone: vaultAccentThemeTones.terracotta },
  ];
};

export const getVaultAccentTone = (accentTheme?: VaultAccentTheme | "") =>
  (accentTheme ? vaultAccentThemeTones[accentTheme] : null) ?? vaultAccentThemeTones.sand;

export const getVaultAccentThemeLabel = (accentTheme?: VaultAccentTheme | "") =>
  getVaultAccentThemeOptions().find((option) => option.value === accentTheme)?.label ?? null;

export const buildCreateVaultReviewModel = ({
  chainId,
  values,
}: {
  chainId: VaultSummary["chainId"];
  values: CreateVaultFormInput;
}): CreateVaultReviewModel => {
  const messages = getCurrentMessages();
  const normalizedTargetAmount = values.targetAmount.replaceAll(",", "").trim();
  const targetAmount = parseAmountInput(normalizedTargetAmount);
  const unlockTimestamp = BigInt(Math.floor(Date.parse(values.unlockDate) / 1000));
  const unlockDateLabel = formatLongDate(values.unlockDate);
  const networkLabel = chainId === 84532 ? messages.common.networkBaseSepolia : messages.common.networkBase;

  return {
    goalName: values.goalName.trim(),
    category: values.category.trim() || undefined,
    note: values.note.trim(),
    accentTheme: values.accentTheme || undefined,
    accentTone: getVaultAccentTone(values.accentTheme),
    targetAmount,
    targetAmountAtomic: parseUnits(normalizedTargetAmount, 6),
    targetAmountDisplay: formatUsdc(targetAmount),
    assetSymbol: "USDC",
    networkLabel,
    unlockDate: values.unlockDate,
    unlockDateLabel,
    unlockTimestamp,
    protectionCopy: [
      messages.pages.createVault.stateBanner,
      `${messages.common.labels.networkAndAsset}: ${networkLabel} • USDC`,
      messages.pages.createVault.timeLockDescription,
      `${messages.common.labels.unlockDate}: ${unlockDateLabel}`,
    ],
  };
};

export const mergeVaultSummaryWithMetadata = ({
  vault,
  metadata,
}: {
  vault: VaultSummary;
  metadata: VaultMetadataRecord | null;
}): VaultSummary => {
  if (!metadata) {
    return vault;
  }

  return {
    ...vault,
    goalName: metadata.displayName,
    category: metadata.category,
    note: metadata.note,
    accentTheme: metadata.accentTheme,
    accentTone: metadata.accentTone,
    metadataStatus: metadata.metadataStatus,
  };
};

export const createSessionVaultSummary = (metadata: VaultMetadataRecord): VaultSummary => {
  const contractConfig = getContractConfigForChain(metadata.chainId);
  const targetAmount = parseAmountInput(metadata.targetAmount);
  const targetAmountAtomic = parseUnits(metadata.targetAmount.replaceAll(",", "").trim(), 6);

  return {
    address: metadata.contractAddress,
    chainId: metadata.chainId,
    assetAddress: contractConfig.usdcAddress,
    ownerAddress: metadata.ownerWallet,
    goalName: metadata.displayName,
    category: metadata.category,
    note: metadata.note,
    targetAmount,
    savedAmount: 0,
    unlockDate: new Date(metadata.unlockDate).toISOString(),
    ruleType: "timeLock",
    status: "active",
    accentTheme: metadata.accentTheme,
    accentTone: metadata.accentTone,
    metadataStatus: metadata.metadataStatus,
    targetAmountAtomic,
    savedAmountAtomic: 0n,
    totalDepositedAtomic: 0n,
    totalWithdrawnAtomic: 0n,
    currentBalanceAtomic: 0n,
    progressRatio: 0,
    source: "session",
  };
};

export const createSessionVaultDetail = (metadata: VaultMetadataRecord): VaultDetail => mapVaultDetail(createSessionVaultSummary(metadata));
