import type { MotionPreset } from "./presets";
import { motionPresets } from "./presets";

export const getMotionViewEntranceState = ({
  preset,
  isReducedMotion,
  platform,
}: {
  preset: MotionPreset;
  isReducedMotion: boolean;
  platform: string;
}) => {
  const shouldAnimateOnMount = !isReducedMotion && platform !== "web";

  return {
    shouldAnimateOnMount,
    opacity: shouldAnimateOnMount ? 0 : 1,
    translateY: shouldAnimateOnMount ? motionPresets[preset].distance : 0,
    scale: shouldAnimateOnMount ? motionPresets[preset].scale : 1,
  };
};
