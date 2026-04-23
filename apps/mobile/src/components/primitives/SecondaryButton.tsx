import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../../theme";
import { AppText } from "./AppText";

export interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
}

export const SecondaryButton = ({ label, onPress, icon }: SecondaryButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.surfaceStrong : colors.surface,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[4],
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing[2] }}>
        {icon ? <MaterialCommunityIcons color={colors.textPrimary} name={icon} size={18} /> : null}
        <AppText weight="semibold">{label}</AppText>
      </View>
    </Pressable>
  );
};
