import { AccessibilityInfo, Platform } from "react-native";
import { useEffect, useState } from "react";

export type ReducedMotionPreference = "full" | "reduced";

const readReducedMotionState = async () => {
  if (Platform.OS === "web" && typeof window !== "undefined" && "matchMedia" in window) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  return AccessibilityInfo.isReduceMotionEnabled();
};

export const useReducedMotionPreference = () => {
  const [preference, setPreference] = useState<ReducedMotionPreference>("full");

  useEffect(() => {
    let isMounted = true;

    const syncPreference = async () => {
      try {
        const isReduced = await readReducedMotionState();

        if (isMounted) {
          setPreference(isReduced ? "reduced" : "full");
        }
      } catch {
        if (isMounted) {
          setPreference("full");
        }
      }
    };

    void syncPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    preference,
    isReducedMotion: preference === "reduced",
  };
};
