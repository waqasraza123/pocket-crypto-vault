import type { VaultDetail } from "../../types";
import { formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { MotionView, AppHeading, AppText, SecondaryButton, SurfaceCard } from "../primitives";

export const WithdrawSuccessCard = ({
  vault,
  onDismiss,
}: {
  vault: VaultDetail;
  onDismiss: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard level="floating" tone="accent">
      <MotionView preset="hero" intensity="structural" style={{ gap: 12 }}>
        <AppHeading size="md">{messages.withdraw.successTitle}</AppHeading>
        <AppText tone="secondary">{messages.withdraw.successDescription}</AppText>
        <AppText weight="semibold">
          {interpolate(messages.withdraw.successProgress, {
            amount: formatUsdc(vault.savedAmount),
          })}
        </AppText>
      </MotionView>
      <SecondaryButton label={messages.common.buttons.withdrawAgain} onPress={onDismiss} />
    </SurfaceCard>
  );
};
