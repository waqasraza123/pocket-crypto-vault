import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useWalletConnection } from "../../hooks/useWalletConnection";
import { useI18n } from "../../lib/i18n";
import { formatWalletAddress } from "../../lib/blockchain/wallet/helpers";
import { colors, radii, spacing } from "../../theme";
import { AppText, SecondaryButton } from "../primitives";
import { NetworkBadge } from "./NetworkBadge";

export const WalletEntryPlaceholder = () => {
  const { connect, connectionState, switchNetwork } = useWalletConnection();
  const { inlineDirection, messages } = useI18n();

  if (connectionState.status === "ready" && connectionState.session?.address) {
    return (
      <View
        style={{
          flexDirection: inlineDirection(),
          alignItems: "center",
          gap: spacing[2],
          borderRadius: radii.pill,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[2],
        }}
      >
        <MaterialCommunityIcons color={colors.positive} name="shield-check-outline" size={18} />
        <NetworkBadge label={connectionState.session.chain?.shortName ?? messages.common.networkBase} />
        <AppText size="sm" tone="secondary" weight="semibold">
          {formatWalletAddress(connectionState.session.address)}
        </AppText>
      </View>
    );
  }

  if (connectionState.status === "unsupportedNetwork") {
    return <SecondaryButton icon="swap-horizontal" label={messages.common.buttons.switchNetwork} onPress={() => void switchNetwork()} />;
  }

  if (connectionState.status === "connecting") {
    return <SecondaryButton icon="timer-sand" label={messages.common.buttons.connecting} />;
  }

  return <SecondaryButton icon="wallet-outline" label={messages.common.buttons.connectWallet} onPress={() => void connect()} />;
};
