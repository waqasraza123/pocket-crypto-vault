# Pocket Vault Universal React Native Phase 7

## What Phase 7 Implements
- Release-hardens the existing v1 product without adding cooldown unlock, guardian approval, yield, swaps, or multichain scope.
- Adds app-wide readiness mapping for wallet, network, backend, and configuration states.
- Adds persistent transaction recovery for create, deposit, and withdraw flows so pending transactions survive navigation and refresh.
- Replaces fragile or synthetic fallback states with calmer, honest degraded-state UX.
- Adds richer backend `/health` and `/ready` summaries for staging validation.

## Release-Hardening Strategy
- Centralize launch-readiness state in shared domain models that mobile and API both understand.
- Keep the one Expo app and existing route structure intact.
- Prefer chain truth, session overlays, and explicit syncing notices over mock live-state fallbacks.
- Harden screen shells first, then route-level flows, then backend readiness reporting.

## Transaction Recovery Strategy
- Persist submitted create, deposit, and withdraw transactions locally with chain, owner, vault, and status metadata.
- Recover pending transactions on app reopen by re-checking receipts against the configured chain client.
- Treat confirmed-but-not-yet-refreshed flows as syncing rather than failed.
- Retry create-flow metadata saving after confirmed onchain success when the vault address can be resolved.
- Remove recovery records after a flow is fully refreshed or explicitly dismissed.

## Readiness / Health Strategy
- Expand API health responses to report environment checks, per-chain readiness, staging readiness, and sync lag.
- Keep the API bootable even when config is incomplete.
- Return calm 503 messages from vault and activity routes when reads are temporarily unavailable.
- Surface missing RPC and factory config explicitly instead of leaving screens in ambiguous loading states.

## Sync / Degraded-State UX Strategy
- Introduce consistent loading, syncing, configuration, and recovery components under `apps/mobile/src/components/feedback/`.
- Map backend freshness, metadata status, and query gaps into typed degraded states.
- Use session-backed transaction bridges while backend/indexer activity catches up.
- Avoid blank states and raw transport errors.

## Trust / Security UX Refinements
- Clarify that unlock rules are enforced onchain.
- Clarify that metadata and indexed activity help display the vault but do not control funds.
- Keep the tone calm, serious, and non-speculative across landing, create, vault detail, and transaction states.
- Remove dishonest mock-live fallbacks for connected users when real reads fail.

## Staging / Smoke-Test Strategy
- Use `/health` or `/ready` to validate Base Sepolia RPC, factory, sync loop, and staging readiness before manual QA.
- Keep create, deposit, and withdraw smoke tests dependent on Base Sepolia config only, not extra infrastructure.
- Use session recovery plus sync notices so chain-confirmed actions remain testable even while indexing lags.
- Validate app boot with Expo exports for web and iOS plus API boot and health checks.

## What Remains For Later Phases
- Cooldown unlock
- Guardian approval
- Database-backed backend persistence
- Production CI/CD and release automation
- Broader observability or admin tooling

## Risks And Edge Cases
- If RPC configuration is missing, recovery and chain reads remain blocked by design.
- Recovery records depend on local device storage; clearing app storage resets the local bridge history.
- Base Sepolia smoke tests still need real RPC and factory env values.
- Wallet SDK package warnings during Expo export remain upstream dependency noise and were not widened into product-scope changes here.
