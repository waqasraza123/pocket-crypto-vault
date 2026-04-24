# Goal Vault Universal React Native Phase 13

## What Phase 13 Implements
- Replaces loose hybrid screen wiring with a typed API contract and parsed client boundary.
- Makes My Vaults, Vault Detail, and Activity read from real backend payloads first, then fall back to chain or session data only when needed.
- Completes the post-transaction refresh loop for create, deposit, withdraw, and transaction recovery.
- Removes mock vault-detail fallback data from authenticated product reads.
- Makes metadata reconciliation and sync freshness explicit in both API responses and frontend view models.

## Final API Contract Strategy
- `/vaults` returns typed enriched vault summaries for one owner and chain.
- `/vaults/:vaultAddress` returns typed enriched vault detail plus normalized activity.
- `/activity` returns normalized owner activity plus freshness.
- `/vaults/:vaultAddress/activity` returns vault-scoped activity plus freshness.
- `POST /vaults` persists metadata and returns reconciliation status plus a `created` or `updated` result.
- API payloads are parsed through `@goal-vault/api-client` schemas before the app consumes them.

## Typed API Client Strategy
- `packages/api-client` now owns schemas, payload parsing, and mapping from serialized API shapes into typed shared models.
- `apps/mobile/src/lib/api/` owns transport, environment-aware base URL handling, non-technical fallback messages, and app-specific view mappers.
- Screens no longer parse raw JSON directly.

## Frontend Data-Flow Strategy
- `useVaults`, `useVaultDetail`, and `useVaultActivity` now follow one pattern:
  - read backend first
  - fall back to direct chain reads only when backend data is unavailable
  - layer session metadata and session activity over the read result
  - expose one merged product view model to the screen
- `apps/mobile/src/lib/data/source-of-truth.ts` now centralizes merge and source selection logic.

## Source-of-Truth Strategy
- Chain remains source of truth for ownership, transaction confirmation, lock timing, and actual balances.
- Backend is the primary enriched source for metadata, dashboard summaries, normalized activity, freshness, and reconciliation state.
- Session overlays remain limited to recently confirmed local actions while the API catches up.
- The app never invents vaults or balances that do not exist onchain.

## Post-Transaction Refresh Strategy
- Confirmed create, deposit, withdraw, and recovered transactions now call one shared refresh controller.
- The refresh controller:
  - marks the affected owner or vault as refreshing
  - triggers indexer sync
  - invalidates app reads immediately
  - advances to a catching-up state if indexing takes longer
  - clears once backend freshness returns to current or the refresh window expires
- This keeps dashboard, detail, and activity aligned without route reload hacks.

## Reconciliation and Degraded-State Strategy
- Backend payloads surface metadata status, reconciliation status, and sync freshness.
- Frontend maps those into calm read states such as backend current, backend syncing, onchain fallback, and session pending.
- The app treats metadata pending and index lag as honest product states rather than generic failures.

## What Remains for Later Phases
- Cooldown unlock.
- Guardian approval.
- External database-backed indexer persistence.
- CI and deployment automation beyond current local and staging support.

## Risks and Edge Cases
- Backend freshness is still limited by indexer configuration and available RPC settings.
- Session overlays remain temporary and should not grow into a second permanent data source.
- If backend indexing falls too far behind, the app still relies on chain fallback for correctness while keeping enrichment partial.
