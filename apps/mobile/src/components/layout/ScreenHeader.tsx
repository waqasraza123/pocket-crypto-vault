import type { ReactNode } from "react";
import { View } from "react-native";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { spacing } from "../../theme";
import { AppHeading, AppText } from "../primitives";

export interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const ScreenHeader = ({ eyebrow, title, description, action }: ScreenHeaderProps) => {
  const adaptiveLayout = useAdaptiveLayout();

  return (
    <View
      style={{
        gap: spacing[3],
        flexDirection: adaptiveLayout.useSplitLayout && action ? "row" : "column",
        alignItems: adaptiveLayout.useSplitLayout && action ? "flex-end" : "flex-start",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, gap: spacing[3] }}>
        {eyebrow ? (
          <AppText size="sm" tone="accent" weight="semibold">
            {eyebrow}
          </AppText>
        ) : null}
        <View style={{ gap: spacing[2] }}>
          <AppHeading size="xl">{title}</AppHeading>
          {description ? <AppText tone="secondary">{description}</AppText> : null}
        </View>
      </View>
      {action}
    </View>
  );
};
