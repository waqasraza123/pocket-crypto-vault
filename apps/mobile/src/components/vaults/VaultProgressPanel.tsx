import { View } from "react-native";

import type { VaultDetail } from "../../types";
import { formatProgress, formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, ProgressBar, SurfaceCard } from "../primitives";

export interface VaultProgressPanelProps {
  vault: VaultDetail;
}

export const VaultProgressPanel = ({ vault }: VaultProgressPanelProps) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard>
      <View style={{ gap: spacing[2] }}>
        <AppHeading size="md">{messages.common.labels.progress}</AppHeading>
        <AppText size="xl" weight="semibold">
          {formatUsdc(vault.savedAmount)}
        </AppText>
        <AppText tone="secondary">
          {formatProgress(vault.progressRatio)} {messages.common.labels.of} {formatUsdc(vault.targetAmount)}
        </AppText>
      </View>
      <ProgressBar progress={vault.progressRatio} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
        <View
          style={{
            flex: 1,
            minWidth: 160,
            gap: spacing[1],
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.backgroundElevated,
            padding: spacing[4],
          }}
        >
          <AppText size="sm" tone="secondary">
            {messages.common.labels.targetAmount}
          </AppText>
          <AppText weight="semibold">{formatUsdc(vault.targetAmount)}</AppText>
        </View>
        <View
          style={{
            flex: 1,
            minWidth: 160,
            gap: spacing[1],
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.backgroundElevated,
            padding: spacing[4],
          }}
        >
          <AppText size="sm" tone="secondary">
            {messages.common.labels.remainingToTarget}
          </AppText>
          <AppText weight="semibold">{formatUsdc(Math.max(vault.targetAmount - vault.savedAmount, 0))}</AppText>
        </View>
      </View>
    </SurfaceCard>
  );
};
