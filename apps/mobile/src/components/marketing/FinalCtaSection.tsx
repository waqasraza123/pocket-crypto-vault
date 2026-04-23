import { useRouter } from "expo-router";
import { View } from "react-native";

import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";
import { spacing } from "../../theme";
import { AppHeading, AppText, PrimaryButton, SectionContainer, SurfaceCard } from "../primitives";

export const FinalCtaSection = () => {
  const router = useRouter();
  const { messages } = useI18n();

  return (
    <SectionContainer>
      <SurfaceCard tone="accent">
        <View style={{ gap: spacing[3] }}>
          <AppHeading size="xl">{messages.landing.finalCtaTitle}</AppHeading>
          <AppText tone="secondary">{messages.landing.finalCtaDescription}</AppText>
          <PrimaryButton icon="arrow-right" label={messages.common.buttons.enterMyVaults} onPress={() => router.push(routes.appHome)} />
        </View>
      </SurfaceCard>
    </SectionContainer>
  );
};
