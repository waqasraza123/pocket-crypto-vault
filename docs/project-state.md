# Project State

## Product
Goal Vault is a Base-native USDC savings product where a user creates a named vault for one specific goal, deposits over time, and can only withdraw when the vault's unlock rule allows it.

Core promise:
- Create a vault for one goal.
- Lock it with rules.
- Protect the money from impulse withdrawals.

## Current Repository Reality
The repository now has a real v1 foundation:
- `pnpm` workspace monorepo
- Expo-based universal React Native app in `apps/mobile`
- Expo Router marketing and app route groups
- shared TypeScript package boundaries for config, domain models, a typed API client, contracts package, and contracts SDK
- app-owned wallet boundary with Base and Base Sepolia support states
- typed read-only chain access through centralized config and `viem`
- real create-vault write flow with typed transaction stages, receipt-based address resolution, owner-vault-list fallback, and session-aware metadata refresh
- real USDC deposit flow with balance reads, allowance reads, approval handling, deposit confirmation, and session-backed activity refresh
- real time-lock withdrawal flow with owner gating, unlock countdowns, deliberate confirmation UX, receipt-confirmed withdrawals, and session-backed activity refresh
- a thin Fastify backend in `apps/api` with persisted sync state, normalized event indexing, metadata reconciliation, enriched vault/activity reads, and internal sync triggers
- signed metadata writes tied to owner wallet authorization plus verified creation receipts
- protected internal indexer routes and SQLite-backed backend persistence for indexed state and analytics
- hybrid product screens that use real connection/network state and fall back safely when chain config is incomplete
- GitHub Actions CI and release-candidate verification workflows
- guarded manual contract deployment workflow with Foundry simulation, broadcast confirmation, chain checks, and manifest artifacts
- production-shaped API container image and manual GHCR publishing workflow
- guarded EAS mobile build and production store submission workflow
- root README with setup, scripts, architecture, and verification guidance

Still not implemented:
- hosting-provider backend promotion, traffic rollback workflows, and external managed database infrastructure

## Confirmed Product Boundaries
- Chain: Base
- Asset: USDC only
- Wallet-first onboarding
- One owner per vault
- Private vault metadata by default
- No yield, swaps, multi-asset support, multi-chain support, social layer, or AI features in MVP

## Planned Release Order
- `v1`: time-lock vaults only, followed by release hardening, staging readiness, launch-candidate presentation polish, deployment packaging, and final demo or case-study support
- `v1.5`: complete the planned rule system with cooldown unlock and guardian approval
- `v1.6`: close correctness, persistence, security, and automated coverage gaps so the original product scope is defensible in code
- `v2`: infrastructure and expansion work beyond the original one-goal vault rule set

## Core MVP Actions
- Create a vault
- Deposit USDC
- View progress toward a target
- Prevent withdrawal until the rule allows
- Withdraw only when the condition is satisfied

## Product Principles
- Goal-first, not protocol-first
- Calm, premium, non-speculative UX
- Easy deposits, serious withdrawals
- Minimal but polished UI with strong hierarchy
- Rule clarity and trust over feature breadth

## Planned System Shape
- Onchain: `VaultFactory` plus per-vault `GoalVault`
- Frontend surfaces: landing, connect/onboarding, create-vault flow, vault dashboard, vault detail, deposit flow, withdraw/unlock flow
- Backend/indexing later for metadata, activity feed, and personalized display state
- Product direction now targets one universal React Native app for iOS, Android, and web from a single Expo codebase

## Preferred Initial Scaffold
- Monorepo: `pnpm` workspace
- App: Expo-based universal React Native app with Expo Router for iOS, Android, and web
- App language/runtime: TypeScript with shared React Native UI and shared business logic by default
- Backend: Fastify, Prisma, PostgreSQL, zod
- Contracts: Solidity, Foundry, OpenZeppelin
- Target networks: Base Sepolia first, Base mainnet later

## Current Roadmap
- Phase 0: finalize PRD, flows, state model, contract interface draft, copy system
- Phase 1: universal Expo scaffold, design system, adaptive shell, and static core screens
- Phase 2: universal wallet boundary, chain config, contracts package boundaries, and read-only app integration
- Phase 3: create-vault write flow, success/recovery UX, and session-aware metadata refresh
- Phase 4: deposit flow with USDC approval, confirmation UX, and refreshed vault/activity state
- Phase 5: withdraw flow with time-lock eligibility, confirmation UX, and refreshed vault/activity state
- Phase 6: metadata backend and indexed activity polish
- Phase 7: release hardening, transaction recovery, trust polish, and staging readiness
- Phase 8: onboarding polish, demo readiness, packaging polish, and portfolio presentation improvements
- Phase 9: deployment readiness, launch packaging, and operator-facing checklist support
- Phase 10: final presentation polish, guided demo support, and case-study artifacts
- Phase 11: post-launch instrumentation, analytics, and observability
- Phase 12: motion-system upgrade, modern visual refresh, and animated product polish
- Phase 13: full backend or API wiring, typed data flow, and completion of the end-to-end core loop
- Phase 14: final production cleanup, dead-code removal, duplicate-path consolidation, and repository hardening
- Phase 15: cooldown unlock plus guardian approval, with rule-system completion across contracts, backend, and app flows
- Phase 16: remediation pass for indexed rule correctness, unlock-flow hardening, signed metadata security, SQLite persistence, and critical automated coverage
- Phase 17: GitHub Actions CI, manual release-candidate verification, environment documentation, and operator-facing automation guardrails
- Phase 18: guarded contract deployment automation, Foundry deployment script hardening, deployment manifests, and contract deployment runbook
- Phase 19: API container image packaging, manual GHCR publishing, image manifests, and backend image runbook
- Phase 20: guarded EAS mobile build and production store submission automation with mobile distribution runbook

## Important Decisions
- The product should feel like a premium savings tool, not a DeFi dashboard.
- The narrow scope is intentional and part of the moat.
- The initial contract design should be boring, strict, auditable, and avoid unnecessary upgradeability.
- Repo coding rules require no code comments, strong naming, modular design, strong typing, validation, error handling, and explicit assumptions when requirements are missing.
- Repo workflow rules require commit messages under 140 characters and committing/pushing changes when explicitly requested.
- The repo direction has changed from the earlier web-first planning path to a universal React Native plan with one Expo app for iOS, Android, and web.
- English and Arabic are part of the active plan, with Arabic implemented as a real RTL experience rather than a string-only translation layer.
- Bilingual delivery is a first-class implementation track: direction-aware primitives, a header-level language switcher, translation parity, and RTL validation gates are required before launch.
- The app now owns locale state in `apps/mobile/src/lib/i18n/`, persists the selected language, and applies `lang` plus `dir` at the document/root shell level so web and native share one RTL/LTR model.
- Phase 1 is now scaffolded in-repo with a universal Expo app shell, typed shared models, adaptive layout primitives, and static product screens.
- Phase 2 now adds Reown AppKit as the wallet strategy, `viem` read clients, centralized Base/Base Sepolia config, initial Solidity package boundaries, and app-owned connection/read hooks.
- Native Reown wallet flows must degrade safely in Expo Go. The app treats Expo Go as an unsupported native wallet runtime and falls back to the unconfigured wallet state instead of initializing the native AppKit bridge there. Detection must not rely only on deprecated `Constants.appOwnership`; `Constants.expoGoConfig` is also used because newer Expo runtimes can report `appOwnership` as `null`.
- Metro must resolve all native Reown, `derive-valtio`, and app imports of `valtio` to one root package instance. Without this alias, nested Valtio copies reject each other's proxies and Expo Router reports route default-export failures after the underlying Valtio runtime error.
- Web Reown wallet flows now intentionally disable the Coinbase Base-account connector and rely on injected or EIP-6963 plus WalletConnect paths so Expo or Metro bundling stays clear of the optional Base SDK dependency chain.
- Wallet SDK specifics must stay isolated to `apps/mobile/src/lib/blockchain/wallet/`; presentation components consume only app-level hooks and connection state.
- The first write flow must keep transaction stages app-owned and explicit instead of leaking wallet SDK state into presentation screens.
- Metadata stays display-only. The app now uses a session cache after onchain success so just-created vaults remain visible before full backend/indexer rollout.
- Deposit activity now follows the same bridge pattern: the app records confirmed deposits in local session state immediately after onchain confirmation, then defers full indexed history to the backend phase.
- Withdrawals now follow the same bridge pattern: the app records confirmed withdrawals in local session state immediately after onchain confirmation, then defers full indexed history to the backend phase.
- Phase 6 now makes backend enrichment the primary product read path when the API is configured, while preserving direct chain reads and session overlays as honest fallbacks.
- The API owns normalized confirmed activity, metadata reconciliation status, and sync freshness hints. It does not invent financial truth beyond confirmed chain reads and indexed events.
- The backend currently persists index state in a file-backed store under `apps/api/.data/` so the repo can boot, sync, and recover without external infrastructure. A database-backed replacement remains a later infrastructure step.
- Phase 16 replaces the older file-backed index and analytics stores with SQLite-backed durable persistence under `apps/api/.data/` while keeping the backend self-contained inside the repo.
- Phase 16 hardens metadata writes by requiring a fresh owner signature bound to the vault metadata payload and verified against the creation transaction receipt plus onchain summary.
- Phase 16 protects internal sync and status routes with an internal token header model, while still allowing local loopback development when no token is configured.
- Phase 16 closes the audited rule-system gap by intentionally normalizing both `VaultCreated` and `VaultCreatedV2` creation events into one backend creation model.
- Phase 17 adds CI and release-candidate automation without automatic deployment, contract promotion, store submission, or production traffic changes.
- GitHub release-candidate workflows bind staging and production configuration through GitHub Environments. Public release metadata belongs in environment variables, while RPC URLs belong in environment secrets.
- Phase 18 makes contract deployment a guarded manual GitHub Actions path. It simulates by default, requires explicit broadcast confirmation, validates target chain IDs, and uploads deployment manifests instead of committing generated artifacts.
- Contract deployment requires `USDC_ADDRESS` as a GitHub Environment variable plus `CONTRACT_DEPLOY_RPC_URL` and `CONTRACT_DEPLOYER_PRIVATE_KEY` as GitHub Environment secrets.
- Phase 19 packages the Fastify API/indexer as a Docker image and adds a guarded manual GHCR publishing workflow. It creates backend artifacts but does not choose a host or promote traffic.
- The API image currently runs the existing TypeScript API start path, so `tsx` is an API runtime dependency until a compiled backend artifact replaces it.
- Phase 20 moves EAS configuration beside the Expo app, adds guarded manual mobile distribution workflow, and keeps store credentials in EAS instead of repository secrets.
- Mobile submission is production-only and requires explicit `confirm_submit=submit`.
- Confirmed create, deposit, and withdraw flows now trigger a thin backend sync endpoint and then invalidate reads so backend-enriched vaults and activity refresh more cleanly.
- Phase 7 adds shared readiness and recovery models, persistent mobile transaction recovery, app-shell readiness banners, calmer degraded-state handling, and explicit staging health summaries from the API.
- Phase 7 removes connected-user mock live fallbacks when real reads fail. The app now prefers honest chain/session data plus syncing or recovery messaging.
- The API now exposes richer `/health` and `/ready` responses that report environment checks, per-chain readiness, staging readiness, and sync lag in one contract.
- Phase 8 tightens the universal product presentation around first-run clarity, premium empty states, stronger create/detail/dashboard composition, and cleaner launch-surface metadata without faking authenticated product truth.
- Phase 8 updates the near-term roadmap order so demo polish and packaging land before cooldown unlock and guardian expansion.
- Phase 9 centralizes deployment env handling, moves Expo packaging to environment-aware app config, separates API liveness from readiness, and adds repo-local launch documentation.
- Phase 10 keeps real product behavior honest while adding guided presentation paths, stronger screenshot states, and repo-local demo artifacts.
- Phase 12 refreshes the universal app with brighter layered tokens, app-owned motion primitives, reduced-motion handling, and Apple-like polish translated into an original Goal Vault visual system.
- Phase 12 initially kept the existing Expo React Native styling model and a small shared `Animated`-based motion layer, but the mobile marketing refresh now adopts NativeWind v5 preview with Tailwind CSS v4 for production-grade public mobile surfaces.
- NativeWind is configured in `apps/mobile` with CSS-first tokens in `global.css`, a root `_layout.tsx` CSS import, `react-native-css`, and `withNativewind` wrapping Metro while preserving the required `valtio` resolver alias.
- The current public mobile visual direction uses deep slate foundations, vibrant blue, cyan, emerald, and fuchsia accents, tighter radii, modern shadows, compact mobile spacing, and avoids Apple-like glass or decorative blob-heavy mobile layouts.
- The compact public homepage keeps the footer inside the scroll content, removes mobile decorative hero circles, and uses dense below-hero content sections to avoid the previous oversized empty scroll region.
- Phase 11 adds a typed analytics boundary in the universal app, lean API-side event ingestion, structured backend observability signals, and post-launch metric definitions without collecting freeform private vault content.
- Phase 13 makes the API-backed read model the default product path for dashboard, detail, and activity, while keeping chain reads limited to correctness fallbacks and session overlays limited to in-flight recovery.
- Phase 13 centralizes frontend merge logic for backend, chain, and session state so create, deposit, withdraw, and recovery refresh the same product surfaces consistently.
- Phase 14 removes unused authenticated mocks, dead wrapper modules, and duplicate backend freshness helpers so the repository reads as a cleaner production codebase instead of layered phase scaffolding.
- Phase 15 completes the original Goal Vault rule system with generalized rule typing, backward-aware vault reads, cooldown unlock, guardian approval, and rule-aware activity or API responses.
- Phase 15 keeps the existing legacy time-lock summary read path available while introducing richer rule-state reads and `VaultCreatedV2` for new deployments so old time-lock vaults can still be rendered cleanly.
- Phase 17 adds GitHub Actions CI and manual release-candidate verification for staging and production artifact checks.
- Phase 18 adds guarded Foundry deployment automation for `GoalVaultFactory` on Base Sepolia and Base mainnet.
- Phase 19 adds API image packaging and publishing so backend releases can be promoted from immutable image tags.
- Phase 20 adds EAS mobile build and production submit automation for iOS and Android.
- Product docs live in `docs/product/goal-vault/`:
  - `goal.md` for the concise product goal
  - `plan.md` for the detailed execution-oriented plan
  - `execution-plan.md` for the build-ready implementation map
- The Phase 0 engineering spec lives at `docs/plans/goal-vault-phase-0.md`.
- The active universal React Native Phase 0 engineering spec lives at `docs/plans/goal-vault-universal-react-native-phase-0.md`.
- The Phase 1 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-1.md`.
- The Phase 2 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-2.md`.
- The Phase 3 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-3.md`.
- The Phase 4 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-4.md`.
- The Phase 5 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-5.md`.
- The Phase 7 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-7.md`.
- The Phase 8 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-8.md`.
- The Phase 9 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-9.md`.
- The Phase 10 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-10.md`.
- The Phase 11 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-11.md`.
- The Phase 11 event taxonomy note lives at `docs/plans/goal-vault-analytics-event-taxonomy.md`.
- The Phase 11 post-launch metrics note lives at `docs/plans/goal-vault-post-launch-metrics.md`.
- The Phase 12 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-12.md`.
- The Phase 12 motion system note lives at `docs/plans/goal-vault-motion-system.md`.
- The Phase 12 theme refresh note lives at `docs/plans/goal-vault-theme-refresh-notes.md`.
- The Phase 13 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-13.md`.
- The Phase 14 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-14.md`.
- The Phase 15 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-15.md`.
- The Phase 16 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-16.md`.
- The Phase 15 rule-system note lives at `docs/plans/goal-vault-rule-system.md`.
- The Phase 16 test coverage note lives at `docs/plans/goal-vault-test-coverage-notes.md`.
- The Phase 17 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-17.md`.
- The Phase 18 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-18.md`.
- The Phase 19 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-19.md`.
- The Phase 20 implementation note lives at `docs/plans/goal-vault-universal-react-native-phase-20.md`.
- The CI and release workflow note lives at `docs/plans/goal-vault-ci-release-workflows.md`.
- The contract deployment runbook lives at `docs/deployment/contract-deployment.md`.
- The API image runbook lives at `docs/deployment/api-image.md`.
- The mobile distribution runbook lives at `docs/deployment/mobile-distribution.md`.

## Deferred / Not Yet Implemented
- External managed database infrastructure beyond the current in-repo SQLite persistence
- Hosting-provider backend promotion and traffic rollback workflows

## Risks / Watchouts
- Preserve strict clarity around lock rules and withdrawal state.
- Avoid broadening the scope into general fintech or noisy crypto UX before `v1` is complete.
- Preserve the one-codebase Expo Router structure instead of adding separate web/native surfaces during later integrations.
- Keep the public marketing experience independent from wallet runtime readiness so landing, How It Works, and Security remain usable on web before any connection state is available.
- Keep app-home navigation on an explicit `/vaults` route instead of relying on grouped-root paths that overlap the public landing URL.
- Keep the Reown dependency patches in `patches/` aligned with Expo or Metro compatibility until upstream package exports stop pulling unsupported subpaths into the bundle.

## Standard Verification
- `find docs -maxdepth 3 -type f | sort`
- `pnpm typecheck`
- `pnpm --filter @goal-vault/mobile exec expo export --platform web --output-dir ../../dist/web`
- `pnpm --filter @goal-vault/mobile exec expo export --platform ios --output-dir ../../dist/ios`
- `pnpm --filter @goal-vault/mobile exec expo export --platform android --output-dir ../../dist/android`
- `git status --short`
- `sed -n '1,220p' docs/project-state.md`
- `sed -n '1,220p' docs/_local/current-session.md`
