import type { CreateVaultTransactionState } from "../../types";
import { useI18n } from "../../lib/i18n";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";

export const CreateVaultErrorState = ({
  state,
  onRetry,
  onReset,
}: {
  state: CreateVaultTransactionState;
  onRetry?: () => void;
  onReset?: () => void;
}) => {
  const { messages } = useI18n();

  return (
    <SurfaceCard tone="muted">
      <AppHeading size="md">
        {state.didOnchainSucceed ? messages.pages.createVault.error.activeTitle : messages.pages.createVault.error.failedTitle}
      </AppHeading>
      <AppText tone="secondary">
        {state.errorMessage ??
          (state.didOnchainSucceed
            ? messages.pages.createVault.error.activeDescription
            : messages.pages.createVault.error.failedDescription)}
      </AppText>
      {onRetry ? <PrimaryButton icon="refresh" label={messages.common.buttons.retry} onPress={onRetry} /> : null}
      {onReset ? <SecondaryButton icon="restart" label={messages.common.buttons.startOver} onPress={onReset} /> : null}
    </SurfaceCard>
  );
};
