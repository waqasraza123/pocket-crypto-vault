import type { VaultDetail } from "../../types";
import { formatProgress } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { AppHeading, AppText, SecondaryButton, SurfaceCard } from "../primitives";

export const DepositSuccessCard = ({
  vault,
  onDismiss,
}: {
  vault: VaultDetail;
  onDismiss: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="accent">
      <AppHeading size="md">{messages.deposit.successTitle}</AppHeading>
      <AppText tone="secondary">{messages.deposit.successDescription}</AppText>
      <AppText weight="semibold">
        {interpolate(messages.deposit.successProgress, {
          progress: formatProgress(vault.progressRatio),
        })}
      </AppText>
      <SecondaryButton label={messages.common.buttons.fundAgain} onPress={onDismiss} />
    </SurfaceCard>
  );
};
