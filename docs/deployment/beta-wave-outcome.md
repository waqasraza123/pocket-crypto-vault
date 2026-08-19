# Pocket Vault Beta Wave Outcome Report

## Purpose
The beta wave outcome report records aggregate results after a limited-beta invitation wave and decides whether the next step is `continue`, `pause`, `rollback`, or `disable`.

It does not send invites, deploy infrastructure, mutate a database, move traffic, run chain transactions, or record participant PII. It validates the approved invitation wave plan, post-wave observation report, aggregate counts, support reference, incident owner, and incident reference rules before operators approve another wave or recovery action.

## Files
- `scripts/write-beta-wave-outcome-report.mjs`
  - validates target, outcome label, decision, observation status, invitation wave plan, observation report, aggregate counts, support reference, incident owner, and confirmation
  - inspects runner-local invitation wave and production observation JSON artifacts when paths are provided
  - blocks `continue` unless observation evidence is stable and incident count is zero
  - requires an incident reference for rollback, disable, incident observation, or non-zero incident count
  - writes a JSON outcome report with aggregate counts, evidence summaries, acceptance gates, next actions, and git metadata
- `.github/workflows/beta-wave-outcome-report.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - requires `confirm_report=report`
  - uploads the beta wave outcome report artifact
- `package.json`
  - exposes `pnpm beta:wave:outcome`

## Required Inputs
- `BETA_WAVE_OUTCOME_TARGET`
  - `staging` or `production`
- `BETA_WAVE_OUTCOME_LABEL`
- `BETA_WAVE_OUTCOME_DECISION`
  - `continue`, `pause`, `rollback`, or `disable`
- `BETA_WAVE_OUTCOME_OBSERVATION_STATUS`
  - `stable`, `degraded`, or `incident`
- `BETA_WAVE_OUTCOME_INVITATION_WAVE_PLAN`
- `BETA_WAVE_OUTCOME_OBSERVATION_REPORT`
- `BETA_WAVE_OUTCOME_INVITED_COUNT`
- `BETA_WAVE_OUTCOME_SUPPORT_REFERENCE`
- `BETA_WAVE_OUTCOME_INCIDENT_OWNER`
- `BETA_WAVE_OUTCOME_CONFIRM_REPORT=report`

Aggregate signal inputs:

- `BETA_WAVE_OUTCOME_ACTIVATED_WALLET_COUNT`
- `BETA_WAVE_OUTCOME_VAULT_CREATED_COUNT`
- `BETA_WAVE_OUTCOME_DEPOSIT_COUNT`
- `BETA_WAVE_OUTCOME_WITHDRAW_COUNT`
- `BETA_WAVE_OUTCOME_SUPPORT_REQUEST_COUNT`
- `BETA_WAVE_OUTCOME_FAILED_TRANSACTION_COUNT`
- `BETA_WAVE_OUTCOME_INCIDENT_COUNT`
- `BETA_WAVE_OUTCOME_PARTICIPANT_IDENTIFIERS_RECORDED`
  - must be `false`

Optional inputs:

- `BETA_WAVE_OUTCOME_INCIDENT_REFERENCE`
  - required for rollback, disable, incident observation, or non-zero incident count
- `BETA_WAVE_OUTCOME_OPERATOR`
- `BETA_WAVE_OUTCOME_NOTES`
- `BETA_WAVE_OUTCOME_DIR`

## Decision Rules
Use `continue` only when:

- post-wave observation status is `stable`
- locally inspected observation has healthy `/health` and `/ready`
- locally inspected observation has healthy indexer status
- locally inspected observation has non-blocked support
- locally inspected observation has non-degraded analytics
- locally inspected observation has within-budget errors
- incident count is zero

Use `pause` when support, failed transactions, analytics, or indexer signals need review before another wave.

Use `rollback` or `disable` only with an incident reference and the approved recovery artifacts from the launch runbooks.

## Evidence Checks
When local JSON artifact paths are provided, the script validates:

- invitation wave artifact target, component, approval status, non-sending boundary, wave size, participant limit, support reference, incident owner, invite owner, and no participant identifiers
- post-wave observation artifact target, component, observation status, health, readiness, support reference, incident owner, and operational signals
- invited count does not exceed the approved wave size
- activated wallet count does not exceed invited count
- support reference and incident owner match inspected wave and observation evidence

Remote artifact names and URLs remain valid references but are recorded as not locally inspected. Operators must compare them before approving the outcome decision.

## PII Boundary
Do not put participant names, emails, phone numbers, wallet addresses, social handles, invite links, contact details, private support text, or transaction-level participant traces in the outcome report, workflow inputs, notes, committed docs, or release notes.

Only aggregate counts belong in this artifact. Participant-level follow-up belongs in approved private operational systems.

## Local Usage
Example continue report:

```bash
BETA_WAVE_OUTCOME_TARGET=production \
BETA_WAVE_OUTCOME_LABEL=v1-wave-1 \
BETA_WAVE_OUTCOME_DECISION=continue \
BETA_WAVE_OUTCOME_OBSERVATION_STATUS=stable \
BETA_WAVE_OUTCOME_INVITATION_WAVE_PLAN=./artifacts/beta-invitation-wave.json \
BETA_WAVE_OUTCOME_OBSERVATION_REPORT=./artifacts/production-observation-wave-1.json \
BETA_WAVE_OUTCOME_INVITED_COUNT=5 \
BETA_WAVE_OUTCOME_ACTIVATED_WALLET_COUNT=3 \
BETA_WAVE_OUTCOME_VAULT_CREATED_COUNT=2 \
BETA_WAVE_OUTCOME_DEPOSIT_COUNT=2 \
BETA_WAVE_OUTCOME_WITHDRAW_COUNT=0 \
BETA_WAVE_OUTCOME_SUPPORT_REQUEST_COUNT=0 \
BETA_WAVE_OUTCOME_FAILED_TRANSACTION_COUNT=0 \
BETA_WAVE_OUTCOME_INCIDENT_COUNT=0 \
BETA_WAVE_OUTCOME_PARTICIPANT_IDENTIFIERS_RECORDED=false \
BETA_WAVE_OUTCOME_SUPPORT_REFERENCE=/support \
BETA_WAVE_OUTCOME_INCIDENT_OWNER=operations \
BETA_WAVE_OUTCOME_CONFIRM_REPORT=report \
pnpm beta:wave:outcome
```

## GitHub Usage
1. Run `Beta Wave Outcome Report`.
2. Select `staging` or `production`.
3. Provide the invitation wave plan, post-wave observation report, aggregate counts, decision, support reference, and incident owner.
4. Set `confirm_report` to `report`.
5. Download the uploaded outcome report artifact.
6. Approve the next wave only when the decision is `continue`.

## Boundary
This report records the outcome decision; it does not send follow-up messages or execute recovery actions. Rollback and disablement must still use their approved traffic, database, and incident procedures.
