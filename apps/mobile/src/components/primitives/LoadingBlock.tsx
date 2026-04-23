import { View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";

import { colors, radii } from "../../theme";

export interface LoadingBlockProps {
  height?: number;
  width?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

export const LoadingBlock = ({ height = 14, width = "100%", style }: LoadingBlockProps) => {
  return (
    <View
      style={[
        {
          height,
          width,
          borderRadius: radii.pill,
          backgroundColor: colors.surfaceStrong,
        },
        style,
      ]}
    />
  );
};
