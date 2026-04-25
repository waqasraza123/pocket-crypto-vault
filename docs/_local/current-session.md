# Current Session

## Date
2026-04-25

## Current Objective
Repair the broken universal web experience so the public Goal Vault shell renders correctly, routes work, and placeholder behavior is removed from the primary web paths.

## Last Completed Step
Fixed the public web shell by moving app-home navigation to `/vaults`, making marketing entrance motion render visible immediately on web, wiring real CTA targets, making the wallet header honest when runtime config is missing, and updating public copy away from phase-shell placeholders.

## Current Step
The web repair pass is complete and verified. Remaining work is handoff only unless new browser regressions are reported.

## Why This Step Exists
Manual browser testing showed the landing and marketing routes behaving like a broken shell: the app and landing root paths overlapped, marketing content shipped hidden on first paint through entrance-motion opacity, grouped-route CTA targets were ambiguous, and the header still exposed a fake wallet action when runtime config was missing.

## Files Touched
- `apps/mobile/src/app/{index.tsx,(marketing)/how-it-works.tsx,(marketing)/security.tsx,(app)/vaults/index.tsx}`
- `apps/mobile/src/components/{layout/LanguageSwitcher.tsx,layout/MobileHeader.tsx,layout/WalletEntryPlaceholder.tsx,marketing/HeroSection.tsx,marketing/FinalCtaSection.tsx,marketing/LandingPageContent.tsx,marketing/HowItWorksPageContent.tsx,marketing/SecurityPageContent.tsx,marketing/index.ts,primitives/MotionView.tsx}`
- `apps/mobile/src/lib/{i18n/index.tsx,motion/entrance-state.ts,motion/entrance-state.test.ts,motion/presets.ts,public/marketing-experience.ts,public/marketing-experience.test.ts,routing/routes.ts,routing/routes.test.ts}`
- `docs/project-state.md`
- `docs/_local/current-session.md`
- `apps/mobile/package.json`
- `pnpm-lock.yaml`

## Durable Decisions Captured
- Public app-home navigation now lives on `/vaults` so the marketing landing page owns `/` without conflicting with grouped app routes.
- Marketing entrance motion stays visible on web-first paint instead of shipping public sections at `opacity: 0` until hydration completes.
- Public marketing CTAs must point at stable public routes and header wallet controls must be disabled when wallet runtime setup is unavailable.

## Scope Boundaries
- No multichain, yield, swaps, lending, or social features.
- No product redesign or widened feature scope.
- The one-goal-per-vault model remains intact.

## Exact Next Steps
1. If more web regressions appear, check route collisions and first-paint visibility before changing visual styling.
2. If the repo later adopts a React Native-aware component test runner, add direct route-render tests for the landing and marketing screens.
3. Keep app-home on `/vaults` and keep marketing pages usable without wallet readiness.

## Verification Commands
- `pnpm --filter @goal-vault/mobile test`
- `pnpm typecheck`
- `pnpm --filter @goal-vault/mobile exec expo export --platform web --output-dir ../../dist-web-fixed`
- `rg -n 'href=\"/vaults\"|opacity:1;transform:translateY\\(0px\\) scale\\(1\\)|Wallet setup pending' dist-web-fixed/index.html dist-web-fixed/how-it-works.html dist-web-fixed/security.html`
- `git status --short`

## Handoff Note
The universal web shell now behaves like a real product surface on first load: landing content stays visible even when the wallet is unavailable, How It Works and Security render real content statically on web, public CTAs resolve to stable routes, the language switcher stays honest, and the header no longer exposes a fake wallet action when runtime configuration is missing.
