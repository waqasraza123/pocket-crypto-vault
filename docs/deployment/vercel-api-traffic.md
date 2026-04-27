# Goal Vault Vercel API Traffic Command Plan

## Purpose
The Vercel API traffic command plan turns a reviewed provider-neutral API traffic plan into a Vercel-specific operator handoff.

It does not run Vercel CLI, deploy a backend, promote a deployment, roll back production, change domains, enable protection rules, or move traffic. It validates the public Vercel inputs, records the exact command an approved operator can run later, and uploads a review artifact.

## Files
- `scripts/write-vercel-api-traffic-command.mjs`
  - validates target, action, Vercel project reference, production domain, deployment URLs, observation window, and traffic plan evidence
  - inspects a runner-local API traffic plan JSON when a local path is provided
  - writes a Vercel-specific command plan artifact with `noDeploymentPerformed: true` and `noTrafficMoved: true`
- `.github/workflows/vercel-api-traffic-command.yml`
  - manual staging or production workflow
  - supports `promote`, `rollback`, and `disable`
  - binds to the matching GitHub Environment
  - uploads the Vercel command plan artifact
- `package.json`
  - exposes `pnpm api:traffic:vercel`

## Inputs
Required for every action:

- `VERCEL_API_TRAFFIC_TARGET`
- `VERCEL_API_TRAFFIC_ACTION`
- `VERCEL_API_TRAFFIC_LABEL`
- `VERCEL_API_TRAFFIC_PLAN`
- `VERCEL_API_PROJECT`
- `VERCEL_API_PRODUCTION_DOMAIN`

Required for promotion:

- `VERCEL_API_CANDIDATE_DEPLOYMENT_URL`
- `VERCEL_API_ROLLBACK_DEPLOYMENT_URL`

Required for rollback:

- `VERCEL_API_ROLLBACK_DEPLOYMENT_URL`

Optional:

- `VERCEL_SCOPE`
- `VERCEL_API_TRAFFIC_CHANGE_WINDOW`
- `VERCEL_API_TRAFFIC_OBSERVE_MINUTES`
- `VERCEL_API_TRAFFIC_OPERATOR`
- `VERCEL_API_TRAFFIC_NOTES`
- `VERCEL_API_TRAFFIC_DIR`

## Secret Boundary
The workflow does not need secrets because it does not execute Vercel CLI.

The generated artifact names the secrets required for later execution:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Do not place secret values in workflow inputs, labels, project references, scope, notes, URLs, or committed docs.

## Local Usage
Example promotion command plan:

```bash
VERCEL_API_TRAFFIC_TARGET=staging \
VERCEL_API_TRAFFIC_ACTION=promote \
VERCEL_API_TRAFFIC_LABEL=v0.1.0-rc.1 \
VERCEL_API_TRAFFIC_PLAN=./artifacts/goal-vault-api-traffic-staging-promote-v0.1.0-rc.1.json \
VERCEL_API_PROJECT=goal-vault-api \
VERCEL_API_CANDIDATE_DEPLOYMENT_URL=https://goal-vault-api-git-rc-example.vercel.app \
VERCEL_API_ROLLBACK_DEPLOYMENT_URL=https://goal-vault-api-previous-example.vercel.app \
VERCEL_API_PRODUCTION_DOMAIN=https://api.goal-vault.example.com \
pnpm api:traffic:vercel
```

When `VERCEL_API_TRAFFIC_PLAN` is a local JSON file path, the script verifies:

- app is `goal-vault`
- component is `api-traffic-plan`
- target matches
- action matches
- `noTrafficMoved` is `true`
- candidate URL matches for promotion
- rollback URL matches when provided
- current URL matches the production domain for disablement

When `VERCEL_API_TRAFFIC_PLAN` is a remote artifact reference, the script records that it was not inspected and requires operator comparison before execution.

## GitHub Workflow Usage
Run the `Vercel API Traffic Command` workflow manually after the `API Traffic Plan` workflow.

Use `traffic_plan` as either:

- a downloaded runner-local JSON path when the artifact is already available inside the runner
- an artifact name or HTTPS URL when local inspection is not possible

The workflow only writes the command plan. It does not install Vercel CLI, call Vercel, read Vercel secrets, or change traffic.

## Artifact Contents
The command plan records:

- target environment
- action
- Vercel provider marker
- Vercel project and optional scope
- production API domain
- candidate deployment URL
- rollback deployment URL
- traffic plan reference and validation result
- required secret names for later execution
- pre-execution checks
- exact Vercel CLI command strings for `promote` and `rollback`
- manual disablement steps for `disable`
- rollback triggers
- post-execution checks
- Git commit, ref, and workflow run metadata
- `noDeploymentPerformed: true`
- `noTrafficMoved: true`

## Promotion Sequence
Use this handoff after provider-neutral release artifacts exist:

1. Run release-candidate verification.
2. Run API preflight.
3. Build and publish the API image.
4. Create an API data snapshot.
5. Generate the release manifest.
6. Generate the API traffic plan.
7. Generate the Vercel API traffic command plan.
8. Review the Vercel project, team scope, production domain, candidate deployment, rollback deployment, and required secret names.
9. Execute the generated Vercel CLI command only from an approved operator environment.
10. Observe `/health`, `/ready`, indexer freshness, support intake, and product smoke checks for the planned observation window.
11. Record the final deployment and observation result with release notes.

## Rollback Sequence
Use this handoff during rollback:

1. Generate or retrieve the rollback API traffic plan.
2. Generate the Vercel rollback command plan.
3. Confirm the previous known-good deployment reference and rollback data snapshot.
4. Execute the generated rollback command only from an approved operator environment.
5. Check `/health` and `/ready`.
6. Restore API data only from the approved rollback snapshot and only while the affected API process is stopped.
7. Record the incident reason, restored deployment, and follow-up owner.

## Disablement Boundary
The `disable` action intentionally emits no Vercel CLI command. Public API disablement depends on the selected project routing policy, such as removing an alias, enabling project protection, changing routing middleware, or applying a platform access control.

The artifact records manual-only steps so the incident operator can prove the disablement was intentional and reversible without pretending the repository owns the provider policy.
