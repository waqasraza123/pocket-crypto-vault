import type { ComponentProps } from "react";
import { Animated, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useInteractiveMotion } from "../../lib/motion/feedback-motion";
import { colors, radii, spacing } from "../../theme";

export interface IconButtonProps {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress?: () => void;
  accessibilityLabel: string;
}

export const IconButton = ({ icon, onPress, accessibilityLabel }: IconButtonProps) => {
  const motion = useInteractiveMotion("subtle");

  return (
    <Animated.View style={motion.animatedStyle}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onBlur={motion.onBlur}
        onFocus={motion.onFocus}
        onHoverIn={motion.onHoverIn}
        onHoverOut={motion.onHoverOut}
        onPress={onPress}
        onPressIn={motion.onPressIn}
        onPressOut={motion.onPressOut}
        style={({ pressed }) => ({
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: radii.pill,
          backgroundColor: pressed ? colors.surfaceStrong : colors.surfaceGlass,
          borderWidth: 1,
          borderColor: pressed ? colors.borderStrong : colors.border,
          shadowColor: colors.overlayStrong,
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
        })}
      >
        <MaterialCommunityIcons color={colors.textPrimary} name={icon} size={20} />
      </Pressable>
    </Animated.View>
  );
};
