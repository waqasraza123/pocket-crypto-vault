import { View } from "react-native";

import { MarketingShell } from "../components/layout";
import { FinalCtaSection, HeroSection, HowItWorksSection } from "../components/marketing";
import { PageContainer, Screen } from "../components/primitives";
import { spacing } from "../theme";

export default function LandingScreen() {
  return (
    <MarketingShell>
      <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
        <PageContainer width="dashboard" style={{ gap: spacing[12], paddingTop: spacing[6] }}>
          <HeroSection />
          <HowItWorksSection />
          <FinalCtaSection />
          <View />
        </PageContainer>
      </Screen>
    </MarketingShell>
  );
}
