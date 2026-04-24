import { motion } from "../../theme";

export const screenMotion = {
  heroDelay: motion.stagger.regular,
  sectionDelay: motion.stagger.tight,
  contentDelay: motion.stagger.regular,
} as const;
