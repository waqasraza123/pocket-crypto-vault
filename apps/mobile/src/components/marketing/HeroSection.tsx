import { useRouter } from "expo-router";
import { View } from "react-native";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SectionContainer } from "../primitives";
import { HeroVaultPreviewCard } from "./HeroVaultPreviewCard";

export const HeroSection = () => {
  const adaptiveLayout = useAdaptiveLayout();
  const router = useRouter();
  const { inlineDirection, messages } = useI18n();

  return (
    <SectionContainer
      style={{
        flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column",
        alignItems: adaptiveLayout.useSplitLayout ? "stretch" : "flex-start",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, gap: spacing[5], paddingVertical: spacing[8] }}>
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: radii.pill,
            backgroundColor: colors.accentSoft,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[2],
          }}
        >
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.heroBadge}
          </AppText>
        </View>
        <View style={{ gap: spacing[3] }}>
          <AppHeading size={adaptiveLayout.isCompact ? "xl" : "display"}>{messages.landing.heroTitle}</AppHeading>
          <AppText size="lg" tone="secondary">
            {messages.landing.heroSubtitle}
          </AppText>
        </View>
        <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[2] }}>
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
        </View>
        <View
          style={{
            gap: spacing[2],
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: spacing[4],
          }}
        >
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.finalCtaEyebrow}
          </AppText>
          <AppText tone="secondary">
            {messages.landing.securityDescription}
          </AppText>
        </View>
        <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[3] }}>
          <PrimaryButton
            icon="arrow-right"
            label={messages.common.buttons.openAppShell}
            onPress={() => router.push(routes.appHome)}
          />
          <SecondaryButton
            icon="arrow-top-right"
            label={messages.common.buttons.seeHowItWorks}
            onPress={() => router.push(routes.howItWorks)}
          />
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: "center", paddingBottom: spacing[8] }}>
        <HeroVaultPreviewCard />
      </View>
    </SectionContainer>
  );
};
