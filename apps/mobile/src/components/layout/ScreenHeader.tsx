import type { ReactNode } from "react";
import { View } from "react-native";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { colors, radii, spacing } from "../../theme";
import { AppHeading, AppText, MotionView } from "../primitives";

export interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const ScreenHeader = ({ eyebrow, title, description, action }: ScreenHeaderProps) => {
  const adaptiveLayout = useAdaptiveLayout();
  const breakpoint = useBreakpoint();

  return (
    <View
      style={{
        gap: breakpoint.isCompact ? spacing[2] : spacing[3],
        flexDirection: adaptiveLayout.useSplitLayout && action ? "row" : "column",
        alignItems: adaptiveLayout.useSplitLayout && action ? "flex-end" : "flex-start",
        justifyContent: "space-between",
      }}
    >
      <MotionView intensity="structural" style={{ flex: 1, gap: breakpoint.isCompact ? spacing[2] : spacing[3] }}>
        {eyebrow ? (
          <View
            style={{
              alignSelf: "flex-start",
              borderRadius: radii.pill,
              borderWidth: breakpoint.isCompact ? 0 : 1,
              borderColor: colors.borderStrong,
              backgroundColor: breakpoint.isCompact ? colors.background : colors.accentSoft,
              paddingHorizontal: breakpoint.isCompact ? 0 : spacing[3],
              paddingVertical: breakpoint.isCompact ? 0 : spacing[2],
            }}
          >
            <AppText size={breakpoint.isCompact ? "xs" : "sm"} tone="accent" weight="semibold">
              {eyebrow}
            </AppText>
          </View>
        ) : null}
        <View style={{ gap: breakpoint.isCompact ? spacing[1] : spacing[2] }}>
          <AppHeading size={breakpoint.isCompact ? "lg" : "xl"}>{title}</AppHeading>
          {description ? <AppText size={breakpoint.isCompact ? "sm" : "md"} tone="secondary">{description}</AppText> : null}
        </View>
      </MotionView>
      {action ? (
        <MotionView delay={80} intensity="subtle">
          {action}
        </MotionView>
      ) : null}
    </View>
  );
};
