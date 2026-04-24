import { View } from "react-native";

import { useI18n } from "../../lib/i18n";
import type { CreateVaultReviewModel } from "../../types";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, SurfaceCard } from "../primitives";

export const CreateVaultReviewPanel = ({ review }: { review: CreateVaultReviewModel }) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard>
      <MotionView style={{ gap: spacing[3] }}>
        <View style={{ gap: spacing[1] }}>
          <AppText size="sm" tone="secondary">{messages.common.labels.goal}</AppText>
          <AppText weight="semibold">{review.goalName}</AppText>
        </View>
        {review.category ? (
          <View style={{ gap: spacing[1] }}>
            <AppText size="sm" tone="secondary">{messages.common.labels.category}</AppText>
            <AppText weight="semibold">{review.category}</AppText>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
          <View
            style={{
              flex: 1,
              minWidth: 180,
              gap: spacing[1],
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElevated,
              padding: spacing[4],
            }}
          >
            <AppText size="sm" tone="secondary">{messages.common.labels.targetAmount}</AppText>
            <AppText weight="semibold">{review.targetAmountDisplay}</AppText>
          </View>
          <View
            style={{
              flex: 1,
              minWidth: 180,
              gap: spacing[1],
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElevated,
              padding: spacing[4],
            }}
          >
            <AppText size="sm" tone="secondary">{messages.common.labels.unlockDate}</AppText>
            <AppText weight="semibold">{review.unlockDateLabel}</AppText>
          </View>
        </View>
        <View style={{ gap: spacing[1] }}>
          <AppText size="sm" tone="secondary">{messages.common.labels.networkAndAsset}</AppText>
          <AppText weight="semibold">
            {review.networkLabel} • {review.assetSymbol}
          </AppText>
        </View>
        <View
          style={{
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceMuted,
            padding: spacing[4],
            gap: spacing[2],
          }}
        >
          {review.protectionCopy.map((line) => (
            <AppText key={line} tone="secondary">
              {line}
            </AppText>
          ))}
        </View>
        <View
          style={{
            gap: spacing[3],
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceGlass,
            padding: spacing[4],
          }}
        >
          <AppHeading size="sm">{messages.pages.createVault.reviewWalkthroughTitle}</AppHeading>
          <AppText tone="secondary">{messages.pages.createVault.reviewWalkthroughDescription}</AppText>
          <View style={{ gap: spacing[2] }}>
            {messages.pages.createVault.reviewWalkthroughSteps.map((step, index) => (
              <View key={step} style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing[3] }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.accentSoft,
                  }}
                >
                  <AppText size="sm" tone="accent" weight="semibold">
                    {index + 1}
                  </AppText>
                </View>
                <AppText style={{ flex: 1 }} tone="secondary">
                  {step}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </MotionView>
    </SurfaceCard>
  );
};
