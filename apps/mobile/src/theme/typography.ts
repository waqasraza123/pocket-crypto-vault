export const typography = {
  fontFamily: {
    body: "System",
    heading: "System",
    mono: "Courier",
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    "2xl": 28,
    "3xl": 36,
    "4xl": 48,
  },
  lineHeight: {
    xs: 18,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    "2xl": 36,
    "3xl": 44,
    "4xl": 56,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  tracking: {
    tight: -0.6,
    normal: 0,
    wide: 0.4,
  },
} as const;
