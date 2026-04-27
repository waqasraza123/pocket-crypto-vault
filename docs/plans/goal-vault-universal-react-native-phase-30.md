# Goal Vault Universal React Native Phase 30

## Objective
Add API persistence runtime guardrails so managed database configuration is explicit and safely blocked until a real PostgreSQL adapter is implemented.

## Implemented Scope
- Added `API_PERSISTENCE_DRIVER`, `API_DATABASE_URL`, and `API_PERSISTENCE_SCHEMA_NAME` parsing to the API runtime env.
- Added a typed persistence runtime config to `ApiRuntimeEnv`.
- Updated API startup validation to block `API_PERSISTENCE_DRIVER=postgresql`.
- Updated `/health`, `/ready`, startup logs, and API preflight reports to expose the selected persistence driver without printing secrets.
- Updated API client schema for the service health persistence driver.
- Added a persistence runtime runbook.
- Updated env, preflight, launch, README, and repo-state documentation.

## Runtime Behavior
Current release behavior:

- `sqlite` remains the default and only runtime-ready persistence driver
- `API_DATA_DIR` remains the active SQLite data location
- `API_DATABASE_URL` is treated as secret and reported only as configured or missing
- `postgresql` is accepted as a known driver value but marks runtime validation invalid
- no PostgreSQL connection is attempted
- no driver dependency is added
- no schema, import, parity, deployment, or traffic operation is executed

## Current Boundary
This phase does not implement PostgreSQL persistence, add a database driver, run migrations, execute import SQL, compare rows, deploy the API, run tests, run builds, or move traffic.

## Follow-Up
- Implement a real store interface and PostgreSQL adapter after provider, credential, rollback, and import procedures are accepted.
- Extend API preflight to execute a redacted connection check only after the runtime adapter exists.
- Keep SQLite as the default until staging parity and rollback procedures are proven.
