import type { ComponentProps } from "react";
import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../../theme";

export interface IconButtonProps {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress?: () => void;
  accessibilityLabel: string;
}

export const IconButton = ({ icon, onPress, accessibilityLabel }: IconButtonProps) => {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        borderRadius: radii.pill,
        backgroundColor: pressed ? colors.surfaceStrong : colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <MaterialCommunityIcons color={colors.textPrimary} name={icon} size={20} />
    </Pressable>
  );
};
