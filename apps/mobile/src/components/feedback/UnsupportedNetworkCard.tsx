import { SurfaceCard, AppHeading, AppText, SecondaryButton } from "../primitives";

export const UnsupportedNetworkCard = () => {
  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">Base only for launch</AppHeading>
      <AppText tone="secondary">
        Wallet and chain wiring land in a later phase. The shell already reserves space for unsupported
        network messaging.
      </AppText>
      <SecondaryButton label="Network rules" />
    </SurfaceCard>
  );
};
