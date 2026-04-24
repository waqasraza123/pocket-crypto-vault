import { Link, type Href, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { productConfig } from "@goal-vault/config";

import { routes } from "../../lib/routing";
import { useI18n } from "../../lib/i18n";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PageContainer, PrimaryButton } from "../primitives";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WalletEntryPlaceholder } from "./WalletEntryPlaceholder";

export interface HeaderLink {
  label: string;
  href: Href;
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
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.backgroundElevated }}>
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
            <Pressable>
              <View style={{ gap: spacing[1] }}>
                <AppHeading size="sm">{productConfig.shortName}</AppHeading>
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
                  style={({ pressed }) => ({
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[2],
                    borderRadius: radii.pill,
                    backgroundColor: pressed ? colors.surfaceStrong : colors.backgroundElevated,
                  })}
                >
                  <AppText tone="secondary" weight="medium">
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
