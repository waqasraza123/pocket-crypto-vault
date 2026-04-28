# Pocket Vault Universal React Native Phase 40

## Objective
Add local API preflight evidence validation to managed database runtime cutover planning so PostgreSQL activation cannot be planned from a stale or blocked local preflight report.

## Implemented Scope
- Updated `scripts/write-api-managed-database-runtime-plan.mjs`.
- Added local JSON inspection for `API_DATABASE_RUNTIME_PREFLIGHT_REPORT` when it points to a workspace file.
- Added cutover-mode enforcement for PostgreSQL preflight evidence:
  - valid preflight status
  - PostgreSQL persistence driver
  - configured PostgreSQL URL presence
  - runtime-ready persistence
  - ready PostgreSQL runtime capability
  - ready driver adapter capability
  - ready store factory wiring capability
  - ready preflight connection-check capability
- Added a non-secret `evidence.preflight` summary to generated runtime plans.
- Updated runtime-plan, preflight, README, and repo-state documentation.

## Runtime Behavior
Current release behavior is unchanged:

- `API_PERSISTENCE_DRIVER=sqlite` remains the only runtime-ready persistence mode.
- `API_PERSISTENCE_DRIVER=postgresql` remains blocked by runtime validation and preflight.
- no PostgreSQL driver, driver adapter, connection string loading, factory wiring, schema execution, import execution, parity execution, deployment, or traffic movement was added.

## Evidence Boundary
Local evidence validation only inspects JSON files available in the workspace. Remote URLs and workflow artifact names remain valid references, but they are recorded as not locally inspected and require operator review.

The validation never reads or prints `API_DATABASE_URL`; it only checks the redacted `postgresUrlConfigured` boolean and capability gates already emitted by API preflight.

## Follow-Up
- Add the provider-approved PostgreSQL driver adapter.
- Wire PostgreSQL stores through the persistence factory.
- Implement PostgreSQL preflight connection checks without printing secrets.
- Use a passing local API preflight JSON file when generating a cutover-mode runtime plan.
