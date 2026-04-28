# Pocket Vault Universal React Native Phase 46

## Scope
Phase 46 adds a Vercel-specific backend traffic command handoff after the existing provider-neutral API traffic plan.

The goal is to make backend promotion and rollback operationally useful for a real limited-beta audience without letting GitHub Actions move production traffic automatically.

## Implemented
- Added `scripts/write-vercel-api-traffic-command.mjs`.
- Added `pnpm api:traffic:vercel`.
- Added `.github/workflows/vercel-api-traffic-command.yml`.
- Added `docs/deployment/vercel-api-traffic.md`.
- Updated release, launch, and project-state docs to include the Vercel traffic command gate.

## Command Plan Behavior
The script writes a JSON artifact with:

- `provider: "vercel"`
- `component: "vercel-api-traffic-command"`
- `noDeploymentPerformed: true`
- `noTrafficMoved: true`
- Vercel project, optional scope, production domain, candidate deployment, and rollback deployment references
- required secret names, but never secret values
- exact Vercel CLI command strings for promotion and rollback
- manual-only disablement steps
- pre-execution checks, rollback triggers, and post-execution checks

## Validation
The script validates:

- target is `staging` or `production`
- action is `promote`, `rollback`, or `disable`
- Vercel deployment and production URLs use HTTPS and do not include credentials
- observation window is a positive integer
- project, scope, notes, and references do not contain secret-like values
- local API traffic plan JSON matches app, component, target, action, no-traffic boundary, and relevant URLs

Remote traffic plan references are allowed, but the artifact records that they were not inspected and requires operator comparison before execution.

## Boundaries
This phase does not:

- install or run Vercel CLI
- deploy API code
- promote a Vercel deployment
- roll back production
- change aliases, domains, routing middleware, or project protection
- read `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or `VERCEL_PROJECT_ID`
- run builds, tests, Expo exports, contract work, database provisioning, data imports, parity comparisons, or real traffic movement

## Next Steps
- Decide whether Vercel command execution belongs in a separate reviewer-protected workflow or should remain an operator workstation procedure.
- Add a guarded support export artifact for offline operator review before broadening beta invites.
- Finalize production PostgreSQL cutover execution only after schema/import/parity artifacts have been accepted with provider-owned access.
