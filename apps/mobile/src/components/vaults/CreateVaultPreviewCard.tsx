import type { CreateVaultInput } from "../../types";
import { View } from "react-native";
import { formatLongDate, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { getVaultAccentThemeLabel, getVaultAccentTone } from "../../lib/contracts/mappers";
import { colors, radii, spacing } from "../../theme";
import { AnimatedNumberText, AppHeading, AppText, MotionView, ProgressBar, SurfaceCard } from "../primitives";

export interface CreateVaultPreviewCardProps {
  values: CreateVaultInput;
  targetAmount: number;
}

export const CreateVaultPreviewCard = ({ values, targetAmount }: CreateVaultPreviewCardProps) => {
  const { messages } = useI18n();
  const protectionLabel =
    values.ruleType === "timeLock"
      ? values.unlockDate
        ? interpolate(messages.vaults.protectionRuleUnlocksOn, { date: formatLongDate(values.unlockDate) })
        : messages.pages.createVault.preview.chooseUnlockDate
      : values.ruleType === "cooldownUnlock"
        ? `${values.cooldownDays || "7"} day cooldown`
        : values.guardianAddress || "Guardian approval";

  return (
    <SurfaceCard tone="accent" level="floating" style={{ borderColor: getVaultAccentTone(values.accentTheme), backgroundColor: colors.backgroundElevated }}>
      <View style={{ gap: spacing[4] }}>
        <MotionView style={{ gap: spacing[2] }}>
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.common.labels.livePreview}
          </AppText>
          <AppHeading size="lg">{values.goalName || messages.pages.createVault.preview.emptyGoal}</AppHeading>
          <AppText tone="secondary">{values.note || messages.pages.createVault.preview.emptyNote}</AppText>
          {values.category ? <AppText tone="secondary">{values.category}</AppText> : null}
        </MotionView>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
          <View
            style={{
              flex: 1,
              minWidth: 140,
              gap: spacing[1],
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceGlass,
              padding: spacing[4],
            }}
          >
            <AppText size="sm" tone="secondary">
              {messages.common.labels.targetAmount}
            </AppText>
            <AnimatedNumberText formatValue={formatUsdc} value={targetAmount || 0} weight="semibold" />
          </View>
          <View
            style={{
              flex: 1,
              minWidth: 140,
              gap: spacing[1],
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceGlass,
              padding: spacing[4],
            }}
          >
            <AppText size="sm" tone="secondary">
              {messages.common.labels.protectionRule}
            </AppText>
            <AppText weight="semibold">{protectionLabel}</AppText>
          </View>
        </View>

        <View style={{ gap: spacing[2] }}>
          <AppText size="sm" tone="secondary">
            {messages.common.labels.progress}
          </AppText>
          <ProgressBar progress={targetAmount > 0 ? 0.18 : 0} />
          <AppText size="sm" tone="muted">
            {messages.pages.createVault.preview.progressHint}
          </AppText>
        </View>

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
          <AppText tone="secondary">{messages.pages.createVault.preview.networkSummary}</AppText>
          {values.accentTheme ? <AppText tone="secondary">{getVaultAccentThemeLabel(values.accentTheme)}</AppText> : null}
        </View>
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
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.pages.createVault.reviewWalkthroughTitle}
          </AppText>
          <AppText tone="secondary">{messages.pages.createVault.reviewWalkthroughDescription}</AppText>
        </View>
      </View>
    </SurfaceCard>
  );
};
