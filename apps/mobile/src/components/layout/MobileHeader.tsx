import { Link, type Href } from "expo-router";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { productConfig } from "@goal-vault/config";

import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PageContainer } from "../primitives";
import type { HeaderLink } from "./DesktopHeader";
import { WalletEntryPlaceholder } from "./WalletEntryPlaceholder";

export interface MobileHeaderProps {
  links: HeaderLink[];
  ctaHref: Href;
  ctaLabel: string;
}

export const MobileHeader = ({ links, ctaHref, ctaLabel }: MobileHeaderProps) => {
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.backgroundElevated }}>
      <PageContainer>
        <View style={{ gap: spacing[3], paddingVertical: spacing[4] }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" asChild>
              <Pressable>
                <View style={{ gap: spacing[1] }}>
                  <AppHeading size="sm">{productConfig.shortName}</AppHeading>
                  <AppText size="sm" tone="muted">
                    Protect one goal at a time
                  </AppText>
                </View>
              </Pressable>
            </Link>
            <WalletEntryPlaceholder />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>
            {links.map((link) => (
              <Link key={link.label} href={link.href} asChild>
                <Pressable
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing[2],
                    borderRadius: radii.pill,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: pressed ? colors.surfaceStrong : colors.surface,
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[2],
                  })}
                >
                  <MaterialCommunityIcons color={colors.textPrimary} name="arrow-top-right" size={16} />
                  <AppText size="sm" weight="semibold">
                    {link.label}
                  </AppText>
                </Pressable>
              </Link>
            ))}
            <Link href={ctaHref} asChild>
              <Pressable
                style={({ pressed }) => ({
                  borderRadius: radii.pill,
                  backgroundColor: pressed ? colors.accentStrong : colors.accent,
                  paddingHorizontal: spacing[4],
                  paddingVertical: spacing[2],
                })}
              >
                <AppText size="sm" style={{ color: colors.white }} weight="semibold">
                  {ctaLabel}
                </AppText>
              </Pressable>
            </Link>
          </View>
        </View>
      </PageContainer>
    </View>
  );
};
