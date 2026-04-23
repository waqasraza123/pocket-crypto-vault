import type { CreateVaultResult } from "../../types";
import { interpolate, useI18n } from "../../lib/i18n";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";

export const CreateVaultSuccessCard = ({
  result,
  onViewVault,
  onBackToVaults,
}: {
  result: CreateVaultResult;
  onViewVault: () => void;
  onBackToVaults: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="accent">
      <AppText size="sm" tone="accent" weight="semibold">
        {messages.pages.createVault.success.eyebrow}
      </AppText>
      <AppHeading size="lg">{result.review.goalName}</AppHeading>
      <AppText tone="secondary">{messages.pages.createVault.success.description}</AppText>
      <AppText weight="semibold">{result.review.targetAmountDisplay}</AppText>
      <AppText tone="secondary">
        {interpolate(messages.vaults.protectionRuleUnlocksOn, { date: result.review.unlockDateLabel })}
      </AppText>
      <AppText tone="secondary">
        {result.review.networkLabel} • {result.review.assetSymbol}
      </AppText>
      <PrimaryButton icon="shield-check-outline" label={messages.common.buttons.viewVault} onPress={onViewVault} />
      <SecondaryButton icon="view-grid-outline" label={messages.common.buttons.backToVaults} onPress={onBackToVaults} />
    </SurfaceCard>
  );
};
