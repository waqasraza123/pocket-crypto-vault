import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useWalletPlaceholderState } from "../../state";
import { colors, radii, spacing } from "../../theme";
import { AppText, SecondaryButton } from "../primitives";

export const WalletEntryPlaceholder = () => {
  const { walletState } = useWalletPlaceholderState();

  if (walletState.connectionState === "connected" && walletState.accountLabel) {
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
        <AppText size="sm" tone="secondary" weight="semibold">
          {walletState.accountLabel}
        </AppText>
      </View>
    );
  }

  return <SecondaryButton icon="wallet-outline" label="Wallet soon" />;
};
