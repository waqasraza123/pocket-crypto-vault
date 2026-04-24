import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { formatLongDate, formatProgress, formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AnimatedNumberText, AppHeading, AppText, MotionView, ProgressBar, StatusChip, SurfaceCard } from "../primitives";

export const HeroVaultPreviewCard = () => {
  const { messages } = useI18n();
  const savedAmount = 7450;
  const targetAmount = 12000;
  const progress = 0.62;

  return (
    <SurfaceCard tone="default" level="floating" style={{ backgroundColor: colors.backgroundElevated, gap: spacing[5] }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
        <MotionView style={{ gap: spacing[2], flex: 1 }} preset="rise" intensity="emphasis">
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.heroPreviewLabel}
          </AppText>
          <AppHeading size="lg">{messages.landing.heroPreviewGoal}</AppHeading>
          <AppText tone="secondary">{messages.landing.heroPreviewDescription}</AppText>
        </MotionView>
        <StatusChip label={messages.vaults.status.active} />
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing[3],
        }}
      >
        <View
          style={{
            flex: 1,
            minWidth: 150,
            gap: spacing[1],
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceGlass,
            padding: spacing[4],
          }}
        >
            <AppText size="sm" tone="secondary">
              {messages.common.labels.totalSaved}
            </AppText>
            <AnimatedNumberText formatValue={formatUsdc} size="xl" value={savedAmount} weight="semibold" />
        </View>
        <View
          style={{
            flex: 1,
            minWidth: 150,
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
            <AnimatedNumberText formatValue={formatUsdc} size="xl" value={targetAmount} weight="semibold" />
        </View>
      </View>
      <View style={{ gap: spacing[2] }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText tone="secondary">{messages.common.labels.progress}</AppText>
          <AppText weight="semibold">{formatProgress(progress)}</AppText>
        </View>
        <ProgressBar progress={progress} />
        <AppText size="sm" tone="muted">
          {formatProgress(progress)} of {formatUsdc(targetAmount)}
        </AppText>
      </View>
      <View
        style={{
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceGlass,
          padding: spacing[4],
          gap: spacing[3],
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
          <MaterialCommunityIcons color={colors.accentStrong} name="calendar-lock-outline" size={18} />
          <AppText tone="secondary">Unlocks on {formatLongDate("2026-08-30T00:00:00.000Z")}</AppText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
          <MaterialCommunityIcons color={colors.accentStrong} name="cash-lock" size={18} />
          <AppText tone="secondary">{messages.landing.heroPreviewFooter}</AppText>
        </View>
      </View>
      <View
        style={{
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceGlass,
          padding: spacing[4],
          gap: spacing[3],
        }}
      >
        <AppText size="sm" tone="accent" weight="semibold">
          {messages.landing.heroPreviewActivityLabel}
        </AppText>
        <View style={{ gap: spacing[3] }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: colors.accentStrong,
              }}
            />
            <AppText tone="secondary">{messages.landing.heroPreviewActivityCreated}</AppText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: colors.accentStrong,
              }}
            />
            <AppText tone="secondary">{messages.landing.heroPreviewActivityFunded}</AppText>
          </View>
        </View>
      </View>
    </SurfaceCard>
  );
};
