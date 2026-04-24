import { motion } from "../../theme";

export const getStaggerDelay = (index: number, spacing: "tight" | "regular" | "relaxed" = "regular") =>
  index * motion.stagger[spacing];
