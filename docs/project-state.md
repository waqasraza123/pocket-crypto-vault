# Project State

## Product
Goal Vault is a Base-native USDC savings product where a user creates a named vault for one specific goal, deposits over time, and can only withdraw when the vault's unlock rule allows it.

Core promise:
- Create a vault for one goal.
- Lock it with rules.
- Protect the money from impulse withdrawals.

## Current Repository Reality
The repository is still bootstrap-stage and contains no app, contract, backend, or deployment code yet. The durable product direction is now defined, but the implementation architecture is not scaffolded in-repo.

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

## Preferred Initial Scaffold
- Monorepo: `pnpm` workspace with Turborepo
- Frontend: Next.js App Router, TypeScript, Tailwind, wagmi, viem, TanStack Query
- Backend: Fastify, Prisma, PostgreSQL, zod
- Contracts: Solidity, Foundry, OpenZeppelin
- Target networks: Base Sepolia first, Base mainnet later

## Current Roadmap
- Phase 0: finalize PRD, flows, state model, contract interface draft, copy system
- Phase 1: design system and clickable UI
- Phase 2: onchain `v1` time-lock contracts and tests
- Phase 3: frontend integration
- Phase 4: metadata backend and polish
- Phase 5: cooldown unlock
- Phase 6: guardian approval

## Important Decisions
- The product should feel like a premium savings tool, not a DeFi dashboard.
- The narrow scope is intentional and part of the moat.
- The initial contract design should be boring, strict, auditable, and avoid unnecessary upgradeability.
- Repo coding rules require no code comments, strong naming, modular design, strong typing, validation, error handling, and explicit assumptions when requirements are missing.
- Product docs live in `docs/product/goal-vault/`:
  - `goal.md` for the concise product goal
  - `plan.md` for the detailed execution-oriented plan
  - `execution-plan.md` for the build-ready implementation map
- The Phase 0 engineering spec lives at `docs/plans/goal-vault-phase-0.md`.

## Deferred / Not Yet Implemented
- README and developer setup
- Package/workspace structure
- Smart contracts, tests, and deployment scripts
- Frontend, backend, database, and indexing code
- CI, linting, formatting, and release workflows

## Risks / Watchouts
- Do not imply existing implementation architecture until files are scaffolded.
- Preserve strict clarity around lock rules and withdrawal state.
- Avoid broadening the scope into general fintech or noisy crypto UX before `v1` is complete.

## Standard Verification
- `find docs -maxdepth 3 -type f | sort`
- `git status --short`
- `sed -n '1,220p' docs/project-state.md`
- `sed -n '1,220p' docs/_local/current-session.md`
