import type { VaultEligibility } from "../../types";
import { formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export interface WithdrawNoticeCardProps {
  withdrawEligibility: VaultEligibility;
}

export const WithdrawNoticeCard = ({ withdrawEligibility }: WithdrawNoticeCardProps) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone={withdrawEligibility.state === "eligible" ? "default" : "muted"}>
      <AppHeading size="md">{messages.vaults.withdrawalsStaySerious}</AppHeading>
      <AppText tone="secondary">{withdrawEligibility.message}</AppText>
      <AppText weight="semibold">
        {withdrawEligibility.state === "eligible"
          ? interpolate(messages.vaults.availableAmount, {
              amount: formatUsdc(withdrawEligibility.availableAmount),
            })
          : messages.vaults.noFundsAvailable}
      </AppText>
    </SurfaceCard>
  );
};
