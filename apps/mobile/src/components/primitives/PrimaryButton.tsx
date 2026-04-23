import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../../theme";
import { useI18n } from "../../lib/i18n";
import { AppText } from "./AppText";

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
}

export const PrimaryButton = ({ label, onPress, disabled, icon }: PrimaryButtonProps) => {
  const { getDirectionalIcon, inlineDirection } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: disabled ? colors.border : pressed ? colors.accentStrong : colors.accent,
        borderRadius: radii.pill,
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[4],
      })}
    >
      <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "center", gap: spacing[2] }}>
        {icon ? <MaterialCommunityIcons color={colors.white} name={getDirectionalIcon(icon)} size={18} /> : null}
        <AppText align="center" style={{ color: colors.white }} weight="semibold">
          {label}
        </AppText>
      </View>
    </Pressable>
  );
};
