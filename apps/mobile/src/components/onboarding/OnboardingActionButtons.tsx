import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useI18n } from "../../lib/i18n";
import { createShadowStyle, onboardingPalette, radii, spacing } from "../../theme";
import { AppText } from "../primitives";

export interface OnboardingActionButtonsProps {
  onCreateAccount: () => void;
  onSignIn: () => void;
}

export const OnboardingActionButtons = ({ onCreateAccount, onSignIn }: OnboardingActionButtonsProps) => {
  const breakpoint = useBreakpoint();
  const { getDirectionalIcon, inlineDirection, messages } = useI18n();

  return (
    <View style={{ flexDirection: breakpoint.isCompact ? "column" : inlineDirection(), gap: spacing[3] }}>
      <Pressable
        accessibilityRole="button"
        onPress={onCreateAccount}
        style={({ pressed }) => ({
          flex: breakpoint.isCompact ? undefined : 1,
          minHeight: 56,
          borderRadius: radii.lg,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pressed ? onboardingPalette.accentStrong : onboardingPalette.ink,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[3],
          ...createShadowStyle({
            color: onboardingPalette.ink,
            opacity: pressed ? 0.08 : 0.14,
            radius: pressed ? 12 : 22,
            offsetY: pressed ? 5 : 10,
            elevation: 5,
          }),
        })}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
          <MaterialCommunityIcons color={onboardingPalette.white} name="account-plus-outline" size={20} />
          <AppText style={{ color: onboardingPalette.white }} weight="bold">
            {messages.onboarding.actions.createAccount}
          </AppText>
          <MaterialCommunityIcons color={onboardingPalette.white} name={getDirectionalIcon("arrow-right")} size={18} />
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onSignIn}
        style={({ pressed }) => ({
          flex: breakpoint.isCompact ? undefined : 1,
          minHeight: 56,
          borderRadius: radii.lg,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: pressed ? onboardingPalette.ink : onboardingPalette.borderStrong,
          backgroundColor: pressed ? onboardingPalette.surfaceMuted : onboardingPalette.surface,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[3],
        })}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
          <MaterialCommunityIcons color={onboardingPalette.ink} name="login-variant" size={20} />
          <AppText style={{ color: onboardingPalette.ink }} weight="bold">
            {messages.onboarding.actions.signIn}
          </AppText>
        </View>
      </Pressable>
    </View>
  );
};
