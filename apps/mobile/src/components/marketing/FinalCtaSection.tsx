import { View } from "react-native";

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
  const { messages } = useI18n();

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
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
            <PrimaryButton icon="arrow-right" label={messages.common.buttons.enterMyVaults} onPress={onEnterVaults} />
            <SecondaryButton icon="plus" label={messages.common.buttons.createVault} onPress={onCreateVault} />
          </View>
        </View>
      </SurfaceCard>
    </SectionContainer>
  );
};
