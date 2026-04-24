# Goal Vault Universal React Native Phase 11

## What Phase 11 Implements
- typed analytics events for the core product journey across landing, wallet connection, dashboard, create vault, vault detail, deposit, withdraw, activity, and degraded states
- transaction lifecycle instrumentation for create, deposit, withdraw, and transaction recovery flows
- a safe analytics provider boundary in the Expo app with disabled, local-log, and backend modes
- lean API-side analytics ingestion and file-backed event storage for post-launch review
- structured backend observability signals for vault reads, activity reads, sync runs, reconciliation, and analytics ingestion
- repo-local documentation for event taxonomy, post-launch metrics, and privacy boundaries

## Analytics Strategy
- keep event names centralized and typed in shared domain models
- emit only from stable interaction or lifecycle boundaries, not from arbitrary rerenders
- include route, platform, wallet state, chain id, vault address, transaction hash, and sync freshness only when useful
- treat analytics as optional infrastructure: the app must stay stable when analytics is disabled or unavailable

## Event Taxonomy Strategy
- marketing: landing, how-it-works, security
- wallet: connect started, connect succeeded, unsupported network
- vault: dashboard viewed, create started, step progressed, create submitted, vault confirmed, vault detail viewed
- deposit: flow opened, approval required, approval confirmed, deposit confirmed
- withdraw: flow opened, lock-blocked attempt, withdraw confirmed
- activity: activity viewed, empty-state exposure
- error or sync: degraded states, transaction lifecycle updates, recovery actions

## Transaction Lifecycle Observability Strategy
- track create, deposit, and withdraw across wallet confirmation, submission, confirmation, syncing, completion, failure, and partial success
- use the same lifecycle model for recovery so post-launch analysis can separate chain success from metadata or index lag
- keep transaction payloads bounded to hashes, vault addresses, flow type, and coarse error classes

## Backend Observability Strategy
- log structured signals for API read success or failure, analytics ingestion, factory sync, vault sync, metadata reconciliation, and startup sync
- keep operator-facing details in logs rather than user-facing copy
- preserve the thin backend shape by writing analytics to the existing file-backed data directory instead of adding a warehouse layer

## Privacy And Data-Minimization Choices
- collect bounded product state, route, flow, and status metadata only
- do not collect freeform goal names, notes, or other private vault text in analytics events
- prefer coarse buckets for amount and unlock timing rather than raw values where product questions do not need exact numbers
- keep wallet-linked analytics limited to the minimum event context needed for diagnosing product flow friction

## Post-Launch Metric Definitions
- visitor to wallet connection rate
- wallet connection to create-vault start rate
- create-vault start to create confirmation rate
- vault created to first deposit rate
- first deposit to repeat deposit rate
- withdraw attempts blocked by lock
- eligible withdrawal completion rate
- degraded-state exposure rate by surface
- transaction failure and partial-success rates by flow

## What Remains For Later Phases
- cooldown unlock remains the next product-scope phase
- guardian approval remains after cooldown unlock
- external analytics warehouse, dashboards, or alerting infrastructure can wait until real traffic justifies them

## Risks And Edge Cases
- event volume can become noisy if new flows ignore the typed boundary and emit ad hoc duplicates
- local session overlays can still produce honest but slightly stale product surfaces while backend indexing catches up
- file-backed analytics storage is appropriate for early launch validation, not long-term high-volume retention
