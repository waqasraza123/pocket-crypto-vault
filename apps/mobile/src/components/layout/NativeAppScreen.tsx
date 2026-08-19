import type { PropsWithChildren, ReactNode } from "react";
import { Platform, ScrollView, View, useWindowDimensions, type ScrollViewProps, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useI18n } from "../../lib/i18n";
import { colors, createShadowStyle, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView } from "../primitives";

export interface NativeAppScreenShellProps {
  top?: ReactNode;
  bottom?: ReactNode;
  scroll?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
  background?: "app" | "story";
}

export const NativeAppScreenShell = ({
  children,
  top,
  bottom,
  scroll = false,
  keyboardShouldPersistTaps = "handled",
  background = "app",
}: PropsWithChildren<NativeAppScreenShellProps>) => {
  const breakpoint = useBreakpoint();
  const { height } = useWindowDimensions();
  const frameWidth = Platform.OS === "web" && breakpoint.isCompact ? ("min(100vw, 430px)" as ViewStyle["width"]) : "100%";
  const isShortViewport = height > 0 && height < 760;
  const shellBackground = background === "story" ? "#07133d" : colors.background;
  const content = scroll ? (
    <NativeScrollRegion keyboardShouldPersistTaps={keyboardShouldPersistTaps}>{children}</NativeScrollRegion>
  ) : (
    <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
  );

  if (!breakpoint.isCompact) {
    return <>{children}</>;
  }

  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: shellBackground }}>
      <View style={{ flex: 1, width: frameWidth, maxWidth: 430, overflow: "hidden", backgroundColor: shellBackground }}>
        {background === "story" ? (
          <>
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: -90,
                top: -120,
                width: 250,
                height: 210,
                borderRadius: 76,
                backgroundColor: "rgba(37, 99, 235, 0.78)",
                borderWidth: 1,
                borderColor: "rgba(191, 219, 254, 0.5)",
                transform: [{ rotate: "-8deg" }],
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                right: -92,
                top: -92,
                width: 170,
                height: 170,
                borderRadius: 58,
                backgroundColor: "rgba(96, 165, 250, 0.78)",
                borderWidth: 1,
                borderColor: "rgba(191, 219, 254, 0.5)",
              }}
            />
          </>
        ) : null}
        <View style={{ flex: 1, minHeight: 0, paddingHorizontal: isShortViewport ? spacing[3] : spacing[4], paddingTop: isShortViewport ? spacing[2] : spacing[3], gap: isShortViewport ? spacing[2] : spacing[3] }}>
          {top}
          {content}
          {bottom}
        </View>
      </View>
    </View>
  );
};

export interface NativeScreenHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
}

export const NativeScreenHeader = ({ eyebrow, title, description, action, tone = "light" }: NativeScreenHeaderProps) => {
  const { inlineDirection } = useI18n();
  const isDark = tone === "dark";

  return (
    <MotionView intensity="structural" style={{ gap: spacing[2] }}>
      <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", justifyContent: "space-between", gap: spacing[3] }}>
        <View style={{ flex: 1, gap: spacing[1] }}>
          {eyebrow ? (
            <AppText size="xs" style={isDark ? { color: "#bfdbfe", letterSpacing: 0.9 } : { letterSpacing: 0.6 }} tone={isDark ? "primary" : "accent"} weight="bold">
              {eyebrow}
            </AppText>
          ) : null}
          <AppHeading size="md" style={isDark ? { color: colors.white } : undefined} numberOfLines={2}>
            {title}
          </AppHeading>
          {description ? (
            <AppText size="sm" style={isDark ? { color: "#dbeafe" } : undefined} tone={isDark ? "primary" : "secondary"} numberOfLines={3}>
              {description}
            </AppText>
          ) : null}
        </View>
        {action}
      </View>
    </MotionView>
  );
};

export interface NativeHeroCardProps {
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  tone?: "accent" | "positive" | "warning" | "dark";
}

export const NativeHeroCard = ({ icon = "shield-lock-outline", eyebrow, title, description, children, tone = "accent" }: NativeHeroCardProps) => {
  const { inlineDirection } = useI18n();
  const isDark = tone === "dark";
  const iconColor = tone === "positive" ? colors.positive : tone === "warning" ? colors.warning : isDark ? colors.white : colors.accentStrong;
  const iconBackgroundColor = tone === "positive" ? colors.positiveSoft : tone === "warning" ? colors.warningSoft : isDark ? "rgba(255, 255, 255, 0.14)" : colors.accentSoft;

  return (
    <MotionView
      intensity="emphasis"
      style={{
        borderRadius: 28,
        borderWidth: 1,
        borderColor: isDark ? "rgba(191, 219, 254, 0.38)" : colors.borderStrong,
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.12)" : colors.backgroundElevated,
        padding: spacing[4],
        gap: spacing[3],
        ...createShadowStyle({
          color: isDark ? colors.textPrimary : colors.overlayStrong,
          opacity: isDark ? 0.18 : 0.1,
          radius: 24,
          offsetY: 12,
          elevation: 5,
        }),
      }}
    >
      <View style={{ flexDirection: inlineDirection(), alignItems: "flex-start", gap: spacing[3] }}>
        <View style={{ width: 42, height: 42, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: iconBackgroundColor }}>
          <MaterialCommunityIcons color={iconColor} name={icon} size={23} />
        </View>
        <View style={{ flex: 1, gap: spacing[1] }}>
          {eyebrow ? (
            <AppText size="xs" style={isDark ? { color: "#bfdbfe" } : undefined} tone={isDark ? "primary" : "accent"} weight="bold">
              {eyebrow}
            </AppText>
          ) : null}
          <AppHeading size="sm" style={isDark ? { color: colors.white } : undefined}>
            {title}
          </AppHeading>
          {description ? (
            <AppText size="sm" style={isDark ? { color: "#dbeafe" } : undefined} tone={isDark ? "primary" : "secondary"}>
              {description}
            </AppText>
          ) : null}
        </View>
      </View>
      {children}
    </MotionView>
  );
};

export const NativeActionDock = ({ children }: PropsWithChildren) => (
  <View
    style={{
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.backgroundElevated,
      padding: spacing[3],
      gap: spacing[2],
      ...createShadowStyle({
        color: colors.overlayStrong,
        opacity: 0.16,
        radius: 24,
        offsetY: 12,
        elevation: 8,
      }),
    }}
  >
    {children}
  </View>
);

export const NativeScrollRegion = ({ children, keyboardShouldPersistTaps = "handled" }: PropsWithChildren<{ keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"] }>) => (
  <ScrollView
    contentContainerStyle={{ gap: spacing[3], paddingBottom: spacing[2] }}
    keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    showsVerticalScrollIndicator={false}
    style={{ flex: 1, minHeight: 0 }}
  >
    {children}
  </ScrollView>
);

export interface NativeMetricItem {
  label: string;
  value: string;
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  tone?: "accent" | "positive" | "warning" | "muted";
}

export const NativeMetricRow = ({ items }: { items: NativeMetricItem[] }) => {
  const { inlineDirection } = useI18n();

  return (
    <View style={{ flexDirection: inlineDirection(), gap: spacing[2] }}>
      {items.map((item) => {
        const iconColor = item.tone === "positive" ? colors.positive : item.tone === "warning" ? colors.warning : item.tone === "muted" ? colors.textMuted : colors.accentStrong;
        const backgroundColor = item.tone === "positive" ? colors.positiveSoft : item.tone === "warning" ? colors.warningSoft : item.tone === "muted" ? colors.surfaceMuted : colors.accentSoft;

        return (
          <View
            key={item.label}
            style={{
              flex: 1,
              minWidth: 0,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              backgroundColor: colors.backgroundElevated,
              padding: spacing[3],
              gap: spacing[2],
            }}
          >
            <View style={{ flexDirection: inlineDirection(), alignItems: "center", justifyContent: "space-between", gap: spacing[2] }}>
              <AppText numberOfLines={1} size="xs" tone="muted" weight="semibold">
                {item.label}
              </AppText>
              {item.icon ? (
                <View style={{ width: 24, height: 24, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor }}>
                  <MaterialCommunityIcons color={iconColor} name={item.icon} size={14} />
                </View>
              ) : null}
            </View>
            <AppText numberOfLines={1} weight="bold">
              {item.value}
            </AppText>
          </View>
        );
      })}
    </View>
  );
};

export interface NativeStepScreenProps {
  header: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
}

export const NativeStepScreen = ({ header, body, footer, keyboardShouldPersistTaps }: NativeStepScreenProps) => (
  <NativeAppScreenShell
    top={header}
    bottom={footer ? <NativeActionDock>{footer}</NativeActionDock> : undefined}
    scroll
    keyboardShouldPersistTaps={keyboardShouldPersistTaps}
  >
    {body}
  </NativeAppScreenShell>
);
