import { View } from "react-native";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { useI18n } from "../../lib/i18n";
import { colors, createShadowStyle, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, PrimaryButton, SecondaryButton, SectionContainer } from "../primitives";
import { HeroVaultPreviewCard } from "./HeroVaultPreviewCard";

export const HeroSection = ({
  onEnterVaults,
  onSeeHowItWorks,
}: {
  onEnterVaults: () => void;
  onSeeHowItWorks: () => void;
}) => {
  const adaptiveLayout = useAdaptiveLayout();
  const { inlineDirection, messages } = useI18n();

  return (
    <SectionContainer
      style={{
        flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column",
        alignItems: adaptiveLayout.useSplitLayout ? "stretch" : "flex-start",
        justifyContent: "space-between",
        gap: spacing[8],
      }}
    >
      <MotionView style={{ flex: 1, gap: spacing[5], paddingVertical: spacing[8] }} preset="hero" intensity="emphasis">
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: radii.pill,
            backgroundColor: colors.accentSoft,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[2],
          }}
        >
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.heroBadge}
          </AppText>
        </View>
        <MotionView delay={70} style={{ gap: spacing[3] }}>
          <AppHeading size={adaptiveLayout.isCompact ? "xl" : "display"}>{messages.landing.heroTitle}</AppHeading>
          <AppText size="lg" tone="secondary">
            {messages.landing.heroSubtitle}
          </AppText>
        </MotionView>
        <MotionView delay={130} style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[2] }}>
          {messages.landing.heroHighlights.map((item) => (
            <View
              key={item}
              style={{
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[2],
              }}
            >
              <AppText size="sm" tone="secondary" weight="semibold">
                {item}
              </AppText>
            </View>
          ))}
        </MotionView>
        <MotionView
          delay={190}
          style={{
            gap: spacing[2],
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceGlass,
            padding: spacing[4],
            ...createShadowStyle({
              color: colors.overlayStrong,
              opacity: 0.08,
              radius: 18,
              offsetY: 12,
              elevation: 2,
            }),
            elevation: 2,
          }}
        >
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.demoPathEyebrow}
          </AppText>
          <AppText tone="secondary">
            {messages.landing.demoPathDescription}
          </AppText>
        </MotionView>
        <MotionView delay={250} style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[3] }}>
          <PrimaryButton icon="arrow-right" label={messages.common.buttons.openAppShell} onPress={onEnterVaults} />
          <SecondaryButton
            icon="arrow-top-right"
            label={messages.common.buttons.seeHowItWorks}
            onPress={onSeeHowItWorks}
          />
        </MotionView>
      </MotionView>
      <MotionView delay={180} intensity="emphasis" style={{ flex: 1, justifyContent: "center", paddingBottom: spacing[8] }}>
        <HeroVaultPreviewCard />
      </MotionView>
    </SectionContainer>
  );
};
