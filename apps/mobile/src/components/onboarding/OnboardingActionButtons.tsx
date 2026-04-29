import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useI18n } from "../../lib/i18n";
import { colors, createShadowStyle, radii, spacing } from "../../theme";
import { AppText } from "../primitives";

export interface OnboardingActionButtonsProps {
  onCreateAccount: () => void;
  onSignIn: () => void;
}

export const OnboardingActionButtons = ({ onCreateAccount, onSignIn }: OnboardingActionButtonsProps) => {
  const { getDirectionalIcon, inlineDirection, messages } = useI18n();

  return (
    <View style={{ gap: spacing[3] }}>
      <Pressable
        accessibilityRole="button"
        onPress={onCreateAccount}
        style={({ pressed }) => ({
          minHeight: 58,
          borderRadius: radii.lg,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pressed ? "#dbeafe" : colors.white,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[4],
          ...createShadowStyle({
            color: colors.textPrimary,
            opacity: pressed ? 0.12 : 0.22,
            radius: pressed ? 18 : 26,
            offsetY: pressed ? 8 : 14,
            elevation: 8,
          }),
        })}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
          <MaterialCommunityIcons color={colors.accentStrong} name="account-plus-outline" size={20} />
          <AppText style={{ color: colors.accentStrong }} weight="bold">
            {messages.onboarding.actions.createAccount}
          </AppText>
          <MaterialCommunityIcons color={colors.accentStrong} name={getDirectionalIcon("arrow-right")} size={18} />
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onSignIn}
        style={({ pressed }) => ({
          minHeight: 54,
          borderRadius: radii.lg,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.36)",
          backgroundColor: pressed ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.12)",
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[4],
        })}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
          <MaterialCommunityIcons color={colors.white} name="login-variant" size={20} />
          <AppText style={{ color: colors.white }} weight="bold">
            {messages.onboarding.actions.signIn}
          </AppText>
        </View>
      </Pressable>
    </View>
  );
};
