import type { WithdrawPreview } from "../../types";
import { formatProgress, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { MotionView, AppHeading, AppText, ProgressBar, SurfaceCard } from "../primitives";

export const WithdrawPreviewCard = ({ preview }: { preview: WithdrawPreview }) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard level="floating" tone="muted">
      <MotionView style={{ gap: 12 }}>
        <AppHeading size="md">{messages.withdraw.afterWithdrawal}</AppHeading>
        <AppText tone="secondary">
          {interpolate(messages.withdraw.afterWithdrawalDescription, {
            amount: formatUsdc(preview.resultingSavedAmount),
            progress: formatProgress(preview.resultingProgressRatio),
          })}
        </AppText>
        <ProgressBar progress={preview.resultingProgressRatio} />
        <AppText weight="semibold">
          {interpolate(messages.withdraw.remainingToTarget, {
            amount: formatUsdc(preview.resultingRemainingAmount),
          })}
        </AppText>
      </MotionView>
    </SurfaceCard>
  );
};
