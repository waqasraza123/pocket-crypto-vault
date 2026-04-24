import { Animated } from "react-native";
import { useMemo, useRef } from "react";

import type { MotionIntensity } from "./presets";
import { createSpring, createTiming } from "./transitions";
import { useReducedMotionPreference } from "./reduced-motion";

export const useInteractiveMotion = (intensity: MotionIntensity = "subtle") => {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const { isReducedMotion } = useReducedMotionPreference();

  const animateTo = (nextScale: number, nextLift: number) => {
    if (isReducedMotion) {
      scale.setValue(nextScale);
      lift.setValue(nextLift);
      return;
    }

    Animated.parallel([
      createSpring({
        value: scale,
        toValue: nextScale,
        intensity,
      }),
      createTiming({
        value: lift,
        toValue: nextLift,
        duration: 180,
        intensity,
      }),
    ]).start();
  };

  return {
    animatedStyle: useMemo(
      () => ({
        transform: [
          { scale },
          {
            translateY: lift.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -4],
            }),
          },
        ],
      }),
      [lift, scale],
    ),
    onPressIn: () => animateTo(0.985, 1),
    onPressOut: () => animateTo(1, 0),
    onHoverIn: () => animateTo(0.994, 1),
    onHoverOut: () => animateTo(1, 0),
    onFocus: () => animateTo(0.996, 1),
    onBlur: () => animateTo(1, 0),
  };
};
