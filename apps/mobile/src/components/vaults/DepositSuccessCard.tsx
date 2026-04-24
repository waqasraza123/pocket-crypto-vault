import type { VaultDetail } from "../../types";
import { formatProgress } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { MotionView, AppHeading, AppText, ProgressBar, SecondaryButton, SurfaceCard } from "../primitives";

export const DepositSuccessCard = ({
  vault,
  onDismiss,
}: {
  vault: VaultDetail;
  onDismiss: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard level="floating" tone="accent">
      <MotionView preset="hero" intensity="emphasis" style={{ gap: 12 }}>
        <AppHeading size="md">{messages.deposit.successTitle}</AppHeading>
        <AppText tone="secondary">{messages.deposit.successDescription}</AppText>
        <AppText weight="semibold">
          {interpolate(messages.deposit.successProgress, {
            progress: formatProgress(vault.progressRatio),
          })}
        </AppText>
      </MotionView>
      <ProgressBar progress={vault.progressRatio} tone={vault.progressRatio >= 1 ? "positive" : "accent"} />
      <SecondaryButton label={messages.common.buttons.fundAgain} onPress={onDismiss} />
    </SurfaceCard>
  );
};
