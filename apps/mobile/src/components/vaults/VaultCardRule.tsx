import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { formatLongDate } from "../../lib/format";
import { interpolate, useI18n } from "../../lib/i18n";
import { colors, spacing } from "../../theme";
import { AppText } from "../primitives";

export interface VaultCardRuleProps {
  unlockDate: string;
}

export const VaultCardRule = ({ unlockDate }: VaultCardRuleProps) => {
  const { inlineDirection, messages } = useI18n();

  return (
    <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
      <MaterialCommunityIcons color={colors.accentStrong} name="calendar-clock-outline" size={18} />
      <AppText tone="secondary">
        {interpolate(messages.vaults.protectionRuleUnlocksOn, { date: formatLongDate(unlockDate) })}
      </AppText>
    </View>
  );
};
