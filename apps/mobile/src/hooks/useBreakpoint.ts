import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import type { BreakpointName } from "../theme";
import { breakpoints } from "../theme";

export const useBreakpoint = (): {
  breakpoint: BreakpointName;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  width: number;
} => {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    if (width >= breakpoints.expanded) {
      return {
        breakpoint: "expanded" as const,
        isCompact: false,
        isMedium: false,
        isExpanded: true,
        width,
      };
    }

    if (width >= breakpoints.medium) {
      return {
        breakpoint: "medium" as const,
        isCompact: false,
        isMedium: true,
        isExpanded: false,
        width,
      };
    }

    return {
      breakpoint: "compact" as const,
      isCompact: true,
      isMedium: false,
      isExpanded: false,
      width,
    };
  }, [width]);
};
