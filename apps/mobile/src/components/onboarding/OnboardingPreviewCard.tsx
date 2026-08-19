import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { formatProgress, formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { createShadowStyle, onboardingPalette, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView } from "../primitives";

const savedAmount = 745;
const targetAmount = 1200;
const progress = savedAmount / targetAmount;

export const OnboardingPreviewCard = () => {
  const { inlineDirection, messages } = useI18n();
  const preview = messages.onboarding.preview;

  return (
    <MotionView
      delay={120}
      intensity="emphasis"
      preset="hero"
      style={{
        width: "100%",
        maxWidth: 520,
        alignSelf: "center",
        borderRadius: 32,
        borderWidth: 1,
        borderColor: onboardingPalette.border,
        backgroundColor: onboardingPalette.surface,
        padding: spacing[5],
        gap: spacing[5],
        ...createShadowStyle({
          color: onboardingPalette.ink,
          opacity: 0.12,
          radius: 34,
          offsetY: 18,
          elevation: 8,
        }),
      }}
    >
      <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", justifyContent: "space-between", gap: spacing[3] }}>
        <View style={{ flex: 1, flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3] }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radii.md,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: onboardingPalette.surfaceMuted,
            }}
          >
            <MaterialCommunityIcons color={onboardingPalette.ink} name="shield-lock-outline" size={24} />
          </View>
          <View style={{ flex: 1, gap: spacing[1] }}>
            <AppText size="xs" style={{ color: onboardingPalette.muted, letterSpacing: 0.8 }} weight="bold">
              {preview.eyebrow}
            </AppText>
            <AppHeading size="md" style={{ color: onboardingPalette.ink }}>
              {preview.goal}
            </AppHeading>
          </View>
        </View>
        <View
          style={{
            flexDirection: inlineDirection(),
            alignItems: "center",
            gap: spacing[1],
            borderRadius: radii.pill,
            backgroundColor: onboardingPalette.accentSoft,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[2],
          }}
        >
          <MaterialCommunityIcons color={onboardingPalette.accentStrong} name="check-decagram" size={15} />
          <AppText size="xs" style={{ color: onboardingPalette.accentStrong }} weight="bold">
            {preview.status}
          </AppText>
        </View>
      </View>

      <View
        style={{
          borderRadius: radii.xl,
          backgroundColor: onboardingPalette.ink,
          padding: spacing[5],
          gap: spacing[4],
        }}
      >
        <View style={{ gap: spacing[1] }}>
          <AppText size="sm" style={{ color: onboardingPalette.onInkMuted }} weight="semibold">
            {preview.savedLabel}
          </AppText>
          <AppHeading size="xl" style={{ color: onboardingPalette.white }}>
            {formatUsdc(savedAmount)}
          </AppHeading>
          <AppText size="sm" style={{ color: onboardingPalette.onInkMuted }}>
            {messages.common.labels.of} {formatUsdc(targetAmount)}
          </AppText>
        </View>
        <View style={{ gap: spacing[2] }}>
          <View style={{ height: 9, borderRadius: radii.pill, backgroundColor: onboardingPalette.progressTrack, overflow: "hidden" }}>
            <View
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                borderRadius: radii.pill,
                backgroundColor: onboardingPalette.accent,
              }}
            />
          </View>
          <AppText size="sm" style={{ color: onboardingPalette.onInk }} weight="semibold">
            {formatProgress(progress)} {preview.fundedLabel}
          </AppText>
        </View>
      </View>

      <View style={{ flexDirection: inlineDirection(), gap: spacing[3] }}>
        <PreviewDetail icon="calendar-lock-outline" label={preview.ruleLabel} value={preview.ruleValue} />
        <PreviewDetail icon="cube-outline" label={preview.networkLabel} value={preview.networkValue} />
      </View>

      <View
        style={{
          flexDirection: inlineDirection(),
          alignItems: "flex-start",
          gap: spacing[3],
          borderTopWidth: 1,
          borderTopColor: onboardingPalette.border,
          paddingTop: spacing[4],
        }}
      >
        <MaterialCommunityIcons color={onboardingPalette.accent} name="shield-check-outline" size={20} />
        <AppText style={{ flex: 1, color: onboardingPalette.text }} size="sm">
          {preview.footer}
        </AppText>
      </View>
    </MotionView>
  );
};

const PreviewDetail = ({ icon, label, value }: { icon: "calendar-lock-outline" | "cube-outline"; label: string; value: string }) => (
  <View
    style={{
      flex: 1,
      minWidth: 0,
      borderRadius: radii.lg,
      backgroundColor: onboardingPalette.surfaceMuted,
      padding: spacing[3],
      gap: spacing[2],
    }}
  >
    <MaterialCommunityIcons color={onboardingPalette.accent} name={icon} size={19} />
    <View style={{ gap: spacing[1] }}>
      <AppText size="xs" style={{ color: onboardingPalette.muted }}>
        {label}
      </AppText>
      <AppText numberOfLines={2} size="sm" style={{ color: onboardingPalette.ink }} weight="semibold">
        {value}
      </AppText>
    </View>
  </View>
);
