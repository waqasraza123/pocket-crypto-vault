import { View } from "react-native";

import { formatWalletAddress } from "../../lib/blockchain/wallet/helpers";
import { spacing } from "../../theme";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";
import { NetworkBadge } from "./NetworkBadge";

export const WalletStatusCard = () => {
  const { connect, connectionState, disconnect, switchNetwork } = useWalletConnection();

  const chainLabel = connectionState.session?.chain?.shortName ?? "Wallet";

  return (
    <SurfaceCard tone={connectionState.status === "ready" ? "default" : "muted"}>
      <View style={{ gap: spacing[2] }}>
        <AppHeading size="md">Connection status</AppHeading>
        <AppText tone="secondary">
          {connectionState.status === "walletUnavailable"
            ? "Wallet connectivity is waiting for runtime configuration."
            : connectionState.status === "disconnected"
              ? "Connect a wallet to move from the static shell into real Base-aware reads."
              : connectionState.status === "unsupportedNetwork"
                ? "The wallet is connected, but the active network is outside the supported launch set."
                : connectionState.status === "connecting"
                  ? "Waiting for wallet approval."
                  : "Wallet and supported network are ready for read-only chain access."}
        </AppText>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing[3] }}>
        {connectionState.session?.address ? (
          <NetworkBadge
            label={connectionState.session.chain?.shortName ?? "Unsupported"}
            tone={connectionState.status === "unsupportedNetwork" ? "unsupported" : "supported"}
          />
        ) : null}
        {connectionState.session?.address ? (
          <AppText weight="semibold">{formatWalletAddress(connectionState.session.address)}</AppText>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[3] }}>
        {connectionState.status === "walletUnavailable" ? null : connectionState.status === "unsupportedNetwork" ? (
          <PrimaryButton icon="swap-horizontal" label={`Switch to ${chainLabel}`} onPress={() => void switchNetwork()} />
        ) : connectionState.status === "disconnected" ? (
          <PrimaryButton icon="wallet-outline" label="Connect wallet" onPress={() => void connect()} />
        ) : connectionState.status === "connecting" ? (
          <SecondaryButton icon="timer-sand" label="Connecting..." />
        ) : (
          <SecondaryButton icon="logout" label="Disconnect" onPress={() => void disconnect()} />
        )}
      </View>
    </SurfaceCard>
  );
};
