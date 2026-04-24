# Goal Vault Motion System

## Stack
- React Native `Animated`
- `apps/mobile/src/lib/motion/`
- `apps/mobile/src/components/primitives/MotionView.tsx`
- `apps/mobile/src/components/primitives/AnimatedNumberText.tsx`

## Motion Tokens
- Durations live in `apps/mobile/src/theme/motion.ts`.
- Presets live in `apps/mobile/src/lib/motion/presets.ts`.
- Transition helpers live in `apps/mobile/src/lib/motion/transitions.ts`.

## Preset Roles
- `fade`: low-emphasis reveal.
- `rise`: default section and card entrance.
- `scale`: icon, chip, and highlight emphasis.
- `card`: card reveal with gentler distance.
- `hero`: strongest reveal used for hero and success moments.

## Intensity Roles
- `subtle`: button, hover, focus, and chip response.
- `structural`: section reveal and page composition movement.
- `emphasis`: hero, important summaries, and notable success states.
- `celebratory`: reserved for later if a stronger completion state is needed.

## Shared Patterns
- Buttons use `useInteractiveMotion` for scale and lift on press, hover, and focus.
- Card and section reveal uses `MotionView`.
- Amount and count changes use `AnimatedNumberText`.
- Savings progress uses animated `ProgressBar`.
- Loading placeholders use a restrained pulse instead of aggressive shimmer.
- Lists use `getStaggerDelay()` for orderly reveal.

## Safety Rules
- Motion never replaces meaning.
- Critical financial actions keep copy and hierarchy primary.
- Reduced motion must return immediate readable states.
- Decorative motion should stay occasional and background-only.

## Extension Rules
- Add new motion through shared presets before introducing bespoke animation constants.
- Keep future motion inside `lib/motion` and theme tokens.
- Prefer one strong animated surface over many simultaneous competing motions.
