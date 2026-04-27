# Goal Vault Universal React Native Phase 24

## Objective
Add a provider-neutral API traffic plan workflow so backend promotion, rollback, and disablement can be reviewed before any hosting-provider traffic change.

## Implemented Scope
- Added `scripts/write-api-traffic-plan.mjs`.
- Added `pnpm api:traffic:plan`.
- Added a manual `API Traffic Plan` GitHub Actions workflow.
- Added a deployment runbook for promotion, rollback, and disablement planning.
- Updated release, launch, env, README, and repo-state documentation.

## Traffic Plan Behavior
The plan generator:

- validates target as `staging` or `production`
- validates action as `promote`, `rollback`, or `disable`
- requires HTTPS URLs
- rejects production localhost URLs
- requires explicit image tags when images are provided
- requires rollback URL and rollback image before promotion plans
- requires release manifest, API preflight, and API data snapshot references before promotion plans
- writes a JSON artifact with `noTrafficMoved: true`

## Promotion Contract
Promotion plans require:

- candidate API URL
- rollback API URL
- candidate API image
- rollback API image
- release manifest reference
- API preflight report reference
- API data snapshot reference

This keeps a promotion record tied to the artifacts needed for recovery.

## Rollback Contract
Rollback plans require:

- rollback API URL
- rollback API image

The generated plan records rollback trigger conditions and execution steps without touching the selected hosting provider.

## Disable Contract
Disable plans require:

- current API URL

The generated plan captures the steps for stopping public API traffic while preserving honest degraded-state behavior in clients.

## Current Boundary
This phase does not deploy images, update DNS, change load balancers, mutate hosting provider settings, restore data, run tests, run builds, or move traffic.

## Follow-Up
- Generate an API traffic plan before any staging traffic movement.
- Choose a backend host and traffic policy before adding provider-specific promotion and rollback automation.
- Keep traffic plans beside release manifests, API image manifests, API preflight reports, and data snapshots.
