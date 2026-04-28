# Pocket Vault Phase 18 Production Activation

## Objective
Move Pocket Vault from operationally prepared to ready for controlled production activation and limited beta.

This phase does not add product features or redesign UI. It hardens the existing Base USDC product for production database cutover, protected smoke evidence, traffic movement, limited beta controls, and rollback.

## Activation Boundary
- Production chain is Base mainnet.
- Asset remains USDC only.
- Production API persistence must use PostgreSQL before limited beta traffic.
- Neon is allowed only through `API_POSTGRES_DRIVER=neon` with `API_DATABASE_URL` stored as a secret.
- SQLite remains local and staging rehearsal storage only.
- Live chain smoke is operator-driven with small values and recorded evidence; repo automation does not send live transactions.

## Code-Level Gates
- `API_PERSISTENCE_DRIVER=postgresql` is required in production.
- `API_DATABASE_URL`, `API_POSTGRES_DRIVER`, and `API_PERSISTENCE_SCHEMA_NAME` are rejected in SQLite runtime mode to prevent ambiguous mixed modes.
- `/ready` now reports `productionActivation` gates for code, database, chain, indexer, internal token, support, analytics, smoke, rollback, and beta scope.
- API preflight writes the same production activation summary in the redacted preflight artifact.
- Beta readiness requires accepted protected smoke evidence and production activation gates before production beta approval.

## Required Operator Evidence
- Release manifest for the target release.
- API preflight report with PostgreSQL runtime selected.
- Managed database schema apply, import execute, and parity execute artifacts.
- API database runtime cutover plan.
- API traffic plan and provider execution artifact.
- Production smoke result artifact.
- Source and rollback snapshots.
- Support owner, incident owner, participant limit, per-vault value limit, and observation window.

## Stop Conditions
- `/ready.productionActivation.status` is `blocked`.
- PostgreSQL connection or schema checks fail.
- Parity checks fail without an approved reset or controlled sync advancement.
- Internal support triage cannot list and update beta support requests.
- Protected smoke fails create, deposit, dashboard/detail/activity, indexing, metadata, or support checks.
- Rollback URL, rollback image, rollback snapshot, or traffic reversal path is missing.

## Verification
- `pnpm api:preflight`
- `pnpm api:database:runtime:plan`
- `pnpm smoke:production-v1`
- `pnpm beta:readiness`
- `pnpm typecheck`
- `pnpm test:ts`

