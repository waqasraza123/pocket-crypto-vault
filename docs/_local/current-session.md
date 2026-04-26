# Current Session

## Date
2026-04-26

## Current Objective
Fix Expo Go native startup errors where every route reported a missing default export after a wallet import crash.

## Last Completed Step
Added a Metro resolver alias that forces every `valtio` import to the root package instance, and updated native wallet runtime detection to treat `Constants.expoGoConfig` as Expo Go.

## Current Step
The Expo Go startup fix is implemented and verified with the focused wallet runtime test, mobile typecheck, an iOS export bundle, and a temporary iOS dev-server run on port `8082`.

## Why This Step Exists
The native wallet runtime is intentionally disabled in Expo Go. Two issues were causing the route warnings: Expo 55 can report `Constants.appOwnership` as `null` in Expo Go, and Metro was resolving nested Valtio copies for Reown plus `derive-valtio`, which made Valtio reject Reown controller proxies.

## Files Touched
- `apps/mobile/metro.config.js`
- `apps/mobile/src/lib/blockchain/wallet/native-runtime.ts`
- `apps/mobile/src/lib/blockchain/wallet/native-runtime.test.ts`
- `apps/mobile/src/lib/blockchain/wallet/provider.tsx`
- `apps/mobile/src/lib/blockchain/wallet/provider.native.tsx`
- `apps/mobile/src/lib/blockchain/wallet/write-provider.ts`
- `docs/project-state.md`
- `docs/_local/current-session.md`

## Durable Decisions Captured
- Expo Go must stay on a Reown-free unconfigured wallet path.
- Expo Go detection must check `Constants.expoGoConfig` in addition to deprecated `Constants.appOwnership`.
- Metro must force `valtio` and `valtio/*` imports to a single package instance.
- Reown SDK imports should remain behind platform/runtime gates instead of shared top-level imports.

## Scope Boundaries
- No wallet behavior changes for web or supported native development builds.
- No route, UI, or chain-read behavior changes.

## Exact Next Steps
1. Restart Expo with a cleared Metro cache: `pnpm --filter @goal-vault/mobile exec expo start --clear`.
2. Re-open iOS in Expo Go and confirm route warnings are gone.

## Verification Commands
- `pnpm --filter @goal-vault/mobile exec expo start --ios --clear --port 8082`
- `pnpm --filter @goal-vault/mobile exec tsx --test src/lib/blockchain/wallet/native-runtime.test.ts`
- `pnpm --filter @goal-vault/mobile typecheck`
- `pnpm --filter @goal-vault/mobile exec expo export --platform ios --output-dir ../../dist/ios`

## Handoff Note
The route missing-default-export warnings were secondary symptoms of Valtio proxy mismatches and native Reown runtime detection. The iOS dev bundle on port `8082` rebuilt cleanly after the Metro alias; no Valtio warning, TypeError, or route default-export warnings appeared.
