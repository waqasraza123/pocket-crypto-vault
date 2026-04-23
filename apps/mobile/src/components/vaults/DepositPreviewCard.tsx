import type { DepositPreview } from "../../types";
import { formatProgress, formatUsdc } from "../../lib/format";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export interface DepositPreviewCardProps {
  preview: DepositPreview;
}

export const DepositPreviewCard = ({ preview }: DepositPreviewCardProps) => {
  return (
    <SurfaceCard tone="accent">
      <AppHeading size="md">Deposit feels easy</AppHeading>
      <AppText tone="secondary">
        Deposit USDC and move this goal to {formatUsdc(preview.resultingSavedAmount)}.
      </AppText>
      <AppText weight="semibold">{formatProgress(preview.resultingProgressRatio)} funded after this deposit</AppText>
    </SurfaceCard>
  );
};
