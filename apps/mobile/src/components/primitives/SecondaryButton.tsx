import type { ComponentProps } from "react";
import { Animated, Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useInteractiveMotion } from "../../lib/motion/feedback-motion";
import { colors, createShadowStyle, radii, spacing } from "../../theme";
import { useI18n } from "../../lib/i18n";
import { AppText } from "./AppText";

export interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  disabled?: boolean;
  fullWidth?: boolean;
}

export const SecondaryButton = ({ label, onPress, icon, disabled, fullWidth = false }: SecondaryButtonProps) => {
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
          backgroundColor: disabled ? colors.surfaceMuted : pressed ? colors.surfaceStrong : colors.surfaceGlass,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: disabled ? colors.borderStrong : pressed ? colors.accentStrong : colors.borderStrong,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[4],
          overflow: "hidden",
          ...createShadowStyle({
            color: colors.overlayStrong,
            opacity: disabled ? 0 : pressed ? 0.08 : 0.12,
            radius: pressed ? 14 : 20,
            offsetY: pressed ? 7 : 11,
            elevation: disabled ? 0 : 3,
          }),
          elevation: disabled ? 0 : 3,
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
            opacity: disabled ? 0 : 0.72,
          }}
        />
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "center", gap: spacing[2] }}>
          {icon ? (
            <MaterialCommunityIcons
              color={disabled ? colors.textMuted : colors.accentStrong}
              name={getDirectionalIcon(icon)}
              size={18}
            />
          ) : null}
          <AppText style={disabled ? { color: colors.textMuted } : { color: colors.accentStrong }} weight="semibold">
            {label}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
};
