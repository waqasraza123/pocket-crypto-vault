import { Platform } from "react-native";

export const typography = {
  fontFamily: {
    body: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "System",
      web: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, sans-serif",
    }),
    heading: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "System",
      web: "-apple-system, BlinkMacSystemFont, SF Pro Display, Segoe UI, sans-serif",
    }),
    mono: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "Courier",
      web: "IBM Plex Mono, Menlo, monospace",
    }),
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    "2xl": 30,
    "3xl": 40,
    "4xl": 58,
    "5xl": 72,
  },
  lineHeight: {
    xs: 18,
    sm: 20,
    md: 24,
    lg: 30,
    xl: 34,
    "2xl": 40,
    "3xl": 48,
    "4xl": 68,
    "5xl": 82,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  tracking: {
    tight: -1.1,
    normal: 0,
    wide: 0.6,
  },
} as const;
