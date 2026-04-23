import type { PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { useAdaptiveLayout } from "../../hooks/useAdaptiveLayout";
import { tokens } from "../../theme";

export interface PageContainerProps {
  style?: StyleProp<ViewStyle>;
  width?: "page" | "reading" | "dashboard";
}

export const PageContainer = ({
  children,
  style,
  width = "page",
}: PropsWithChildren<PageContainerProps>) => {
  const adaptiveLayout = useAdaptiveLayout();

  return (
    <View
      style={[
        {
          width: "100%",
          maxWidth: tokens.maxWidth[width],
          alignSelf: "center",
          paddingHorizontal: adaptiveLayout.contentPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
