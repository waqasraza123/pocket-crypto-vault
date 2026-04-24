import type { ComponentProps } from "react";
import { Animated, Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useInteractiveMotion } from "../../lib/motion/feedback-motion";
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
  const motion = useInteractiveMotion("subtle");

  return (
    <Animated.View style={[motion.animatedStyle, { opacity: disabled ? 0.74 : 1 }]}>
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
          backgroundColor: disabled ? colors.border : pressed ? colors.accentStrong : colors.accent,
          borderRadius: radii.pill,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[4],
          borderWidth: 1,
          borderColor: disabled ? colors.borderStrong : colors.accentStrong,
          shadowColor: colors.accentStrong,
          shadowOpacity: disabled ? 0 : 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: disabled ? 0 : 6,
        })}
      >
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
