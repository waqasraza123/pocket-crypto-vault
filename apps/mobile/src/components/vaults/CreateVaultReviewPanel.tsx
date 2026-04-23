import { View } from "react-native";

import { useI18n } from "../../lib/i18n";
import type { CreateVaultReviewModel } from "../../types";
import { colors, spacing } from "../../theme";
import { AppText, SurfaceCard } from "../primitives";

export const CreateVaultReviewPanel = ({ review }: { review: CreateVaultReviewModel }) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard>
      <View style={{ gap: spacing[3] }}>
        <AppText tone="secondary">{messages.common.labels.goal}</AppText>
        <AppText weight="semibold">{review.goalName}</AppText>
        {review.category ? (
          <>
            <AppText tone="secondary">{messages.common.labels.category}</AppText>
            <AppText weight="semibold">{review.category}</AppText>
          </>
        ) : null}
        <AppText tone="secondary">{messages.common.labels.targetAmount}</AppText>
        <AppText weight="semibold">{review.targetAmountDisplay}</AppText>
        <AppText tone="secondary">{messages.common.labels.unlockDate}</AppText>
        <AppText weight="semibold">{review.unlockDateLabel}</AppText>
        <AppText tone="secondary">{messages.common.labels.networkAndAsset}</AppText>
        <AppText weight="semibold">
          {review.networkLabel} • {review.assetSymbol}
        </AppText>
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
