import { EmptyState, SecondaryButton } from "../primitives";

export interface DisconnectedStateProps {
  onConnect: () => void;
}

export const DisconnectedState = ({ onConnect }: DisconnectedStateProps) => {
  return (
    <EmptyState
      description="Connect a wallet to read vaults on Base, check the active network, and prepare for later onchain actions."
      icon="wallet-outline"
      title="Connect a wallet to open the app"
    >
      <SecondaryButton icon="wallet-outline" label="Connect wallet" onPress={onConnect} />
    </EmptyState>
  );
};
