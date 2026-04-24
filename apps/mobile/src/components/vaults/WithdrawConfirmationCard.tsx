import type { VaultDetail, WithdrawEligibility, WithdrawPreview } from "../../types";
import { formatUsdc } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { MotionView, AppHeading, AppText, PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";

export const WithdrawConfirmationCard = ({
  vault,
  eligibility,
  preview,
  onCancel,
  onConfirm,
  disabled,
}: {
  vault: VaultDetail;
  eligibility: WithdrawEligibility;
  preview: WithdrawPreview;
  onCancel: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard level="floating" tone="muted">
      <MotionView style={{ gap: 12 }}>
        <AppHeading size="md">{messages.withdraw.confirmationTitle}</AppHeading>
        <AppText tone="secondary">{messages.withdraw.confirmationDescription}</AppText>
        <AppText weight="semibold">{vault.goalName}</AppText>
        <AppText>{interpolate(messages.withdraw.confirmationAmount, { amount: formatUsdc(preview.withdrawAmount) })}</AppText>
        <AppText>{interpolate(messages.withdraw.confirmationRemaining, { amount: formatUsdc(preview.resultingSavedAmount) })}</AppText>
        <AppText>{interpolate(messages.withdraw.confirmationTarget, { amount: formatUsdc(vault.targetAmount) })}</AppText>
        <AppText tone="secondary">{eligibility.message}</AppText>
      </MotionView>
      <PrimaryButton disabled={disabled} label={messages.common.buttons.confirmWithdrawal} onPress={() => void onConfirm()} />
      <SecondaryButton disabled={disabled} label={messages.common.buttons.cancel} onPress={onCancel} />
    </SurfaceCard>
  );
};
