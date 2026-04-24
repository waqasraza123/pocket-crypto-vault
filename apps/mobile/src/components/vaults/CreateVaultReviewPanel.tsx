import { View } from "react-native";

import { useI18n } from "../../lib/i18n";
import type { CreateVaultReviewModel } from "../../types";
import { colors, radii, spacing } from "../../theme";
import { AppText, SurfaceCard } from "../primitives";

export const CreateVaultReviewPanel = ({ review }: { review: CreateVaultReviewModel }) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard>
      <View style={{ gap: spacing[3] }}>
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
              borderRadius: radii.md,
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
              borderRadius: radii.md,
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
            borderRadius: 18,
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
      </View>
    </SurfaceCard>
  );
};
