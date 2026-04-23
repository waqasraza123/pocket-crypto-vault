export const breakpoints = {
  compact: 0,
  medium: 768,
  expanded: 1200,
} as const;

export type BreakpointName = "compact" | "medium" | "expanded";
