import { SurfaceCard, AppHeading, AppText, SecondaryButton } from "../primitives";

export interface UnsupportedNetworkNoticeProps {
  onSwitch: () => void;
  label?: string | null;
}

export const UnsupportedNetworkNotice = ({ onSwitch, label }: UnsupportedNetworkNoticeProps) => {
  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">Switch to Base or Base Sepolia</AppHeading>
      <AppText tone="secondary">
        {label
          ? `${label} is connected right now. Goal Vault reads are only enabled on Base and Base Sepolia.`
          : "Goal Vault reads are only enabled on Base and Base Sepolia."}
      </AppText>
      <SecondaryButton icon="swap-horizontal" label="Switch network" onPress={onSwitch} />
    </SurfaceCard>
  );
};
