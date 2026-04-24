import { breakpoints } from "./breakpoints";
import { colors } from "./colors";
import { gradients } from "./gradients";
import { motion } from "./motion";
import { radii } from "./radii";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const tokens = {
  breakpoints,
  colors,
  gradients,
  motion,
  radii,
  shadows,
  spacing,
  typography,
  maxWidth: {
    page: 1240,
    reading: 780,
    dashboard: 1360,
  },
} as const;
