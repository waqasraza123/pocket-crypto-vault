# Pocket Vault Universal React Native Phase 16

## Objective
Phase 16 closes the audited correctness, security, persistence, and automated coverage gaps without widening product scope. The product remains one Expo React Native codebase for iOS, Android, and web, still focused on Base-native USDC goal vaults.

## What Phase 16 Fixes
- Factory indexing now handles both `VaultCreated` and `VaultCreatedV2` as intentional creation inputs.
- Cooldown and guardian vaults now flow through backend discovery, persistence, reconciliation, and API-backed reads.
- Unlock request and unlock cancel receipt parsing now map to the correct contract events.
- Unlock actions now use the same recovery and refresh model as create, deposit, and withdraw.
- Metadata writes now require a fresh owner signature that binds the vault address, chain, creation tx hash, and rule metadata.
- Internal indexer routes now require explicit internal authorization outside local-development fallback cases.
- Core backend persistence moved from whole-file JSON or NDJSON rewrites to SQLite-backed durable storage for indexed state and analytics events.
- Real automated tests now cover contract rule behavior, backend indexing and metadata verification, and frontend rule-state helpers.

## Creation Event Handling
The backend indexer now treats vault creation as a normalized model built from either:
- `VaultCreated`
- `VaultCreatedV2`

Normalization rules:
- legacy time-lock vaults can still be discovered through `VaultCreated`
- when a `VaultCreatedV2` log exists for the same tx hash and vault, it becomes the preferred canonical creation record
- V2 rule fields are normalized into the shared internal vault model
- idempotency is preserved by stable event ids and upsert-based vault persistence
- factory sync now rescans the factory creation range and rebuilds normalized creation records instead of assuming the older event-only cursor is sufficient

## Unlock Flow Remediation
The mobile write layer now parses:
- unlock request from `UnlockRequested`
- unlock cancel from `UnlockCanceled`

Unlock flow hardening changes:
- request, cancel, approve, and reject now use explicit transaction lifecycle states
- unlock actions now write transaction recovery records
- unlock actions now trigger analytics lifecycle tracking
- unlock actions now trigger the same refresh strategy used by the main create, deposit, and withdraw flows
- local session activity now projects temporary rule-state changes into dashboard and detail surfaces while backend indexing catches up

## Backend Security and Persistence
Metadata writes now require:
- a signed authorization message from the owner wallet
- a fresh issued-at timestamp
- verification that the signed wallet matches the creation transaction sender
- verification that the creation receipt actually created the target vault
- verification that rule metadata matches the onchain vault summary

Internal indexer routes now require:
- `x-goal-vault-internal-token`
- local-development loopback fallback only when no internal token is configured

Persistence changes:
- indexed vaults, indexed events, and sync cursors now live in SQLite under `apps/api/.data/`
- analytics events now also persist in SQLite instead of NDJSON append files
- restart safety and idempotent upsert behavior now match the production-shaped backend target more closely

## Tests Added
Contracts:
- legacy plus V2 creation events
- time-lock withdraw gating
- cooldown creation, request, cancel, maturity, and withdraw
- guardian creation, request, approve, reject, and bypass rejection
- deposit and withdraw accounting
- invalid guardian and duplicate action rejection

Backend:
- factory sync normalization for legacy and V2 creation events
- idempotent factory reprocessing
- signed metadata verification and vault materialization
- protected internal indexer routes
- metadata route rejection for invalid or unsigned payloads
- serializer coverage for rule-specific vault and activity models

Frontend and shared logic:
- unlock lifecycle activity shaping
- session rule-state overlays for cooldown and guardian actions
- API-client rule and activity parsing
- contracts SDK rule-state mapping

## Remaining Risks
- SQLite via `node:sqlite` is materially safer than file rewrites, but the backend still does not use an external managed database.
- Unlock-flow UI behavior now shares the recovery architecture, but broader end-to-end UI tests still rely on lower-level logic coverage instead of browser or device automation.
- Internal route protection depends on deployment env configuration being set correctly.

## Verification Commands
- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter @pocket-vault/api test`
- `pnpm --filter @pocket-vault/contracts test`
- `git status --short`

## Result After Phase 16
Pocket Vault is materially closer to feature-complete and defensible from a coding perspective:
- rule-system indexing is complete across legacy and V2 creation paths
- unlock lifecycle handling is correct and hardened
- backend mutation and internal operational surfaces are protected
- core backend state is durably persisted
- the repo now has meaningful automated coverage for the most important audited risk areas
