# Goal Vault Universal React Native Phase 41

## Objective
Add local release manifest and API traffic plan evidence validation to managed database runtime cutover planning so a cutover plan cannot silently combine mismatched images or artifact references.

## Implemented Scope
- Updated `scripts/write-api-managed-database-runtime-plan.mjs`.
- Added local JSON inspection for `API_DATABASE_RUNTIME_RELEASE_MANIFEST` when it points to a workspace file.
- Added local JSON inspection for `API_DATABASE_RUNTIME_TRAFFIC_PLAN` when it points to a workspace file.
- Added cutover-mode release manifest checks:
  - release target matches runtime target
  - release API image matches runtime candidate image
  - release rollback image matches runtime rollback image when present
- Added cutover-mode traffic plan checks:
  - traffic target matches runtime target
  - traffic action is `promote`
  - traffic candidate image matches runtime candidate image
  - traffic rollback image matches runtime rollback image
  - traffic release manifest reference matches the runtime release manifest reference
  - traffic preflight report reference matches the runtime preflight report reference
- Added non-secret release and traffic evidence summaries to generated runtime plans.
- Updated runtime-plan, release-manifest, traffic-plan, README, and repo-state documentation.

## Runtime Behavior
Current release behavior is unchanged:

- `API_PERSISTENCE_DRIVER=sqlite` remains the only runtime-ready persistence mode.
- `API_PERSISTENCE_DRIVER=postgresql` remains blocked by runtime validation and preflight.
- no PostgreSQL driver, driver adapter, connection string loading, factory wiring, schema execution, import execution, parity execution, deployment, or traffic movement was added.

## Evidence Boundary
Local evidence validation only inspects JSON files available in the workspace. Remote URLs and workflow artifact names remain valid references, but they are recorded as not locally inspected and require operator review.

The validation compares non-secret target, image, action, and artifact reference fields only. It does not read credentials, connect to providers, deploy infrastructure, or move traffic.

## Follow-Up
- Add the provider-approved PostgreSQL driver adapter.
- Wire PostgreSQL stores through the persistence factory.
- Implement PostgreSQL preflight connection checks without printing secrets.
- Use local release manifest, API preflight, and API traffic plan JSON files when generating cutover-mode runtime plans.
