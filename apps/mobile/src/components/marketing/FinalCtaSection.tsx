import { View } from "react-native";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PrimaryButton, SectionContainer, SecondaryButton, SurfaceCard } from "../primitives";

export const FinalCtaSection = ({
  onCreateVault,
  onEnterVaults,
}: {
  onCreateVault: () => void;
  onEnterVaults: () => void;
}) => {
  const adaptiveLayout = useAdaptiveLayout();
  const { messages } = useI18n();

  if (adaptiveLayout.isCompact) {
    return (
      <SectionContainer gap={spacing[3]}>
        <SurfaceCard tone="accent" style={{ backgroundColor: colors.backgroundElevated, padding: spacing[4] }}>
          <View style={{ gap: spacing[3] }}>
            <View
              style={{
                alignSelf: "flex-start",
                borderRadius: radii.pill,
                backgroundColor: colors.accentSoft,
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[1],
              }}
            >
              <AppText size="xs" tone="accent" weight="semibold">
                {messages.landing.finalCtaEyebrow}
              </AppText>
            </View>
            <AppHeading size="lg">{messages.landing.finalCtaTitle}</AppHeading>
            <AppText size="sm" tone="secondary">{messages.landing.finalCtaDescription}</AppText>
            <View style={{ gap: spacing[2] }}>
              <PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={onCreateVault} fullWidth />
              <SecondaryButton icon="arrow-right" label={messages.common.buttons.enterMyVaults} onPress={onEnterVaults} fullWidth />
            </View>
          </View>
        </SurfaceCard>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <SurfaceCard tone="accent" style={{ backgroundColor: colors.backgroundElevated }}>
        <View style={{ gap: spacing[4] }}>
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
              {messages.landing.finalCtaEyebrow}
            </AppText>
          </View>
          <AppHeading size="xl">{messages.landing.finalCtaTitle}</AppHeading>
          <AppText tone="secondary">{messages.landing.finalCtaDescription}</AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>
            {messages.landing.finalCtaHighlights.map((item) => (
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
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
            <PrimaryButton icon="plus" label={messages.common.buttons.createVault} onPress={onCreateVault} />
            <SecondaryButton icon="arrow-right" label={messages.common.buttons.enterMyVaults} onPress={onEnterVaults} />
          </View>
        </View>
      </SurfaceCard>
    </SectionContainer>
  );
};
