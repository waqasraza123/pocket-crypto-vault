import { Animated, View, type StyleProp, type ViewStyle } from "react-native";
import { useEffect, useMemo, useRef } from "react";

import { useReducedMotionPreference } from "../../lib/motion/reduced-motion";
import { createTiming } from "../../lib/motion/transitions";
import { colors, radii } from "../../theme";

export interface ProgressBarProps {
  progress: number;
  style?: StyleProp<ViewStyle>;
  height?: number;
  tone?: "accent" | "positive";
}

export const ProgressBar = ({ progress, style, height = 10, tone = "accent" }: ProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const progressValue = useRef(new Animated.Value(clampedProgress)).current;
  const { isReducedMotion } = useReducedMotionPreference();

  useEffect(() => {
    if (isReducedMotion) {
      progressValue.setValue(clampedProgress);
      return;
    }

    createTiming({
      value: progressValue,
      toValue: clampedProgress,
      duration: 420,
      intensity: "structural",
      useNativeDriver: false,
    }).start();
  }, [clampedProgress, isReducedMotion, progressValue]);

  const fillWidth = useMemo(
    () =>
      progressValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["4%", "100%"],
      }),
    [progressValue],
  );
  const fillColor = tone === "positive" ? colors.positive : colors.accentStrong;

  return (
    <View
      style={[
        {
          height,
          width: "100%",
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.surfaceMuted,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: fillWidth,
          height: "100%",
          borderRadius: radii.pill,
          backgroundColor: fillColor,
          shadowColor: tone === "positive" ? colors.positiveGlow : colors.accentGlow,
          shadowOpacity: 0.28,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 1,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: "48%",
            borderRadius: radii.pill,
            backgroundColor: colors.white,
            opacity: 0.18,
          }}
        />
      </Animated.View>
    </View>
  );
};
