import { View } from "react-native";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { getStaggerDelay } from "../../lib/motion/list-motion";
import { useI18n } from "../../lib/i18n";
import { colors, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, SectionContainer, SurfaceCard } from "../primitives";

export const HowItWorksSection = () => {
  const adaptiveLayout = useAdaptiveLayout();
  const { messages } = useI18n();

  return (
    <SectionContainer
      header={
        <MotionView style={{ gap: spacing[2] }}>
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.howItWorksEyebrow}
          </AppText>
          <AppHeading size="xl">{messages.landing.howItWorksTitle}</AppHeading>
        </MotionView>
      }
    >
      <View
        style={{
          flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column",
          gap: spacing[4],
        }}
      >
        {messages.landing.howItWorksSteps.map((step, index) => (
          <MotionView key={step.title} delay={getStaggerDelay(index)} style={{ flex: 1 }}>
            <SurfaceCard style={{ flex: 1, backgroundColor: index === 1 ? colors.backgroundElevated : colors.surfaceGlass }}>
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
              <AppText size="sm" tone="secondary" weight="semibold">
                {messages.landing.howItWorksSupport[index]}
              </AppText>
              <AppHeading size="md">{step.title}</AppHeading>
              <AppText tone="secondary">{step.description}</AppText>
            </SurfaceCard>
          </MotionView>
        ))}
      </View>
    </SectionContainer>
  );
};
