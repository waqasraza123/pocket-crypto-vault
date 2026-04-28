# Pocket Vault Beta Invitation Wave Plan

## Purpose
The beta invitation wave plan is the non-mutating approval artifact for inviting a specific limited-beta cohort after readiness and observation evidence are accepted.

It does not send invites, deploy infrastructure, mutate a database, move traffic, run chain transactions, or record participant PII. It validates the beta readiness plan, stable production observation report, approved participant limit, wave size, value guidance, support reference, incident owner, and invite owner before operators send invitations outside GitHub.

## Files
- `scripts/write-beta-invitation-wave-plan.mjs`
  - validates target, wave label, wave number, wave size, previously invited count, value limit, communication reference, support reference, incident owner, invite owner, and confirmation
  - inspects runner-local beta readiness and production observation JSON artifacts when paths are provided
  - blocks waves that exceed the approved participant limit
  - blocks value guidance that exceeds the beta readiness max vault USDC limit when the readiness artifact is locally inspected
  - writes a JSON wave plan with invite steps, pause criteria, evidence summaries, and git metadata
- `.github/workflows/beta-invitation-wave-plan.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - requires `confirm_plan=plan`
  - uploads the beta invitation wave plan artifact
- `package.json`
  - exposes `pnpm beta:invitation:wave`

## Required Inputs
- `BETA_INVITATION_TARGET`
  - `staging` or `production`
- `BETA_INVITATION_WAVE_LABEL`
- `BETA_INVITATION_READINESS_PLAN`
- `BETA_INVITATION_OBSERVATION_REPORT`
- `BETA_INVITATION_WAVE_NUMBER`
- `BETA_INVITATION_WAVE_SIZE`
- `BETA_INVITATION_PREVIOUSLY_INVITED_COUNT`
- `BETA_INVITATION_MAX_VAULT_USDC`
- `BETA_INVITATION_COMMUNICATION_REFERENCE`
- `BETA_INVITATION_SUPPORT_REFERENCE`
- `BETA_INVITATION_INCIDENT_OWNER`
- `BETA_INVITATION_OWNER`
- `BETA_INVITATION_CONFIRM_PLAN=plan`

Optional inputs:

- `BETA_INVITATION_PARTICIPANT_LIMIT`
  - used only when the readiness artifact is not locally inspected
- `BETA_INVITATION_OPERATOR`
- `BETA_INVITATION_NOTES`
- `BETA_INVITATION_DIR`

## Evidence Checks
When local JSON artifact paths are provided, the script validates:

- beta readiness artifact target, component, ready status, participant limit, max vault USDC, support reference, incident owner, and observation window
- production observation artifact target, component, stable status, public `/health`, public `/ready`, healthy indexer, non-blocked support, non-degraded analytics, within-budget errors, and zero incidents
- wave size plus previously invited count stays within the readiness participant limit
- wave value guidance does not exceed the readiness max vault USDC
- support reference and incident owner match readiness and observation evidence

Remote artifact names and URLs remain valid references but are recorded as not locally inspected. Operators must compare them before sending invites.

## PII Boundary
Do not put participant names, emails, phone numbers, wallet addresses, social handles, invite links, or contact details in the wave plan, workflow inputs, notes, committed docs, or release notes.

Use `BETA_INVITATION_COMMUNICATION_REFERENCE` for a non-secret invite copy, rollout doc, or private communication-channel reference. Store actual participant lists only in approved private operational systems.

## Local Usage
Example first wave:

```bash
BETA_INVITATION_TARGET=production \
BETA_INVITATION_WAVE_LABEL=v1-wave-1 \
BETA_INVITATION_READINESS_PLAN=./artifacts/beta-readiness.json \
BETA_INVITATION_OBSERVATION_REPORT=./artifacts/production-observation.json \
BETA_INVITATION_WAVE_NUMBER=1 \
BETA_INVITATION_WAVE_SIZE=5 \
BETA_INVITATION_PREVIOUSLY_INVITED_COUNT=0 \
BETA_INVITATION_MAX_VAULT_USDC=25 \
BETA_INVITATION_COMMUNICATION_REFERENCE=private-beta-invite-copy-v1 \
BETA_INVITATION_SUPPORT_REFERENCE=/support \
BETA_INVITATION_INCIDENT_OWNER=operations \
BETA_INVITATION_OWNER=operations \
BETA_INVITATION_CONFIRM_PLAN=plan \
pnpm beta:invitation:wave
```

## GitHub Usage
1. Run `Beta Invitation Wave Plan`.
2. Select `staging` or `production`.
3. Provide beta readiness, stable observation, wave count, value guidance, communication, support, incident-owner, and invite-owner references.
4. Set `confirm_plan` to `plan`.
5. Download the uploaded wave plan artifact.
6. Send invitations outside GitHub only after reviewing the artifact and confirming no participant PII was recorded.

## Boundary
This workflow approves a wave plan; it does not perform outreach. Every next wave should start from a fresh stable production observation report.
