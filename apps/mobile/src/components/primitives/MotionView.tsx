import type { PropsWithChildren } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";
import { useEffect, useMemo, useRef } from "react";

import { useReducedMotionPreference } from "../../lib/motion/reduced-motion";
import type { MotionIntensity, MotionPreset } from "../../lib/motion/presets";
import { motionPresets } from "../../lib/motion/presets";
import { createSpring, createTiming } from "../../lib/motion/transitions";

export interface MotionViewProps {
  style?: StyleProp<ViewStyle>;
  preset?: MotionPreset;
  intensity?: MotionIntensity;
  delay?: number;
}

export const MotionView = ({
  children,
  style,
  preset = "rise",
  intensity = "structural",
  delay = 0,
}: PropsWithChildren<MotionViewProps>) => {
  const { isReducedMotion } = useReducedMotionPreference();
  const opacity = useRef(new Animated.Value(isReducedMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(isReducedMotion ? 0 : motionPresets[preset].distance)).current;
  const scale = useRef(new Animated.Value(isReducedMotion ? 1 : motionPresets[preset].scale)).current;

  useEffect(() => {
    if (isReducedMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      scale.setValue(1);
      return;
    }

    const timeout = setTimeout(() => {
      Animated.parallel([
        createTiming({
          value: opacity,
          toValue: 1,
          duration: motionPresets[preset].duration,
          intensity,
        }),
        createTiming({
          value: translateY,
          toValue: 0,
          duration: motionPresets[preset].duration,
          intensity,
        }),
        createSpring({
          value: scale,
          toValue: 1,
          intensity,
        }),
      ]).start();
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [delay, intensity, isReducedMotion, opacity, preset, scale, translateY]);

  return (
    <Animated.View
      style={[
        useMemo(
          () => ({
            opacity,
            transform: [{ translateY }, { scale }],
          }),
          [opacity, scale, translateY],
        ),
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};
