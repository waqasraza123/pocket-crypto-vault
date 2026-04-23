import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../../theme";
import { useI18n } from "../../lib/i18n";
import { AppText } from "./AppText";

export interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  disabled?: boolean;
}

export const SecondaryButton = ({ label, onPress, icon, disabled }: SecondaryButtonProps) => {
  const { getDirectionalIcon, inlineDirection } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: disabled ? colors.surfaceMuted : pressed ? colors.surfaceStrong : colors.surface,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: disabled ? colors.borderStrong : colors.border,
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[4],
      })}
    >
      <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "center", gap: spacing[2] }}>
        {icon ? (
          <MaterialCommunityIcons
            color={disabled ? colors.textMuted : colors.textPrimary}
            name={getDirectionalIcon(icon)}
            size={18}
          />
        ) : null}
        <AppText style={disabled ? { color: colors.textMuted } : undefined} weight="semibold">
          {label}
        </AppText>
      </View>
    </Pressable>
  );
};
