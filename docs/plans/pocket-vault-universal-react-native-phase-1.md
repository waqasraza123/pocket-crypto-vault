# Pocket Vault Universal React Native Phase 1 Note

## What Phase 1 Implements
- Scaffolds the repo as a `pnpm` workspace monorepo with `apps/mobile` as the universal Expo app.
- Adds Expo Router route groups for public marketing surfaces and authenticated app surfaces from one shared route tree.
- Establishes shared theme tokens, primitive UI components, adaptive layout hooks, and shell/navigation components.
- Implements polished static screens for landing, how-it-works, security, my vaults, create vault, vault detail, and activity.
- Adds typed shared domain models, route-safe parsing, and validation scaffolding for the create-vault flow.
- Creates placeholder package boundaries for shared domain code, future API integration, future contract integration, and shared config.

## Folder Structure Created
- `apps/mobile/`
  - Expo app config, Router entry, and universal React Native source tree
  - `src/app/` for routes
  - `src/components/` for primitives, layout, marketing, vaults, forms, feedback
  - `src/features/` for mock data and create-vault form scaffolding
  - `src/hooks/`, `src/lib/`, `src/state/`, `src/theme/`, `src/types/`
- `packages/shared/`
  - shared pocket-vault domain types and validation utilities
- `packages/api-client/`
  - typed placeholder boundary for later backend reads
- `packages/contracts-sdk/`
  - typed placeholder boundary for later contract reads and writes
- `packages/config/`
  - shared product and chain constants

## Key Architectural Decisions
- One Expo Router app handles iOS, Android, and web. No separate Next.js app or duplicate web route tree was introduced.
- Static screens use typed mock data only. No fake backend, contract orchestration, or wallet SDK logic was added.
- Adaptive layout uses shared breakpoint hooks and container primitives instead of screen-specific web/mobile forks.
- Shared domain types live in `packages/shared` and are consumed by the app to keep future backend and contract integration straightforward.
- Wallet integration remains a visible placeholder boundary through layout and state components, but actual connection logic is deferred.
- Validation exists where it matters now: create-vault input and typed route parsing.

## What Remains For Later Phases
- Real wallet connection and network handling
- Arabic localization and RTL runtime implementation
- Smart contract package, ABIs, read/write helpers, and transaction flows
- Backend services, metadata persistence, and indexed activity APIs
- Real loading, error, and empty states driven by live data
- CI, linting, and release automation

## Risks And Follow-Up Notes
- Expo Router group-based app entry relies on explicit internal navigation to `/(app)` while preserving the public landing route at `/`.
- Wallet and data boundaries are intentionally placeholders, so future phases should preserve the current component hierarchy and replace data sources rather than rewrite screens.
- The current typography uses platform defaults; a branded font system can be added later if it does not compromise universal app stability.
- Arabic and RTL were planned in Phase 0 but not implemented in this Phase 1 scaffold.
