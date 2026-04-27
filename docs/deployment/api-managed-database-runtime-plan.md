# Goal Vault API Managed Database Runtime Plan

## Purpose
The API managed database runtime plan records the final evidence required before PostgreSQL can become an API runtime persistence mode.

It is not a deployment workflow. It does not install a driver, connect to PostgreSQL, apply schema, import rows, compare data, deploy the API, change `API_PERSISTENCE_DRIVER`, or move traffic. It validates non-secret runtime activation inputs and writes a JSON artifact for operator review.

## Files
- `scripts/write-api-managed-database-runtime-plan.mjs`
  - validates target, engine, mode, schema name, driver package label, managed database target reference, artifact references, image references, and observation window
  - rejects target references that look like connection strings or credentials
  - records acceptance gates for driver, connection pool, schema execution, import execution, parity, preflight, release manifest, traffic plan, and rollback snapshot evidence
  - writes a JSON runtime activation plan
  - emits the plan path for GitHub artifact upload
- `.github/workflows/api-managed-database-runtime-plan.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - uploads the runtime activation plan artifact
- `package.json`
  - exposes `pnpm api:database:runtime:plan`

## Required Inputs
- `API_DATABASE_RUNTIME_TARGET`
  - `staging` or `production`
- `API_DATABASE_RUNTIME_LABEL`
  - stable runtime activation label
- `API_DATABASE_RUNTIME_ENGINE`
  - currently `postgresql`
- `API_DATABASE_RUNTIME_MODE`
  - `shadow`, `cutover`, or `rollback-drill`
- `API_DATABASE_RUNTIME_TARGET_REFERENCE`
  - non-secret managed database target reference
- `API_DATABASE_RUNTIME_SCHEMA_NAME`
  - PostgreSQL schema name
- `API_DATABASE_RUNTIME_DRIVER_PACKAGE`
  - planned Node PostgreSQL driver package label, such as `pg`
- `API_DATABASE_RUNTIME_DATABASE_PLAN`
- `API_DATABASE_RUNTIME_SCHEMA_MANIFEST`
- `API_DATABASE_RUNTIME_SCHEMA_SQL`
- `API_DATABASE_RUNTIME_EXPORT_BUNDLE`
- `API_DATABASE_RUNTIME_IMPORT_PLAN`
- `API_DATABASE_RUNTIME_PARITY_PLAN`
- `API_DATABASE_RUNTIME_PREFLIGHT_REPORT`
- `API_DATABASE_RUNTIME_RELEASE_MANIFEST`
- `API_DATABASE_RUNTIME_TRAFFIC_PLAN`
- `API_DATABASE_RUNTIME_SOURCE_SNAPSHOT`
- `API_DATABASE_RUNTIME_ROLLBACK_SNAPSHOT`
- `API_DATABASE_RUNTIME_API_IMAGE`
- `API_DATABASE_RUNTIME_ROLLBACK_API_IMAGE`

Optional inputs:

- `API_DATABASE_RUNTIME_CHANGE_WINDOW`
- `API_DATABASE_RUNTIME_OBSERVE_MINUTES`
- `API_DATABASE_RUNTIME_OPERATOR`
- `API_DATABASE_RUNTIME_NOTES`
- `API_DATABASE_RUNTIME_DIR`

## Secret Boundary
Do not put `API_DATABASE_URL`, passwords, tokens, private keys, RPC URLs, or provider credentials into runtime plan inputs.

The managed database target reference is intentionally a non-secret label. Runtime credentials belong only in the selected hosting provider secret store or GitHub Environment secrets when a future runtime connection layer is accepted.

## Modes
### Shadow
Use `shadow` before cutover.

The generated plan keeps public API traffic on SQLite, deploys a private candidate API host, runs preflight and read-only smoke checks, observes the candidate, and requires a separate cutover plan before traffic movement.

### Cutover
Use `cutover` only after schema execution, import execution, parity, preflight, release manifest, and traffic plan artifacts are accepted.

The generated plan records candidate and rollback images, observation requirements, and public traffic movement gates.

### Rollback Drill
Use `rollback-drill` to verify recovery before a real cutover.

The generated plan keeps public traffic on the known-good runtime and records rollback image, persistence configuration, recovery timing, and data restore expectations.

## Acceptance Gates
Before PostgreSQL runtime activation, operators must confirm:

- PostgreSQL driver package and lockfile changes are reviewed.
- PostgreSQL connection pooling and shutdown behavior are reviewed.
- PostgreSQL transaction execution uses one checked-out client per transaction and releases it after commit or rollback.
- Managed database schema execution is complete.
- Managed database import execution is complete.
- Parity review accepts row counts, latest sync state, metadata samples, and analytics bounds.
- API preflight accepts PostgreSQL persistence without printing secrets.
- Release manifest records candidate and rollback API images.
- API traffic plan records candidate URL, rollback URL, candidate image, and rollback image.
- Rollback snapshot is available in approved operational storage.

## Promotion Sequence
Use the runtime plan after the earlier managed-database artifacts:

1. Create an API data snapshot.
2. Generate the managed database plan.
3. Generate the PostgreSQL schema bundle.
4. Generate the managed database export bundle.
5. Generate the managed database import plan.
6. Generate the managed database parity plan.
7. Add the PostgreSQL driver and connection pool in code.
8. Run API preflight with PostgreSQL runtime readiness checks.
9. Generate the release manifest and API traffic plan.
10. Generate the managed database runtime plan.
11. Move traffic manually only after the selected hosting-provider operator approves the plan.

## Boundary
This workflow creates a reviewable runtime activation artifact. PostgreSQL driver installation, connection pooling, runtime factory wiring, schema execution, import execution, parity execution, API deployment, traffic movement, and rollback automation remain separate steps.
