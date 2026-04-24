import { Animated } from "react-native";
import { useEffect, useRef, useState } from "react";

import { AppText, type AppTextProps } from "./AppText";
import { useReducedMotionPreference } from "../../lib/motion/reduced-motion";
import { createTiming } from "../../lib/motion/transitions";
import type { MotionIntensity } from "../../lib/motion/presets";

export interface AnimatedNumberTextProps extends Omit<AppTextProps, "children"> {
  value: number;
  formatValue?: (value: number) => string;
  motionIntensity?: MotionIntensity;
}

export const AnimatedNumberText = ({
  value,
  formatValue = (nextValue) => `${nextValue}`,
  motionIntensity = "structural",
  ...props
}: AnimatedNumberTextProps) => {
  const [displayValue, setDisplayValue] = useState(() => formatValue(value));
  const animatedValue = useRef(new Animated.Value(value)).current;
  const previousValue = useRef(value);
  const { isReducedMotion } = useReducedMotionPreference();

  useEffect(() => {
    const listener = animatedValue.addListener(({ value: nextValue }) => {
      setDisplayValue(formatValue(nextValue));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue, formatValue]);

  useEffect(() => {
    if (isReducedMotion) {
      previousValue.current = value;
      animatedValue.setValue(value);
      setDisplayValue(formatValue(value));
      return;
    }

    animatedValue.setValue(previousValue.current);
    const animation = createTiming({
      value: animatedValue,
      toValue: value,
      duration: 340,
      intensity: motionIntensity,
      useNativeDriver: false,
    });

    animation.start(() => {
      previousValue.current = value;
      setDisplayValue(formatValue(value));
    });
  }, [animatedValue, formatValue, isReducedMotion, motionIntensity, value]);

  return <AppText {...props}>{displayValue}</AppText>;
};
