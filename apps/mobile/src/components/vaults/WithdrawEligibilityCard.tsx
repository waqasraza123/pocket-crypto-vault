import type { WithdrawEligibility } from "../../types";
import { formatLongDateTime, formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export const WithdrawEligibilityCard = ({ eligibility }: { eligibility: WithdrawEligibility }) => {
  const { messages } = useI18n();
  const fallbackDate = eligibility.unlockDate ? formatLongDateTime(eligibility.unlockDate) : null;
  const title =
    eligibility.availability === "ready"
      ? messages.withdraw.unlockedTitle
      : eligibility.availability === "owner_only"
        ? messages.withdraw.ownerOnlyTitle
        : eligibility.availability === "unlock_request_required"
          ? "Unlock request required"
          : eligibility.availability === "cooldown_pending"
            ? "Cooldown in progress"
            : eligibility.availability === "guardian_pending"
              ? "Waiting for guardian approval"
              : eligibility.availability === "guardian_rejected"
                ? "Guardian rejected"
        : eligibility.availability === "empty"
          ? messages.withdraw.emptyTitle
          : interpolate(messages.withdraw.lockedTitle, { date: fallbackDate ?? "later" });

  return (
    <SurfaceCard tone={eligibility.canWithdraw ? "accent" : "muted"}>
      <AppHeading size="md">{title}</AppHeading>
      <AppText tone="secondary">{eligibility.message}</AppText>
      {fallbackDate ? (
        <AppText weight="semibold">
          {interpolate(messages.vaults.protectionRuleUnlocksOn, {
            date: fallbackDate,
          })}
        </AppText>
      ) : null}
      {eligibility.canWithdraw ? <AppText tone="secondary">{formatUsdc(eligibility.availableAmount)}</AppText> : null}
    </SurfaceCard>
  );
};
