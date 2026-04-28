# Pocket Vault Universal React Native Phase 43

## Objective
Add a final limited-beta readiness gate so operators can review real-audience evidence before inviting users to create vaults with real USDC.

## Implemented Scope
- Added `scripts/write-beta-readiness-plan.mjs`.
- Added `pnpm beta:readiness`.
- Added `.github/workflows/beta-readiness-plan.yml`.
- Added `docs/deployment/beta-readiness.md`.
- Updated launch, release, environment, workflow, project-state, and local-session documentation.
- Updated managed database runtime-plan blockers now that PostgreSQL driver, factory wiring, and preflight connection checks exist.

## Evidence Gate
The beta readiness script validates local JSON artifacts when file paths are supplied:

- release manifest target, app URL, API URL, API image, and rollback image
- API preflight target, valid status, persistence driver, runtime readiness, and PostgreSQL connection/schema checks when selected
- API traffic plan target, promote action, candidate URL, rollback URL, image alignment, release manifest reference, and preflight reference
- managed database runtime plan target, cutover mode, PostgreSQL persistence target, release reference, preflight reference, and traffic plan reference when PostgreSQL is selected

Remote URLs and artifact names remain allowed but are recorded as not locally inspected.

## Beta Controls
The generated artifact records:

- participant limit
- maximum recommended USDC per vault
- support reference
- incident owner
- observation window
- launch steps
- rollback steps

These controls are operational. They do not modify contracts, app behavior, or API behavior.

## Boundary
This phase does not deploy infrastructure, provision databases, apply schema, import data, compare parity, move traffic, send beta invites, run tests, run builds, submit apps, mutate contracts, or run live chain actions.
