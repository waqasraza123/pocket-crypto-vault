import { PageContainer, Screen } from "../primitives";
import { ScreenHeader } from "../layout";
import { useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";
import { FinalCtaSection } from "./FinalCtaSection";
import { SecurityTrustSection } from "./SecurityTrustSection";

export const SecurityPageContent = ({
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
          eyebrow={messages.pages.security.eyebrow}
          title={messages.pages.security.title}
          description={messages.pages.security.description}
        />
        <SecurityTrustSection />
        <FinalCtaSection onCreateVault={onCreateVault} onEnterVaults={onEnterVaults} />
      </PageContainer>
    </Screen>
  );
};
