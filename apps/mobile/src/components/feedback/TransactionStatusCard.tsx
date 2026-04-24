import { View } from "react-native";

import { useI18n } from "../../lib/i18n";
import { colors, spacing } from "../../theme";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export interface TransactionStatusDetail {
  label: string;
  value: string;
}

export const TransactionStatusCard = ({
  title,
  description,
  eyebrow,
  tone = "accent",
  details = [],
}: {
  title: string;
  description: string;
  eyebrow?: string;
  tone?: "accent" | "muted" | "default";
  details?: TransactionStatusDetail[];
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone={tone}>
      <View style={{ gap: spacing[2] }}>
        <AppText size="sm" tone="accent" weight="semibold">
          {eyebrow ?? messages.common.labels.transactionStatus}
        </AppText>
        <AppHeading size="md">{title}</AppHeading>
        <AppText tone="secondary">{description}</AppText>
      </View>

      {details.map((detail) => (
        <View
          key={detail.label}
          style={{
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.backgroundElevated,
            padding: spacing[4],
            gap: spacing[2],
          }}
        >
          <AppText size="sm" tone="secondary">
            {detail.label}
          </AppText>
          <AppText weight="semibold">{detail.value}</AppText>
        </View>
      ))}
    </SurfaceCard>
  );
};
