import type { WithdrawEligibility } from "../../types";
import { formatLongDateTime } from "../../lib/format";
import { formatUnlockCountdownLabel } from "../../lib/contracts/withdraw-flow";
import { interpolate, useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export const UnlockCountdownCard = ({ eligibility }: { eligibility: WithdrawEligibility }) => {
  const { messages } = useI18n();

  if (!eligibility.countdown || eligibility.countdown.isComplete) {
    return null;
  }

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">{messages.withdraw.eligibilityTitle}</AppHeading>
      <AppText tone="secondary">
        {interpolate(messages.withdraw.countdownLabel, {
          time: formatUnlockCountdownLabel(eligibility.countdown),
        })}
      </AppText>
      {eligibility.unlockDate ? <AppText weight="semibold">{formatLongDateTime(eligibility.unlockDate)}</AppText> : null}
    </SurfaceCard>
  );
};
