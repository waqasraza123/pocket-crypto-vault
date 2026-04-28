import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, type Href, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { productConfig } from "@pocket-vault/config";

import { routes } from "../../lib/routing";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PageContainer, PrimaryButton } from "../primitives";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WalletEntryPlaceholder } from "./WalletEntryPlaceholder";

export interface HeaderLink {
  label: string;
  href: Href;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  isActive?: boolean;
}

export interface DesktopHeaderProps {
  links: HeaderLink[];
  ctaLabel: string;
  ctaHref: Href;
}

export const DesktopHeader = ({ links, ctaLabel, ctaHref }: DesktopHeaderProps) => {
  const router = useRouter();
  const { inlineDirection, justifyEnd, justifyStart, messages } = useI18n();

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.borderStrong, backgroundColor: colors.backgroundElevated }}>
      <PageContainer width="dashboard">
        <View
          style={{
            flexDirection: inlineDirection(),
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing[6],
            minHeight: 84,
          }}
        >
          <Link href={routes.landing} asChild>
            <Pressable accessibilityRole="link">
              <View style={{ gap: spacing[1] }}>
                <AppHeading size="sm" style={{ color: colors.accentStrong }}>{productConfig.shortName}</AppHeading>
                <AppText size="sm" tone="muted">
                  {messages.navigation.desktopTagline}
                </AppText>
              </View>
            </Pressable>
          </Link>
          <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3], justifyContent: justifyStart }}>
            {links.map((link) => (
              <Link key={link.label} href={link.href} asChild>
                <Pressable
                  accessibilityRole="link"
                  accessibilityState={{ selected: link.isActive }}
                  style={({ pressed }) => ({
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[2],
                    borderRadius: radii.pill,
                    borderWidth: 1,
                    borderColor: link.isActive || pressed ? colors.accentStrong : colors.border,
                    backgroundColor: link.isActive ? colors.accentSoft : pressed ? colors.surfaceStrong : colors.surfaceGlass,
                    flexDirection: inlineDirection(),
                    alignItems: "center",
                    gap: spacing[2],
                  })}
                >
                  <MaterialCommunityIcons
                    color={link.isActive ? colors.accentStrong : colors.textSecondary}
                    name={link.icon}
                    size={17}
                  />
                  <AppText style={link.isActive ? { color: colors.accentStrong } : undefined} tone="secondary" weight="medium">
                    {link.label}
                  </AppText>
                </Pressable>
              </Link>
            ))}
          </View>
          <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[3], justifyContent: justifyEnd }}>
            <LanguageSwitcher />
            <WalletEntryPlaceholder />
            <PrimaryButton icon="arrow-right" label={ctaLabel} onPress={() => router.push(ctaHref)} />
          </View>
        </View>
      </PageContainer>
    </View>
  );
};
