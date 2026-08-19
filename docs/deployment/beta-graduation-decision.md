# Pocket Vault Beta Graduation Decision Report

## Purpose
The beta graduation decision report records whether an expanded beta can graduate toward public launch planning, should remain in beta, must hold, or requires rollback or disablement.

It does not launch publicly, send invites, deploy infrastructure, mutate a database, move traffic, run chain transactions, read live data, or record participant PII. It validates the latest expansion decision, latest wave outcome, retention plan, aggregate beta signals, support readiness, privacy readiness, reliability readiness, communications readiness, distribution readiness, review approvals, support reference, incident owner, and graduation owner.

## Files
- `scripts/write-beta-graduation-decision-report.mjs`
  - validates target, label, decision, latest expansion decision, latest wave outcome, retention plan, aggregate counts, readiness statuses, review approvals, support reference, incident owner, graduation owner, and confirmation
  - inspects runner-local expansion, wave outcome, and retention JSON artifacts when paths are provided
  - blocks graduation unless all beta evidence and review gates are accepted
  - writes a JSON graduation decision report with aggregate signals, readiness, reviews, evidence summaries, acceptance gates, next actions, and git metadata
- `.github/workflows/beta-graduation-decision-report.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - requires `confirm_report=report`
  - uploads the beta graduation decision artifact
- `package.json`
  - exposes `pnpm beta:graduation:decision`

## Required Inputs
- `BETA_GRADUATION_TARGET`
  - `staging` or `production`
- `BETA_GRADUATION_LABEL`
- `BETA_GRADUATION_DECISION`
  - `graduate`, `extend-beta`, `hold`, `rollback`, or `disable`
- `BETA_GRADUATION_EXPANSION_DECISION`
- `BETA_GRADUATION_LATEST_WAVE_OUTCOME`
- `BETA_GRADUATION_RETENTION_PLAN`
- `BETA_GRADUATION_PARTICIPANT_COUNT`
- `BETA_GRADUATION_MINIMUM_PARTICIPANT_COUNT`
- `BETA_GRADUATION_SUPPORT_READINESS`
  - `ready`, `watch`, or `blocked`
- `BETA_GRADUATION_PRIVACY_READINESS`
  - `ready`, `watch`, or `blocked`
- `BETA_GRADUATION_RELIABILITY_READINESS`
  - `ready`, `watch`, or `blocked`
- `BETA_GRADUATION_COMMUNICATIONS_READINESS`
  - `ready`, `watch`, or `blocked`
- `BETA_GRADUATION_STORE_READINESS`
  - `ready`, `watch`, or `blocked`
- `BETA_GRADUATION_SUPPORT_REVIEW_ACCEPTED`
- `BETA_GRADUATION_PRIVACY_REVIEW_ACCEPTED`
- `BETA_GRADUATION_RELIABILITY_REVIEW_ACCEPTED`
- `BETA_GRADUATION_RETENTION_REVIEW_ACCEPTED`
- `BETA_GRADUATION_COMMUNICATIONS_REVIEW_ACCEPTED`
- `BETA_GRADUATION_PARTICIPANT_IDENTIFIERS_RECORDED`
  - must be `false`
- `BETA_GRADUATION_SUPPORT_REFERENCE`
- `BETA_GRADUATION_INCIDENT_OWNER`
- `BETA_GRADUATION_OWNER`
- `BETA_GRADUATION_CONFIRM_REPORT=report`

Aggregate signal inputs:

- `BETA_GRADUATION_OPEN_SUPPORT_REQUEST_COUNT`
- `BETA_GRADUATION_UNRESOLVED_INCIDENT_COUNT`
- `BETA_GRADUATION_FAILED_TRANSACTION_COUNT`

Optional inputs:

- `BETA_GRADUATION_INCIDENT_REFERENCE`
  - required for rollback, disable, or unresolved incidents
- `BETA_GRADUATION_OPERATOR`
- `BETA_GRADUATION_NOTES`
- `BETA_GRADUATION_DIR`

## Graduation Gate
Use `BETA_GRADUATION_DECISION=graduate` only when:

- latest expansion decision is `expand` when locally inspected
- latest wave outcome decision is `continue` when locally inspected
- latest wave outcome observation status is `stable` when locally inspected
- participant count meets the minimum graduation sample
- open support request count is zero
- unresolved incident count is zero
- failed transaction count is zero
- support readiness is `ready`
- privacy readiness is `ready`
- reliability readiness is `ready`
- communications readiness is `ready`
- store or distribution readiness is `ready`
- support, privacy, reliability, retention, and communications reviews are accepted
- participant identifiers are not recorded

Use `extend-beta` when the beta should continue with more evidence before public launch planning.

Use `hold` when support, privacy, reliability, retention, communications, store, or operator review is incomplete.

Use `rollback` or `disable` only with an incident reference and approved recovery artifacts.

## Evidence Checks
When local JSON artifact paths are provided, the script validates:

- beta expansion decision target, component, non-sending boundary, non-PII boundary, support reference, incident owner, expansion owner, decision, participant capacity, support backlog, operator capacity, and reviews
- beta wave outcome target, component, non-PII boundary, support reference, incident owner, decision, observation status, and aggregate counts
- beta data retention target, component, planning-only boundary, non-committable boundary, policy owner, support owner, and incident owner
- support reference and incident owner match expansion and wave outcome evidence when inspected

Remote artifact names and URLs remain valid references but are recorded as not locally inspected. Operators must compare them before approving graduation.

## PII Boundary
Do not put participant names, emails, phone numbers, wallet addresses, social handles, invite links, contact details, private support text, or participant-level transaction traces in the graduation report, workflow inputs, notes, committed docs, or release notes.

Only aggregate counts and non-secret operational references belong in this artifact.

## Local Usage
Example graduation decision:

```bash
BETA_GRADUATION_TARGET=production \
BETA_GRADUATION_LABEL=v1-beta-graduation \
BETA_GRADUATION_DECISION=graduate \
BETA_GRADUATION_EXPANSION_DECISION=./artifacts/beta-expansion-decision.json \
BETA_GRADUATION_LATEST_WAVE_OUTCOME=./artifacts/beta-wave-outcome.json \
BETA_GRADUATION_RETENTION_PLAN=./artifacts/beta-data-retention.json \
BETA_GRADUATION_PARTICIPANT_COUNT=10 \
BETA_GRADUATION_MINIMUM_PARTICIPANT_COUNT=10 \
BETA_GRADUATION_OPEN_SUPPORT_REQUEST_COUNT=0 \
BETA_GRADUATION_UNRESOLVED_INCIDENT_COUNT=0 \
BETA_GRADUATION_FAILED_TRANSACTION_COUNT=0 \
BETA_GRADUATION_SUPPORT_READINESS=ready \
BETA_GRADUATION_PRIVACY_READINESS=ready \
BETA_GRADUATION_RELIABILITY_READINESS=ready \
BETA_GRADUATION_COMMUNICATIONS_READINESS=ready \
BETA_GRADUATION_STORE_READINESS=ready \
BETA_GRADUATION_SUPPORT_REVIEW_ACCEPTED=true \
BETA_GRADUATION_PRIVACY_REVIEW_ACCEPTED=true \
BETA_GRADUATION_RELIABILITY_REVIEW_ACCEPTED=true \
BETA_GRADUATION_RETENTION_REVIEW_ACCEPTED=true \
BETA_GRADUATION_COMMUNICATIONS_REVIEW_ACCEPTED=true \
BETA_GRADUATION_PARTICIPANT_IDENTIFIERS_RECORDED=false \
BETA_GRADUATION_SUPPORT_REFERENCE=/support \
BETA_GRADUATION_INCIDENT_OWNER=operations \
BETA_GRADUATION_OWNER=operations \
BETA_GRADUATION_CONFIRM_REPORT=report \
pnpm beta:graduation:decision
```

## GitHub Usage
1. Run `Beta Graduation Decision Report`.
2. Select `staging` or `production`.
3. Provide expansion, wave outcome, retention, aggregate counts, readiness statuses, review approvals, support reference, incident owner, and graduation owner.
4. Set `confirm_report` to `report`.
5. Download the uploaded graduation decision artifact.
6. Start public launch planning only when the decision is `graduate`.

## Boundary
This report records the graduation decision; it does not launch the product publicly or execute recovery actions. Public launch still requires fresh release, preflight, traffic, smoke, activation, observation, support, privacy, and rollback evidence.
