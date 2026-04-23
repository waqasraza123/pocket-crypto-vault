import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { formatLongDate, formatProgress, formatUsdc } from "../../lib/format";
import { colors, spacing } from "../../theme";
import { AppHeading, AppText, ProgressBar, StatusChip, SurfaceCard } from "../primitives";

export const HeroVaultPreviewCard = () => {
  return (
    <SurfaceCard tone="default" style={{ backgroundColor: colors.backgroundElevated }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
        <View style={{ gap: spacing[2], flex: 1 }}>
          <AppText size="sm" tone="accent" weight="semibold">
            Goal Vault preview
          </AppText>
          <AppHeading size="lg">Emergency Reserve</AppHeading>
          <AppText tone="secondary">Protected for the period when you want zero impulse access.</AppText>
        </View>
        <StatusChip label="Your vault is active" />
      </View>
      <View style={{ gap: spacing[2] }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AppText tone="secondary">Saved</AppText>
          <AppText weight="semibold">{formatUsdc(7450)}</AppText>
        </View>
        <ProgressBar progress={0.62} />
        <AppText size="sm" tone="muted">
          {formatProgress(0.62)} of {formatUsdc(12000)}
        </AppText>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
        <MaterialCommunityIcons color={colors.accentStrong} name="calendar-lock-outline" size={18} />
        <AppText tone="secondary">Unlocks on {formatLongDate("2026-08-30T00:00:00.000Z")}</AppText>
      </View>
    </SurfaceCard>
  );
};
