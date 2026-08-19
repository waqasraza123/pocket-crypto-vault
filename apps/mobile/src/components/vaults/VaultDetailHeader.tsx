import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { formatLongDate, formatProgress, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { colors, createShadowStyle, radii, spacing } from "../../theme";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import type { VaultDetail } from "../../types";
import { AnimatedNumberText, AppHeading, AppText, MotionView, ProgressBar, SurfaceCard } from "../primitives";
import { VaultCardStatus } from "./VaultCardStatus";

export interface VaultDetailHeaderProps {
  vault: VaultDetail;
}

export const VaultDetailHeader = ({ vault }: VaultDetailHeaderProps) => {
  const breakpoint = useBreakpoint();
  const { inlineDirection, messages } = useI18n();
  const accentTone = vault.accentTone || colors.accentStrong;
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
  const metrics = [
    {
      label: messages.common.labels.totalSaved,
      value: formatUsdc(vault.savedAmount),
      icon: "wallet-outline",
      backgroundColor: colors.accentSoft,
      iconColor: colors.accentStrong,
    },
    {
      label: messages.common.labels.targetAmount,
      value: formatUsdc(vault.targetAmount),
      icon: "flag-checkered",
      backgroundColor: colors.positiveSoft,
      iconColor: colors.positive,
    },
    {
      label: messages.common.labels.progress,
      value: formatProgress(vault.progressRatio),
      icon: "chart-line",
      backgroundColor: colors.warningSoft,
      iconColor: colors.warning,
    },
  ] satisfies Array<{
    label: string;
    value: string;
    icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
    backgroundColor: string;
    iconColor: string;
  }>;

  return (
    <SurfaceCard
      accentColor={accentTone}
      level="floating"
      style={{ backgroundColor: colors.backgroundElevated, borderColor: colors.borderStrong, padding: breakpoint.isCompact ? spacing[4] : spacing[5] }}
    >
      <View style={{ gap: breakpoint.isCompact ? spacing[4] : spacing[5] }}>
        <View style={{ flexDirection: inlineDirection(), justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
          <VaultCardStatus status={vault.status} />
          <View
            style={{
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              backgroundColor: colors.surfaceMuted,
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
            }}
          >
            <AppText size="sm" tone="secondary" weight="semibold">
              Base • USDC
            </AppText>
          </View>
        </View>

        <MotionView style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radii.md,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.accentSoft,
              borderWidth: 1,
              borderColor: colors.borderStrong,
            }}
          >
            <MaterialCommunityIcons color={accentTone} name="bullseye-arrow" size={25} />
          </View>
          <View style={{ flex: 1, gap: spacing[2] }}>
            <AppHeading size={breakpoint.isCompact ? "lg" : "xl"}>{vault.goalName}</AppHeading>
            {vault.note ? <AppText tone="secondary">{vault.note}</AppText> : null}
            {vault.category ? <AppText size="sm" tone="accent" weight="semibold">{vault.category}</AppText> : null}
          </View>
        </MotionView>

        <View
          style={{
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: accentTone,
            backgroundColor: colors.textPrimary,
            padding: breakpoint.isCompact ? spacing[4] : spacing[5],
            gap: spacing[4],
            overflow: "hidden",
            ...createShadowStyle({
              color: accentTone,
              opacity: 0.18,
              radius: 28,
              offsetY: 16,
              elevation: 5,
            }),
            elevation: 5,
          }}
        >
          <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: accentTone }} />
          <View style={{ flexDirection: inlineDirection(), justifyContent: "space-between", alignItems: "flex-start", gap: spacing[3] }}>
            <View style={{ flex: 1, gap: spacing[1] }}>
              <AppText size="sm" style={{ color: "#bfdbfe" }} weight="semibold">
                {messages.common.labels.totalSaved}
              </AppText>
              <AnimatedNumberText formatValue={formatUsdc} size={breakpoint.isCompact ? "lg" : "xl"} style={{ color: colors.white }} value={vault.savedAmount} weight="semibold" />
            </View>
            <View
              style={{
                alignSelf: "flex-start",
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[2],
              }}
            >
              <AppText size="sm" style={{ color: "#d1fae5" }} weight="semibold">
                {formatProgress(vault.progressRatio)}
              </AppText>
            </View>
          </View>
          <View style={{ gap: spacing[2] }}>
            <ProgressBar
              emphasizeCompletion
              progress={vault.progressRatio}
              tone={vault.progressRatio >= 1 ? "positive" : "accent"}
              height={12}
            />
            <AppText style={{ color: "#cbd5e1" }}>
              {messages.common.labels.of} {formatUsdc(vault.targetAmount)}
            </AppText>
          </View>
        </View>

        <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[3] }}>
          {metrics.map((metric) => (
            <View
              key={metric.label}
              style={{
                flex: 1,
                minWidth: 170,
                gap: spacing[3],
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.borderStrong,
                backgroundColor: colors.surfaceGlass,
                padding: spacing[4],
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radii.sm,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: metric.backgroundColor,
                }}
              >
                <MaterialCommunityIcons color={metric.iconColor} name={metric.icon} size={18} />
              </View>
              <View style={{ gap: spacing[1] }}>
                <AppText size="sm" tone="secondary">
                  {metric.label}
                </AppText>
                <AppText weight="semibold">{metric.value}</AppText>
              </View>
            </View>
          ))}
        </View>

        <View
          style={{
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            backgroundColor: colors.accentSoft,
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
