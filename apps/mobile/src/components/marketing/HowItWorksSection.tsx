import type { ComponentProps } from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { getStaggerDelay } from "../../lib/motion/list-motion";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, SectionContainer, SurfaceCard } from "../primitives";

export const HowItWorksSection = () => {
  const adaptiveLayout = useAdaptiveLayout();
  const { inlineDirection, messages } = useI18n();
  const stepIcons: Array<ComponentProps<typeof MaterialCommunityIcons>["name"]> = [
    "bullseye-arrow",
    "shield-lock-outline",
    "cash-plus",
    "check-decagram-outline",
  ];

  if (adaptiveLayout.isCompact) {
    return (
      <SectionContainer
        gap={spacing[3]}
        header={
          <MotionView style={{ gap: spacing[1] }}>
            <AppText size="xs" tone="accent" weight="semibold">
              {messages.landing.howItWorksEyebrow}
            </AppText>
            <AppHeading size="lg">{messages.landing.howItWorksTitle}</AppHeading>
            <AppText size="sm" tone="secondary">{messages.landing.howItWorksDescription}</AppText>
          </MotionView>
        }
      >
        <View className="rounded-3xl border border-slate-200 bg-white p-2 shadow-vault-soft" style={{ gap: spacing[2] }}>
          {messages.landing.howItWorksSteps.map((step, index) => (
            <MotionView key={step.title} delay={getStaggerDelay(index)} style={{ gap: spacing[2] }}>
              <View
                className="rounded-2xl bg-slate-50 p-2.5"
                style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}
              >
                <View className="h-9 w-9 items-center justify-center rounded-2xl bg-blue-100">
                  <MaterialCommunityIcons color={colors.accentStrong} name={stepIcons[index] ?? "check-circle-outline"} size={18} />
                </View>
                <View style={{ flex: 1, gap: spacing[1] }}>
                  <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "space-between", gap: spacing[2] }}>
                    <AppHeading size="sm" style={{ flex: 1 }}>{step.title}</AppHeading>
                    <AppText size="xs" tone="accent" weight="semibold">
                      {String(index + 1).padStart(2, "0")}
                    </AppText>
                  </View>
                  <AppText size="sm" tone="secondary">{step.description}</AppText>
                </View>
              </View>
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
            {messages.landing.howItWorksEyebrow}
          </AppText>
          <AppHeading size="xl">{messages.landing.howItWorksTitle}</AppHeading>
          <AppText tone="secondary">{messages.landing.howItWorksDescription}</AppText>
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
            <SurfaceCard style={{ flex: 1, backgroundColor: index % 2 === 0 ? colors.surfaceGlass : colors.backgroundElevated }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[3] }}>
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
                  <MaterialCommunityIcons color={colors.accentStrong} name={stepIcons[index] ?? "check-circle-outline"} size={20} />
                </View>
                <View
                  style={{
                    borderRadius: radii.pill,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[2],
                  }}
                >
                  <AppText size="sm" tone="muted" weight="semibold">
                    {messages.landing.howItWorksSupport[index]}
                  </AppText>
                </View>
              </View>
              <View style={{ gap: spacing[2] }}>
                <AppText size="sm" tone="accent" weight="semibold">
                  {index + 1}
                </AppText>
                <AppHeading size="md">{step.title}</AppHeading>
                <AppText tone="secondary">{step.description}</AppText>
              </View>
            </SurfaceCard>
          </MotionView>
        ))}
      </View>
    </SectionContainer>
  );
};
