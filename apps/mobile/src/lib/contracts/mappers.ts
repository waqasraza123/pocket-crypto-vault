import { mapVaultDetail, mapVaultSummary } from "@goal-vault/contracts-sdk";
import type {
  CreateVaultFormInput,
  CreateVaultReviewModel,
  VaultAccentTheme,
  VaultDetail,
  VaultMetadataRecord,
  VaultRuleSummary,
  VaultSummary,
} from "@goal-vault/shared";
import { parseAmountInput } from "@goal-vault/shared";
import { parseUnits, isAddress } from "viem";

import { formatLongDate, formatUsdc } from "../format";
import { getCurrentMessages } from "../i18n";
import { getContractConfigForChain } from "./registry";

export { mapVaultDetail, mapVaultSummary };

const vaultAccentThemeTones: Record<VaultAccentTheme, string> = {
  sand: "#c48a4d",
  sage: "#64815c",
  sky: "#6b9185",
  terracotta: "#bf6c49",
};

const formatCooldownDurationLabel = (days: number) => `${days} day${days === 1 ? "" : "s"}`;

const buildCreateRuleSummary = (values: CreateVaultFormInput): VaultRuleSummary => {
  if (values.ruleType === "cooldownUnlock") {
    const cooldownDays = Math.max(Number.parseInt(values.cooldownDays, 10) || 0, 0);
    const cooldownDurationSeconds = cooldownDays * 86_400;

    return {
      type: "cooldownUnlock",
      cooldownDurationSeconds,
      cooldownDurationDays: cooldownDays,
      cooldownDurationLabel: formatCooldownDurationLabel(cooldownDays),
      unlockRequestedAt: null,
      unlockEligibleAt: null,
      unlockEligibleTimestampMs: null,
    };
  }

  if (values.ruleType === "guardianApproval") {
    const guardianAddress = isAddress(values.guardianAddress as `0x${string}`)
      ? (values.guardianAddress as `0x${string}`)
      : "0x0000000000000000000000000000000000000000";

    return {
      type: "guardianApproval",
      guardianAddress,
      guardianLabel: `${guardianAddress.slice(0, 6)}…${guardianAddress.slice(-4)}`,
      unlockRequestedAt: null,
      guardianDecision: "not_requested",
      guardianDecisionAt: null,
    };
  }

  return {
    type: "timeLock",
    unlockDate: values.unlockDate,
    unlockTimestampMs: Date.parse(values.unlockDate),
  };
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
  const networkLabel = chainId === 84532 ? messages.common.networkBaseSepolia : messages.common.networkBase;
  const ruleSummary = buildCreateRuleSummary(values);

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
    ruleType: values.ruleType,
    ruleSummary,
    unlockDate: ruleSummary.type === "timeLock" ? values.unlockDate : null,
    unlockDateLabel: ruleSummary.type === "timeLock" ? formatLongDate(values.unlockDate) : null,
    unlockTimestamp: ruleSummary.type === "timeLock" ? BigInt(Math.floor(Date.parse(values.unlockDate) / 1000)) : null,
    cooldownDurationSeconds:
      ruleSummary.type === "cooldownUnlock" ? BigInt(ruleSummary.cooldownDurationSeconds) : null,
    cooldownDurationLabel: ruleSummary.type === "cooldownUnlock" ? ruleSummary.cooldownDurationLabel : null,
    guardianAddress: ruleSummary.type === "guardianApproval" ? ruleSummary.guardianAddress : null,
    protectionCopy: [
      messages.pages.createVault.stateBanner,
      `${messages.common.labels.networkAndAsset}: ${networkLabel} • USDC`,
      ruleSummary.type === "timeLock"
        ? messages.pages.createVault.timeLockDescription
        : ruleSummary.type === "cooldownUnlock"
          ? "Request unlock first. Funds become withdrawable after the cooldown ends."
          : "A guardian must approve unlock before this vault can be withdrawn.",
      ruleSummary.type === "timeLock"
        ? `${messages.common.labels.unlockDate}: ${formatLongDate(values.unlockDate)}`
        : ruleSummary.type === "cooldownUnlock"
          ? `Cooldown: ${ruleSummary.cooldownDurationLabel}`
          : `Guardian: ${ruleSummary.guardianLabel}`,
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
    ruleType: metadata.ruleType,
    unlockDate:
      metadata.ruleType === "timeLock" ? new Date(metadata.unlockDate ?? new Date().toISOString()).toISOString() : null,
    ruleSummary:
      metadata.ruleType === "timeLock"
        ? {
            type: "timeLock",
            unlockDate: new Date(metadata.unlockDate ?? new Date().toISOString()).toISOString(),
            unlockTimestampMs: Date.parse(metadata.unlockDate ?? new Date().toISOString()),
          }
        : metadata.ruleType === "cooldownUnlock"
          ? {
              type: "cooldownUnlock",
              cooldownDurationSeconds: metadata.cooldownDurationSeconds ?? 0,
              cooldownDurationDays: Math.round((metadata.cooldownDurationSeconds ?? 0) / 86_400),
              cooldownDurationLabel: formatCooldownDurationLabel(Math.round((metadata.cooldownDurationSeconds ?? 0) / 86_400)),
              unlockRequestedAt: null,
              unlockEligibleAt: null,
              unlockEligibleTimestampMs: null,
            }
          : {
              type: "guardianApproval",
              guardianAddress: metadata.guardianAddress ?? "0x0000000000000000000000000000000000000000",
              guardianLabel: metadata.guardianAddress
                ? `${metadata.guardianAddress.slice(0, 6)}…${metadata.guardianAddress.slice(-4)}`
                : "Guardian",
              unlockRequestedAt: null,
              guardianDecision: "not_requested",
              guardianDecisionAt: null,
            },
  };
};

export const createSessionVaultSummary = (metadata: VaultMetadataRecord): VaultSummary => {
  const contractConfig = getContractConfigForChain(metadata.chainId);
  const targetAmount = parseAmountInput(metadata.targetAmount);
  const targetAmountAtomic = parseUnits(metadata.targetAmount.replaceAll(",", "").trim(), 6);
  const ruleSummary =
    metadata.ruleType === "timeLock"
      ? {
          type: "timeLock" as const,
          unlockDate: new Date(metadata.unlockDate ?? new Date().toISOString()).toISOString(),
          unlockTimestampMs: Date.parse(metadata.unlockDate ?? new Date().toISOString()),
        }
      : metadata.ruleType === "cooldownUnlock"
        ? {
            type: "cooldownUnlock" as const,
            cooldownDurationSeconds: metadata.cooldownDurationSeconds ?? 0,
            cooldownDurationDays: Math.round((metadata.cooldownDurationSeconds ?? 0) / 86_400),
            cooldownDurationLabel: formatCooldownDurationLabel(Math.round((metadata.cooldownDurationSeconds ?? 0) / 86_400)),
            unlockRequestedAt: null,
            unlockEligibleAt: null,
            unlockEligibleTimestampMs: null,
          }
        : {
            type: "guardianApproval" as const,
            guardianAddress: metadata.guardianAddress ?? "0x0000000000000000000000000000000000000000",
            guardianLabel: metadata.guardianAddress
              ? `${metadata.guardianAddress.slice(0, 6)}…${metadata.guardianAddress.slice(-4)}`
              : "Guardian",
            unlockRequestedAt: null,
            guardianDecision: "not_requested" as const,
            guardianDecisionAt: null,
          };

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
    unlockDate: metadata.ruleType === "timeLock" ? new Date(metadata.unlockDate ?? new Date().toISOString()).toISOString() : null,
    ruleType: metadata.ruleType,
    ruleSummary,
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
