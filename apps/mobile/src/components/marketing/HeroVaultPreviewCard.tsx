import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { formatLongDate, formatProgress, formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, ProgressBar, StatusChip, SurfaceCard } from "../primitives";

export const HeroVaultPreviewCard = () => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="default" style={{ backgroundColor: colors.backgroundElevated, gap: spacing[5] }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
        <View style={{ gap: spacing[2], flex: 1 }}>
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.heroPreviewLabel}
          </AppText>
          <AppHeading size="lg">{messages.landing.heroPreviewGoal}</AppHeading>
          <AppText tone="secondary">{messages.landing.heroPreviewDescription}</AppText>
        </View>
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
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: spacing[4],
          }}
        >
            <AppText size="sm" tone="secondary">
              {messages.common.labels.totalSaved}
            </AppText>
            <AppHeading size="md">{formatUsdc(7450)}</AppHeading>
        </View>
        <View
          style={{
            flex: 1,
            minWidth: 150,
            gap: spacing[1],
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: spacing[4],
          }}
        >
            <AppText size="sm" tone="secondary">
              {messages.common.labels.targetAmount}
            </AppText>
            <AppHeading size="md">{formatUsdc(12000)}</AppHeading>
        </View>
      </View>
      <View style={{ gap: spacing[2] }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText tone="secondary">{messages.common.labels.progress}</AppText>
          <AppText weight="semibold">{formatProgress(0.62)}</AppText>
        </View>
        <ProgressBar progress={0.62} />
        <AppText size="sm" tone="muted">
          {formatProgress(0.62)} of {formatUsdc(12000)}
        </AppText>
      </View>
      <View
        style={{
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
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
    </SurfaceCard>
  );
};
