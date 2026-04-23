import type { VaultDetail } from "../../types";
import { formatProgress, formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { AppHeading, AppText, ProgressBar, SurfaceCard } from "../primitives";

export interface VaultProgressPanelProps {
  vault: VaultDetail;
}

export const VaultProgressPanel = ({ vault }: VaultProgressPanelProps) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard>
      <AppHeading size="md">{messages.common.labels.progress}</AppHeading>
      <AppText size="xl" weight="semibold">
        {formatUsdc(vault.savedAmount)}
      </AppText>
      <ProgressBar progress={vault.progressRatio} />
      <AppText tone="secondary">
        {formatProgress(vault.progressRatio)} {messages.common.labels.of} {formatUsdc(vault.targetAmount)}
      </AppText>
    </SurfaceCard>
  );
};
