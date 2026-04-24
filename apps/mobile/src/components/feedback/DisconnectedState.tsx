import { useI18n } from "../../lib/i18n";
import { EmptyState, SecondaryButton } from "../primitives";

export interface DisconnectedStateProps {
  onConnect: () => void;
}

export const DisconnectedState = ({ onConnect }: DisconnectedStateProps) => {
  const { messages } = useI18n();

  return (
    <EmptyState
      eyebrow={messages.wallet.connectToOpenAppEyebrow}
      description={messages.wallet.connectToOpenAppDescription}
      highlights={messages.wallet.connectToOpenAppHighlights}
      icon="wallet-outline"
      title={messages.wallet.connectToOpenAppTitle}
    >
      <SecondaryButton icon="wallet-outline" label={messages.common.buttons.connectWallet} onPress={onConnect} />
    </EmptyState>
  );
};
