# Goal Vault

![Status](https://img.shields.io/badge/status-phase%2036-b07d4f)
![Platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android%20%7C%20Web-456b66)
![Expo](https://img.shields.io/badge/expo-sdk%2055-111827?logo=expo&logoColor=white)
![React%20Native](https://img.shields.io/badge/react%20native-0.83.6-61dafb?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/typescript-5.9-3178c6?logo=typescript&logoColor=white)
![Network](https://img.shields.io/badge/network-Base-0052ff)
![Asset](https://img.shields.io/badge/asset-USDC-2775CA)

Goal Vault is a Base-native USDC savings product where a user creates one vault for one goal, deposits over time, and cannot withdraw until the selected rule allows it.

The product is intentionally narrow. It is not trying to be a DeFi dashboard, a multi-chain wallet layer, or a noisy fintech surface. The goal is to create a calm, premium savings experience with clear rules and strong emotional framing.

## Current Status

This repository now contains a deployment-oriented universal Goal Vault v1:

- `pnpm` workspace monorepo
- one Expo-based React Native app in `apps/mobile`
- Expo Router route groups for marketing and authenticated product surfaces
- shared TypeScript package boundaries for config, domain models, API client, contracts SDK, and deployment metadata
- real wallet-first create, deposit, withdraw, vault detail, and activity flows
- Fastify API with health/readiness endpoints, indexer sync, metadata reconciliation, and enriched vault/activity reads
- deployment-aware Expo config, EAS profiles, env reference, and launch checklist docs
- GitHub Actions CI and manual release-candidate verification workflows
- guarded manual contract deployment workflow for `GoalVaultFactory`
- production-shaped API container image and manual GHCR publishing workflow
- guarded EAS mobile build and production store submission workflow
- release manifest workflow for promotion and rollback records
- API data snapshot and restore tooling for current SQLite-backed persistence
- API runtime preflight workflow for staging and production env validation
- API persistence runtime guardrails that block PostgreSQL mode until the adapter exists
- centralized API persistence store factory for current SQLite indexer and analytics stores
- typed API persistence ports for indexer records, sync state, and analytics batches
- asynchronous API persistence read boundary for future external database adapters
- inactive PostgreSQL persistence store core behind the same API ports
- transaction-aware PostgreSQL query executor boundary for future driver wiring
- provider-neutral API traffic plan workflow for promotion, rollback, and disablement records
- provider-neutral managed database planning workflow for future PostgreSQL migration
- provider-neutral PostgreSQL schema bundle workflow for the current API persistence contract
- provider-neutral managed database export workflow for SQLite snapshot to JSONL handoff
- provider-neutral managed database import plan workflow for PostgreSQL import SQL handoff
- provider-neutral managed database parity planning workflow for pre-traffic comparison review
- provider-neutral managed database runtime activation planning workflow

Still deferred:

- PostgreSQL runtime activation with a driver, connection pool, credentials model, accepted schema/import/parity procedure, and rollback path
- hosting-provider backend promotion and traffic rollback workflows

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
- API client boundary: `packages/api-client`
- Contract boundary: `packages/contracts-sdk`
- Shared product and chain config: `packages/config`
- Backend runtime: Fastify + SQLite-backed persistence behind typed API store ports in `apps/api`

There is no separate Next.js app and no separate native app tree. Web is the Expo Router web target from the same app.

## Repository Layout

```text
.
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   └── src/
│   └── mobile/
│       ├── app.config.js
│       ├── package.json
│       └── src/
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
  - indexed activity feed and fallback timeline

## Deployment Readiness

Phase 9 focuses on launch packaging, environment safety, and repeatable verification for the current v1.

Included:

- centralized public env parsing in `packages/config`
- environment-aware Expo package config in `apps/mobile/app.config.js`
- EAS build and submit profiles in `apps/mobile/eas.json`
- API startup validation plus separated `/health` and `/ready`
- guarded Foundry deployment script and GitHub Actions contract deployment workflow
- API Dockerfile and manual image build/publish workflow for GHCR
- API runtime preflight job and manual workflow for release env validation
- API persistence driver validation with explicit SQLite runtime readiness and blocked PostgreSQL mode
- centralized API persistence store construction behind the runtime persistence config
- typed API persistence interfaces that keep routes and services independent of SQLite classes
- asynchronous persistence reads across API routes, sync services, metadata verification, and readiness checks
- inactive PostgreSQL store core that implements the API persistence interfaces without runtime wiring
- transaction-aware PostgreSQL query executor support for future pooled runtime wiring
- API traffic plan generation before provider-specific promotion or rollback
- managed database migration planning and schema inventory artifacts
- managed database schema bundle artifacts for PostgreSQL review
- managed database export bundles for future PostgreSQL import handoff
- managed database import plan artifacts for psql execution review
- managed database parity plan artifacts for restore and pre-traffic review
- managed database runtime activation plan artifacts before PostgreSQL driver wiring or traffic movement
- guarded mobile EAS build and submit workflow
- release manifest generation before manual traffic movement
- API data snapshot and restore scripts for the current SQLite persistence layer
- launch checklist and env reference docs in `docs/plans/`
- repeatable release verification scripts at the repo root

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

Run the API locally:

```bash
pnpm dev:api
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
- `pnpm api:data:snapshot`
  - snapshots API data files from `API_DATA_DIR`
- `pnpm api:data:restore`
  - restores API data files from a snapshot with explicit confirmation
- `pnpm api:database:plan`
  - writes a provider-neutral managed database migration plan and schema inventory
- `pnpm api:database:export`
  - converts an API data snapshot into table-level JSONL files for future managed database import tooling
- `pnpm api:database:import:plan`
  - writes a provider-neutral PostgreSQL import SQL artifact and execution plan from a managed database export bundle
- `pnpm api:database:parity`
  - writes a provider-neutral SQLite/PostgreSQL parity review plan
- `pnpm api:database:runtime:plan`
  - writes a provider-neutral PostgreSQL runtime activation plan
- `pnpm api:database:schema`
  - writes PostgreSQL DDL and a JSON schema manifest for the current API persistence contract
- `pnpm api:preflight`
  - writes a redacted API runtime preflight report and exits nonzero on invalid staging or production configuration
- `pnpm api:traffic:plan`
  - writes a provider-neutral API promotion, rollback, or disablement plan
- `pnpm typecheck`
  - runs workspace TypeScript checks through Turbo
- `pnpm test:ts`
  - runs Node/TypeScript unit tests for the API, mobile app, API client, and contracts SDK
- `pnpm test:contracts`
  - runs Foundry contract tests
- `pnpm verify:ci`
  - runs workspace typecheck, TypeScript unit tests, and contract tests
- `pnpm deploy:contracts:simulate`
  - simulates `GoalVaultFactory` deployment with Foundry
- `pnpm deploy:contracts:broadcast`
  - broadcasts `GoalVaultFactory` deployment with Foundry
- `pnpm deploy:contracts:manifest`
  - writes a deployment manifest from Foundry broadcast output
- `pnpm image:api:build`
  - builds the API container image locally
- `pnpm release:manifest`
  - writes a release manifest from environment variables
- `pnpm verify:mobile:web`
  - exports the Expo web target
- `pnpm verify:mobile:ios`
  - exports the Expo iOS bundle
- `pnpm verify:mobile:android`
  - exports the Expo Android bundle
- `pnpm verify:release`
  - runs typecheck plus the web, iOS, and Android export checks

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
pnpm --filter @goal-vault/api start
curl -s http://127.0.0.1:3001/health
curl -s http://127.0.0.1:3001/ready
pnpm verify:mobile:web
pnpm verify:mobile:ios
pnpm verify:mobile:android
```

What these checks cover:

- workspace dependency resolution
- TypeScript validity across all packages
- Expo Router bundling for web
- Expo export packaging for web, iOS, and Android

## Docs

Key documentation files:

- `docs/project-state.md`
  - durable repository memory and current implementation reality
- `docs/plans/goal-vault-universal-react-native-phase-0.md`
  - active architecture and delivery plan
- `docs/plans/goal-vault-universal-react-native-phase-1.md`
  - Phase 1 implementation note
- `docs/plans/goal-vault-env-reference.md`
  - env variables and deployment assumptions
- `docs/plans/goal-vault-launch-checklist.md`
  - operator-facing launch checklist
- `docs/plans/goal-vault-ci-release-workflows.md`
  - CI and release-candidate workflow setup
- `docs/deployment/contract-deployment.md`
  - guarded contract deployment runbook
- `docs/deployment/api-image.md`
  - API image build, publish, runtime, promotion, and rollback runbook
- `docs/deployment/api-preflight.md`
  - API runtime preflight runbook
- `docs/deployment/api-persistence-runtime.md`
  - API persistence driver guardrail runbook
- `docs/deployment/api-managed-database-plan.md`
  - managed database planning and schema inventory runbook
- `docs/deployment/api-managed-database-parity.md`
  - managed database parity planning runbook
- `docs/deployment/api-managed-database-runtime-plan.md`
  - managed database runtime activation planning runbook
- `docs/deployment/api-managed-database-schema.md`
  - PostgreSQL schema bundle runbook
- `docs/deployment/api-managed-database-export.md`
  - SQLite snapshot to JSONL export runbook
- `docs/deployment/api-managed-database-import-plan.md`
  - managed database import plan and generated SQL runbook
- `docs/deployment/api-traffic-plan.md`
  - API traffic planning, rollback, and disablement runbook
- `docs/deployment/mobile-distribution.md`
  - EAS mobile build, submit, manifest, and rollback runbook
- `docs/deployment/release-manifest.md`
  - release manifest, promotion record, and rollback pointer runbook
- `docs/deployment/api-data-snapshots.md`
  - API data snapshot and restore runbook
- `docs/plans/goal-vault-universal-react-native-phase-18.md`
  - Phase 18 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-19.md`
  - Phase 19 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-20.md`
  - Phase 20 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-21.md`
  - Phase 21 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-22.md`
  - Phase 22 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-23.md`
  - Phase 23 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-24.md`
  - Phase 24 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-25.md`
  - Phase 25 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-26.md`
  - Phase 26 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-27.md`
  - Phase 27 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-28.md`
  - Phase 28 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-29.md`
  - Phase 29 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-30.md`
  - Phase 30 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-31.md`
  - Phase 31 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-32.md`
  - Phase 32 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-33.md`
  - Phase 33 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-34.md`
  - Phase 34 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-35.md`
  - Phase 35 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-36.md`
  - Phase 36 implementation note
- `docs/plans/goal-vault-universal-react-native-phase-9.md`
  - Phase 9 implementation note
- `docs/product/goal-vault/goal.md`
  - concise product goal
- `docs/product/goal-vault/plan.md`
  - product and UX planning
- `docs/product/goal-vault/execution-plan.md`
  - execution-oriented product map

## What Comes Next

The next major implementation steps are:

1. Configure GitHub Environment values and secrets for staging contract deployment and API runtime.
2. Run staging contract deployment simulation, then broadcast only after review.
3. Feed the staged factory address into app/API env and run release-candidate verification.
4. Run API preflight for the target environment and fix any runtime configuration errors.
5. Build and publish the staging API image, then deploy it manually to the selected backend host.
6. Run staging mobile EAS builds after backend and contract configuration are stable.
7. Create an API data snapshot before manually moving traffic.
8. Generate a managed database plan before adding external PostgreSQL infrastructure.
9. Generate a managed database schema bundle for review.
10. Generate a managed database export bundle for provider-owned import.
11. Generate a managed database import plan for provider-owned execution.
12. Generate a managed database parity plan before managed-database traffic movement.
13. Keep `API_PERSISTENCE_DRIVER=sqlite` until a real PostgreSQL runtime adapter is implemented and accepted.
14. Generate a managed database runtime activation plan before enabling PostgreSQL mode.
15. Add a PostgreSQL driver and connection pool only after credentials, rollback, and parity procedures are accepted.
16. Generate a release manifest before manually moving traffic.
17. Generate an API traffic plan before manually moving traffic.
18. Decide whether hosting-provider backend promotion should be automated next.

## Notes

- This repository now has CI, release-candidate verification, guarded contract deployment, API image packaging, API runtime preflight, API persistence runtime guardrails, centralized API persistence store construction, typed asynchronous API persistence ports, an inactive transaction-aware PostgreSQL store core, API traffic planning, managed database planning, managed database schema artifacts, managed database export artifacts, managed database import plan artifacts, managed database parity planning, managed database runtime activation planning, mobile EAS distribution automation, release manifests, and API data snapshot tooling, but backend traffic promotion remains manual.
- `.env.example` provides the expected variable names without secrets.
- Use the launch checklist and env reference docs before staging or production deployment.
