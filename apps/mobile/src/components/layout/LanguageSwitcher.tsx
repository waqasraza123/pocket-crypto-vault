import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, onboardingPalette, radii, spacing } from "../../theme";
import { useI18n, type AppLocale } from "../../lib/i18n";
import { marketingLanguageOptions } from "../../lib/public/marketing-experience";
import { AppText } from "../primitives";

export interface LanguageSwitcherProps {
  compact?: boolean;
  appearance?: "default" | "monochrome";
}

export const LanguageSwitcher = ({ compact = false, appearance = "default" }: LanguageSwitcherProps) => {
  const { inlineDirection, locale, messages, setLocale } = useI18n();
  const isMonochrome = appearance === "monochrome";

  return (
    <View
      style={{
        flexDirection: inlineDirection(),
        alignItems: "center",
        gap: compact ? spacing[1] : spacing[2],
        borderRadius: compact ? radii.md : radii.pill,
        borderWidth: 1,
        borderColor: isMonochrome ? onboardingPalette.border : compact ? colors.borderStrong : colors.border,
        backgroundColor: isMonochrome ? onboardingPalette.surface : colors.surfaceMuted,
        padding: 4,
      }}
    >
      <View
        style={{
          flexDirection: inlineDirection(),
          alignItems: "center",
          gap: compact ? spacing[1] : spacing[2],
          paddingHorizontal: spacing[2],
        }}
      >
        <MaterialCommunityIcons color={isMonochrome ? onboardingPalette.text : colors.accentStrong} name="translate" size={18} />
        {isMonochrome && compact ? null : (
          <AppText numberOfLines={1} size={compact ? "xs" : "sm"} tone="secondary" weight="medium">
            {messages.localeSwitchLabel}
          </AppText>
        )}
      </View>

      <View
        style={{
          flexDirection: inlineDirection(),
          alignItems: "center",
          gap: spacing[1],
        }}
      >
        {marketingLanguageOptions.map((option) => {
          const isActive = option.locale === locale;

          return (
            <Pressable
              key={option.locale}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setLocale(option.locale as AppLocale)}
              style={({ pressed }) => ({
                borderRadius: compact ? radii.sm : radii.pill,
                backgroundColor: isActive
                  ? isMonochrome
                    ? onboardingPalette.ink
                    : colors.accent
                  : pressed
                    ? isMonochrome
                      ? onboardingPalette.surfaceStrong
                      : colors.surfaceStrong
                    : compact
                      ? "transparent"
                      : colors.surface,
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[2],
              })}
            >
              <AppText size={compact ? "xs" : "sm"} style={{ color: isActive ? colors.white : colors.textPrimary }} weight="semibold">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
