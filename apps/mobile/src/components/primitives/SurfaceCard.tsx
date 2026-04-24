import type { PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import type { ThemeSurfaceLevel } from "../../theme";
import { colors, radii, shadows, spacing } from "../../theme";

export interface SurfaceCardProps {
  style?: StyleProp<ViewStyle>;
  tone?: "default" | "muted" | "accent";
  level?: ThemeSurfaceLevel;
}

const toneStyles: Record<NonNullable<SurfaceCardProps["tone"]>, ViewStyle> = {
  default: {
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.border,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  accent: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderStrong,
  },
};

const levelStyles: Record<ThemeSurfaceLevel, ViewStyle> = {
  canvas: {},
  muted: shadows.soft,
  elevated: shadows.medium,
  floating: shadows.floating,
};

export const SurfaceCard = ({
  children,
  style,
  tone = "default",
  level = tone === "accent" ? "floating" : "elevated",
}: PropsWithChildren<SurfaceCardProps>) => {
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderRadius: radii.xl,
          padding: spacing[6],
          gap: spacing[4],
          overflow: "hidden",
          position: "relative",
        },
        levelStyles[level],
        toneStyles[tone],
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -40,
          right: -24,
          width: 132,
          height: 132,
          borderRadius: 66,
          backgroundColor: tone === "accent" ? colors.heroGlowPrimary : colors.canvasGlow,
          opacity: tone === "muted" ? 0.64 : 0.84,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: colors.white,
          opacity: 0.74,
        }}
      />
      <View style={{ gap: spacing[4] }}>{children}</View>
    </View>
  );
};
