import { View } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useI18n } from "../../lib/i18n";
import { getHowItWorksPageModel } from "../../lib/public/marketing-content";
import { spacing } from "../../theme";
import { NativeActionDock, NativeAppScreenShell, NativeHeroCard, NativeScreenHeader } from "../layout";
import { AppText, PageContainer, PrimaryButton, Screen, SecondaryButton } from "../primitives";
import { FinalCtaSection } from "./FinalCtaSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { PublicRouteHero } from "./PublicRouteHero";
import { RuleProtectionSection } from "./RuleProtectionSection";

export const HowItWorksPageContent = ({
  onCreateVault,
  onEnterVaults,
  onReviewSecurity,
}: {
  onCreateVault: () => void;
  onEnterVaults: () => void;
  onReviewSecurity: () => void;
}) => {
  const { locale, messages } = useI18n();
  const breakpoint = useBreakpoint();
  const model = getHowItWorksPageModel(locale);

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
              eyebrow={messages.pages.howItWorks.eyebrow}
              title={messages.pages.howItWorks.title}
              description={messages.pages.howItWorks.description}
              tone="dark"
            />
          }
          bottom={
            <NativeActionDock>
              <PrimaryButton fullWidth icon="plus" label={model.primaryAction.label} onPress={onCreateVault} />
              <SecondaryButton fullWidth icon="arrow-top-right" label={model.secondaryAction.label} onPress={onReviewSecurity} />
            </NativeActionDock>
          }
          scroll
        >
          <NativeHeroCard
            icon="compass-outline"
            eyebrow={messages.landing.howItWorksEyebrow}
            title={messages.landing.howItWorksTitle}
            description={messages.landing.howItWorksDescription}
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
          {messages.landing.howItWorksSteps.map((step, index) => (
            <NativeHeroCard
              key={step.title}
              icon={index === 0 ? "bullseye-arrow" : index === 1 ? "shield-lock-outline" : index === 2 ? "cash-plus" : "lock-open-check-outline"}
              eyebrow={`${index + 1}`}
              title={step.title}
              description={step.description}
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
          eyebrow={messages.pages.howItWorks.eyebrow}
          title={messages.pages.howItWorks.title}
          description={messages.pages.howItWorks.description}
          highlights={model.highlightItems}
          primaryActionLabel={model.primaryAction.label}
          onPrimaryAction={onCreateVault}
          secondaryActionLabel={model.secondaryAction.label}
          onSecondaryAction={onReviewSecurity}
          insightEyebrow={messages.landing.howItWorksEyebrow}
          insightTitle={messages.landing.howItWorksTitle}
          insightPoints={model.insightPoints}
        />
        <HowItWorksSection />
        <RuleProtectionSection />
        <FinalCtaSection onCreateVault={onCreateVault} onEnterVaults={onEnterVaults} />
      </PageContainer>
    </Screen>
  );
};
