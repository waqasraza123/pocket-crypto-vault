import type { DepositPreview } from "../../types";
import { formatProgress, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { MotionView, AppHeading, AppText, ProgressBar, SurfaceCard } from "../primitives";

export const DepositPreviewCard = ({ preview }: { preview: DepositPreview }) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard level="floating" tone="accent">
      <MotionView style={{ gap: 12 }}>
        <AppHeading size="md">{messages.deposit.afterDeposit}</AppHeading>
        <AppText tone="secondary">
          {interpolate(messages.deposit.afterDepositDescription, {
            amount: formatUsdc(preview.resultingSavedAmount),
            progress: formatProgress(preview.resultingProgressRatio),
          })}
        </AppText>
        <ProgressBar progress={preview.resultingProgressRatio} tone={preview.resultingProgressRatio >= 1 ? "positive" : "accent"} />
        <AppText weight="semibold">
          {interpolate(messages.deposit.remainingToTarget, {
            amount: formatUsdc(preview.resultingRemainingAmount),
          })}
        </AppText>
      </MotionView>
    </SurfaceCard>
  );
};
