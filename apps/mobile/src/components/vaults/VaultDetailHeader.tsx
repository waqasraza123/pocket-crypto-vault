import { View } from "react-native";

import type { VaultDetail } from "../../types";
import { formatLongDate, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AnimatedNumberText, AppHeading, AppText, MotionView, SurfaceCard } from "../primitives";
import { VaultCardStatus } from "./VaultCardStatus";

export interface VaultDetailHeaderProps {
  vault: VaultDetail;
}

export const VaultDetailHeader = ({ vault }: VaultDetailHeaderProps) => {
  const { messages } = useI18n();
  const protectionDescription =
    vault.ruleType === "timeLock"
      ? interpolate(messages.vaults.protectionRuleUnlocksOn, { date: formatLongDate(vault.unlockDate ?? new Date().toISOString()) })
      : vault.ruleType === "cooldownUnlock"
        ? vault.ruleSummary.type === "cooldownUnlock"
          ? `This vault uses a ${vault.ruleSummary.cooldownDurationLabel} cooldown unlock.`
          : "This vault uses a cooldown unlock."
        : vault.ruleSummary.type === "guardianApproval"
          ? `Guardian approval required from ${vault.ruleSummary.guardianLabel}.`
          : "Guardian approval required.";

  return (
    <SurfaceCard level="floating" style={{ backgroundColor: colors.backgroundElevated }}>
      <View style={{ gap: spacing[4] }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
          <VaultCardStatus status={vault.status} />
          <View
            style={{
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceGlass,
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
            }}
          >
            <AppText size="sm" tone="secondary" weight="semibold">
              Base • USDC
            </AppText>
          </View>
        </View>
        <MotionView style={{ gap: spacing[2] }}>
          <AppHeading size="xl">{vault.goalName}</AppHeading>
          {vault.note ? <AppText tone="secondary">{vault.note}</AppText> : null}
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.vaults.status[vault.status]}
          </AppText>
        </MotionView>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
          <View
            style={{
              flex: 1,
              minWidth: 180,
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
            <AnimatedNumberText formatValue={formatUsdc} size="xl" value={vault.savedAmount} weight="semibold" />
          </View>
          <View
            style={{
              flex: 1,
              minWidth: 180,
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
            <AnimatedNumberText formatValue={formatUsdc} value={vault.targetAmount} weight="semibold" />
          </View>
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
          <AppText size="lg" weight="semibold">
            {interpolate(messages.vaults.detailSaved, { amount: formatUsdc(vault.savedAmount) })}
          </AppText>
          <AppText tone="secondary">{protectionDescription}</AppText>
        </View>
      </View>
    </SurfaceCard>
  );
};
