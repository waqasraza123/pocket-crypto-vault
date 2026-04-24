import { motion } from "../../theme";

export type MotionPreset = "fade" | "rise" | "scale" | "card" | "hero";
export type MotionIntensity = "subtle" | "structural" | "emphasis" | "celebratory";
export type TransitionVariant = "timing" | "spring";
export type FeedbackAnimationState = "idle" | "loading" | "success" | "warning" | "serious";
export type ProgressVisualState = "idle" | "growing" | "steady" | "complete" | "withdrawing";

export const motionPresets = {
  fade: {
    duration: motion.duration.quick,
    distance: 0,
    scale: 1,
  },
  rise: {
    duration: motion.duration.regular,
    distance: motion.distance.regular,
    scale: 1,
  },
  scale: {
    duration: motion.duration.regular,
    distance: motion.distance.subtle,
    scale: 0.985,
  },
  card: {
    duration: motion.duration.regular,
    distance: motion.distance.subtle,
    scale: 0.975,
  },
  hero: {
    duration: motion.duration.hero,
    distance: motion.distance.dramatic,
    scale: 0.97,
  },
} as const;
