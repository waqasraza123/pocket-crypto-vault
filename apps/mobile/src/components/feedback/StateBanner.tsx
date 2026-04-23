import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../../theme";
import { AppText } from "../primitives";

export interface StateBannerProps {
  tone?: "warning" | "neutral";
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}

export const StateBanner = ({ tone = "neutral", icon = "information-outline", label }: StateBannerProps) => {
  const backgroundColor = tone === "warning" ? colors.warningSoft : colors.surfaceMuted;
  const iconColor = tone === "warning" ? colors.warning : colors.textSecondary;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
        borderRadius: radii.md,
        backgroundColor,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
      }}
    >
      <MaterialCommunityIcons color={iconColor} name={icon} size={18} />
      <AppText size="sm" tone="secondary">
        {label}
      </AppText>
    </View>
  );
};
