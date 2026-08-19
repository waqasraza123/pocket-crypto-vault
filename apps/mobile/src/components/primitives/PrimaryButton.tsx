import type { ComponentProps } from "react";
import { Animated, Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useInteractiveMotion } from "../../lib/motion/feedback-motion";
import { colors, createShadowStyle, radii, spacing } from "../../theme";
import { useI18n } from "../../lib/i18n";
import { AppText } from "./AppText";

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  fullWidth?: boolean;
}

export const PrimaryButton = ({ label, onPress, disabled, icon, fullWidth = false }: PrimaryButtonProps) => {
  const { getDirectionalIcon, inlineDirection } = useI18n();
  const motion = useInteractiveMotion("subtle");

  return (
    <Animated.View style={[motion.animatedStyle, { opacity: disabled ? 0.74 : 1, alignSelf: fullWidth ? "stretch" : undefined }]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onBlur={motion.onBlur}
        onFocus={motion.onFocus}
        onHoverIn={motion.onHoverIn}
        onHoverOut={motion.onHoverOut}
        onPress={onPress}
        onPressIn={motion.onPressIn}
        onPressOut={motion.onPressOut}
        style={({ pressed }) => ({
          minHeight: 54,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: disabled ? colors.border : pressed ? colors.accentStrong : colors.accent,
          borderRadius: radii.md,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[4],
          borderWidth: 1,
          borderColor: disabled ? colors.borderStrong : pressed ? colors.accentStrong : colors.borderStrong,
          overflow: "hidden",
          ...createShadowStyle({
            color: colors.accentStrong,
            opacity: disabled ? 0 : pressed ? 0.18 : 0.28,
            radius: pressed ? 18 : 26,
            offsetY: pressed ? 9 : 15,
            elevation: disabled ? 0 : 8,
          }),
          elevation: disabled ? 0 : 8,
        })}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 1,
            left: 1,
            right: 1,
            height: "48%",
            borderRadius: radii.md,
            backgroundColor: colors.white,
            opacity: disabled ? 0 : 0.14,
          }}
        />
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "center", gap: spacing[2] }}>
          {icon ? <MaterialCommunityIcons color={colors.white} name={getDirectionalIcon(icon)} size={18} /> : null}
          <AppText align="center" style={{ color: colors.white }} weight="semibold">
            {label}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
};
