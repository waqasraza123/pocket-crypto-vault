# Goal Vault

![Status](https://img.shields.io/badge/status-phase%201-b07d4f)
![Platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android%20%7C%20Web-456b66)
![Expo](https://img.shields.io/badge/expo-sdk%2055-111827?logo=expo&logoColor=white)
![React%20Native](https://img.shields.io/badge/react%20native-0.83.6-61dafb?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/typescript-5.9-3178c6?logo=typescript&logoColor=white)
![Network](https://img.shields.io/badge/network-Base-0052ff)
![Asset](https://img.shields.io/badge/asset-USDC-2775CA)

Goal Vault is a Base-native USDC savings product where a user creates one vault for one goal, deposits over time, and cannot withdraw until the selected rule allows it.

The product is intentionally narrow. It is not trying to be a DeFi dashboard, a multi-chain wallet layer, or a noisy fintech surface. The goal is to create a calm, premium savings experience with clear rules and strong emotional framing.

## Current Status

This repository currently contains the Phase 1 universal app foundation:

- `pnpm` workspace monorepo
- one Expo-based React Native app in `apps/mobile`
- Expo Router route groups for marketing and authenticated product surfaces
- shared TypeScript package boundaries for config, domain models, API client placeholder, and contracts SDK placeholder
- adaptive layout primitives and a static cross-platform product shell

Still deferred:

- real wallet integration
- smart contracts and transaction flows
- backend metadata and indexed activity APIs
- Arabic localization and real RTL runtime behavior
- CI, release workflows, and production deployment plumbing

## Product Scope

Locked `v1` scope:

- Base only
- USDC only
- create vault
- time lock only
- deposit anytime
- withdraw only after unlock date
- vault list
- vault detail
- offchain vault metadata
- activity feed

Explicitly not in `v1`:

- cooldown unlock
- guardian approval
- yield
- swaps
- multi-asset support
- multichain
- social features
- AI assistant features

## Architecture

The repository direction is one codebase for iOS, Android, and web.

- App runtime: Expo + React Native + Expo Router + TypeScript
- Workspace: `pnpm` + Turbo
- Shared logic: `packages/shared`
- Future backend boundary: `packages/api-client`
- Future contract boundary: `packages/contracts-sdk`
- Shared product and chain config: `packages/config`

There is no separate Next.js app and no separate native app tree. Web is the Expo Router web target from the same app.

## Repository Layout

```text
.
├── apps/
│   └── mobile/
│       ├── app.json
│       ├── package.json
│       └── src/
│           ├── app/
│           ├── components/
│           ├── features/
│           ├── hooks/
│           ├── lib/
│           ├── state/
│           ├── theme/
│           └── types/
├── packages/
│   ├── api-client/
│   ├── config/
│   ├── contracts-sdk/
│   └── shared/
├── docs/
│   ├── product/
│   └── plans/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── turbo.json
```

## App Surfaces

The current Expo Router tree is organized into two route groups:

- public marketing surfaces in `src/app/(marketing)`
- authenticated product surfaces in `src/app/(app)`

Current routes:

- `/`
  - universal landing and product entry screen
- `/how-it-works`
  - three-step product explanation
- `/security`
  - trust model and product boundaries
- `/(app)`
  - My Vaults dashboard shell
- `/vaults/new`
  - create-vault flow with validation scaffolding
- `/vaults/[vaultAddress]`
  - vault detail screen using typed route parsing
- `/activity`
  - activity timeline shell

## Phase 1 Implementation

Phase 1 focuses on product-quality foundation work, not fake integrations.

Included in Phase 1:

- shared theme tokens for color, spacing, radii, typography, motion, and breakpoints
- reusable primitives for text, containers, cards, buttons, fields, states, and progress
- adaptive layout hooks for compact, medium, and expanded screens
- layout shells for marketing and app areas
- static but typed feature data for vault list, vault detail, activity, and create-vault flows
- zod-backed validation scaffolding for create-vault input

Not included in Phase 1:

- real wallet SDK wiring
- chain reads or writes
- backend calls
- complex fake repositories or placeholder orchestration layers

## Getting Started

### Prerequisites

- Node.js `22.x`
- `pnpm` `10.x`

### Install

```bash
pnpm install
```

### Run The App

Start the Expo development server:

```bash
pnpm dev
```

Start specific targets:

```bash
pnpm dev:web
pnpm dev:ios
pnpm dev:android
```

## Scripts

Root scripts:

- `pnpm dev`
  - starts the Expo app workspace
- `pnpm dev:web`
  - runs the Expo web target
- `pnpm dev:ios`
  - runs the iOS target
- `pnpm dev:android`
  - runs the Android target
- `pnpm typecheck`
  - runs workspace TypeScript checks through Turbo

App-level scripts in `apps/mobile`:

- `pnpm --filter @goal-vault/mobile start`
- `pnpm --filter @goal-vault/mobile web`
- `pnpm --filter @goal-vault/mobile ios`
- `pnpm --filter @goal-vault/mobile android`

## Verification

Recommended verification commands:

```bash
pnpm install
pnpm typecheck
pnpm --filter @goal-vault/mobile exec expo export --platform web --output-dir ../../dist-web
CI=1 pnpm --filter @goal-vault/mobile exec expo start --web --port 8081
```

What these checks cover:

- workspace dependency resolution
- TypeScript validity across all packages
- Expo Router bundling for web
- app boot on the Expo web target

## Docs

Key documentation files:

- `docs/project-state.md`
  - durable repository memory and current implementation reality
- `docs/plans/goal-vault-universal-react-native-phase-0.md`
  - active architecture and delivery plan
- `docs/plans/goal-vault-universal-react-native-phase-1.md`
  - Phase 1 implementation note
- `docs/product/goal-vault/goal.md`
  - concise product goal
- `docs/product/goal-vault/plan.md`
  - product and UX planning
- `docs/product/goal-vault/execution-plan.md`
  - execution-oriented product map

## What Comes Next

The next major implementation steps are:

1. Add localization, Arabic resources, and real RTL behavior.
2. Replace the wallet placeholder boundary with real Base and Base Sepolia connection state.
3. Add contracts and contracts SDK read/write integration.
4. Add backend metadata and indexed activity reads behind the existing package boundaries.

## Notes

- This repository currently has no production deployment workflow.
- The current app uses static mock data intentionally to preserve clean future integration boundaries.
- The README reflects the scaffold that exists today, not the full product vision.
