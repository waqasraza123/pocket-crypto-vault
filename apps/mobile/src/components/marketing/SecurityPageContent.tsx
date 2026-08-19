import { View } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useI18n } from "../../lib/i18n";
import { getSecurityPageModel } from "../../lib/public/marketing-content";
import { spacing } from "../../theme";
import { NativeActionDock, NativeAppScreenShell, NativeHeroCard, NativeScreenHeader } from "../layout";
import { AppText, PageContainer, PrimaryButton, Screen, SecondaryButton } from "../primitives";
import { FinalCtaSection } from "./FinalCtaSection";
import { PublicRouteHero } from "./PublicRouteHero";
import { SecurityDisclosureSection } from "./SecurityDisclosureSection";
import { SecurityTrustSection } from "./SecurityTrustSection";

export const SecurityPageContent = ({
  onCreateVault,
  onEnterVaults,
  onSeeHowItWorks,
}: {
  onCreateVault: () => void;
  onEnterVaults: () => void;
  onSeeHowItWorks: () => void;
}) => {
  const { locale, messages } = useI18n();
  const breakpoint = useBreakpoint();
  const model = getSecurityPageModel(locale);

  if (breakpoint.isCompact) {
    return (
      <Screen
        scroll={false}
        contentContainerStyle={{ flex: 1 }}
        edges={["left", "right"]}
      >
        <NativeAppScreenShell
          background="story"
          top={
            <NativeScreenHeader
              eyebrow={messages.pages.security.eyebrow}
              title={messages.pages.security.title}
              description={messages.pages.security.description}
              tone="dark"
            />
          }
          bottom={
            <NativeActionDock>
              <PrimaryButton fullWidth icon="plus" label={model.primaryAction.label} onPress={onCreateVault} />
              <SecondaryButton fullWidth icon="arrow-top-right" label={model.secondaryAction.label} onPress={onSeeHowItWorks} />
            </NativeActionDock>
          }
          scroll
        >
          <NativeHeroCard
            icon="shield-star-outline"
            eyebrow={messages.landing.securityEyebrow}
            title={messages.landing.securityTitle}
            description={messages.landing.securityDescription}
            tone="dark"
          >
            <View style={{ gap: spacing[2] }}>
              {model.highlightItems.map((item) => (
                <AppText key={item} size="sm" style={{ color: "#dbeafe" }} weight="semibold">
                  {item}
                </AppText>
              ))}
            </View>
          </NativeHeroCard>
          {messages.landing.securityPrinciples.map((principle, index) => (
            <NativeHeroCard
              key={principle.title}
              icon={index === 0 ? "wallet-outline" : index === 1 ? "link-variant" : index === 2 ? "file-document-outline" : "shield-check-outline"}
              eyebrow={`${index + 1}`}
              title={principle.title}
              description={principle.description}
            />
          ))}
        </NativeAppScreenShell>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing[12] }}>
      <PageContainer width="dashboard" style={{ gap: spacing[10], paddingTop: spacing[6] }}>
        <PublicRouteHero
          eyebrow={messages.pages.security.eyebrow}
          title={messages.pages.security.title}
          description={messages.pages.security.description}
          highlights={model.highlightItems}
          primaryActionLabel={model.primaryAction.label}
          onPrimaryAction={onCreateVault}
          secondaryActionLabel={model.secondaryAction.label}
          onSecondaryAction={onSeeHowItWorks}
          insightEyebrow={messages.landing.securityEyebrow}
          insightTitle={messages.landing.securityTitle}
          insightPoints={model.insightPoints}
        />
        <SecurityDisclosureSection />
        <SecurityTrustSection />
        <FinalCtaSection onCreateVault={onCreateVault} onEnterVaults={onEnterVaults} />
      </PageContainer>
    </Screen>
  );
};
