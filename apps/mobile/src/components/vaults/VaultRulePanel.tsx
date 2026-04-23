import type { VaultDetail } from "../../types";
import { formatLongDate } from "../../lib/format";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export interface VaultRulePanelProps {
  vault: VaultDetail;
}

export const VaultRulePanel = ({ vault }: VaultRulePanelProps) => {
  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">Protection rule</AppHeading>
      <AppText tone="secondary">Time lock</AppText>
      <AppText>Unlocks on {formatLongDate(vault.unlockDate)}</AppText>
      <AppText tone="secondary">{vault.withdrawEligibility.message}</AppText>
    </SurfaceCard>
  );
};
