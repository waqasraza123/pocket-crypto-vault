import { PageContainer, Screen } from "../primitives";
import { ScreenHeader } from "../layout";
import { useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";
import { FinalCtaSection } from "./FinalCtaSection";
import { HowItWorksSection } from "./HowItWorksSection";

export const HowItWorksPageContent = ({
  onCreateVault,
  onEnterVaults,
}: {
  onCreateVault: () => void;
  onEnterVaults: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="dashboard" style={{ gap: spacing[10], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.howItWorks.eyebrow}
          title={messages.pages.howItWorks.title}
          description={messages.pages.howItWorks.description}
        />
        <HowItWorksSection />
        <FinalCtaSection onCreateVault={onCreateVault} onEnterVaults={onEnterVaults} />
      </PageContainer>
    </Screen>
  );
};
