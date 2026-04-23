import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../../theme";
import { useI18n, type AppLocale } from "../../lib/i18n";
import { AppText } from "../primitives";

const locales: AppLocale[] = ["en", "ar"];

export const LanguageSwitcher = () => {
  const { inlineDirection, isRTL, locale, messages, setLocale } = useI18n();

  return (
    <View
      style={{
        flexDirection: inlineDirection(),
        alignItems: "center",
        gap: spacing[2],
        borderRadius: radii.pill,
        backgroundColor: colors.surfaceMuted,
        padding: 4,
      }}
    >
      <View
        style={{
          flexDirection: inlineDirection(),
          alignItems: "center",
          gap: spacing[2],
          paddingHorizontal: spacing[2],
        }}
      >
        <MaterialCommunityIcons color={colors.accentStrong} name="translate" size={18} />
        <AppText size="sm" tone="secondary" weight="medium">
          {messages.localeSwitchLabel}
        </AppText>
      </View>

      <View
        style={{
          flexDirection: inlineDirection(),
          alignItems: "center",
          gap: spacing[1],
        }}
      >
        {locales.map((option) => {
          const isActive = option === locale;
          const label = option === "en" ? "English" : "العربية";

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => setLocale(option)}
              style={({ pressed }) => ({
                borderRadius: radii.pill,
                backgroundColor: isActive ? colors.accent : pressed ? colors.surfaceStrong : colors.surface,
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[2],
              })}
            >
              <AppText size="sm" style={{ color: isActive ? colors.white : colors.textPrimary }} weight="semibold">
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
