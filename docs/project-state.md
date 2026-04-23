# Project State

## Product
Goal Vault is a Base-native USDC savings product where a user creates a named vault for one specific goal, deposits over time, and can only withdraw when the vault's unlock rule allows it.

Core promise:
- Create a vault for one goal.
- Lock it with rules.
- Protect the money from impulse withdrawals.

## Current Repository Reality
The repository now has a real Phase 4 foundation:
- `pnpm` workspace monorepo
- Expo-based universal React Native app in `apps/mobile`
- Expo Router marketing and app route groups
- shared TypeScript package boundaries for config, domain models, API client placeholder, contracts package, and contracts SDK
- app-owned wallet boundary with Base and Base Sepolia support states
- typed read-only chain access through centralized config and `viem`
- real create-vault write flow with typed transaction stages, receipt-based address resolution, owner-vault-list fallback, and session-aware metadata refresh
- real USDC deposit flow with balance reads, allowance reads, approval handling, deposit confirmation, and session-backed activity refresh
- real time-lock withdrawal flow with owner gating, unlock countdowns, deliberate confirmation UX, receipt-confirmed withdrawals, and session-backed activity refresh
- hybrid product screens that use real connection/network state and fall back safely when chain config is incomplete
- root README with setup, scripts, architecture, and verification guidance

Still not implemented:
- full backend/indexing rollout
- production CI and release workflows

## Confirmed Product Boundaries
- Chain: Base
- Asset: USDC only
- Wallet-first onboarding
- One owner per vault
- Private vault metadata by default
- No yield, swaps, multi-asset support, multi-chain support, social layer, or AI features in MVP

## Planned Release Order
- `v1`: time-lock vaults only
- `v1.5`: cooldown unlock
- `v2`: guardian approval

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
- Phase 7: cooldown unlock
- Phase 8: guardian approval

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

## Deferred / Not Yet Implemented
- Backend, database, and indexed activity integrations beyond the current metadata POST/session fallback bridge
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
