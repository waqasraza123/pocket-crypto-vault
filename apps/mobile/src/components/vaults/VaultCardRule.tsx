import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { formatLongDate } from "../../lib/format";
import { colors, spacing } from "../../theme";
import { AppText } from "../primitives";

export interface VaultCardRuleProps {
  unlockDate: string;
}

export const VaultCardRule = ({ unlockDate }: VaultCardRuleProps) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
      <MaterialCommunityIcons color={colors.accentStrong} name="calendar-clock-outline" size={18} />
      <AppText tone="secondary">Unlocks on {formatLongDate(unlockDate)}</AppText>
    </View>
  );
};
