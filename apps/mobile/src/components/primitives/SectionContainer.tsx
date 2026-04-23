import type { PropsWithChildren, ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { spacing } from "../../theme";

export interface SectionContainerProps {
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
}

export const SectionContainer = ({
  children,
  header,
  style,
  gap = spacing[5],
}: PropsWithChildren<SectionContainerProps>) => {
  return (
    <View style={[{ gap }, style]}>
      {header}
      <View style={{ gap }}>{children}</View>
    </View>
  );
};
