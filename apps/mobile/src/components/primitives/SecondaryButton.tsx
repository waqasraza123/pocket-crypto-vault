import type { ComponentProps } from "react";
import { Animated, Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useInteractiveMotion } from "../../lib/motion/feedback-motion";
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
          backgroundColor: disabled ? colors.surfaceMuted : pressed ? colors.surfaceStrong : colors.surfaceGlass,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: disabled ? colors.borderStrong : pressed ? colors.borderStrong : colors.border,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[4],
          shadowColor: colors.overlayStrong,
          shadowOpacity: disabled ? 0 : 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
          elevation: disabled ? 0 : 2,
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
    </Animated.View>
  );
};
