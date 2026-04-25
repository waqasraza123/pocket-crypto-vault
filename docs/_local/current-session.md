# Current Session

## Date
2026-04-25

## Current Objective
Fix the broken English to Arabic toggle on web so locale changes apply immediately and persist reliably.

## Last Completed Step
Fixed the locale bootstrap race by initializing from web storage synchronously, preventing late async hydration from overwriting a manual language change, and adding regression coverage for the locale storage decisions.

## Current Step
The locale-toggle repair is complete and verified. Remaining work is handoff only unless another web regression appears.

## Why This Step Exists
Manual browser testing showed the language toggle could be clicked without sticking. The provider booted in English, then hydrated locale asynchronously, so a late storage read could overwrite the user’s Arabic selection immediately after they pressed the toggle.

## Files Touched
- `apps/mobile/src/lib/i18n/{index.tsx,locale-storage.ts,locale-storage.test.ts}`
- `docs/_local/current-session.md`

## Durable Decisions Captured
- Web locale changes must apply immediately from user interaction and must not be reverted by delayed persistence hydration.
- Locale storage decisions should stay in a pure helper so this race remains regression-testable without a React Native renderer.

## Scope Boundaries
- No multichain, yield, swaps, lending, or social features.
- No product redesign, routing changes, or widened feature scope.
- The fix stays within the existing universal Expo React Native i18n model.

## Exact Next Steps
1. If more locale bugs appear, inspect hydration order before changing header controls or translation data.
2. If the repo later adopts a React Native-aware component test runner, add a direct LanguageSwitcher interaction test.
3. Keep web locale initialization synchronous whenever the selected locale already exists in browser storage.

## Verification Commands
- `pnpm --filter @goal-vault/mobile test`
- `pnpm --filter @goal-vault/mobile typecheck`
- `git status --short`

## Handoff Note
The English/Arabic toggle now behaves deterministically on web: the provider starts from browser storage when available, a manual toggle writes immediately, and delayed async hydration can no longer snap the UI back to English after the user selects Arabic.
