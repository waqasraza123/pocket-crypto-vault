import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { productConfig } from "@pocket-vault/config";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useI18n } from "../../lib/i18n";
import { routes } from "../../lib/routing";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, PageContainer } from "../primitives";

export const AppFooter = () => {
  const { inlineDirection, messages } = useI18n();
  const breakpoint = useBreakpoint();
  const router = useRouter();
  const links = [
    {
      label: messages.navigation.marketingLinks.howItWorks,
      href: routes.howItWorks,
    },
    {
      label: messages.navigation.marketingLinks.security,
      href: routes.security,
    },
    {
      label: messages.common.buttons.enterMyVaults,
      href: routes.appHome,
    },
  ];

  return (
    <View className="border-t border-slate-200 bg-white">
      <PageContainer style={{ paddingVertical: breakpoint.isCompact ? spacing[4] : spacing[5], gap: breakpoint.isCompact ? spacing[3] : spacing[4] }}>
        <View style={{ gap: spacing[2] }}>
          <AppHeading size="sm" style={{ color: colors.textPrimary }}>{productConfig.name}</AppHeading>
          <AppText size="sm" tone="muted" numberOfLines={breakpoint.isCompact ? 3 : undefined}>
            {messages.footer.description.replace("Pocket Vault", productConfig.name)}
          </AppText>
        </View>
        <View style={{ flexDirection: inlineDirection(), flexWrap: "wrap", gap: spacing[2] }}>
          {links.map((link) => (
            <Pressable
              key={link.label}
              onPress={() => router.push(link.href)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 active:bg-slate-100"
              style={({ pressed }) => ({
                borderRadius: radii.md,
                backgroundColor: pressed ? colors.surfaceStrong : colors.surfaceGlass,
              })}
            >
              <AppText size="sm" style={{ color: colors.accentStrong }} weight="semibold">
                {link.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </PageContainer>
    </View>
  );
};
