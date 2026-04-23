import type { PropsWithChildren } from "react";
import { Text, type StyleProp, type TextProps, type TextStyle } from "react-native";

import { colors, typography } from "../../theme";

type TextTone = "primary" | "secondary" | "muted" | "accent" | "positive" | "danger";
type TextSize = "xs" | "sm" | "md" | "lg" | "xl";

const toneStyles: Record<TextTone, TextStyle> = {
  primary: { color: colors.textPrimary },
  secondary: { color: colors.textSecondary },
  muted: { color: colors.textMuted },
  accent: { color: colors.accentStrong },
  positive: { color: colors.positive },
  danger: { color: colors.danger },
};

const sizeStyles: Record<TextSize, TextStyle> = {
  xs: { fontSize: typography.size.xs, lineHeight: typography.lineHeight.xs },
  sm: { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm },
  md: { fontSize: typography.size.md, lineHeight: typography.lineHeight.md },
  lg: { fontSize: typography.size.lg, lineHeight: typography.lineHeight.lg },
  xl: { fontSize: typography.size.xl, lineHeight: typography.lineHeight.xl },
};

export interface AppTextProps extends TextProps {
  tone?: TextTone;
  size?: TextSize;
  weight?: keyof typeof typography.weight;
  align?: "auto" | "left" | "center" | "right";
  style?: StyleProp<TextStyle>;
}

export const AppText = ({
  children,
  tone = "primary",
  size = "md",
  weight = "regular",
  align = "auto",
  style,
  ...props
}: PropsWithChildren<AppTextProps>) => {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: typography.fontFamily.body,
          fontWeight: typography.weight[weight] as TextStyle["fontWeight"],
          textAlign: align,
        },
        toneStyles[tone],
        sizeStyles[size],
        style,
      ]}
    >
      {children}
    </Text>
  );
};
