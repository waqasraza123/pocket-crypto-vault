import type { VaultDetail } from "../../types";
import { formatProgress, formatUsdc } from "../../lib/format";
import { AppHeading, AppText, ProgressBar, SurfaceCard } from "../primitives";

export interface VaultProgressPanelProps {
  vault: VaultDetail;
}

export const VaultProgressPanel = ({ vault }: VaultProgressPanelProps) => {
  return (
    <SurfaceCard>
      <AppHeading size="md">Progress</AppHeading>
      <AppText size="xl" weight="semibold">
        {formatUsdc(vault.savedAmount)}
      </AppText>
      <ProgressBar progress={vault.progressRatio} />
      <AppText tone="secondary">
        {formatProgress(vault.progressRatio)} of {formatUsdc(vault.targetAmount)}
      </AppText>
    </SurfaceCard>
  );
};
