import { View } from "react-native";

import type { VaultDetail } from "../../types";
import { formatLongDate, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, SurfaceCard } from "../primitives";
import { VaultCardStatus } from "./VaultCardStatus";

export interface VaultDetailHeaderProps {
  vault: VaultDetail;
}

export const VaultDetailHeader = ({ vault }: VaultDetailHeaderProps) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard style={{ backgroundColor: colors.backgroundElevated }}>
      <View style={{ gap: spacing[4] }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
          <VaultCardStatus status={vault.status} />
          <View
            style={{
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
            }}
          >
            <AppText size="sm" tone="secondary" weight="semibold">
              Base • USDC
            </AppText>
          </View>
        </View>
        <View style={{ gap: spacing[2] }}>
          <AppHeading size="xl">{vault.goalName}</AppHeading>
          {vault.note ? <AppText tone="secondary">{vault.note}</AppText> : null}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
          <View
            style={{
              flex: 1,
              minWidth: 180,
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
            <AppHeading size="md">{formatUsdc(vault.savedAmount)}</AppHeading>
          </View>
          <View
            style={{
              flex: 1,
              minWidth: 180,
              gap: spacing[1],
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              padding: spacing[4],
            }}
          >
            <AppText size="sm" tone="secondary">
              {messages.common.labels.protectionRule}
            </AppText>
            <AppText weight="semibold">
              {interpolate(messages.vaults.protectionRuleUnlocksOn, { date: formatLongDate(vault.unlockDate) })}
            </AppText>
          </View>
        </View>
        <AppText size="lg" weight="semibold">
          {interpolate(messages.vaults.detailSaved, { amount: formatUsdc(vault.savedAmount) })}
        </AppText>
      </View>
    </SurfaceCard>
  );
};
