import type { ReactNode } from "react";
import { useI18n } from "../../lib/i18n";
import { GuidedStepsCard } from "../feedback";
import { PageContainer, Screen } from "../primitives";
import { spacing } from "../../theme";
import { FinalCtaSection } from "./FinalCtaSection";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { SecurityTrustSection } from "./SecurityTrustSection";

export interface LandingPageContentProps {
  connectionNotice?: ReactNode;
  showConnectionNotice?: boolean;
  onCreateVault: () => void;
  onEnterVaults: () => void;
  onSeeHowItWorks: () => void;
}

export const LandingPageContent = ({
  connectionNotice,
  showConnectionNotice = false,
  onCreateVault,
  onEnterVaults,
  onSeeHowItWorks,
}: LandingPageContentProps) => {
  const { messages } = useI18n();

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="dashboard" style={{ gap: spacing[12], paddingTop: spacing[6] }}>
        <HeroSection onEnterVaults={onEnterVaults} onSeeHowItWorks={onSeeHowItWorks} />
        <GuidedStepsCard
          description={messages.landing.demoPathDescription}
          eyebrow={messages.landing.demoPathEyebrow}
          icon="play-circle-outline"
          steps={messages.landing.demoPathSteps}
          title={messages.landing.demoPathTitle}
        />
        {showConnectionNotice ? connectionNotice ?? null : null}
        <HowItWorksSection />
        <SecurityTrustSection />
        <FinalCtaSection onCreateVault={onCreateVault} onEnterVaults={onEnterVaults} />
      </PageContainer>
    </Screen>
  );
};
