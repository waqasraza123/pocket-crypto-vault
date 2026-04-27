# Goal Vault API Traffic Plan

## Purpose
The API traffic plan records exactly how an operator intends to promote, roll back, or disable public API traffic.

It is not a deployment workflow. It does not deploy images, update DNS, change load balancers, mutate hosting provider settings, restore data, or move traffic. It validates the non-secret inputs needed for a backend traffic change and writes a JSON artifact that can be reviewed before any provider-specific action.

## Files
- `scripts/write-api-traffic-plan.mjs`
  - validates target, action, HTTPS API URLs, image tags, required artifact references, and observation window
  - writes a provider-neutral JSON traffic plan
  - emits the plan path for GitHub artifact upload
- `.github/workflows/api-traffic-plan.yml`
  - manual staging or production workflow
  - supports `promote`, `rollback`, and `disable`
  - binds to the matching GitHub Environment
  - uploads the traffic plan artifact
- `package.json`
  - exposes `pnpm api:traffic:plan`
- `docs/deployment/api-managed-database-plan.md`
  - records the managed database cutover plan when API persistence is moving away from SQLite
- `docs/deployment/api-managed-database-schema.md`
  - records the PostgreSQL schema artifact when API persistence is moving away from SQLite
- `docs/deployment/api-managed-database-export.md`
  - records the SQLite snapshot to JSONL handoff bundle when API persistence is moving away from SQLite
- `docs/deployment/api-managed-database-import-plan.md`
  - records the PostgreSQL import SQL handoff when API persistence is moving away from SQLite
- `docs/deployment/api-managed-database-parity.md`
  - records the parity checks that must pass before managed-database traffic movement

## Actions
### Promote
Use `promote` when a candidate API host or image is ready for manual traffic movement.

Required inputs:

- `API_TRAFFIC_TARGET`
- `API_TRAFFIC_ACTION=promote`
- `API_TRAFFIC_PLAN_LABEL`
- `API_TRAFFIC_CANDIDATE_URL`
- `API_TRAFFIC_ROLLBACK_URL`
- `API_TRAFFIC_API_IMAGE`
- `API_TRAFFIC_ROLLBACK_API_IMAGE`
- `API_TRAFFIC_RELEASE_MANIFEST`
- `API_TRAFFIC_PREFLIGHT_REPORT`
- `API_TRAFFIC_DATA_SNAPSHOT`

The script requires a rollback URL, rollback image, passing preflight reference, release manifest reference, and data snapshot reference before writing a promotion plan.

### Rollback
Use `rollback` when public API traffic needs to return to the previous known-good backend.

Required inputs:

- `API_TRAFFIC_TARGET`
- `API_TRAFFIC_ACTION=rollback`
- `API_TRAFFIC_PLAN_LABEL`
- `API_TRAFFIC_ROLLBACK_URL`
- `API_TRAFFIC_ROLLBACK_API_IMAGE`

Optional inputs can record the current broken URL, release manifest, preflight report, and data snapshot reference.

### Disable
Use `disable` when public API traffic must be stopped while the app stays honest about degraded backend state.

Required inputs:

- `API_TRAFFIC_TARGET`
- `API_TRAFFIC_ACTION=disable`
- `API_TRAFFIC_PLAN_LABEL`
- `API_TRAFFIC_CURRENT_URL`

## Local Usage
Example promotion plan:

```bash
API_TRAFFIC_TARGET=staging \
API_TRAFFIC_ACTION=promote \
API_TRAFFIC_PLAN_LABEL=v0.1.0-rc.1 \
API_TRAFFIC_CANDIDATE_URL=https://candidate-api.example.com \
API_TRAFFIC_ROLLBACK_URL=https://previous-api.example.com \
API_TRAFFIC_API_IMAGE=ghcr.io/example/goal-vault-api:staging-abc123 \
API_TRAFFIC_ROLLBACK_API_IMAGE=ghcr.io/example/goal-vault-api:staging-previous \
API_TRAFFIC_RELEASE_MANIFEST=goal-vault-release-staging-v0.1.0-rc.1 \
API_TRAFFIC_PREFLIGHT_REPORT=goal-vault-api-preflight-staging \
API_TRAFFIC_DATA_SNAPSHOT=goal-vault-api-data-snapshot-staging-20260427 \
pnpm api:traffic:plan
```

## GitHub Workflow Usage
Run the `API Traffic Plan` workflow manually:

- `target`: `staging` or `production`
- `action`: `promote`, `rollback`, or `disable`
- `plan_label`: stable label for artifact naming

The workflow does not need secrets. All inputs are public operational references or non-secret artifact names.

## Artifact Contents
The traffic plan records:

- target environment
- action
- plan label
- generated timestamp
- current, candidate, and rollback API URLs
- candidate and rollback API image references
- release manifest, preflight report, and data snapshot references
- change window, observation minutes, operator, and notes
- action-specific execution steps
- rollback trigger conditions
- rollback execution steps
- Git commit, ref, and workflow run metadata
- `noTrafficMoved: true`

## Promotion Sequence
Use the traffic plan after the supporting artifacts exist:

1. Run release-candidate verification.
2. Run API preflight.
3. Build and publish the API image.
4. Create an API data snapshot.
5. Generate the managed database plan when persistence is changing.
6. Generate the managed database schema bundle when persistence is changing.
7. Generate the managed database export bundle when persistence is changing.
8. Generate the managed database import plan when persistence is changing.
9. Import data through the selected provider or future migration tool when persistence is changing.
10. Generate the managed database parity plan when persistence is changing.
11. Generate the release manifest.
12. Generate the API traffic plan.
13. Review the plan with the operator who owns the hosting provider.
14. Move traffic manually in the selected hosting provider.
15. Observe `/health`, `/ready`, indexer freshness, and product smoke checks for the planned observation window.

## Rollback Sequence
Use the plan during rollback:

1. Stop or pause active traffic promotion.
2. Route public API traffic back to the rollback URL or redeploy the rollback image.
3. Check rollback `/health` and `/ready`.
4. Restore API data only from the planned snapshot and only while the API is stopped.
5. Record the rollback reason, restored URL, restored image, and data handling notes.

## Boundary
This phase creates a reviewable traffic-change record. Provider-specific traffic shifting, deployment automation, DNS changes, managed database promotion, and automated rollback remain deferred until the hosting provider and traffic policy are selected.
