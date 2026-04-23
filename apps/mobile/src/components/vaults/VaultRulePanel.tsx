import type { VaultDetail } from "../../types";
import { formatLongDate } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export interface VaultRulePanelProps {
  vault: VaultDetail;
}

export const VaultRulePanel = ({ vault }: VaultRulePanelProps) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">{messages.common.labels.protectionRule}</AppHeading>
      <AppText tone="secondary">{messages.common.labels.timeLock}</AppText>
      <AppText>{interpolate(messages.vaults.protectionRuleUnlocksOn, { date: formatLongDate(vault.unlockDate) })}</AppText>
      <AppText tone="secondary">{vault.withdrawEligibility.message}</AppText>
    </SurfaceCard>
  );
};
