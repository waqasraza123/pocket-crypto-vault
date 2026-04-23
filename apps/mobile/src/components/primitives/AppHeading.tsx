import type { PropsWithChildren } from "react";
import type { StyleProp, TextStyle } from "react-native";

import { typography } from "../../theme";
import { AppText, type AppTextProps } from "./AppText";

type HeadingSize = "sm" | "md" | "lg" | "xl" | "display";

const headingSizeStyles: Record<HeadingSize, TextStyle> = {
  sm: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  md: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
  },
  lg: {
    fontSize: typography.size["2xl"],
    lineHeight: typography.lineHeight["2xl"],
  },
  xl: {
    fontSize: typography.size["3xl"],
    lineHeight: typography.lineHeight["3xl"],
    letterSpacing: typography.tracking.tight,
  },
  display: {
    fontSize: typography.size["4xl"],
    lineHeight: typography.lineHeight["4xl"],
    letterSpacing: typography.tracking.tight,
  },
};

export interface AppHeadingProps extends Omit<AppTextProps, "size"> {
  size?: HeadingSize;
  style?: StyleProp<TextStyle>;
}

export const AppHeading = ({
  children,
  size = "lg",
  weight = "semibold",
  style,
  ...props
}: PropsWithChildren<AppHeadingProps>) => {
  return (
    <AppText
      {...props}
      weight={weight}
      style={[
        {
          fontFamily: typography.fontFamily.heading,
        },
        headingSizeStyles[size],
        style,
      ]}
    >
      {children}
    </AppText>
  );
};
