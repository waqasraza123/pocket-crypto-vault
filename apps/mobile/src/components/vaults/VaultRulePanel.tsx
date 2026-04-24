import { View } from "react-native";

import type { VaultDetail, WithdrawEligibility } from "../../types";
import { formatLongDate } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, SurfaceCard } from "../primitives";

export interface VaultRulePanelProps {
  vault: VaultDetail;
  eligibility?: WithdrawEligibility | null;
}

export const VaultRulePanel = ({ vault, eligibility }: VaultRulePanelProps) => {
  const { messages } = useI18n();
  const ruleMessage = eligibility?.message ?? vault.withdrawEligibility.message;
  const ruleLabel =
    vault.ruleType === "timeLock"
      ? messages.common.labels.timeLock
      : vault.ruleType === "cooldownUnlock"
        ? "Cooldown unlock"
        : "Guardian approval";
  const ruleDescription =
    vault.ruleType === "timeLock"
      ? interpolate(messages.vaults.protectionRuleUnlocksOn, { date: formatLongDate(vault.unlockDate ?? new Date().toISOString()) })
      : vault.ruleType === "cooldownUnlock"
        ? `Funds become withdrawable ${vault.ruleSummary.type === "cooldownUnlock" ? `after a ${vault.ruleSummary.cooldownDurationLabel} cooldown.` : "after the cooldown ends."}`
        : `Guardian approval is required before withdrawal becomes eligible.`;

  return (
    <SurfaceCard tone="muted">
      <MotionView
        style={{
          alignSelf: "flex-start",
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceGlass,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[2],
        }}
      >
        <AppText size="sm" tone="secondary" weight="semibold">
          {ruleLabel}
        </AppText>
      </MotionView>
      <AppHeading size="md">{messages.common.labels.protectionRule}</AppHeading>
      <AppText>{ruleDescription}</AppText>
      <View
        style={{
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceGlass,
          padding: spacing[4],
          gap: spacing[2],
        }}
      >
        <AppText tone="secondary">{ruleMessage}</AppText>
        <AppText tone="secondary">{messages.vaults.ruleTruthDescription}</AppText>
      </View>
    </SurfaceCard>
  );
};
