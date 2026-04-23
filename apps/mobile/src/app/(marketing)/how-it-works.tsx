import { FinalCtaSection, HowItWorksSection } from "../../components/marketing";
import { PageContainer, Screen } from "../../components/primitives";
import { ScreenHeader } from "../../components/layout";
import { spacing } from "../../theme";

export default function HowItWorksScreen() {
  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="dashboard" style={{ gap: spacing[10], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow="Product flow"
          title="Create one vault, keep one promise clear."
          description="Goal Vault strips the product back to the moments that matter: naming the goal, protecting it with time, and funding it calmly."
        />
        <HowItWorksSection />
        <FinalCtaSection />
      </PageContainer>
    </Screen>
  );
}
