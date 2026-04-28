# Pocket Vault Beta Readiness

## Purpose
The beta readiness plan is the final provider-neutral review artifact before inviting real users to a limited Pocket Vault beta.

It does not deploy infrastructure, mutate a database, move traffic, send invites, run chain transactions, or submit mobile builds. It validates that the release, API preflight, traffic plan, persistence cutover evidence, rollback references, support path, and audience limits are coherent before an operator starts a real-world beta.

## Files
- `scripts/write-beta-readiness-plan.mjs`
  - validates beta target and persistence driver
  - inspects local release, preflight, traffic, and managed database runtime JSON artifacts when paths are provided
  - requires PostgreSQL runtime evidence when `BETA_READINESS_PERSISTENCE_DRIVER=postgresql`
  - requires protected smoke evidence and production activation gates for production beta readiness
  - records participant limits, per-vault USDC limit, support reference, incident owner, launch steps, and rollback steps
  - writes a JSON readiness plan
- `.github/workflows/beta-readiness-plan.yml`
  - manual staging or production workflow
  - uploads the beta readiness plan artifact
- `package.json`
  - exposes `pnpm beta:readiness`

## Required Inputs
- `BETA_READINESS_TARGET`
  - `staging` or `production`
- `BETA_READINESS_LABEL`
  - stable readiness label
- `BETA_READINESS_PERSISTENCE_DRIVER`
  - `sqlite` or `postgresql`
  - defaults to `postgresql`
- `BETA_READINESS_RELEASE_MANIFEST`
- `BETA_READINESS_PREFLIGHT_REPORT`
- `BETA_READINESS_TRAFFIC_PLAN`
- `BETA_READINESS_DATABASE_RUNTIME_PLAN`
  - required when persistence driver is `postgresql`
- `BETA_READINESS_SMOKE_RESULT`
- `BETA_READINESS_SOURCE_SNAPSHOT`
- `BETA_READINESS_ROLLBACK_SNAPSHOT`
- `BETA_READINESS_PARTICIPANT_LIMIT`
- `BETA_READINESS_MAX_VAULT_USDC`
- `BETA_READINESS_SUPPORT_REFERENCE`
- `BETA_READINESS_INCIDENT_OWNER`

Optional inputs:

- `BETA_READINESS_CHANGE_WINDOW`
- `BETA_READINESS_OBSERVE_MINUTES`
- `BETA_READINESS_OPERATOR`
- `BETA_READINESS_NOTES`
- `BETA_READINESS_DIR`

## Evidence Checks
When artifact references point to local JSON files, the script validates:

- release manifest target, URLs, API image, and rollback image
- API preflight target, valid status, persistence driver, runtime readiness, and PostgreSQL connection/schema status when selected
- API preflight production activation status and `safeForLimitedBetaTraffic` for production
- traffic plan target, promote action, candidate URL, rollback URL, image alignment, release manifest reference, and preflight reference
- managed database runtime plan target, cutover mode, PostgreSQL persistence target, release reference, preflight reference, and traffic plan reference
- protected smoke target, `/health`, `/ready`, wallet, vault, create, deposit, support, dashboard, detail, activity, indexer, and metadata evidence
- `/support` references require local API preflight evidence with support intake enabled

Remote URLs and artifact names remain valid references but are recorded as not locally inspected. Operators must review them before launch.

## Beta Limits
The readiness plan records:

- maximum participant count
- maximum recommended USDC per vault
- support or escalation reference
- incident owner
- observation window
- launch steps
- rollback steps

These limits are operational controls, not smart contract limits. They should be communicated to invited beta users before they use real USDC.

The preferred support reference for app users is `/support` when the deployed API has `API_ENABLE_SUPPORT=true`. If the API route is intentionally disabled, the readiness plan must point to another operator-owned support channel.

## Secret Boundary
Do not place RPC URLs, `API_DATABASE_URL`, internal API tokens, wallet project secrets, private keys, EAS tokens, or provider credentials in the beta readiness inputs.

The script rejects obvious credential strings and connection strings. Artifact reports should keep using redacted configured or missing fields.

## Usage
Local:

```bash
pnpm beta:readiness
```

GitHub:

1. Run `Beta Readiness Plan`.
2. Select `staging` or `production`.
3. Provide release, preflight, traffic, runtime, snapshot, support, and audience-limit references.
4. Download the uploaded readiness artifact.
5. Review it with the operator and incident owner before sending beta invites.

## Boundary
This gate does not make the product safe by itself. It ensures the operational evidence is assembled before a limited beta. Real launch still depends on provider deployment, traffic movement, support readiness, participant communication, and manual rollback discipline.
