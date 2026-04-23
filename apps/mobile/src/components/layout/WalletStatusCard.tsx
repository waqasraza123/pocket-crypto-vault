import { View } from "react-native";

import { formatWalletAddress } from "../../lib/blockchain/wallet/helpers";
import { interpolate, useI18n } from "../../lib/i18n";
import { spacing } from "../../theme";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { AppHeading, AppText, PrimaryButton, SecondaryButton, SurfaceCard } from "../primitives";
import { NetworkBadge } from "./NetworkBadge";

export const WalletStatusCard = () => {
  const { connect, connectionState, disconnect, switchNetwork } = useWalletConnection();
  const { inlineDirection, messages } = useI18n();

  const chainLabel = connectionState.session?.chain?.shortName ?? messages.common.networkBase;

  return (
    <SurfaceCard tone={connectionState.status === "ready" ? "default" : "muted"}>
      <View style={{ gap: spacing[2] }}>
        <AppHeading size="md">{messages.common.labels.connectionStatus}</AppHeading>
        <AppText tone="secondary">
          {connectionState.status === "walletUnavailable"
            ? messages.wallet.runtimeWaiting
            : connectionState.status === "disconnected"
              ? messages.wallet.disconnected
              : connectionState.status === "unsupportedNetwork"
                ? messages.wallet.unsupported
                : connectionState.status === "connecting"
                  ? messages.wallet.connecting
                  : messages.wallet.ready}
        </AppText>
      </View>

      <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", alignItems: "center", gap: spacing[3] }}>
        {connectionState.session?.address ? (
          <NetworkBadge
            label={connectionState.session.chain?.shortName ?? messages.common.unsupported}
            tone={connectionState.status === "unsupportedNetwork" ? "unsupported" : "supported"}
          />
        ) : null}
        {connectionState.session?.address ? (
          <AppText weight="semibold">{formatWalletAddress(connectionState.session.address)}</AppText>
        ) : null}
      </View>

      <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[3] }}>
        {connectionState.status === "walletUnavailable" ? null : connectionState.status === "unsupportedNetwork" ? (
          <PrimaryButton
            icon="swap-horizontal"
            label={interpolate(messages.wallet.switchToChain, { chain: chainLabel })}
            onPress={() => void switchNetwork()}
          />
        ) : connectionState.status === "disconnected" ? (
          <PrimaryButton icon="wallet-outline" label={messages.common.buttons.connectWallet} onPress={() => void connect()} />
        ) : connectionState.status === "connecting" ? (
          <SecondaryButton icon="timer-sand" label={messages.common.buttons.connecting} />
        ) : (
          <SecondaryButton icon="logout" label={messages.common.buttons.disconnect} onPress={() => void disconnect()} />
        )}
      </View>
    </SurfaceCard>
  );
};
