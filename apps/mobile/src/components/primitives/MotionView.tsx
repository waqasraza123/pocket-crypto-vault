import type { PropsWithChildren } from "react";
import { Animated, Platform, type StyleProp, type ViewStyle } from "react-native";
import { useEffect, useMemo, useRef } from "react";

import { useReducedMotionPreference } from "../../lib/motion/reduced-motion";
import type { MotionIntensity, MotionPreset } from "../../lib/motion/presets";
import { getMotionViewEntranceState } from "../../lib/motion/entrance-state";
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
  const initialState = getMotionViewEntranceState({
    preset,
    isReducedMotion,
    platform: Platform.OS,
  });
  const opacity = useRef(new Animated.Value(initialState.opacity)).current;
  const translateY = useRef(new Animated.Value(initialState.translateY)).current;
  const scale = useRef(new Animated.Value(initialState.scale)).current;

  useEffect(() => {
    if (!initialState.shouldAnimateOnMount) {
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
  }, [delay, initialState.shouldAnimateOnMount, intensity, opacity, preset, scale, translateY]);

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
