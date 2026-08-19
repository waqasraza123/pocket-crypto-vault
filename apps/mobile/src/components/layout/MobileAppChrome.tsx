import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, usePathname, useRouter, type Href } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { productConfig } from "@pocket-vault/config";

import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText } from "../primitives";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WalletEntryPlaceholder } from "./WalletEntryPlaceholder";

interface MobileAppTab {
  label: string;
  href: Href;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  isActive: boolean;
}

export const MobileAppHeader = () => {
  const { inlineDirection, messages } = useI18n();

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.backgroundElevated }}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.borderStrong,
          backgroundColor: colors.backgroundElevated,
          paddingHorizontal: spacing[4],
          paddingBottom: spacing[2],
          paddingTop: spacing[1],
        }}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "space-between", gap: spacing[3] }}>
          <Link href={routes.appHome} asChild>
            <Pressable accessibilityRole="link" style={{ flex: 1 }}>
              <View style={{ gap: spacing[1] }}>
                    <AppHeading numberOfLines={1} size="sm" style={{ color: colors.textPrimary, fontSize: 17, lineHeight: 23 }}>
                  {productConfig.shortName}
                </AppHeading>
                <AppText numberOfLines={1} size="xs" tone="muted">
                  {messages.navigation.mobileTagline}
                </AppText>
              </View>
            </Pressable>
          </Link>
          <View style={{ flexDirection: inlineDirection(), alignItems: "center", gap: spacing[2] }}>
            <LanguageSwitcher compact />
            <WalletEntryPlaceholder compact />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export const MobileAppTabBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { inlineDirection, messages } = useI18n();
  const tabs: MobileAppTab[] = [
    {
      label: messages.navigation.appLinks.home,
      href: routes.appHome,
      icon: "shield-home-outline",
      isActive: pathname === routes.appHome || (pathname.startsWith("/vaults/") && pathname !== routes.createVault.toString()),
    },
    {
      label: messages.navigation.appLinks.activity,
      href: routes.activity,
      icon: "timeline-clock-outline",
      isActive: pathname === routes.activity,
    },
    {
      label: messages.navigation.appLinks.support,
      href: routes.support,
      icon: "lifebuoy",
      isActive: pathname === routes.support,
    },
  ];
  const createIsActive = pathname === routes.createVault;

  return (
    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: colors.backgroundElevated }}>
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.borderStrong,
          backgroundColor: colors.backgroundElevated,
          paddingHorizontal: spacing[3],
          paddingTop: spacing[1],
        }}
      >
        <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "space-between", gap: spacing[2] }}>
          {tabs.slice(0, 1).map((tab) => (
            <MobileAppTabItem key={tab.label} tab={tab} />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: createIsActive }}
            onPress={() => router.push(routes.createVault)}
            style={({ pressed }) => ({
              minWidth: 68,
              minHeight: 50,
              borderRadius: radii.lg,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed || createIsActive ? colors.accentStrong : colors.accent,
              borderWidth: 1,
              borderColor: colors.accentStrong,
              paddingHorizontal: spacing[2],
              paddingVertical: spacing[1],
            })}
          >
            <MaterialCommunityIcons color={colors.white} name="plus" size={24} />
            <AppText numberOfLines={1} size="xs" style={{ color: colors.white }} weight="semibold">
              {messages.navigation.appLinks.create}
            </AppText>
          </Pressable>
          {tabs.slice(1).map((tab) => (
            <MobileAppTabItem key={tab.label} tab={tab} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const MobileAppTabItem = ({ tab }: { tab: MobileAppTab }) => {
  return (
    <Link href={tab.href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityState={{ selected: tab.isActive }}
        style={({ pressed }) => ({
          flex: 1,
          minHeight: 50,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing[1],
          borderRadius: radii.md,
          backgroundColor: tab.isActive ? colors.accentSoft : pressed ? colors.surfaceStrong : colors.backgroundElevated,
          paddingHorizontal: spacing[2],
          paddingVertical: spacing[2],
        })}
      >
        <MaterialCommunityIcons color={tab.isActive ? colors.accentStrong : colors.textSecondary} name={tab.icon} size={21} />
        <AppText
          align="center"
          numberOfLines={1}
          size="xs"
          style={tab.isActive ? { color: colors.accentStrong } : undefined}
          tone={tab.isActive ? "accent" : "muted"}
          weight="semibold"
        >
          {tab.label}
        </AppText>
      </Pressable>
    </Link>
  );
};
