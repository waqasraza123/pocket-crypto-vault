# Pocket Vault Beta Expansion Decision Report

## Purpose
The beta expansion decision report records whether operators should expand the limited beta, hold expansion, roll back, or disable access after reviewing the latest wave outcome and data-handling readiness.

It does not send invites, deploy infrastructure, mutate a database, move traffic, run chain transactions, read live data, or record participant PII. It validates the latest beta wave outcome, beta data retention plan, aggregate capacity signals, support readiness, privacy readiness, incident ownership, and participant limits before another invitation wave is approved.

## Files
- `scripts/write-beta-expansion-decision-report.mjs`
  - validates target, label, decision, latest wave outcome, retention plan, participant counts, support backlog, operator capacity, review approvals, support reference, incident owner, and confirmation
  - inspects runner-local beta wave outcome and beta data retention JSON artifacts when paths are provided
  - blocks expansion when participant limits, support backlog, failed transaction, incident, retention, support, privacy, or capacity gates are not accepted
  - writes a JSON expansion decision report with capacity signals, review decisions, evidence summaries, acceptance gates, next actions, and git metadata
- `.github/workflows/beta-expansion-decision-report.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - requires `confirm_report=report`
  - uploads the beta expansion decision report artifact
- `package.json`
  - exposes `pnpm beta:expansion:decision`

## Required Inputs
- `BETA_EXPANSION_TARGET`
  - `staging` or `production`
- `BETA_EXPANSION_LABEL`
- `BETA_EXPANSION_DECISION`
  - `expand`, `hold`, `rollback`, or `disable`
- `BETA_EXPANSION_LATEST_WAVE_OUTCOME`
- `BETA_EXPANSION_RETENTION_PLAN`
- `BETA_EXPANSION_CURRENT_PARTICIPANT_COUNT`
- `BETA_EXPANSION_NEXT_WAVE_SIZE`
- `BETA_EXPANSION_PARTICIPANT_LIMIT`
- `BETA_EXPANSION_SUPPORT_BACKLOG_STATUS`
  - `clear`, `watch`, or `blocked`
- `BETA_EXPANSION_OPERATOR_CAPACITY_STATUS`
  - `ready`, `constrained`, or `blocked`
- `BETA_EXPANSION_RETENTION_REVIEW_ACCEPTED`
- `BETA_EXPANSION_SUPPORT_REVIEW_ACCEPTED`
- `BETA_EXPANSION_PRIVACY_REVIEW_ACCEPTED`
- `BETA_EXPANSION_PARTICIPANT_IDENTIFIERS_RECORDED`
  - must be `false`
- `BETA_EXPANSION_SUPPORT_REFERENCE`
- `BETA_EXPANSION_INCIDENT_OWNER`
- `BETA_EXPANSION_OWNER`
- `BETA_EXPANSION_CONFIRM_REPORT=report`

Aggregate signal inputs:

- `BETA_EXPANSION_OPEN_SUPPORT_REQUEST_COUNT`
- `BETA_EXPANSION_UNRESOLVED_INCIDENT_COUNT`
- `BETA_EXPANSION_FAILED_TRANSACTION_COUNT`

Optional inputs:

- `BETA_EXPANSION_INCIDENT_REFERENCE`
  - required for rollback, disable, or unresolved incidents
- `BETA_EXPANSION_OPERATOR`
- `BETA_EXPANSION_NOTES`
- `BETA_EXPANSION_DIR`

## Expansion Gate
Use `BETA_EXPANSION_DECISION=expand` only when:

- latest wave outcome decision is `continue` when locally inspected
- latest wave observation status is `stable` when locally inspected
- projected participant count does not exceed the approved participant limit
- open support request count is zero
- unresolved incident count is zero
- failed transaction count is zero
- support backlog status is `clear`
- operator capacity status is `ready`
- retention review is accepted
- support review is accepted
- privacy review is accepted
- participant identifiers are not recorded

Use `hold` when expansion needs more support, privacy, retention, operator, or product review.

Use `rollback` or `disable` only with an incident reference and the approved recovery artifacts from the launch runbooks.

## Evidence Checks
When local JSON artifact paths are provided, the script validates:

- beta wave outcome target, component, non-sending boundary, non-PII boundary, support reference, incident owner, decision, observation status, and aggregate counts
- beta data retention target, component, planning-only boundary, non-committable boundary, policy owner, support owner, incident owner, and review cadence
- support reference and incident owner match the latest wave outcome when inspected
- projected participant count stays within the approved participant limit

Remote artifact names and URLs remain valid references but are recorded as not locally inspected. Operators must compare them before approving expansion.

## PII Boundary
Do not put participant names, emails, phone numbers, wallet addresses, social handles, invite links, contact details, private support text, or participant-level transaction traces in the expansion report, workflow inputs, notes, committed docs, or release notes.

Only aggregate counts and non-secret operational references belong in this artifact.

## Local Usage
Example expansion decision:

```bash
BETA_EXPANSION_TARGET=production \
BETA_EXPANSION_LABEL=v1-expand-wave-2 \
BETA_EXPANSION_DECISION=expand \
BETA_EXPANSION_LATEST_WAVE_OUTCOME=./artifacts/beta-wave-outcome.json \
BETA_EXPANSION_RETENTION_PLAN=./artifacts/beta-data-retention.json \
BETA_EXPANSION_CURRENT_PARTICIPANT_COUNT=5 \
BETA_EXPANSION_NEXT_WAVE_SIZE=5 \
BETA_EXPANSION_PARTICIPANT_LIMIT=10 \
BETA_EXPANSION_OPEN_SUPPORT_REQUEST_COUNT=0 \
BETA_EXPANSION_UNRESOLVED_INCIDENT_COUNT=0 \
BETA_EXPANSION_FAILED_TRANSACTION_COUNT=0 \
BETA_EXPANSION_SUPPORT_BACKLOG_STATUS=clear \
BETA_EXPANSION_OPERATOR_CAPACITY_STATUS=ready \
BETA_EXPANSION_RETENTION_REVIEW_ACCEPTED=true \
BETA_EXPANSION_SUPPORT_REVIEW_ACCEPTED=true \
BETA_EXPANSION_PRIVACY_REVIEW_ACCEPTED=true \
BETA_EXPANSION_PARTICIPANT_IDENTIFIERS_RECORDED=false \
BETA_EXPANSION_SUPPORT_REFERENCE=/support \
BETA_EXPANSION_INCIDENT_OWNER=operations \
BETA_EXPANSION_OWNER=operations \
BETA_EXPANSION_CONFIRM_REPORT=report \
pnpm beta:expansion:decision
```

## GitHub Usage
1. Run `Beta Expansion Decision Report`.
2. Select `staging` or `production`.
3. Provide the latest wave outcome, retention plan, participant counts, support status, operator capacity, review approvals, support reference, incident owner, and expansion owner.
4. Set `confirm_report` to `report`.
5. Download the uploaded expansion decision artifact.
6. Generate the next observation report and invitation wave plan only when the decision is `expand`.

## Boundary
This report records the expansion decision; it does not send invitations or execute recovery actions. Rollback and disablement still require the approved traffic, database, support, and incident procedures.
