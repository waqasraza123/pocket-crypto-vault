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
- root README with setup, scripts, architecture, and verification guidance

Still not implemented:
- production CI and release workflows

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
- Confirmed create, deposit, and withdraw flows now trigger a thin backend sync endpoint and then invalidate reads so backend-enriched vaults and activity refresh more cleanly.
- Phase 7 adds shared readiness and recovery models, persistent mobile transaction recovery, app-shell readiness banners, calmer degraded-state handling, and explicit staging health summaries from the API.
- Phase 7 removes connected-user mock live fallbacks when real reads fail. The app now prefers honest chain/session data plus syncing or recovery messaging.
- The API now exposes richer `/health` and `/ready` responses that report environment checks, per-chain readiness, staging readiness, and sync lag in one contract.
- Phase 8 tightens the universal product presentation around first-run clarity, premium empty states, stronger create/detail/dashboard composition, and cleaner launch-surface metadata without faking authenticated product truth.
- Phase 8 updates the near-term roadmap order so demo polish and packaging land before cooldown unlock and guardian expansion.
- Phase 9 centralizes deployment env handling, moves Expo packaging to environment-aware app config, separates API liveness from readiness, and adds repo-local launch documentation.
- Phase 10 keeps real product behavior honest while adding guided presentation paths, stronger screenshot states, and repo-local demo artifacts.
- Phase 12 refreshes the universal app with brighter layered tokens, app-owned motion primitives, reduced-motion handling, and Apple-like polish translated into an original Goal Vault visual system.
- Phase 12 intentionally keeps the existing Expo React Native styling model and uses a small shared `Animated`-based motion layer instead of introducing a heavier styling or animation stack late in the cycle.
- Phase 11 adds a typed analytics boundary in the universal app, lean API-side event ingestion, structured backend observability signals, and post-launch metric definitions without collecting freeform private vault content.
- Phase 13 makes the API-backed read model the default product path for dashboard, detail, and activity, while keeping chain reads limited to correctness fallbacks and session overlays limited to in-flight recovery.
- Phase 13 centralizes frontend merge logic for backend, chain, and session state so create, deposit, withdraw, and recovery refresh the same product surfaces consistently.
- Phase 14 removes unused authenticated mocks, dead wrapper modules, and duplicate backend freshness helpers so the repository reads as a cleaner production codebase instead of layered phase scaffolding.
- Phase 15 completes the original Goal Vault rule system with generalized rule typing, backward-aware vault reads, cooldown unlock, guardian approval, and rule-aware activity or API responses.
- Phase 15 keeps the existing legacy time-lock summary read path available while introducing richer rule-state reads and `VaultCreatedV2` for new deployments so old time-lock vaults can still be rendered cleanly.
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

## Deferred / Not Yet Implemented
- External managed database infrastructure beyond the current in-repo SQLite persistence
- CI, linting, formatting, and release workflows

## Risks / Watchouts
- Preserve strict clarity around lock rules and withdrawal state.
- Avoid broadening the scope into general fintech or noisy crypto UX before `v1` is complete.
- Preserve the one-codebase Expo Router structure instead of adding separate web/native surfaces during later integrations.

## Standard Verification
- `find docs -maxdepth 3 -type f | sort`
- `pnpm typecheck`
- `pnpm --filter @goal-vault/mobile exec expo export --platform web --output-dir ../../dist-web`
- `pnpm --filter @goal-vault/mobile exec expo export --platform ios --output-dir ../../dist-ios`
- `git status --short`
- `sed -n '1,220p' docs/project-state.md`
- `sed -n '1,220p' docs/_local/current-session.md`
