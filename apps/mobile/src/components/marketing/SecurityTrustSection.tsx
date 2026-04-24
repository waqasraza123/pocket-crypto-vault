import { View } from "react-native";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, SectionContainer, SurfaceCard } from "../primitives";

export const SecurityTrustSection = () => {
  const adaptiveLayout = useAdaptiveLayout();
  const { messages } = useI18n();

  return (
    <SectionContainer
      header={
        <View style={{ gap: spacing[2] }}>
          <AppText size="sm" tone="accent" weight="semibold">
            {messages.landing.securityEyebrow}
          </AppText>
          <AppHeading size="xl">{messages.landing.securityTitle}</AppHeading>
          <AppText tone="secondary">{messages.landing.securityDescription}</AppText>
        </View>
      }
    >
      <View
        style={{
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundElevated,
          padding: spacing[5],
          gap: spacing[2],
        }}
      >
        <AppText size="sm" tone="accent" weight="semibold">
          {messages.landing.securitySummaryTitle}
        </AppText>
        <AppText tone="secondary">
          {messages.landing.securitySummaryDescription}
        </AppText>
      </View>
      <View style={{ flexDirection: adaptiveLayout.useSplitLayout ? "row" : "column", gap: spacing[4] }}>
        {messages.landing.securityPrinciples.map((item) => (
          <SurfaceCard key={item.title} style={{ flex: 1 }}>
            <AppHeading size="md">{item.title}</AppHeading>
            <AppText tone="secondary">{item.description}</AppText>
          </SurfaceCard>
        ))}
      </View>
    </SectionContainer>
  );
};
