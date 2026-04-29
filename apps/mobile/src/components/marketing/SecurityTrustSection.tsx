import type { ComponentProps } from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { getStaggerDelay } from "../../lib/motion/list-motion";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, SectionContainer, SurfaceCard } from "../primitives";

export const SecurityTrustSection = () => {
  const adaptiveLayout = useAdaptiveLayout();
  const { inlineDirection, messages } = useI18n();
  const principleIcons: Array<ComponentProps<typeof MaterialCommunityIcons>["name"]> = [
    "wallet-outline",
    "bank-check",
    "card-text-outline",
    "compass-outline",
  ];

  if (adaptiveLayout.isCompact) {
    return (
      <SectionContainer
        gap={spacing[3]}
        header={
          <MotionView style={{ gap: spacing[1] }}>
            <AppText size="xs" tone="accent" weight="semibold">
              {messages.landing.securityEyebrow}
            </AppText>
            <AppHeading size="lg">{messages.landing.securityTitle}</AppHeading>
            <AppText size="sm" tone="secondary">{messages.landing.securityDescription}</AppText>
          </MotionView>
        }
      >
        <MotionView
          style={{
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            backgroundColor: colors.backgroundElevated,
            padding: spacing[3],
            gap: spacing[2],
          }}
        >
          <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: radii.md,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.accentSoft,
                borderWidth: 1,
                borderColor: colors.borderStrong,
              }}
            >
              <MaterialCommunityIcons color={colors.accentStrong} name="shield-star-outline" size={20} />
            </View>
            <View style={{ flex: 1, gap: spacing[1] }}>
              <AppText size="sm" tone="accent" weight="semibold">
                {messages.landing.securitySummaryTitle}
              </AppText>
              <AppText size="sm" tone="secondary">
                {messages.landing.securitySummaryDescription}
              </AppText>
            </View>
          </View>
        </MotionView>
        <View style={{ gap: spacing[2] }}>
          {messages.landing.securityPrinciples.map((item, index) => (
            <MotionView key={item.title} delay={getStaggerDelay(index)}>
              <SurfaceCard
                accentColor={index === 1 ? colors.positive : colors.accentStrong}
                style={{ padding: spacing[3] }}
              >
                <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radii.md,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: index === 1 ? colors.positiveSoft : colors.accentSoft,
                      borderWidth: 1,
                      borderColor: index === 1 ? colors.positive : colors.borderStrong,
                    }}
                  >
                    <MaterialCommunityIcons
                      color={index === 1 ? colors.positive : colors.accentStrong}
                      name={principleIcons[index] ?? "shield-check-outline"}
                      size={19}
                    />
                  </View>
                  <View style={{ flex: 1, gap: spacing[1] }}>
                    <AppHeading size="sm">{item.title}</AppHeading>
                    <AppText size="sm" tone="secondary">{item.description}</AppText>
                  </View>
                </View>
              </SurfaceCard>
            </MotionView>
          ))}
        </View>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer
      header={
        <MotionView style={{ gap: spacing[2] }}>
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.securityEyebrow}
          </AppText>
          <AppHeading size="xl">{messages.landing.securityTitle}</AppHeading>
          <AppText tone="secondary">{messages.landing.securityDescription}</AppText>
        </MotionView>
      }
    >
      <MotionView
        style={{
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.backgroundElevated,
          padding: spacing[5],
          gap: spacing[3],
        }}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: radii.md,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.accentSoft,
              borderWidth: 1,
              borderColor: colors.borderStrong,
            }}
          >
            <MaterialCommunityIcons color={colors.accentStrong} name="shield-star-outline" size={22} />
          </View>
          <View style={{ flex: 1, gap: spacing[1] }}>
            <AppText size="sm" tone="accent" weight="semibold">
              {messages.landing.securitySummaryTitle}
            </AppText>
            <AppText tone="secondary">
              {messages.landing.securitySummaryDescription}
            </AppText>
          </View>
        </View>
      </MotionView>
      <View style={{ flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column", gap: spacing[4] }}>
        {messages.landing.securityPrinciples.map((item, index) => (
          <MotionView key={item.title} delay={getStaggerDelay(index)} style={{ flex: 1 }}>
            <SurfaceCard accentColor={index === 1 ? colors.positive : colors.accentStrong} style={{ flex: 1, backgroundColor: index === 1 ? colors.backgroundElevated : colors.surfaceGlass, padding: spacing[5] }}>
              <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: radii.md,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: index === 1 ? colors.positiveSoft : colors.accentSoft,
                    borderWidth: 1,
                    borderColor: index === 1 ? colors.positive : colors.borderStrong,
                  }}
                >
                  <MaterialCommunityIcons
                    color={index === 1 ? colors.positive : colors.accentStrong}
                    name={principleIcons[index] ?? "shield-check-outline"}
                    size={22}
                  />
                </View>
                <View style={{ flex: 1, gap: spacing[2] }}>
                  <AppHeading size="md">{item.title}</AppHeading>
                  <AppText tone="secondary">{item.description}</AppText>
                </View>
              </View>
            </SurfaceCard>
          </MotionView>
        ))}
      </View>
    </SectionContainer>
  );
};
