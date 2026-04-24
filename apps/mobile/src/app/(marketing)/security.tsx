import { Stack } from "expo-router";

import { FinalCtaSection, SecurityTrustSection } from "../../components/marketing";
import { ScreenHeader } from "../../components/layout";
import { PageContainer, Screen } from "../../components/primitives";
import { useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";

export default function SecurityScreen() {
  const { messages } = useI18n();

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <Stack.Screen options={{ title: messages.pages.security.title }} />
      <PageContainer width="dashboard" style={{ gap: spacing[10], paddingTop: spacing[6] }}>
        <ScreenHeader
          eyebrow={messages.pages.security.eyebrow}
          title={messages.pages.security.title}
          description={messages.pages.security.description}
        />
        <SecurityTrustSection />
        <FinalCtaSection />
      </PageContainer>
    </Screen>
  );
}
