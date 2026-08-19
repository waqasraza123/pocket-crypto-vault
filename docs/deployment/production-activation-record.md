# Pocket Vault Production Activation Record

## Purpose
The production activation record is the final non-mutating evidence bundle after a controlled production cutover or rollback decision.

It does not deploy infrastructure, mutate a database, move traffic, submit mobile builds, run chain transactions, or invite users. It validates and records that the release manifest, preflight, managed database execution evidence, traffic movement evidence, production smoke result, beta readiness, snapshots, support path, and incident owner are coherent before operators treat the activation as accepted.

## Files
- `scripts/write-production-activation-record.mjs`
  - validates target, label, activation outcome, persistence driver, observation window, support reference, and incident owner
  - inspects runner-local release, preflight, traffic, Vercel execution, managed database execution, smoke, and beta readiness JSON artifacts when paths are provided
  - requires PostgreSQL runtime, schema apply, import execution, and parity execution evidence when `PRODUCTION_ACTIVATION_PERSISTENCE_DRIVER=postgresql`
  - writes a JSON activation record with acceptance gates, next steps, artifact references, redacted evidence summaries, and git metadata
- `.github/workflows/production-activation-record.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - requires `confirm_record=record`
  - uploads the activation record artifact
- `package.json`
  - exposes `pnpm production:activation:record`

## Required Inputs
- `PRODUCTION_ACTIVATION_TARGET`
  - `staging` or `production`
- `PRODUCTION_ACTIVATION_LABEL`
  - stable activation label
- `PRODUCTION_ACTIVATION_OUTCOME`
  - `accepted`, `rolled-back`, or `disabled`
  - defaults to `accepted`
- `PRODUCTION_ACTIVATION_PERSISTENCE_DRIVER`
  - `sqlite` or `postgresql`
  - defaults to `postgresql`
- `PRODUCTION_ACTIVATION_RELEASE_MANIFEST`
- `PRODUCTION_ACTIVATION_PREFLIGHT_REPORT`
- `PRODUCTION_ACTIVATION_TRAFFIC_PLAN`
- `PRODUCTION_ACTIVATION_TRAFFIC_EXECUTION`
- `PRODUCTION_ACTIVATION_SMOKE_RESULT`
- `PRODUCTION_ACTIVATION_BETA_READINESS`
- `PRODUCTION_ACTIVATION_SOURCE_SNAPSHOT`
- `PRODUCTION_ACTIVATION_ROLLBACK_SNAPSHOT`
- `PRODUCTION_ACTIVATION_SUPPORT_REFERENCE`
- `PRODUCTION_ACTIVATION_INCIDENT_OWNER`
- `PRODUCTION_ACTIVATION_CONFIRM_RECORD=record`

Required when persistence driver is `postgresql`:

- `PRODUCTION_ACTIVATION_DATABASE_RUNTIME_PLAN`
- `PRODUCTION_ACTIVATION_SCHEMA_EXECUTION`
- `PRODUCTION_ACTIVATION_IMPORT_EXECUTION`
- `PRODUCTION_ACTIVATION_PARITY_EXECUTION`

Optional inputs:

- `PRODUCTION_ACTIVATION_CHANGE_WINDOW`
- `PRODUCTION_ACTIVATION_OBSERVE_MINUTES`
- `PRODUCTION_ACTIVATION_OPERATOR`
- `PRODUCTION_ACTIVATION_NOTES`
- `PRODUCTION_ACTIVATION_DIR`

## Evidence Checks
When artifact references point to local JSON files, the script validates:

- release manifest target, app URL, API URL, API image, and rollback image
- API preflight target, valid status, persistence driver, runtime readiness, PostgreSQL connection/schema checks, and production limited-beta activation gate
- managed database runtime plan target, cutover mode, PostgreSQL persistence target, release reference, preflight reference, and traffic plan reference
- managed database schema apply, import execution, and parity execution result components plus completion flags
- provider-neutral traffic plan target, promote action, candidate URL, rollback URL, image alignment, release reference, and preflight reference
- Vercel traffic execution target, promote action, moved-traffic marker, `/health`, and `/ready`
- production smoke target, `/health`, `/ready`, wallet, vault, create, deposit, support, dashboard, detail, activity, indexer, and metadata evidence
- beta readiness target, ready status, persistence driver, participant limit, per-vault USDC guidance, support reference, and incident owner

Remote URLs and artifact names remain valid references but are recorded as not locally inspected. Operators must review them before accepting the activation.

## Secret Boundary
Do not place RPC URLs, `API_DATABASE_URL`, internal API tokens, wallet project secrets, private keys, EAS tokens, Vercel tokens, or provider credentials in activation inputs.

The script rejects obvious credential strings and PostgreSQL connection strings. Activation records should contain artifact names, storage references, URLs that do not embed credentials, owner labels, and redacted evidence only.

## Local Usage
Example production acceptance record:

```bash
PRODUCTION_ACTIVATION_TARGET=production \
PRODUCTION_ACTIVATION_LABEL=v1-limited-beta \
PRODUCTION_ACTIVATION_OUTCOME=accepted \
PRODUCTION_ACTIVATION_PERSISTENCE_DRIVER=postgresql \
PRODUCTION_ACTIVATION_RELEASE_MANIFEST=./artifacts/release.json \
PRODUCTION_ACTIVATION_PREFLIGHT_REPORT=./artifacts/preflight.json \
PRODUCTION_ACTIVATION_DATABASE_RUNTIME_PLAN=./artifacts/database-runtime-plan.json \
PRODUCTION_ACTIVATION_SCHEMA_EXECUTION=./artifacts/schema-apply.json \
PRODUCTION_ACTIVATION_IMPORT_EXECUTION=./artifacts/import-execute.json \
PRODUCTION_ACTIVATION_PARITY_EXECUTION=./artifacts/parity-execute.json \
PRODUCTION_ACTIVATION_TRAFFIC_PLAN=./artifacts/traffic-plan.json \
PRODUCTION_ACTIVATION_TRAFFIC_EXECUTION=./artifacts/vercel-traffic-execute.json \
PRODUCTION_ACTIVATION_SMOKE_RESULT=./artifacts/production-smoke.json \
PRODUCTION_ACTIVATION_BETA_READINESS=./artifacts/beta-readiness.json \
PRODUCTION_ACTIVATION_SOURCE_SNAPSHOT=approved-source-snapshot-reference \
PRODUCTION_ACTIVATION_ROLLBACK_SNAPSHOT=approved-rollback-snapshot-reference \
PRODUCTION_ACTIVATION_SUPPORT_REFERENCE=/support \
PRODUCTION_ACTIVATION_INCIDENT_OWNER=operations \
PRODUCTION_ACTIVATION_CONFIRM_RECORD=record \
pnpm production:activation:record
```

## GitHub Usage
1. Run `Production Activation Record`.
2. Select `staging` or `production`.
3. Provide release, preflight, managed database execution, traffic execution, smoke, readiness, snapshot, support, and owner references.
4. Set `confirm_record` to `record`.
5. Download the uploaded activation record artifact.
6. Store it with release evidence before expanding beta invitations.

## Boundary
This record is not the cutover itself. It is the acceptance artifact after the guarded workflows and operator checks have already produced evidence. A missing or failed activation record should stop beta expansion until the inconsistent evidence is fixed or a rollback/disablement record is created.
