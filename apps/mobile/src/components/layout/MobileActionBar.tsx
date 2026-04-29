import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { colors, spacing } from "../../theme";

export const MobileActionBar = ({ children }: PropsWithChildren) => {
  const breakpoint = useBreakpoint();

  if (!breakpoint.isCompact) {
    return null;
  }

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.borderStrong,
        backgroundColor: colors.backgroundElevated,
        paddingHorizontal: spacing[5],
        paddingBottom: spacing[3],
        paddingTop: spacing[3],
        gap: spacing[2],
      }}
    >
      {children}
    </View>
  );
};
