import { View } from "react-native";

import { useI18n } from "../../lib/i18n";
import { colors, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, SurfaceCard } from "../primitives";

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
  const eyebrowTone = tone === "muted" ? "danger" : "accent";

  return (
    <SurfaceCard level="floating" tone={tone}>
      <MotionView style={{ gap: spacing[2] }}>
        <AppText size="sm" tone={eyebrowTone} weight="semibold">
          {eyebrow ?? messages.common.labels.transactionStatus}
        </AppText>
        <AppHeading size="md">{title}</AppHeading>
        <AppText tone="secondary">{description}</AppText>
      </MotionView>

      {details.map((detail, index) => (
        <MotionView
          key={detail.label}
          delay={80 + index * 45}
          style={{
            borderRadius: 20,
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
        </MotionView>
      ))}
    </SurfaceCard>
  );
};
