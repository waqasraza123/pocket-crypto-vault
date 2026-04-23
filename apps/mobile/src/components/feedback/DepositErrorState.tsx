import type { DepositFlowState } from "../../types";
import { useI18n } from "../../lib/i18n";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";

export const DepositErrorState = ({
  state,
  onRetry,
  onReset,
}: {
  state: DepositFlowState;
  onRetry: () => void;
  onReset: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">
        {state.approvalCompleted ? messages.deposit.approvalErrorReadyTitle : messages.deposit.approvalErrorTitle}
      </AppHeading>
      <AppText tone="secondary">
        {state.errorMessage ??
          (state.approvalCompleted ? messages.deposit.approvalErrorDescription : messages.deposit.errorDescription)}
      </AppText>
      <PrimaryButton
        label={state.approvalCompleted ? messages.common.buttons.retryDeposit : messages.common.buttons.tryAgain}
        onPress={onRetry}
      />
      <SecondaryButton label={messages.common.buttons.reset} onPress={onReset} />
    </SurfaceCard>
  );
};
