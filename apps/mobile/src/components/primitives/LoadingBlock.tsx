import { Animated, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { useEffect, useRef } from "react";

import { useReducedMotionPreference } from "../../lib/motion/reduced-motion";
import { colors, radii } from "../../theme";

export interface LoadingBlockProps {
  height?: number;
  width?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

export const LoadingBlock = ({ height = 14, width = "100%", style }: LoadingBlockProps) => {
  const opacity = useRef(new Animated.Value(0.72)).current;
  const { isReducedMotion } = useReducedMotionPreference();

  useEffect(() => {
    if (isReducedMotion) {
      opacity.setValue(0.82);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.68, duration: 900, useNativeDriver: true }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [isReducedMotion, opacity]);

  return (
    <Animated.View
      style={[
        {
          height,
          width,
          borderRadius: radii.pill,
          backgroundColor: colors.surfaceStrong,
          opacity,
        },
        style,
      ]}
    />
  );
};
