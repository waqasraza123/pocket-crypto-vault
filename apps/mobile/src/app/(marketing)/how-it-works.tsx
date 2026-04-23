import { FinalCtaSection, HowItWorksSection } from "../../components/marketing";
import { PageContainer, Screen } from "../../components/primitives";
import { ScreenHeader } from "../../components/layout";
import { useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";

export default function HowItWorksScreen() {
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
        <FinalCtaSection />
      </PageContainer>
    </Screen>
  );
}
