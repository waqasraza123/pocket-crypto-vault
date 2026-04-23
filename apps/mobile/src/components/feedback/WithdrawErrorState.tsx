import type { WithdrawFlowState } from "../../types";
import { useI18n } from "../../lib/i18n";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";

export const WithdrawErrorState = ({
  state,
  onRetry,
  onReset,
}: {
  state: WithdrawFlowState;
  onRetry: () => void;
  onReset: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">{messages.withdraw.flow.failedTitle}</AppHeading>
      <AppText tone="secondary">{state.errorMessage ?? messages.withdraw.flow.failedDescription}</AppText>
      <PrimaryButton label={messages.withdraw.actions.retry} onPress={onRetry} />
      <SecondaryButton label={messages.common.buttons.reset} onPress={onReset} />
    </SurfaceCard>
  );
};
