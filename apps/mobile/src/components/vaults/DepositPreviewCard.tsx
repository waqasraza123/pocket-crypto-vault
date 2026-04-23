import type { DepositPreview } from "../../types";
import { formatProgress, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export const DepositPreviewCard = ({ preview }: { preview: DepositPreview }) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="accent">
      <AppHeading size="md">{messages.deposit.afterDeposit}</AppHeading>
      <AppText tone="secondary">
        {interpolate(messages.deposit.afterDepositDescription, {
          amount: formatUsdc(preview.resultingSavedAmount),
          progress: formatProgress(preview.resultingProgressRatio),
        })}
      </AppText>
      <AppText weight="semibold">
        {interpolate(messages.deposit.remainingToTarget, {
          amount: formatUsdc(preview.resultingRemainingAmount),
        })}
      </AppText>
    </SurfaceCard>
  );
};
