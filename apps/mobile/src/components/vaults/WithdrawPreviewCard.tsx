import type { WithdrawPreview } from "../../types";
import { formatProgress, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export const WithdrawPreviewCard = ({ preview }: { preview: WithdrawPreview }) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">{messages.withdraw.afterWithdrawal}</AppHeading>
      <AppText tone="secondary">
        {interpolate(messages.withdraw.afterWithdrawalDescription, {
          amount: formatUsdc(preview.resultingSavedAmount),
          progress: formatProgress(preview.resultingProgressRatio),
        })}
      </AppText>
      <AppText weight="semibold">
        {interpolate(messages.withdraw.remainingToTarget, {
          amount: formatUsdc(preview.resultingRemainingAmount),
        })}
      </AppText>
    </SurfaceCard>
  );
};
