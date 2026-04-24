import { View } from "react-native";

import type { CreateVaultResult } from "../../types";
import { interpolate, useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";

export const CreateVaultSuccessCard = ({
  result,
  onViewVault,
  onBackToVaults,
}: {
  result: CreateVaultResult;
  onViewVault: () => void;
  onBackToVaults: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="accent" style={{ backgroundColor: colors.backgroundElevated }}>
      <View style={{ gap: spacing[4] }}>
        <View style={{ gap: spacing[2] }}>
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.pages.createVault.success.eyebrow}
          </AppText>
          <AppHeading size="lg">{result.review.goalName}</AppHeading>
          <AppText tone="secondary">{messages.pages.createVault.success.description}</AppText>
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
              {messages.common.labels.targetAmount}
            </AppText>
            <AppText weight="semibold">{result.review.targetAmountDisplay}</AppText>
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
              {interpolate(messages.vaults.protectionRuleUnlocksOn, { date: result.review.unlockDateLabel })}
            </AppText>
          </View>
        </View>
        <View
          style={{
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: spacing[4],
            gap: spacing[2],
          }}
        >
          <AppText tone="secondary">
            {result.review.networkLabel} • {result.review.assetSymbol}
          </AppText>
          <AppText tone="secondary">{messages.pages.createVault.success.nextDescription}</AppText>
        </View>
        <PrimaryButton icon="shield-check-outline" label={messages.common.buttons.viewVault} onPress={onViewVault} />
        <SecondaryButton icon="view-grid-outline" label={messages.common.buttons.backToVaults} onPress={onBackToVaults} />
      </View>
    </SurfaceCard>
  );
};
