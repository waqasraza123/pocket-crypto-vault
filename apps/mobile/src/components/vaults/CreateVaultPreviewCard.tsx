import type { CreateVaultInput } from "../../types";
import { formatLongDate, formatUsdc } from "../../lib/format";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export interface CreateVaultPreviewCardProps {
  values: CreateVaultInput;
  targetAmount: number;
}

export const CreateVaultPreviewCard = ({ values, targetAmount }: CreateVaultPreviewCardProps) => {
  return (
    <SurfaceCard tone="accent">
      <AppText size="sm" tone="accent" weight="semibold">
        Live preview
      </AppText>
      <AppHeading size="lg">{values.goalName || "Your next milestone"}</AppHeading>
      <AppText tone="secondary">{values.note || "Protect this goal with a clear unlock date."}</AppText>
      <AppText weight="semibold">{formatUsdc(targetAmount || 0)}</AppText>
      <AppText tone="secondary">
        {values.unlockDate ? `Unlocks on ${formatLongDate(values.unlockDate)}` : "Choose an unlock date"}
      </AppText>
    </SurfaceCard>
  );
};
