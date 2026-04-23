import type { VaultEligibility } from "../../types";
import { formatUsdc } from "../../lib/format";
import { AppHeading, AppText, SurfaceCard } from "../primitives";

export interface WithdrawNoticeCardProps {
  withdrawEligibility: VaultEligibility;
}

export const WithdrawNoticeCard = ({ withdrawEligibility }: WithdrawNoticeCardProps) => {
  return (
    <SurfaceCard tone={withdrawEligibility.state === "eligible" ? "default" : "muted"}>
      <AppHeading size="md">Withdrawals stay serious</AppHeading>
      <AppText tone="secondary">{withdrawEligibility.message}</AppText>
      <AppText weight="semibold">
        {withdrawEligibility.state === "eligible"
          ? `${formatUsdc(withdrawEligibility.availableAmount)} available`
          : "No funds available yet"}
      </AppText>
    </SurfaceCard>
  );
};
