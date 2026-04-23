# Goal Vault Universal React Native Phase 6

## What Phase 6 Implements
- A new `apps/api` Fastify package for Goal Vault metadata, activity, health, and sync endpoints.
- File-backed persistent indexing state with idempotent event storage and restart-safe sync cursors.
- Factory event discovery for `VaultCreated` plus per-vault indexing for `Deposited` and `Withdrawn`.
- Enriched backend vault list/detail reads with metadata reconciliation and sync freshness hints.
- Mobile hooks that prefer backend-enriched reads, preserve chain/session fallbacks, and trigger backend sync after confirmed transactions.

## Source-of-Truth Strategy
- Chain remains authoritative for ownership, vault totals, unlock timestamps, and event existence.
- Backend stores normalized representations of confirmed chain events plus offchain vault metadata and sync state.
- Frontend now treats backend enrichment as the primary read path for vaults, vault detail, and activity when `EXPO_PUBLIC_API_BASE_URL` is configured.
- The session bridge remains a temporary overlay for just-confirmed create/deposit/withdraw flows until indexed data catches up.

## Indexing Architecture
- `factory-sync.service.ts` reads `VaultCreated` logs from the configured factory and upserts both vault records and normalized `vault_created` events.
- `vault-sync.service.ts` iterates known vaults, indexes deposit/withdraw logs, and refreshes exact vault totals from `getSummary`.
- `event-normalizer.ts` maps raw logs into normalized event rows with deterministic event ids.
- `sync-state.service.ts` owns stream keys, cursor comparisons, and freshness snapshots.
- `reconciliation.service.ts` merges onchain discovery and metadata saves into one vault record model.

## Sync Cursor / Idempotency Strategy
- Sync state is persisted per chain factory stream and per vault stream.
- Each sync re-reads from one block behind the saved cursor, then filters by block number plus log index.
- Normalized event ids use `chainId:txHash:logIndex`, so reruns overwrite instead of duplicating.
- Vault records upsert by `chainId:vaultAddress`, so repeated factory or vault syncs remain safe.

## Metadata Reconciliation Strategy
- Metadata POST writes directly into the persistent vault record keyed by chain plus contract address.
- If metadata arrives before the factory event is indexed, the vault record remains visible as `metadata_orphaned`.
- If the onchain vault exists without metadata, the vault remains visible as `metadata_pending` instead of disappearing.
- Once both sides exist, reconciliation upgrades the record to `metadata_complete`.

## Enriched API Response Strategy
- `GET /health` returns sync-state visibility for backend verification.
- `GET /vaults?chainId=&ownerWallet=` returns enriched summaries with metadata status, reconciliation status, totals, and freshness.
- `GET /vaults/:vaultAddress?chainId=` returns enriched detail plus normalized activity.
- `GET /vaults/:vaultAddress/activity` and `GET /activity` return normalized activity records.
- `POST /vaults` still saves metadata, but now it reconciles against indexed vault rows instead of writing only to session state.

## Refresh / Freshness Strategy
- Mobile hooks attempt backend reads first, then fall back to direct chain reads and session data when needed.
- After confirmed create, deposit, and withdrawal flows, the app triggers `/internal/indexer/sync` and invalidates read hooks.
- Backend responses include freshness snapshots so vault list/detail can show calm syncing notices instead of silent stale data.
- Session activity and metadata still fill short-lived gaps when the backend is unavailable or catching up.

## Operational Considerations
- The API runs as a thin Fastify app with optional interval-based sync on startup.
- One-off jobs exist for factory sync, vault sync, and metadata reconciliation.
- The current persistence layer is file-backed in `apps/api/.data/`, which keeps Phase 6 self-contained in the repo without introducing external database setup.
- Missing RPC or factory config is surfaced through health and sync-state responses instead of being silently ignored.

## What Remains For Later Phases
- Replace the file-backed store with the planned database-backed persistence layer when infrastructure is introduced.
- Expand reconciliation into richer repair tooling if metadata editing becomes a supported product action.
- Add cooldown unlock and guardian approval on top of the same indexed data model.
- Run live Base Sepolia QA with real RPC and factory config to verify incremental sync under real traffic.

## Risks and Edge Cases
- Without RPC or factory env config, the backend boots and reports honest sync-state errors but cannot index.
- The current persistence layer is durable and idempotent, but it is not yet a multi-process database solution.
- Direct chain reads and backend reads can briefly disagree right after confirmation; the app now handles that with sync nudges plus session overlays.
- Future event types must continue using deterministic ids and serializer boundaries or duplication risk will return.
