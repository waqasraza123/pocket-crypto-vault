import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useWalletConnection } from "../../hooks/useWalletConnection";
import { formatWalletAddress } from "../../lib/blockchain/wallet/helpers";
import { colors, radii, spacing } from "../../theme";
import { AppText, SecondaryButton } from "../primitives";
import { NetworkBadge } from "./NetworkBadge";

export const WalletEntryPlaceholder = () => {
  const { connect, connectionState, switchNetwork } = useWalletConnection();

  if (connectionState.status === "ready" && connectionState.session?.address) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[2],
          borderRadius: radii.pill,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[2],
        }}
      >
        <MaterialCommunityIcons color={colors.positive} name="shield-check-outline" size={18} />
        <NetworkBadge label={connectionState.session.chain?.shortName ?? "Base"} />
        <AppText size="sm" tone="secondary" weight="semibold">
          {formatWalletAddress(connectionState.session.address)}
        </AppText>
      </View>
    );
  }

  if (connectionState.status === "unsupportedNetwork") {
    return <SecondaryButton icon="swap-horizontal" label="Switch network" onPress={() => void switchNetwork()} />;
  }

  if (connectionState.status === "connecting") {
    return <SecondaryButton icon="timer-sand" label="Connecting..." />;
  }

  return <SecondaryButton icon="wallet-outline" label="Connect wallet" onPress={() => void connect()} />;
};
