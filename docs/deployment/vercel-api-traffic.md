# Pocket Vault Vercel API Traffic Command Plan

## Purpose
The Vercel API traffic command plan turns a reviewed provider-neutral API traffic plan into a Vercel-specific operator handoff.

It does not run Vercel CLI, deploy a backend, promote a deployment, roll back production, change domains, enable protection rules, or move traffic. It validates the public Vercel inputs, records the exact command an approved operator can run later, and uploads a review artifact.

## Files
- `scripts/write-vercel-api-traffic-command.mjs`
  - validates target, action, Vercel project reference, production domain, deployment URLs, observation window, and traffic plan evidence
  - inspects a runner-local API traffic plan JSON when a local path is provided
  - writes a Vercel-specific command plan artifact with `noDeploymentPerformed: true` and `noTrafficMoved: true`
  - emits an executable `vercel alias rm` command for reviewed disablement plans when `remove-alias` is selected
- `.github/workflows/vercel-api-traffic-command.yml`
  - manual staging or production workflow
  - supports `promote`, `rollback`, and `disable`
  - binds to the matching GitHub Environment
  - uploads the Vercel command plan artifact
- `scripts/execute-vercel-api-traffic.mjs`
  - reads a reviewed Vercel command plan artifact
  - runs the single planned `pnpm dlx vercel` promote, rollback, or alias-removal disablement command
  - checks `/health` and `/ready` on the production API domain after promotion or rollback
  - confirms `/health` and `/ready` are no longer healthy after disablement
  - writes a redacted traffic execution result artifact
- `.github/workflows/vercel-api-traffic-execute.yml`
  - approval-gated staging or production workflow
  - requires `confirm_execute=execute`
  - downloads the command plan artifact before moving traffic
- `package.json`
  - exposes `pnpm api:traffic:vercel`
  - exposes `pnpm api:traffic:vercel:execute`

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

Required for disable:

- `VERCEL_API_DISABLE_STRATEGY=remove-alias`

Optional:

- `VERCEL_SCOPE`
- `VERCEL_API_DISABLE_ALIAS_DOMAIN`
- `VERCEL_API_TRAFFIC_CHANGE_WINDOW`
- `VERCEL_API_TRAFFIC_OBSERVE_MINUTES`
- `VERCEL_API_TRAFFIC_OPERATOR`
- `VERCEL_API_TRAFFIC_NOTES`
- `VERCEL_API_TRAFFIC_DIR`

## Secret Boundary
The command-plan workflow does not need secrets because it does not execute Vercel CLI.

The generated artifact names the secrets required for later execution:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Do not place secret values in workflow inputs, labels, project references, scope, notes, URLs, or committed docs.

The execution workflow reads `VERCEL_TOKEN` only from the protected GitHub Environment. Execution artifacts record deployment URLs, health-check results, byte counts for command output, and git metadata, but never record token values.

The disablement path removes the alias for the public API domain with Vercel CLI. Vercel documents this command shape as `vercel alias rm [custom-domain] --yes`; the command plan derives the custom domain from `VERCEL_API_PRODUCTION_DOMAIN` unless `VERCEL_API_DISABLE_ALIAS_DOMAIN` is provided.

## Local Usage
Example promotion command plan:

```bash
VERCEL_API_TRAFFIC_TARGET=staging \
VERCEL_API_TRAFFIC_ACTION=promote \
VERCEL_API_TRAFFIC_LABEL=v0.1.0-rc.1 \
VERCEL_API_TRAFFIC_PLAN=./artifacts/pocket-vault-api-traffic-staging-promote-v0.1.0-rc.1.json \
VERCEL_API_PROJECT=pocket-vault-api \
VERCEL_API_CANDIDATE_DEPLOYMENT_URL=https://pocket-vault-api-git-rc-example.vercel.app \
VERCEL_API_ROLLBACK_DEPLOYMENT_URL=https://pocket-vault-api-previous-example.vercel.app \
VERCEL_API_PRODUCTION_DOMAIN=https://api.pocket-vault.example.com \
pnpm api:traffic:vercel
```

Example disable command plan:

```bash
VERCEL_API_TRAFFIC_TARGET=production \
VERCEL_API_TRAFFIC_ACTION=disable \
VERCEL_API_TRAFFIC_LABEL=incident-2026-04-28 \
VERCEL_API_TRAFFIC_PLAN=./artifacts/pocket-vault-api-traffic-production-disable-incident-2026-04-28.json \
VERCEL_API_PROJECT=pocket-vault-api \
VERCEL_API_PRODUCTION_DOMAIN=https://api.pocket-vault.example.com \
VERCEL_API_DISABLE_STRATEGY=remove-alias \
pnpm api:traffic:vercel
```

When `VERCEL_API_TRAFFIC_PLAN` is a local JSON file path, the script verifies:

- app is `pocket-vault`
- component is `api-traffic-plan`
- target matches
- action matches
- `noTrafficMoved` is `true`
- candidate URL matches for promotion
- rollback URL matches when provided
- current URL matches the production domain for disablement
- disable alias domain matches the production domain hostname when disablement is selected

When `VERCEL_API_TRAFFIC_PLAN` is a remote artifact reference, the script records that it was not inspected and requires operator comparison before execution.

## GitHub Command Plan Usage
Run the `Vercel API Traffic Command` workflow manually after the `API Traffic Plan` workflow.

Use `traffic_plan` as either:

- a downloaded runner-local JSON path when the artifact is already available inside the runner
- an artifact name or HTTPS URL when local inspection is not possible

The command-plan workflow only writes the command plan. It does not install Vercel CLI, call Vercel, read Vercel secrets, or change traffic.

For `disable`, choose `disable_strategy=remove-alias`. Leave `disable_alias_domain` empty unless the operator needs to pass the bare domain explicitly; if set, it must match the hostname in `production_domain`.

## GitHub Execution Usage
Run `Vercel API Traffic Execute` only after the command plan is reviewed.

Required execution inputs:

- `target`
- `execution_label`
- `command_plan_artifact`
- `command_plan_run_id`
- `production_domain`
- `confirm_execute=execute`

Execution supports `promote`, `rollback`, and `disable` command plans. Disable execution is limited to the explicit alias-removal policy generated by this repository.

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
- exact Vercel CLI alias removal command for `disable`
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
9. Execute the generated Vercel CLI command through `Vercel API Traffic Execute` or another approved operator environment.
10. Observe `/health`, `/ready`, indexer freshness, support intake, and product smoke checks for the planned observation window.
11. Record the final deployment and observation result with release notes.

## Rollback Sequence
Use this handoff during rollback:

1. Generate or retrieve the rollback API traffic plan.
2. Generate the Vercel rollback command plan.
3. Confirm the previous known-good deployment reference and rollback data snapshot.
4. Execute the generated rollback command through `Vercel API Traffic Execute` or another approved operator environment.
5. Check `/health` and `/ready`.
6. Restore API data only from the approved rollback snapshot and only while the affected API process is stopped.
7. Record the incident reason, restored deployment, and follow-up owner.

## Disablement Boundary
The `disable` action supports one provider-specific policy: remove the public API alias from the selected Vercel project.

Disablement sequence:

1. Generate a provider-neutral API traffic plan with `API_TRAFFIC_ACTION=disable` and `API_TRAFFIC_CURRENT_URL` set to the public API domain.
2. Generate the Vercel command plan with `VERCEL_API_TRAFFIC_ACTION=disable` and `VERCEL_API_DISABLE_STRATEGY=remove-alias`.
3. Review that the command is `pnpm dlx vercel alias rm <api-domain> --yes --token "$VERCEL_TOKEN"` with the expected optional scope.
4. Execute through `Vercel API Traffic Execute` with `confirm_execute=execute`.
5. Confirm the execution artifact records `publicTrafficDisabled: true` and that `/health` plus `/ready` are no longer healthy on the disabled public API domain.
6. Preserve release, traffic, data snapshot, support, and execution artifacts for incident review.

Re-enable by generating a new promotion or rollback plan that points the API domain to an accepted deployment. Do not reattach the alias ad hoc without a matching traffic artifact.
