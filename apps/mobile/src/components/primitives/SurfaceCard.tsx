import type { PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radii, shadows, spacing } from "../../theme";

export interface SurfaceCardProps {
  style?: StyleProp<ViewStyle>;
  tone?: "default" | "muted" | "accent";
}

const toneStyles: Record<NonNullable<SurfaceCardProps["tone"]>, ViewStyle> = {
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  accent: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.borderStrong,
  },
};

export const SurfaceCard = ({
  children,
  style,
  tone = "default",
}: PropsWithChildren<SurfaceCardProps>) => {
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderRadius: radii.lg + 4,
          padding: spacing[6],
          gap: spacing[4],
        },
        tone === "accent" ? shadows.medium : shadows.soft,
        toneStyles[tone],
        style,
      ]}
    >
      {children}
    </View>
  );
};
