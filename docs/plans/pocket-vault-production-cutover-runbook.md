# Pocket Vault Production Cutover Runbook

## Preconditions
- Production Base factory address and RPC are configured.
- `API_PUBLIC_BASE_URL` is HTTPS and points to the candidate production API.
- `API_INTERNAL_TOKEN` is configured.
- `API_PERSISTENCE_DRIVER=postgresql`.
- `API_POSTGRES_DRIVER=pg` or `neon`.
- `API_DATABASE_URL` is configured only in secret storage.
- `API_PERSISTENCE_SCHEMA_NAME=goal_vault_api` unless an approved schema name is recorded.
- `API_ROLLBACK_EVIDENCE_ACCEPTED=true`, `API_SMOKE_EVIDENCE_ACCEPTED=true`, and `API_LIMITED_BETA_SCOPE_APPROVED=true` are set only after the matching evidence is accepted.

## Sequence
1. Create a fresh source snapshot with `pnpm api:data:snapshot`.
2. Generate or review the managed database plan with `pnpm api:database:plan`.
3. Generate schema with `pnpm api:database:schema`.
4. Apply schema through the guarded workflow or `pnpm api:database:schema:apply` with approved credentials.
5. Export source data with `pnpm api:database:export`.
6. Generate and execute import through `pnpm api:database:import:plan` and `pnpm api:database:import:execute`.
7. Generate and execute parity with `pnpm api:database:parity` and `pnpm api:database:parity:execute`.
8. Run `pnpm api:preflight` against the candidate PostgreSQL runtime.
9. Generate the database runtime plan with `pnpm api:database:runtime:plan`.
10. Deploy the candidate API image with PostgreSQL env.
11. Check `GET /health` and `GET /ready`.
12. Generate the API traffic plan with `pnpm api:traffic:plan`.
13. Move traffic only through the approved provider execution path.
14. Run protected production smoke and store the artifact.
15. Generate beta readiness if it has not already been generated against the final traffic and persistence evidence.
16. Generate the production activation record with `pnpm production:activation:record`.
17. Observe `/ready`, indexer freshness, support intake, analytics, failed transaction reports, and incidents for the approved window.
18. Generate the production observation report with `pnpm production:observation:report`.
19. Generate the beta invitation wave plan with `pnpm beta:invitation:wave` before any invitations are sent.
20. Generate the beta wave outcome report with `pnpm beta:wave:outcome` after the wave observation window.
21. Generate the beta expansion decision report with `pnpm beta:expansion:decision` before any larger invitation wave.
22. Generate the beta graduation decision report with `pnpm beta:graduation:decision` before public launch planning.

## Go Criteria
- Preflight `status` is `valid`.
- `/ready.productionActivation.databaseCutoverReady` is `true`.
- `/ready.productionActivation.status` is `ready` after accepted smoke, rollback, and beta scope evidence.
- PostgreSQL schema check passes with no missing tables.
- Parity is accepted.
- Traffic plan records candidate and rollback URLs plus candidate and rollback images.
- Production activation record is generated with `activationOutcome=accepted`.
- Production observation report is generated with `observationStatus=stable`.
- Beta invitation wave plan is generated with `noInvitesSent=true` before private outreach starts.
- Beta wave outcome report is generated with `decision=continue` before any next invitation wave.
- Beta expansion decision report is generated with `decision=expand` before any larger beta wave.
- Beta graduation decision report is generated with `decision=graduate` before public launch planning.

## No-Go Criteria
- Any production runtime uses SQLite.
- Any PostgreSQL secret appears in an artifact or log.
- `/ready` is unavailable or blocked.
- Support or analytics persistence is not ready.
- Rollback evidence is incomplete.
