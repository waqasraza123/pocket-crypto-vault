import { useMemo } from "react";

import { useBreakpoint } from "./useBreakpoint";

export const useAdaptiveLayout = () => {
  const breakpoint = useBreakpoint();

  return useMemo(() => {
    return {
      ...breakpoint,
      contentPadding: breakpoint.isExpanded ? 40 : breakpoint.isMedium ? 32 : 20,
      sectionGap: breakpoint.isExpanded ? 32 : breakpoint.isMedium ? 28 : 16,
      useSplitLayout: !breakpoint.isCompact,
      vaultGridColumns: breakpoint.isExpanded ? 3 : breakpoint.isMedium ? 2 : 1,
      heroAlignment: breakpoint.isCompact ? "stacked" : "split",
    };
  }, [breakpoint]);
};
