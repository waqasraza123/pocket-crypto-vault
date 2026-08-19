import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";
import { colors, createShadowStyle, radii, spacing } from "../../theme";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import type { VaultSummary } from "../../types";
import { AppHeading, AppText, MotionView, SecondaryButton, SurfaceCard } from "../primitives";
import { VaultCardAmount } from "./VaultCardAmount";
import { VaultCardProgress } from "./VaultCardProgress";
import { VaultCardRule } from "./VaultCardRule";
import { VaultCardStatus } from "./VaultCardStatus";

export interface VaultCardProps {
  vault: VaultSummary;
}

export const VaultCard = ({ vault }: VaultCardProps) => {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const { inlineDirection, messages } = useI18n();
  const isFunded = vault.progressRatio >= 1;
  const ruleLabel =
    vault.ruleType === "guardianApproval"
      ? "Guardian approval"
      : vault.ruleType === "cooldownUnlock"
        ? "Cooldown unlock"
        : messages.common.labels.timeLock;
  const ruleIcon = (
    vault.ruleType === "guardianApproval"
      ? "account-supervisor-circle-outline"
      : vault.ruleType === "cooldownUnlock"
        ? "timer-sand"
        : "calendar-lock-outline"
  ) satisfies ComponentProps<typeof MaterialCommunityIcons>["name"];

  return (
    <SurfaceCard
      accent={isFunded ? "top" : "left"}
      accentColor={isFunded ? colors.positive : colors.accent}
      level="floating"
      style={{
        flex: 1,
        minWidth: breakpoint.isCompact ? undefined : 280,
        backgroundColor: colors.backgroundElevated,
        borderColor: isFunded ? colors.positive : colors.borderStrong,
        padding: breakpoint.isCompact ? spacing[4] : spacing[5],
      }}
    >
      <MotionView style={{ gap: spacing[3] }}>
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

        <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radii.md,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isFunded ? colors.positiveSoft : colors.accentSoft,
              borderWidth: 1,
              borderColor: isFunded ? colors.positive : colors.borderStrong,
            }}
          >
            <MaterialCommunityIcons color={isFunded ? colors.positive : colors.accentStrong} name="bullseye-arrow" size={23} />
          </View>
          <View style={{ flex: 1, gap: spacing[1] }}>
            <AppHeading size="md">{vault.goalName}</AppHeading>
            <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
              <MaterialCommunityIcons
                color={vault.ruleType === "guardianApproval" ? colors.warning : colors.accentStrong}
                name={ruleIcon}
                size={18}
              />
              <AppText size="sm" tone="accent" weight="semibold">
                {ruleLabel}
              </AppText>
            </View>
          </View>
        </View>

        {vault.note ? (
          <View
            style={{
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              backgroundColor: colors.surfaceMuted,
            padding: spacing[4],
            }}
          >
            <AppText tone="secondary">{vault.note}</AppText>
          </View>
        ) : null}
      </MotionView>

      <View
        style={{
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.surface,
          padding: spacing[4],
          gap: spacing[4],
          ...createShadowStyle({
            color: colors.overlayStrong,
            opacity: 0.08,
            radius: 18,
            offsetY: 10,
            elevation: 2,
          }),
          elevation: 2,
        }}
      >
        <VaultCardAmount savedAmount={vault.savedAmount} targetAmount={vault.targetAmount} />
        <VaultCardProgress progressRatio={vault.progressRatio} />
      </View>

      <VaultCardRule
        description={
          vault.ruleType === "cooldownUnlock"
            ? vault.ruleSummary.type === "cooldownUnlock"
              ? `${vault.ruleSummary.cooldownDurationLabel} cooldown`
              : "Cooldown unlock"
            : vault.ruleType === "guardianApproval"
              ? "Guardian approval required"
              : undefined
        }
        ruleType={vault.ruleType}
        unlockDate={vault.unlockDate}
      />

      <View
        style={{
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.accentSoft,
          padding: spacing[4],
        }}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[2] }}>
          <MaterialCommunityIcons color={colors.accentStrong} name="shield-check-outline" size={18} />
          <AppText style={{ flex: 1 }} tone="secondary">
            {messages.vaults.ruleTruthDescription}
          </AppText>
        </View>
      </View>

      <SecondaryButton
        fullWidth={breakpoint.isCompact}
        icon="arrow-right"
        label={messages.common.buttons.openVault}
        onPress={() => router.push(routes.vaultDetail(vault.address))}
      />
    </SurfaceCard>
  );
};
