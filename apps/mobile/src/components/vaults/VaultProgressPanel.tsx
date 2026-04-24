import { View } from "react-native";

import type { VaultDetail } from "../../types";
import { formatProgress, formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AnimatedNumberText, AppHeading, AppText, MotionView, ProgressBar, SurfaceCard } from "../primitives";

export interface VaultProgressPanelProps {
  vault: VaultDetail;
}

export const VaultProgressPanel = ({ vault }: VaultProgressPanelProps) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard>
      <MotionView style={{ gap: spacing[2] }}>
        <AppHeading size="md">{messages.common.labels.progress}</AppHeading>
        <AnimatedNumberText formatValue={formatUsdc} size="xl" value={vault.savedAmount} weight="semibold" />
        <AppText tone="secondary">
          {formatProgress(vault.progressRatio)} {messages.common.labels.of} {formatUsdc(vault.targetAmount)}
        </AppText>
      </MotionView>
      <ProgressBar progress={vault.progressRatio} tone={vault.progressRatio >= 1 ? "positive" : "accent"} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
        <View
          style={{
            flex: 1,
            minWidth: 160,
            gap: spacing[1],
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.backgroundElevated,
            padding: spacing[4],
          }}
        >
          <AppText size="sm" tone="secondary">
            {messages.common.labels.targetAmount}
          </AppText>
          <AnimatedNumberText formatValue={formatUsdc} value={vault.targetAmount} weight="semibold" />
        </View>
        <View
          style={{
            flex: 1,
            minWidth: 160,
            gap: spacing[1],
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.backgroundElevated,
            padding: spacing[4],
          }}
        >
          <AppText size="sm" tone="secondary">
            {messages.common.labels.remainingToTarget}
          </AppText>
          <AnimatedNumberText formatValue={formatUsdc} value={Math.max(vault.targetAmount - vault.savedAmount, 0)} weight="semibold" />
        </View>
      </View>
    </SurfaceCard>
  );
};
