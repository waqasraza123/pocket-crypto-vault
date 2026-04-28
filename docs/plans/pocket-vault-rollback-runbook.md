# Pocket Vault Rollback Runbook

## Purpose
Reverse a production activation quickly when runtime, database, indexing, support, or traffic behavior is unacceptable.

## Rollback Preconditions
- Rollback API image is known and recorded.
- Rollback API URL or deployment target is known and recorded.
- Rollback API data snapshot is available in approved storage.
- Traffic reversal command or provider console path is approved.
- Operator understands whether rollback returns to SQLite or another accepted persistence target.

## Rollback Triggers
- `/health` fails after traffic movement.
- `/ready` is blocked after traffic movement.
- PostgreSQL persistence starts but loses schema or connection readiness.
- Parity regression is discovered after cutover.
- Indexer errors prevent dashboard/detail/activity from reflecting confirmed transactions.
- Support intake or triage is unavailable during beta.
- Metadata reconciliation corrupts or misrepresents private vault metadata.
- User-facing create, deposit, unlock, or withdraw path fails repeatedly.

## Fast Rollback Sequence
1. Pause beta invitations.
2. Stop further production smoke or beta transactions.
3. Move API traffic back to the recorded rollback URL or rollback image.
4. Restore previous persistence config.
5. Restore API data only from the rollback snapshot and only while the affected API runtime is stopped.
6. Check rollback `/health` and `/ready`.
7. Confirm app clients show recovered or honestly degraded state.
8. Check support queue and urgent incidents.
9. Record reason, timing, affected participants, restored image, restored persistence mode, snapshot reference, and re-enable conditions.

## Database Cutover Reversal
- Do not write ad hoc repair SQL during emergency rollback.
- Prefer traffic reversal first.
- Restore data only from the planned snapshot.
- Keep the PostgreSQL target intact for later forensic comparison unless data retention policy requires otherwise.
- Run parity again before considering a second cutover.

## Re-Enable Criteria
- Root cause is understood.
- Fix is verified in staging or private production candidate.
- Fresh preflight, parity, traffic, smoke, and beta readiness artifacts are accepted.
- Support owner and incident owner approve reopening beta access.

