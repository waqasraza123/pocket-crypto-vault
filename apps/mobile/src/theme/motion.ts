export const motion = {
  duration: {
    instant: 110,
    quick: 180,
    regular: 260,
    slow: 380,
    hero: 540,
  },
  spring: {
    subtle: {
      damping: 18,
      mass: 0.7,
      stiffness: 180,
    },
    structural: {
      damping: 20,
      mass: 0.82,
      stiffness: 160,
    },
    emphasis: {
      damping: 16,
      mass: 0.88,
      stiffness: 148,
    },
  },
  stagger: {
    tight: 40,
    regular: 70,
    relaxed: 110,
  },
  distance: {
    subtle: 10,
    regular: 18,
    dramatic: 28,
  },
} as const;
