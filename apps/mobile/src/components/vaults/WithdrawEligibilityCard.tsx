import type { WithdrawEligibility } from "../../types";
import { formatLongDateTime, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export const WithdrawEligibilityCard = ({ eligibility }: { eligibility: WithdrawEligibility }) => {
  const { messages } = useI18n();
  const title =
    eligibility.availability === "ready"
      ? messages.withdraw.unlockedTitle
      : eligibility.availability === "owner_only"
        ? messages.withdraw.ownerOnlyTitle
        : eligibility.availability === "empty"
          ? messages.withdraw.emptyTitle
          : interpolate(messages.withdraw.lockedTitle, { date: formatLongDateTime(eligibility.unlockDate) });

  return (
    <SurfaceCard tone={eligibility.canWithdraw ? "accent" : "muted"}>
      <AppHeading size="md">{title}</AppHeading>
      <AppText tone="secondary">{eligibility.message}</AppText>
      <AppText weight="semibold">
        {interpolate(messages.vaults.protectionRuleUnlocksOn, {
          date: formatLongDateTime(eligibility.unlockDate),
        })}
      </AppText>
      {eligibility.canWithdraw ? <AppText tone="secondary">{formatUsdc(eligibility.availableAmount)}</AppText> : null}
    </SurfaceCard>
  );
};
