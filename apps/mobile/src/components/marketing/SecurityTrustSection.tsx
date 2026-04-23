import { View } from "react-native";

import { securityPrinciples } from "../../features/marketing/data";
import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { spacing } from "../../theme";
import { AppHeading, AppText, SectionContainer, SurfaceCard } from "../primitives";

export const SecurityTrustSection = () => {
  const adaptiveLayout = useAdaptiveLayout();

  return (
    <SectionContainer
      header={
        <View style={{ gap: spacing[2] }}>
          <AppText size="sm" tone="accent" weight="semibold">
            Trust model
          </AppText>
          <AppHeading size="xl">Serious withdrawals start with clear rules.</AppHeading>
          <AppText tone="secondary">
            Goal Vault keeps the promise narrow: Base, USDC, one goal, and one rule you can understand instantly.
          </AppText>
        </View>
      }
    >
      <View style={{ flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column", gap: spacing[4] }}>
        {securityPrinciples.map((item) => (
          <SurfaceCard key={item.title} style={{ flex: 1 }}>
            <AppHeading size="md">{item.title}</AppHeading>
            <AppText tone="secondary">{item.description}</AppText>
          </SurfaceCard>
        ))}
      </View>
    </SectionContainer>
  );
};
