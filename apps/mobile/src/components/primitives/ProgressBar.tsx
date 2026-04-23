import { View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radii } from "../../theme";

export interface ProgressBarProps {
  progress: number;
  style?: StyleProp<ViewStyle>;
  height?: number;
}

export const ProgressBar = ({ progress, style, height = 10 }: ProgressBarProps) => {
  return (
    <View
      style={[
        {
          height,
          width: "100%",
          borderRadius: radii.pill,
          backgroundColor: colors.surfaceStrong,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${Math.max(4, Math.min(100, progress * 100))}%`,
          height: "100%",
          borderRadius: radii.pill,
          backgroundColor: colors.accent,
        }}
      />
    </View>
  );
};
