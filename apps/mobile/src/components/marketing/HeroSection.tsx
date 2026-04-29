import { Platform, Pressable, View, type ViewStyle } from "react-native";
import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { formatProgress, formatUsdc } from "../../lib/format";
import { useI18n } from "../../lib/i18n";
import { getLandingPageModel } from "../../lib/public/marketing-content";
import { colors, createShadowStyle, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView, PrimaryButton, ProgressBar, SecondaryButton, SectionContainer } from "../primitives";
import { HeroVaultPreviewCard } from "./HeroVaultPreviewCard";

export const HeroSection = ({
  onCreateVault,
  onEnterVaults,
  onReviewSecurity,
}: {
  onCreateVault: () => void;
  onEnterVaults: () => void;
  onReviewSecurity: () => void;
}) => {
  const adaptiveLayout = useAdaptiveLayout();
  const { inlineDirection, locale, messages } = useI18n();
  const model = getLandingPageModel(locale);
  const savedAmount = 7450;
  const targetAmount = 12000;
  const progress = 0.62;
  const mobileHeroTitleParts = messages.landing.heroTitle.split(". ").filter(Boolean);
  const mobileHeroClassName = "overflow-hidden rounded-[28px] bg-vault-ink shadow-vault";
  const mobileHeroWidth = adaptiveLayout.width > 0 ? Math.max(280, adaptiveLayout.width - adaptiveLayout.contentPadding * 2) : 350;

  if (adaptiveLayout.isCompact) {
    return (
      <SectionContainer gap={spacing[3]}>
        <MotionView
          className={mobileHeroClassName}
          preset="hero"
          intensity="emphasis"
          style={{
            alignSelf: "flex-start",
            gap: spacing[3],
            width: Platform.OS === "web" ? "100%" : mobileHeroWidth,
            paddingHorizontal: spacing[4],
            paddingBottom: spacing[4],
            paddingTop: spacing[3],
            ...({ boxSizing: "border-box" } as ViewStyle),
          }}
        >
          <View className="absolute left-0 right-0 top-0 h-1.5 bg-vault-cyan" />
          <View className="absolute bottom-0 left-0 h-1.5 w-1/2 bg-vault-emerald" />
          <View className="absolute bottom-0 right-0 h-1.5 w-1/2 bg-vault-fuchsia" />
          <View
            className="self-start rounded-2xl border border-cyan-300/30 bg-white/10 px-3 py-1.5"
            style={{ alignSelf: "flex-start" }}
          >
            <AppText size="xs" style={{ color: "#a5f3fc" }} weight="semibold">
              {messages.landing.heroBadge}
            </AppText>
          </View>
          <View style={{ gap: spacing[3], width: "100%" }}>
            <View style={{ gap: 0 }}>
              {mobileHeroTitleParts.map((part, index) => (
                <AppText
                  key={`${part}-${index}`}
                  size="xl"
                  style={{ color: colors.white, fontSize: 32, lineHeight: 37 }}
                  weight="bold"
                >
                  {part.endsWith(".") ? part : `${part}.`}
                </AppText>
              ))}
            </View>
            <AppText size="md" style={{ color: "#cbd5e1", flexShrink: 1, width: "100%" }}>
              {messages.landing.heroSubtitle}
            </AppText>
          </View>
          <View
            className="rounded-3xl bg-white"
            style={{ gap: spacing[3], padding: spacing[3], ...({ boxSizing: "border-box" } as ViewStyle) }}
          >
            <View style={{ flexDirection: inlineDirection(), justifyContent: "space-between", gap: spacing[3] }}>
              <View style={{ flex: 1, gap: spacing[1] }}>
                <AppText size="xs" tone="muted" weight="semibold">
                  {messages.landing.heroPreviewLabel}
                </AppText>
                <AppHeading size="md">{messages.landing.heroPreviewGoal}</AppHeading>
              </View>
            </View>
            <View className="rounded-2xl bg-blue-600" style={{ gap: spacing[1], padding: spacing[3] }}>
              <AppText size="xs" style={{ color: "#bfdbfe" }} weight="semibold">
                {messages.common.labels.totalSaved}
              </AppText>
              <AppHeading size="md" style={{ color: colors.white }}>
                {formatUsdc(savedAmount)}
              </AppHeading>
              <AppText size="sm" style={{ color: "#dbeafe" }}>
                {messages.common.labels.of} {formatUsdc(targetAmount)}
              </AppText>
            </View>
            <View style={{ gap: spacing[2] }}>
              <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "space-between" }}>
                <AppText size="sm" tone="secondary" weight="semibold">
                  {messages.common.labels.progress}
                </AppText>
                <AppText size="sm" weight="semibold">
                  {formatProgress(progress)}
                </AppText>
              </View>
              <ProgressBar progress={progress} />
            </View>
            <View style={{ gap: spacing[2] }}>
              {messages.landing.heroHighlights.slice(0, 2).map((item, index) => (
                <View key={item} style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
                  <MaterialCommunityIcons
                    color={index === 0 ? colors.accentStrong : colors.positive}
                    name={(model.ruleCards[index]?.icon ?? "check-circle-outline") as ComponentProps<typeof MaterialCommunityIcons>["name"]}
                    size={17}
                  />
                  <AppText style={{ flex: 1 }} size="sm" tone="secondary" weight="semibold">
                    {item}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
          <View style={{ gap: spacing[2] }}>
            <Pressable
              accessibilityRole="button"
              onPress={onCreateVault}
              className="min-h-11 rounded-2xl bg-blue-500 px-4 py-2.5 active:bg-blue-600"
            >
              <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "center", gap: spacing[2] }}>
                <MaterialCommunityIcons color={colors.white} name="plus" size={18} />
                <AppText align="center" style={{ color: colors.white }} weight="semibold">
                  {model.heroActions[0].label}
                </AppText>
              </View>
            </Pressable>
            <View style={{ flexDirection: inlineDirection(), gap: spacing[2] }}>
              <Pressable
                accessibilityRole="button"
                onPress={onEnterVaults}
                className="min-h-10 flex-1 rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 active:bg-white/15"
              >
                <AppText align="center" numberOfLines={1} size="sm" style={{ color: colors.white }} weight="semibold">
                  {model.heroActions[1].label}
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onReviewSecurity}
                className="min-h-10 flex-1 rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 active:bg-white/15"
              >
                <AppText align="center" numberOfLines={1} size="sm" style={{ color: colors.white }} weight="semibold">
                  {messages.common.buttons.reviewSecurity}
                </AppText>
              </Pressable>
            </View>
          </View>
        </MotionView>
      </SectionContainer>
    );
  }

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
          {messages.landing.heroHighlights.map((item, index) => (
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
              <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
                <MaterialCommunityIcons
                  color={colors.accentStrong}
                  name={(model.ruleCards[index]?.icon ?? "check-circle-outline") as ComponentProps<typeof MaterialCommunityIcons>["name"]}
                  size={16}
                />
                <AppText size="sm" tone="secondary" weight="semibold">
                  {item}
                </AppText>
              </View>
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
            {messages.landing.storyEyebrow}
          </AppText>
          <AppText tone="secondary">
            {messages.landing.storyDescription}
          </AppText>
        </MotionView>
        <MotionView delay={250} style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[3], alignItems: "center" }}>
          <PrimaryButton icon="plus" label={model.heroActions[0].label} onPress={onCreateVault} />
          <SecondaryButton icon="arrow-right" label={model.heroActions[1].label} onPress={onEnterVaults} />
          <SecondaryButton
            icon="arrow-top-right"
            label={messages.common.buttons.reviewSecurity}
            onPress={onReviewSecurity}
          />
        </MotionView>
        <MotionView delay={310} style={{ gap: spacing[3] }}>
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.demoPathTitle}
          </AppText>
          <View style={{ gap: spacing[2] }}>
            {messages.landing.demoPathSteps.map((step, index) => (
              <View key={step} style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.accentSoft,
                  }}
                >
                  <AppText size="sm" tone="accent" weight="semibold">
                    {index + 1}
                  </AppText>
                </View>
                <AppText style={{ flex: 1 }} tone="secondary">
                  {step}
                </AppText>
              </View>
            ))}
          </View>
        </MotionView>
      </MotionView>
      <MotionView delay={180} intensity="emphasis" style={{ flex: 1, justifyContent: "center", paddingBottom: spacing[8] }}>
        <HeroVaultPreviewCard />
      </MotionView>
    </SectionContainer>
  );
};
