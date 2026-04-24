import { Animated, Easing } from "react-native";

import type { MotionIntensity } from "./presets";
import { motion } from "../../theme";

const easingMap = {
  subtle: Easing.bezier(0.22, 1, 0.36, 1),
  structural: Easing.bezier(0.2, 0.8, 0.2, 1),
  emphasis: Easing.bezier(0.16, 1, 0.3, 1),
  celebratory: Easing.bezier(0.14, 1, 0.24, 1),
} as const;

export const createTiming = ({
  value,
  toValue,
  duration,
  intensity = "structural",
  useNativeDriver = true,
}: {
  value: Animated.Value;
  toValue: number;
  duration: number;
  intensity?: MotionIntensity;
  useNativeDriver?: boolean;
}) =>
  Animated.timing(value, {
    toValue,
    duration,
    easing: easingMap[intensity],
    useNativeDriver,
  });

export const createSpring = ({
  value,
  toValue,
  intensity = "structural",
  useNativeDriver = true,
}: {
  value: Animated.Value;
  toValue: number;
  intensity?: MotionIntensity;
  useNativeDriver?: boolean;
}) =>
  Animated.spring(value, {
    toValue,
    damping: motion.spring[intensity === "celebratory" ? "emphasis" : intensity].damping,
    mass: motion.spring[intensity === "celebratory" ? "emphasis" : intensity].mass,
    stiffness: motion.spring[intensity === "celebratory" ? "emphasis" : intensity].stiffness,
    useNativeDriver,
  });
