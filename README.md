# Pocket Vault

Pocket Vault is a Base-native USDC pocket-money savings app for 18+ college and university students starting with crypto. A student connects a wallet, creates one vault for an emergency or student-life goal, deposits over time, and withdraws only when the selected rule allows it.

The product is intentionally narrow:

- Base only
- USDC only
- wallet-first
- one owner
- private metadata by default
- student emergency savings first
- create vault, deposit, withdraw
- time-lock, cooldown unlock, and guardian approval rules
- dashboard, detail, activity, support, analytics, and indexing

No yield, swaps, multichain, social, or AI features are implemented.

## Repository

- `apps/mobile`: Expo app for iOS, Android, and web
- `apps/api`: Fastify API for readiness, indexing, metadata, support, and analytics
- `packages/contracts`: Foundry contracts
- `packages/*`: shared config, domain models, API client, and contracts SDK

## Install

Requires Node.js 22.x, pnpm 10.x, Foundry, Docker, and EAS access for mobile builds.

```sh
pnpm install
```

## Run Locally

Start the API:

```sh
pnpm dev:api
```

Start the app:

```sh
pnpm dev
```

Target-specific app commands:

```sh
pnpm dev:web
pnpm dev:ios
pnpm dev:android
```

Local API defaults to SQLite. Production activation requires PostgreSQL.

Checks:

```sh
pnpm typecheck
pnpm test:ts
pnpm test:contracts
pnpm verify:ci
pnpm api:preflight
```

Endpoints:

- `GET /health`: service is alive
- `GET /ready`: runtime, chain, persistence, release, and activation readiness

## Core Environment

Use `.env.example` and `docs/plans/pocket-vault-env-reference.md`. Minimum local variables for real chains:

- `EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL`
- `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS`
- `EXPO_PUBLIC_REOWN_PROJECT_ID`
- `EXPO_PUBLIC_API_BASE_URL`

API variables:

- `API_PUBLIC_BASE_URL`
- `API_INTERNAL_TOKEN`
- `API_PERSISTENCE_DRIVER`
- `API_DATA_DIR`
- `API_DATABASE_URL` only when `API_PERSISTENCE_DRIVER=postgresql`
- `API_POSTGRES_DRIVER` only when `API_PERSISTENCE_DRIVER=postgresql`
- `API_ENABLE_INDEXER`, `API_ENABLE_ANALYTICS`, `API_ENABLE_SUPPORT`

Production must not use mixed SQLite/PostgreSQL config.

## Deploy Contracts

Implemented deployment path:

```sh
pnpm deploy:contracts:simulate
pnpm deploy:contracts:broadcast
pnpm deploy:contracts:manifest
```

The `Contract Deployment` workflow is guarded and manual. It simulates by default and broadcasts only with explicit confirmation.

## Deploy API

Build the API image locally:

```sh
pnpm image:api:build
```

Server path:

1. Run `pnpm api:preflight` with the target environment.
2. Publish the API image through the guarded workflow.
3. Run the image on the selected server or hosting provider with `API_HOST=0.0.0.0`.
4. Configure required API env vars and secrets.
5. Check `/health` and `/ready`.
6. Move traffic only after release, database, preflight, smoke, and rollback evidence is accepted.

Vercel traffic command planning and guarded promote/rollback execution are included. Provider-specific public API disablement automation is not implemented.

## Deploy Database

Local/default persistence is SQLite. Production activation uses PostgreSQL behind typed persistence ports.

Implemented database path:

```sh
pnpm api:data:snapshot
pnpm api:database:plan
pnpm api:database:schema
pnpm api:database:schema:apply
pnpm api:database:export
pnpm api:database:import:plan
pnpm api:database:import:execute
pnpm api:database:parity
pnpm api:database:parity:execute
pnpm api:database:runtime:plan
```

PostgreSQL supports `pg` and Neon through `API_POSTGRES_DRIVER=neon`. The API checks connection and required tables on startup and preflight. It does not run migrations automatically.

## Deploy App

Web uses the Expo web target:

```sh
pnpm verify:mobile:web
```

iOS and Android use EAS profiles in `apps/mobile/eas.json`:

```sh
pnpm verify:mobile:ios
pnpm verify:mobile:android
```

The `Mobile Distribution` workflow supports guarded EAS build and production store submission. Store submission is production-only and requires explicit confirmation.

## Production Activation

Before limited beta traffic:

```sh
pnpm release:manifest
pnpm api:traffic:plan
pnpm api:traffic:vercel
pnpm smoke:production-v1
pnpm beta:readiness
```

`pnpm smoke:production-v1` checks public API health/readiness and records operator evidence. It does not send wallet transactions.

`/ready.productionActivation.safeForLimitedBetaTraffic` should be `true` before inviting production beta users.

Runbooks:

- `docs/plans/pocket-vault-production-cutover-runbook.md`
- `docs/plans/pocket-vault-production-smoke-runbook.md`
- `docs/plans/pocket-vault-limited-beta-launch-checklist.md`
- `docs/plans/pocket-vault-rollback-runbook.md`

## Rollback

Rollback is artifact-driven: API image, URL, snapshot, traffic reversal plan, and `/health` plus `/ready` verification. Restore data only from an approved snapshot while the affected API runtime is stopped.
