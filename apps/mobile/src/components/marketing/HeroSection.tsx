import { useRouter } from "expo-router";
import { View } from "react-native";

import { appCopy } from "@goal-vault/config";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { routes } from "../../lib/routing";
import { heroHighlights } from "../../features/marketing/data";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SectionContainer } from "../primitives";
import { HeroVaultPreviewCard } from "./HeroVaultPreviewCard";

export const HeroSection = () => {
  const adaptiveLayout = useAdaptiveLayout();
  const router = useRouter();

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
            Base-native USDC saving
          </AppText>
        </View>
        <View style={{ gap: spacing[3] }}>
          <AppHeading size={adaptiveLayout.isCompact ? "xl" : "display"}>{appCopy.heroTitle}</AppHeading>
          <AppText size="lg" tone="secondary">
            {appCopy.heroSubtitle}
          </AppText>
        </View>
        <View style={{ gap: spacing[2] }}>
          {heroHighlights.map((item) => (
            <AppText key={item} tone="secondary">
              • {item}
            </AppText>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
          <PrimaryButton icon="arrow-right" label="Open the app shell" onPress={() => router.push(routes.appHome)} />
          <SecondaryButton
            icon="arrow-top-right"
            label="See how it works"
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
