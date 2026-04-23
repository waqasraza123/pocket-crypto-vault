import { FinalCtaSection, SecurityTrustSection } from "../../components/marketing";
import { ScreenHeader } from "../../components/layout";
import { PageContainer, Screen } from "../../components/primitives";
import { spacing } from "../../theme";

export default function SecurityScreen() {
  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="dashboard" style={{ gap: spacing[10], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow="Security"
          title="A narrow trust model is easier to understand."
          description="The shell is intentionally calm and factual: Base only, USDC only, and rule-based withdrawal clarity."
        />
        <SecurityTrustSection />
        <FinalCtaSection />
      </PageContainer>
    </Screen>
  );
}
