# Goal Vault API Managed Database Parity

## Purpose
The API managed database parity plan records the source and target comparison checks operators must run after restoring API data into a managed PostgreSQL target.

It is not a live parity checker. It does not connect to SQLite, PostgreSQL, or a hosting provider. It writes a JSON artifact containing the exact table-level queries, acceptance criteria, rollback triggers, and supporting artifact references required before traffic movement.

## Files
- `scripts/write-api-managed-database-parity-plan.mjs`
  - validates target, engine, mode, source snapshot, schema manifest, and target reference
  - rejects target references that look like connection strings or credentials
  - writes a JSON parity plan with SQLite and PostgreSQL query pairs
  - emits the plan path for GitHub artifact upload
- `.github/workflows/api-managed-database-parity.yml`
  - manual staging or production workflow
  - supports `restore-validation`, `pre-traffic`, and `post-rollback`
  - binds to the matching GitHub Environment
  - uploads the parity plan artifact
- `package.json`
  - exposes `pnpm api:database:parity`
- `docs/deployment/api-managed-database-export.md`
  - creates the JSONL handoff bundle that operators import before running parity checks
- `docs/deployment/api-managed-database-import-plan.md`
  - creates the psql-compatible import SQL that operators review before provider-owned execution

## Required Inputs
- `API_DATABASE_PARITY_TARGET`
  - `staging` or `production`
- `API_DATABASE_PARITY_LABEL`
  - stable label used in artifact naming
- `API_DATABASE_PARITY_ENGINE`
  - currently `postgresql`
- `API_DATABASE_PARITY_MODE`
  - `restore-validation`, `pre-traffic`, or `post-rollback`
- `API_DATABASE_PARITY_TARGET_REFERENCE`
  - non-secret managed database target reference
- `API_DATABASE_PARITY_SCHEMA_NAME`
  - PostgreSQL schema name used in target query generation
- `API_DATABASE_PARITY_SOURCE_SNAPSHOT`
  - API data snapshot or managed database export artifact name or approved storage reference
- `API_DATABASE_PARITY_SCHEMA_MANIFEST`
  - managed database schema manifest artifact name or URL

Optional inputs:

- `API_DATABASE_PARITY_DATABASE_PLAN`
- `API_DATABASE_PARITY_SCHEMA_SQL`
- `API_DATABASE_PARITY_TRAFFIC_PLAN`
- `API_DATABASE_PARITY_OBSERVE_MINUTES`
- `API_DATABASE_PARITY_OPERATOR`
- `API_DATABASE_PARITY_NOTES`
- `API_DATABASE_PARITY_DIR`

## Secret Boundary
Do not put database connection strings, passwords, API tokens, RPC URLs, or private keys into parity plan inputs.

`API_DATABASE_PARITY_TARGET_REFERENCE` is a non-secret label only. Operators run the emitted queries through approved provider consoles or future migration tooling that owns credentials outside this repository.

## Parity Checks
The generated plan includes comparison checks for:

- `vaults`
  - row count
  - distinct chain and contract count
  - onchain-found count
  - latest indexed timestamp
- `vault_events`
  - row count
  - distinct chain and vault count
  - latest indexed block by chain
- `sync_states`
  - row count
  - lifecycle and latest indexed markers by key
- `analytics_events`
  - row count
  - latest event timestamp by environment
  - event count by category

Each check includes a SQLite source query, a PostgreSQL target query, and acceptance criteria.

PostgreSQL query pairs use `API_DATABASE_PARITY_SCHEMA_NAME`, which should match the schema name from the managed database schema bundle.

## Acceptance Gate
Before traffic movement:

1. Source snapshot or export bundle, schema manifest, and schema SQL artifacts are reviewed.
2. Import plan SQL is reviewed and executed through approved operational access.
3. Table row counts match exactly unless an intentional reset is recorded.
4. Sync state latest indexed blocks and log indexes do not regress.
5. Private vault metadata is reviewed only through approved operational access.
6. API preflight passes with the managed database runtime configuration.
7. API traffic plan is accepted by the hosting-provider operator.

## Rollback Triggers
Rollback is required when:

- a required table is missing
- row counts differ without an approved reset or controlled sync advancement
- latest sync state regresses
- private metadata rows are missing or malformed
- `/ready` reports blocked checks after managed database configuration

## Boundary
This phase writes a parity review plan. Live query execution, credential handling, data import, parity automation, runtime adapter changes, and traffic movement remain deferred until a managed database provider and driver are selected.
