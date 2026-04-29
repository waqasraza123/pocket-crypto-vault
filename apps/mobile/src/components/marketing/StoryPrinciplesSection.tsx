import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { useI18n } from "../../lib/i18n";
import { getLandingPageModel } from "../../lib/public/marketing-content";
import { getStaggerDelay } from "../../lib/motion/list-motion";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, SectionContainer, SurfaceCard } from "../primitives";

export const StoryPrinciplesSection = () => {
  const adaptiveLayout = useAdaptiveLayout();
  const { inlineDirection, locale, messages } = useI18n();
  const model = getLandingPageModel(locale);

  if (adaptiveLayout.isCompact) {
    return (
      <SectionContainer gap={spacing[3]}>
        <MotionView style={{ gap: spacing[1] }}>
          <AppText size="xs" tone="accent" weight="semibold">
            {messages.landing.storyEyebrow}
          </AppText>
          <AppHeading size="lg">{messages.landing.storyTitle}</AppHeading>
        </MotionView>
        <SurfaceCard style={{ padding: spacing[4], gap: spacing[2] }}>
          {model.storyCards.map((card, index) => (
            <MotionView key={card.title} delay={getStaggerDelay(index)}>
              <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.accentSoft,
                  }}
                >
                  <MaterialCommunityIcons
                    color={colors.accentStrong}
                    name={card.icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
                    size={18}
                  />
                </View>
                <View style={{ flex: 1, gap: spacing[1] }}>
                  <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
                    <AppHeading size="sm" style={{ flex: 1 }}>{card.title}</AppHeading>
                    <AppText size="xs" tone="muted" weight="semibold">
                      {String(index + 1).padStart(2, "0")}
                    </AppText>
                  </View>
                  <AppText size="sm" tone="secondary">{card.description}</AppText>
                </View>
              </View>
            </MotionView>
          ))}
        </SurfaceCard>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer
      header={
        <MotionView style={{ gap: spacing[2] }}>
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.storyEyebrow}
          </AppText>
          <AppHeading size="xl">{messages.landing.storyTitle}</AppHeading>
          <AppText tone="secondary">{messages.landing.storyDescription}</AppText>
        </MotionView>
      }
    >
      <View style={{ flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column", gap: spacing[4] }}>
        {model.storyCards.map((card, index) => (
          <MotionView key={card.title} delay={getStaggerDelay(index)} style={{ flex: 1 }}>
            <SurfaceCard
              style={{
                flex: 1,
                backgroundColor: index === 1 ? colors.backgroundElevated : colors.surfaceGlass,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.accentSoft,
                }}
              >
                <MaterialCommunityIcons
                  color={colors.accentStrong}
                  name={card.icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
                  size={20}
                />
              </View>
              <View style={{ gap: spacing[2] }}>
                <AppHeading size="md">{card.title}</AppHeading>
                <AppText tone="secondary">{card.description}</AppText>
              </View>
              <View
                style={{
                  borderRadius: radii.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  paddingHorizontal: spacing[3],
                  paddingVertical: spacing[2],
                  alignSelf: "flex-start",
                }}
              >
                <AppText size="sm" tone="muted" weight="semibold">
                  {String(index + 1).padStart(2, "0")}
                </AppText>
              </View>
            </SurfaceCard>
          </MotionView>
        ))}
      </View>
    </SectionContainer>
  );
};
