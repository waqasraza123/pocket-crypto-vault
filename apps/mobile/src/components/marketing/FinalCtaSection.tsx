import { useRouter } from "expo-router";
import { View } from "react-native";

import { routes } from "../../lib/routing";
import { spacing } from "../../theme";
import { AppHeading, AppText, PrimaryButton, SectionContainer, SurfaceCard } from "../primitives";

export const FinalCtaSection = () => {
  const router = useRouter();

  return (
    <SectionContainer>
      <SurfaceCard tone="accent">
        <View style={{ gap: spacing[3] }}>
          <AppHeading size="xl">Build the habit before the integrations land.</AppHeading>
          <AppText tone="secondary">
            This phase ships the universal shell, adaptive layouts, and a clean product hierarchy for every later wallet,
            contract, and backend step.
          </AppText>
          <PrimaryButton icon="arrow-right" label="Enter My Vaults" onPress={() => router.push(routes.appHome)} />
        </View>
      </SurfaceCard>
    </SectionContainer>
  );
};
