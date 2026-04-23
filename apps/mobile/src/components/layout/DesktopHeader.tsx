import { Link, type Href, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { productConfig } from "@goal-vault/config";

import { routes } from "../../lib/routing";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PageContainer, PrimaryButton } from "../primitives";
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

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.backgroundElevated }}>
      <PageContainer width="dashboard">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing[6],
            minHeight: 80,
          }}
        >
          <Link href={routes.landing} asChild>
            <Pressable>
              <View style={{ gap: spacing[1] }}>
                <AppHeading size="sm">{productConfig.shortName}</AppHeading>
                <AppText size="sm" tone="muted">
                  Premium goal vaults on Base
                </AppText>
              </View>
            </Pressable>
          </Link>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
            {links.map((link) => (
              <Link key={link.label} href={link.href} asChild>
                <Pressable
                  style={({ pressed }) => ({
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[2],
                    borderRadius: radii.pill,
                    backgroundColor: pressed ? colors.surfaceStrong : "transparent",
                  })}
                >
                  <AppText tone="secondary" weight="medium">
                    {link.label}
                  </AppText>
                </Pressable>
              </Link>
            ))}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
            <WalletEntryPlaceholder />
            <PrimaryButton label={ctaLabel} onPress={() => router.push(ctaHref)} />
          </View>
        </View>
      </PageContainer>
    </View>
  );
};
