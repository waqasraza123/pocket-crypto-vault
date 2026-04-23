import type { VaultDetail } from "../../types";
import { PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";

export interface VaultActionPanelProps {
  vault: VaultDetail;
}

export const VaultActionPanel = ({ vault }: VaultActionPanelProps) => {
  const canWithdraw = vault.withdrawEligibility.state === "eligible";

  return (
    <SurfaceCard>
      <PrimaryButton icon="plus-circle-outline" label="Deposit USDC" />
      <SecondaryButton icon={canWithdraw ? "arrow-up-right" : "lock-outline"} label="Withdraw when eligible" />
    </SurfaceCard>
  );
};
