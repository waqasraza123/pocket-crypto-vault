import { Link, type Href } from "expo-router";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { productConfig } from "@pocket-vault/config";

import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PageContainer } from "../primitives";
import type { HeaderLink } from "./DesktopHeader";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WalletEntryPlaceholder } from "./WalletEntryPlaceholder";

export interface MobileHeaderProps {
  links: HeaderLink[];
  ctaHref: Href;
  ctaLabel: string;
}

export const MobileHeader = ({ links, ctaHref, ctaLabel }: MobileHeaderProps) => {
  const { getDirectionalIcon, inlineDirection, messages } = useI18n();

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.backgroundElevated }}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.borderStrong, backgroundColor: colors.backgroundElevated }}>
        <PageContainer>
          <View style={{ gap: spacing[3], paddingBottom: spacing[3], paddingTop: spacing[2] }}>
            <View style={{ flexDirection: inlineDirection(), alignItems: "center" }}>
              <Link href={routes.landing} asChild>
                <Pressable accessibilityRole="link">
                  <View style={{ gap: spacing[1] }}>
                    <AppHeading size="sm" style={{ color: colors.textPrimary }}>
                      {productConfig.shortName}
                    </AppHeading>
                    <AppText numberOfLines={1} size="xs" tone="muted">
                      {messages.navigation.mobileTagline}
                    </AppText>
                  </View>
                </Pressable>
              </Link>
            </View>
            <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[2], alignItems: "center" }}>
              <LanguageSwitcher compact />
              <WalletEntryPlaceholder compact />
            </View>
            <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[2] }}>
              {links.map((link) => (
                <Link key={link.label} href={link.href} asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityState={{ selected: link.isActive }}
                    style={({ pressed }) => ({
                      flexDirection: inlineDirection(),
                      alignItems: "center",
                      gap: spacing[2],
                      borderRadius: radii.md,
                      borderWidth: 1,
                      borderColor: link.isActive || pressed ? colors.accentStrong : colors.borderStrong,
                      backgroundColor: link.isActive ? colors.accentSoft : pressed ? colors.surfaceStrong : colors.surface,
                      paddingHorizontal: spacing[3],
                      paddingVertical: spacing[2],
                    })}
                  >
                    <MaterialCommunityIcons
                      color={link.isActive ? colors.accentStrong : colors.textPrimary}
                      name={link.icon}
                      size={16}
                    />
                    <AppText
                      size="sm"
                      style={link.isActive ? { color: colors.accentStrong } : undefined}
                      weight="semibold"
                    >
                      {link.label}
                    </AppText>
                  </Pressable>
                </Link>
              ))}
              <Link href={ctaHref} asChild>
                <Pressable
                  accessibilityRole="link"
                  style={({ pressed }) => ({
                    flexDirection: inlineDirection(),
                    alignItems: "center",
                    gap: spacing[2],
                    borderRadius: radii.md,
                    backgroundColor: pressed ? colors.accentStrong : colors.accent,
                    paddingHorizontal: spacing[4],
                    paddingVertical: spacing[2],
                  })}
                >
                  <MaterialCommunityIcons color={colors.white} name={getDirectionalIcon("arrow-right")} size={16} />
                  <AppText numberOfLines={1} size="sm" style={{ color: colors.white }} weight="semibold">
                    {ctaLabel}
                  </AppText>
                </Pressable>
              </Link>
            </View>
          </View>
        </PageContainer>
      </View>
    </SafeAreaView>
  );
};
