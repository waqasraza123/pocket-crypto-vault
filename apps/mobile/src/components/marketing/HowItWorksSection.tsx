import { View } from "react-native";

import { howItWorksSteps } from "../../features/marketing/data";
import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { colors, spacing } from "../../theme";
import { AppHeading, AppText, SectionContainer, SurfaceCard } from "../primitives";

export const HowItWorksSection = () => {
  const adaptiveLayout = useAdaptiveLayout();

  return (
    <SectionContainer
      header={
        <View style={{ gap: spacing[2] }}>
          <AppText size="sm" tone="accent" weight="semibold">
            Three calm steps
          </AppText>
          <AppHeading size="xl">Make saving feel deliberate again.</AppHeading>
        </View>
      }
    >
      <View
        style={{
          flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column",
          gap: spacing[4],
        }}
      >
        {howItWorksSteps.map((step, index) => (
          <SurfaceCard key={step.title} style={{ flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.accentSoft,
              }}
            >
              <AppText tone="accent" weight="semibold">
                {index + 1}
              </AppText>
            </View>
            <AppHeading size="md">{step.title}</AppHeading>
            <AppText tone="secondary">{step.description}</AppText>
          </SurfaceCard>
        ))}
      </View>
    </SectionContainer>
  );
};
