# Pocket Vault Universal React Native Phase 0 Engineering Spec

## Purpose
This document defines the build-ready Phase 0 engineering plan for Pocket Vault as a single universal React Native product running on iOS, Android, and web from one Expo-based codebase.

## Locked Product Scope

### Included in `v1`
- Base only
- USDC only
- wallet-first experience
- create vault
- time lock only
- deposit anytime
- withdraw only after unlock date
- vault list
- vault detail
- offchain vault metadata
- indexed activity feed
- premium light-theme UI
- one codebase for iOS, Android, and web
- English and Arabic

### Explicitly excluded from `v1`
- cooldown unlock
- guardian approval
- yield
- swaps
- multi-asset support
- multichain
- social features
- AI assistant
- separate web app architecture
- separate native apps

## Product Principles
- One vault per goal
- Saving should feel intentional and emotionally meaningful
- Depositing should feel easy
- Withdrawing should feel serious
- No crypto casino design language
- No cluttered dashboards
- No dark DeFi aesthetic
- Calm, premium, light-themed interface
- The same product language and UX should work across web and mobile

## Assumptions
- The repository will be scaffolded as a `pnpm` workspace monorepo.
- `apps/mobile` will be the only app surface and will use Expo Router for native and web.
- The backend remains thin and can stay Node-based with Fastify, Prisma, PostgreSQL, and zod.
- The contracts remain Solidity + Foundry.
- Platform-specific files are allowed only for small isolated concerns such as wallet connector glue, web document direction updates, or modal presentation differences.
- Arabic on native should be treated as a real RTL experience. Because React Native `I18nManager` applies RTL changes on the next app start, native language changes that cross direction boundaries should explicitly trigger an app reload instead of pretending the switch is instantaneous.

## 1. Final Recommended Architecture

### Core architecture
- One Expo-based React Native app for iOS, Android, and web
- Expo Router for file-based routing and navigation across all targets
- TypeScript across app, backend, SDK, and shared packages
- React Native primitives and cross-platform styling first
- Shared business logic, validation, formatting, and domain models by default
- Thin backend for metadata persistence and event indexing
- Onchain contracts as the source of financial truth
- Built-in scalable localization and direction system from the start

### Architectural layers

Presentation:
- `apps/mobile`
- universal screens
- adaptive layout components
- Expo Router route groups
- localization-aware UI shell

Product logic:
- `packages/shared`
- form validation
- formatting
- domain models
- status derivation
- localization keys and typed translation metadata

Localization:
- `packages/localization`
- translation resources
- locale metadata
- direction helpers
- i18n initialization

API integration:
- `packages/api-client`
- typed request functions
- zod-backed response parsing

Blockchain integration:
- `packages/contracts-sdk`
- ABI exports
- chain config
- read/write helpers

Contracts:
- `packages/contracts`
- Solidity source
- Foundry tests
- deployment scripts

Backend:
- metadata persistence
- event indexing
- merged read endpoints

### Non-negotiable architectural rule
Web must be the Expo Router React Native web target from the same app. No separate Next.js app, no separate React web frontend, and no duplicated product logic per platform.

## 2. Exact Monorepo Structure

```text
apps/
  mobile/
    app.json
    babel.config.js
    metro.config.js
    package.json
    tsconfig.json
    src/
      app/
        _layout.tsx
        index.tsx
        (marketing)/
          _layout.tsx
          how-it-works.tsx
          security.tsx
        (app)/
          _layout.tsx
          index.tsx
          vaults/
            new.tsx
            [vaultAddress].tsx
          activity.tsx
      components/
      features/
      hooks/
      lib/
      state/
      theme/
      types/
      providers/
      constants/
      assets/
services/
  api/
    src/
      app.ts
      server.ts
      modules/
      lib/
      jobs/
    prisma/
      schema.prisma
      migrations/
packages/
  contracts/
    src/
    script/
    test/
    foundry.toml
  contracts-sdk/
    src/
      abi/
      addresses/
      read/
      write/
      types/
  api-client/
    src/
      client/
      vaults/
      activity/
      schemas/
      types/
  shared/
    src/
      domain/
      validation/
      format/
      constants/
      state/
      utils/
  localization/
    src/
      config/
      resources/
      hooks/
      utils/
      types/
  config/
    eslint/
    typescript/
    prettier/
docs/
  plans/
```

## 3. Exact Expo App Structure

```text
apps/mobile/src/
  app/
    _layout.tsx
    index.tsx
    (marketing)/
      _layout.tsx
      how-it-works.tsx
      security.tsx
    (app)/
      _layout.tsx
      index.tsx
      vaults/
        new.tsx
        [vaultAddress].tsx
      activity.tsx
  components/
    primitives/
      DirectionRow.tsx
      DirectionText.tsx
      DirectionIcon.tsx
    layout/
      RootStack.tsx
      MarketingShell.tsx
      AppShell.tsx
      TopBar.tsx
      LanguageSwitcher.tsx
      ScreenContainer.tsx
      AdaptiveContentFrame.tsx
    marketing/
      HeroSection.tsx
      HeroVaultArtifact.tsx
      HowItWorksSection.tsx
      TrustSection.tsx
      MarketingCtaPanel.tsx
    vaults/
      VaultCard.tsx
      VaultCardHeader.tsx
      VaultCardProgress.tsx
      VaultStatusChip.tsx
      VaultGrid.tsx
      VaultHeader.tsx
      VaultProgressPanel.tsx
      VaultRulePanel.tsx
      VaultActionsPanel.tsx
      VaultActivityPreview.tsx
      VaultStatsRow.tsx
    create-vault/
      CreateVaultStepper.tsx
      GoalDetailsForm.tsx
      RuleSelectionForm.tsx
      ReviewCreatePanel.tsx
      VaultPreviewCard.tsx
    flows/
      DepositSheet.tsx
      WithdrawSheet.tsx
      TransactionStatusSheet.tsx
    feedback/
      EmptyVaultState.tsx
      LoadingVaultCard.tsx
      VaultDetailSkeleton.tsx
      InlineErrorState.tsx
  features/
    vaults/
      hooks/
      screens/
      state/
      utils/
    wallet/
      hooks/
      providers/
      services/
    activity/
      hooks/
      screens/
    localization/
      hooks/
      providers/
      utils/
    marketing/
      screens/
  hooks/
    useBreakpoint.ts
    useAdaptiveLayout.ts
    useModalPresentation.ts
  lib/
    contracts/
      addresses.ts
      chains.ts
      wallet/
        createWalletClient.native.ts
        createWalletClient.ts
        connectors.native.ts
        connectors.ts
    api/
      client.ts
    platform/
      linking.ts
      storage.ts
      direction.native.ts
      direction.ts
  state/
    uiStore.ts
    localeStore.ts
  theme/
    colors.ts
    spacing.ts
    radii.ts
    typography.ts
    shadows.ts
    tokens.ts
  providers/
    AppProviders.tsx
    QueryProvider.tsx
    WalletProvider.tsx
    ThemeProvider.tsx
    LocalizationProvider.tsx
  types/
    navigation.ts
    localization.ts
```

## 4. Exact Package Boundaries

### `apps/mobile`
Responsibility:
- all product surfaces for iOS, Android, and web
- route files
- screen composition
- adaptive layout behavior
- wallet UX presentation
- transaction UX presentation
- localized strings via hooks only

Must not contain:
- Solidity source
- backend implementation
- duplicated domain logic that belongs in shared packages
- raw translation dictionaries

### `packages/contracts`
Responsibility:
- Solidity contracts
- Foundry tests
- deployment scripts

### `packages/contracts-sdk`
Responsibility:
- exported ABIs
- chain addresses
- typed read helpers
- typed write helpers
- chain constants for Base and Base Sepolia

### `packages/api-client`
Responsibility:
- typed API functions
- endpoint-specific schema validation
- response parsing
- request payload typing

### `packages/shared`
Responsibility:
- domain models
- zod validators
- derived status helpers
- formatters
- numeric helpers
- route-independent product logic

### `packages/localization`
Responsibility:
- translation resources
- locale registry
- direction metadata
- i18n bootstrapping
- typed translation keys
- interpolation helpers

### `packages/config`
Responsibility:
- shared TypeScript, lint, and formatting config

### `services/api`
Responsibility:
- metadata persistence
- event indexing
- merged read endpoints

## 5. Exact Route Map Using Expo Router

### Root routes
- `src/app/_layout.tsx`
- `src/app/index.tsx`

### Marketing route group
- `src/app/(marketing)/_layout.tsx`
- `src/app/(marketing)/how-it-works.tsx`
- `src/app/(marketing)/security.tsx`

### Authenticated route group
- `src/app/(app)/_layout.tsx`
- `src/app/(app)/index.tsx`
- `src/app/(app)/vaults/new.tsx`
- `src/app/(app)/vaults/[vaultAddress].tsx`
- `src/app/(app)/activity.tsx`

### Route responsibilities

`/`
- landing screen
- hero statement
- sample vault artifact
- how-it-works summary
- trust section
- CTA into app

`/how-it-works`
- explain create, deposit, lock, withdraw
- explain one vault per goal

`/security`
- explain Base + USDC scope
- explain chain as source of truth
- explain thin backend role
- explain what the product does not do

`/(app)/index`
- My Vaults screen
- total saved
- vault count
- responsive vault grid/list
- create CTA

`/(app)/vaults/new`
- 3-step create flow
- live vault preview

`/(app)/vaults/[vaultAddress]`
- vault detail
- progress
- rule status
- deposit
- withdraw or locked state
- activity preview

`/(app)/activity`
- cross-vault timeline

## 6. Exact Component Map

### Layout
- `RootStack`
- `MarketingShell`
- `AppShell`
- `TopBar`
- `LanguageSwitcher`
- `ScreenContainer`
- `AdaptiveContentFrame`

### Marketing
- `HeroSection`
- `HeroVaultArtifact`
- `HowItWorksSection`
- `TrustSection`
- `MarketingCtaPanel`

### Vault list
- `VaultGrid`
- `VaultCard`
- `VaultCardHeader`
- `VaultCardProgress`
- `VaultStatusChip`

### Vault detail
- `VaultHeader`
- `VaultProgressPanel`
- `VaultRulePanel`
- `VaultActionsPanel`
- `VaultActivityPreview`
- `VaultStatsRow`

### Create vault flow
- `CreateVaultStepper`
- `GoalDetailsForm`
- `RuleSelectionForm`
- `ReviewCreatePanel`
- `VaultPreviewCard`

### Transaction flows
- `DepositSheet`
- `WithdrawSheet`
- `TransactionStatusSheet`

### Feedback
- `EmptyVaultState`
- `LoadingVaultCard`
- `VaultDetailSkeleton`
- `InlineErrorState`

## 7. Exact Hook Map

### App-level hooks
- `useBreakpoint()`
- `useAdaptiveLayout()`
- `useModalPresentation()`

### Wallet hooks
- `useWalletSession()`
- `useWalletAccount()`
- `useWalletChain()`
- `useWalletActions()`
- `useWalletNetworkGuard()`

### Vault hooks
- `useVaultList(ownerAddress)`
- `useVaultDetail(vaultAddress)`
- `useVaultActivity(vaultAddress)`
- `useCreateVaultPreview()`
- `useCreateVaultFlow()`
- `useCreateVaultMutation()`
- `useDepositFlow(vaultAddress)`
- `useWithdrawFlow(vaultAddress)`
- `useUsdcAllowance(ownerAddress, spenderAddress)`
- `useUnlockCountdown(unlockAt)`

### Localization hooks
- `useAppLocale()`
- `useLanguageSwitcher()`
- `useDirection()`
- `useTranslationNamespace(namespace)`
- `useLocalizedFormatter()`

### Shared state hooks
- `useUiStore()`
- `usePendingTransactionState()`

## 8. Exact Smart Contract Interfaces

### `GoalVaultFactory`

```solidity
interface IGoalVaultFactory {
    event VaultCreated(
        address indexed owner,
        address indexed vault,
        address indexed asset,
        uint256 targetAmount,
        uint64 unlockAt,
        uint256 createdAt
    );

    function usdc() external view returns (address);
    function isGoalVault(address vault) external view returns (bool);
    function createVault(uint256 targetAmount, uint64 unlockAt) external returns (address vault);
    function getVaultsByOwner(address owner) external view returns (address[] memory);
}
```

### `GoalVault`

```solidity
interface IGoalVault {
    error AmountMustBeGreaterThanZero();
    error NotVaultOwner();
    error VaultStillLocked(uint64 unlockAt);
    error InsufficientVaultBalance(uint256 requested, uint256 available);
    error InvalidUnlockTime();

    event Deposited(address indexed from, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed to, uint256 amount, uint256 timestamp);

    function owner() external view returns (address);
    function asset() external view returns (address);
    function targetAmount() external view returns (uint256);
    function unlockAt() external view returns (uint64);
    function totalDeposited() external view returns (uint256);
    function totalWithdrawn() external view returns (uint256);

    function deposit(uint256 amount) external;
    function withdraw(uint256 amount, address to) external;

    function getSummary()
        external
        view
        returns (
            address vaultOwner,
            address vaultAsset,
            uint256 vaultTargetAmount,
            uint64 vaultUnlockAt,
            uint256 vaultTotalDeposited,
            uint256 vaultTotalWithdrawn,
            uint256 vaultBalance,
            bool vaultIsUnlocked
        );
}
```

### Contract rules
- only one token: USDC
- only one rule: time lock
- unlock time must be in the future
- deposits allowed anytime
- withdrawals owner-only and post-unlock only
- zero-value deposit and zero-value withdraw revert
- no upgradeable proxy
- no cooldown logic
- no guardian logic
- no multi-asset abstraction

## 9. Exact Backend Modules

Directory:

```text
services/api/src/modules/
  health/
  users/
  vaults/
  vault-events/
  indexer/
```

### `health`
- health route
- service status payload

### `users`
- resolve wallet summary
- count user vaults
- aggregate saved total from indexed and fallback reads

### `vaults`
- create metadata record after onchain creation
- fetch merged vault cards by owner
- fetch merged vault detail
- optional cosmetic metadata patch only if approved

### `vault-events`
- fetch vault activity
- fetch cross-vault activity for owner
- normalize event payloads

### `indexer`
- factory event sync
- vault event sync
- sync state management
- retry-safe upserts

## 10. Exact Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  walletAddress String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Vault {
  id              String   @id @default(cuid())
  contractAddress String   @unique
  chainId         Int
  ownerWallet     String
  displayName     String
  category        String?
  note            String?
  accentTheme     String?
  targetAmount    Decimal  @db.Decimal(36, 6)
  unlockAt        DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  events          VaultEvent[]

  @@index([ownerWallet, createdAt])
}

model VaultEvent {
  id          String   @id @default(cuid())
  vaultId     String
  txHash      String
  blockNumber BigInt
  logIndex    Int
  eventType   String
  actorWallet String?
  amount      Decimal? @db.Decimal(36, 6)
  createdAt   DateTime

  vault       Vault    @relation(fields: [vaultId], references: [id], onDelete: Cascade)

  @@unique([txHash, logIndex])
  @@index([vaultId, createdAt])
}

model ChainSyncState {
  key       String   @id
  lastBlock BigInt
  updatedAt DateTime @updatedAt
}
```

## 11. Exact API Endpoints

Prefix all endpoints with `/v1`.

### Health
- `GET /v1/health`

### Vault list and detail
- `GET /v1/vaults?owner=0x...`
- `GET /v1/vaults/:vaultAddress`

### Vault activity
- `GET /v1/vaults/:vaultAddress/activity`
- `GET /v1/activity?owner=0x...`

### Metadata creation
- `POST /v1/vaults`

### Cosmetic metadata update
- `PATCH /v1/vaults/:vaultAddress`

`PATCH` should ship only if cosmetic metadata editing remains in scope after implementation review. If not, keep the route unimplemented in `v1`.

### Internal indexing
- `POST /v1/internal/indexer/sync-factory`
- `POST /v1/internal/indexer/sync-vault/:vaultAddress`

### Typed response shapes

Vault list item:

```ts
type VaultListItem = {
  vaultAddress: string
  ownerWallet: string
  displayName: string
  category: string | null
  note: string | null
  accentTheme: string | null
  targetAmount: string
  unlockAt: string
  totalDeposited: string
  totalWithdrawn: string
  balance: string
  isUnlocked: boolean
  status: "locked" | "withdrawable" | "closed"
  progressPercent: number
}
```

Vault activity item:

```ts
type VaultActivityItem = {
  vaultAddress: string
  eventType: "vault_created" | "deposit" | "withdrawal"
  txHash: string
  actorWallet: string | null
  amount: string | null
  createdAt: string
}
```

## 12. Exact Indexing Strategy

### Principles
- do not overbuild
- chain is source of truth
- backend indexes for speed and presentation only
- read paths must tolerate lag

### Factory indexing flow
1. poll `GoalVaultFactory` `VaultCreated` events
2. upsert vault metadata shell row if metadata is not yet saved
3. register vault for individual event polling
4. store latest synced factory block

### Vault event indexing flow
1. poll `Deposited` and `Withdrawn` events for tracked vaults
2. normalize event rows
3. upsert by `txHash + logIndex`
4. store latest synced block per sync key

### Read fallback strategy
- if metadata exists but activity lags, show metadata + direct chain summary
- if onchain vault exists but metadata is missing, return fallback display object
- if activity is partially indexed, order indexed rows and allow later refresh

## 13. Exact Screen-by-Screen Implementation Plan

### 1. Landing screen
Build:
- hero statement
- supporting line
- CTA
- sample vault artifact
- how-it-works section
- trust/security section
- visible language switcher in top bar

Behavior:
- same content hierarchy across mobile and web
- adaptive hero layout
- no web-only decorative sections

### 2. My Vaults screen
Build:
- total saved
- vault count
- create vault CTA
- responsive vault grid/list
- empty state

Behavior:
- 1-column stack on phones
- 2-column or 3-column grid on larger screens
- same card system in English and Arabic

### 3. Create Vault flow
Build:
- 3-step flow max
- step 1 goal details
- step 2 time-lock rule
- step 3 review and create
- live preview card

Behavior:
- stepper stays consistent across touch and pointer devices
- preview updates from shared form state
- form labels, field alignment, and progression must feel natural in LTR and RTL

### 4. Vault Detail screen
Build:
- goal name
- note
- saved amount
- target amount
- progress
- unlock date
- status
- deposit CTA
- withdraw CTA or locked state
- activity preview

Behavior:
- stacked panels on phone
- split content panels on tablet/web when space allows

### 5. Deposit flow
Build:
- amount input
- balance
- max action
- allowance state
- approve flow
- deposit submission
- progress preview
- transaction status

### 6. Withdraw flow
Build:
- locked state with exact unlock date
- withdraw entry only when eligible
- amount input
- destination default to connected wallet
- deliberate confirmation
- transaction status

### 7. Activity screen
Build:
- cross-vault timeline
- event ordering
- vault label on each item
- empty and loading states

## 14. Exact Adaptive UI Strategy

### Breakpoint model
- `compact`: phone widths
- `medium`: tablet / narrow web
- `expanded`: desktop web / large tablet

### Shared adaptive rules
- same components across breakpoints
- layouts adapt by composition, not by separate screen implementations
- spacing scale increases with breakpoint
- panels widen on larger screens but keep readable max width

### Mobile behavior
- single-column structure
- bottom sheets for deposit and withdraw flows
- sticky primary actions where helpful
- larger touch targets

### Tablet behavior
- two-panel compositions where useful
- forms can sit beside preview panels
- detail screen can show progress/rule/action grouping more clearly

### Web behavior
- centered content frame
- wider hero and card layouts
- responsive grid for vaults
- dialog or side-panel presentation for some flows

### Presentation rule
Use adaptive containers and presentation wrappers rather than separate mobile and web product implementations.

## 15. Exact Wallet Integration Strategy

### Recommended approach
Use a wallet abstraction boundary inside `apps/mobile/src/lib/contracts/wallet/` with a shared domain interface and small platform-specific connector modules only where required.

### Native recommendation
Use Reown AppKit for React Native with the Wagmi adapter inside Expo for iOS and Android.

### Web recommendation
Use the same wallet domain interface but a small web-specific connector implementation for browser wallet connections on Expo web.

This isolated platform-specific adapter is justified because browser-injected wallet behavior differs from native wallet deep-link / modal behavior. The product logic, transaction flows, and wallet-facing hooks remain shared.

### Wallet architecture

Shared interface:
- `connect()`
- `disconnect()`
- `switchChain()`
- `getAccount()`
- `getWalletClient()`
- `getPublicClient()`

Native adapter:
- Reown AppKit React Native
- Wagmi adapter
- WalletConnect modal/deep-link flow
- Base and Base Sepolia networks only

Web adapter:
- browser wallet connector flow
- same account and chain interface returned to app hooks

### Rules
- no web-only wallet architecture leaking into app logic
- no duplicate transaction logic
- all write flows use shared contract helpers from `packages/contracts-sdk`
- all UI hooks read wallet state through one provider boundary

## 16. Dual-Language And RTL Strategy

### Languages
- `en` is the default language
- `ar` is the second launch language

### Recommended stack
- `expo-localization` for locale detection
- `i18next` for runtime translation management
- `react-i18next` for React bindings
- React Native `I18nManager` for RTL behavior on native
- web document `lang` and `dir` synchronization through a small web-aware platform utility

### Localization architecture

`packages/localization/src/config/`
- `i18n.ts`
- `locales.ts`
- `direction.ts`

`packages/localization/src/resources/`
- `en/common.json`
- `en/marketing.json`
- `en/vaults.json`
- `en/activity.json`
- `ar/common.json`
- `ar/marketing.json`
- `ar/vaults.json`
- `ar/activity.json`

`packages/localization/src/utils/`
- `bidi.ts`
- `formatting.ts`

### Translation model
- namespace-based translation files
- semantic keys, not raw-English keys
- interpolation only through typed helpers
- future languages added by extending locale registry and resource files
- every shared namespace keeps identical key coverage across `en` and `ar`
- screen copy, status copy, validation copy, and transaction copy must all live in translation resources instead of route files or leaf components

### Direction model
- locale registry defines `direction: "ltr" | "rtl"`
- app shell exposes current direction through context
- layout components use direction-aware primitives and tokens
- icons that imply direction must support mirroring
- row alignment, text alignment, padding, margins, and navigation affordances must derive from direction-aware helpers instead of one-off conditionals
- shared UI must use start/end semantics instead of left/right semantics wherever layout intent is logical rather than absolute

### Direction-aware component system
- create a small set of reusable primitives for row flow, text alignment, and directional icon mirroring before building feature screens
- design tokens and helper utilities must expose logical spacing and alignment values that work in both directions
- forms, cards, dialogs, dropdowns, and tables should consume the same direction helpers instead of implementing their own RTL branching
- mixed-direction values such as wallet addresses, hashes, transaction ids, and numeric amounts must render through dedicated helpers so Arabic UI does not corrupt machine-readable strings

### Header language switcher
- place the language switcher in the top bar on both marketing and authenticated shells
- make it a first-class control, not a settings-only menu item
- use a polished segmented or pill-style control that clearly exposes `English` and `العربية`
- persist the selected locale in app storage and restore it on startup
- on native direction changes, show a short explicit state change message and perform the controlled reload immediately after the user confirms the switch

### Required runtime behavior

On web:
- update `document.documentElement.lang`
- update `document.documentElement.dir`
- update app shell direction context immediately

On native:
- initialize locale and direction at startup
- when changing between `en` and `ar`, persist the new locale
- when direction boundary changes, update `I18nManager` and trigger a controlled app reload

### Translation governance
- English remains the source locale for key naming, but Arabic copy is a launch requirement rather than a post-launch backlog item
- new features are not complete unless both `en` and `ar` namespaces are updated in the same change
- translation resources should be validated for namespace parity during CI once the workspace is scaffolded
- content review must cover tone, truncation risk, and legal or trust-sensitive wording in both languages

### Language switcher requirements
- visible in header / top bar
- available on marketing and app screens
- labeled clearly
- supports `English` and `العربية`
- visually integrated into premium UI
- no hidden settings-only access

### RTL component requirements
- header and nav actions mirror correctly
- forms align naturally in Arabic
- buttons respect icon placement and content flow
- cards and timelines reverse cleanly where appropriate
- dialogs and sheets respect RTL spacing and affordances
- lists, tables, and dropdowns use direction-aware alignment rules
- inline validation, toasts, and transactional status messaging remain readable in both directions
- amount, date, and countdown formatting stay locale-aware without breaking semantic meaning

## 17. Phase-by-Phase Implementation Order

### Phase 0
- finalize universal architecture
- finalize route map
- finalize adaptive UI rules
- finalize wallet integration boundary
- finalize contract and backend interfaces
- finalize localization, Arabic, and RTL architecture

### Phase 1
- scaffold Expo app
- scaffold route groups
- add theme tokens
- add localization package and provider boundary
- build direction-aware primitives and logical spacing helpers
- build static screens and adaptive shells
- add visible language switcher
- establish translation namespace parity rules

### Phase 2
- implement contracts
- add tests
- export contracts SDK

### Phase 3
- implement backend schema and modules
- implement indexing jobs
- implement typed API client

### Phase 4
- implement wallet provider boundary
- implement native and web connector glue
- implement read flows for dashboard and detail
- connect i18n-aware formatting and direction-aware layout
- add locale-aware formatting helpers for currency, dates, countdowns, and mixed LTR content inside Arabic UI

### Phase 5
- implement create vault flow
- onchain create
- offchain metadata save
- success navigation

### Phase 6
- implement deposit flow
- allowance handling
- deposit transaction updates

### Phase 7
- implement withdraw flow
- locked-state UX
- eligible withdrawal UX

### Phase 8
- polish adaptive layouts
- polish RTL and Arabic presentation
- security/trust screens
- staging validation across iOS, Android, and web
- run bilingual regression pass across all launch surfaces

## 18. Acceptance Criteria Per Phase

### Phase 0 acceptance
- architecture is explicitly universal React Native
- no separate web app appears anywhere in the plan
- route map, packages, wallet boundary, backend modules, contracts, and localization system are frozen

### Phase 1 acceptance
- Expo app runs on iOS, Android, and web
- all main routes exist
- UI is calm, premium, and light-themed
- layouts adapt without separate screen implementations
- language switcher is visible and polished
- direction-aware primitives exist before feature-level RTL fixes begin

### Phase 2 acceptance
- contracts compile and pass tests
- Base Sepolia deployment succeeds
- contracts SDK exports are usable by app and backend

### Phase 3 acceptance
- backend persists metadata
- backend serves merged vault list/detail/activity
- event indexing is idempotent

### Phase 4 acceptance
- wallet connection works on native and web through one provider boundary
- dashboard and detail can render real data
- wrong-network handling is clear
- English and Arabic both render through the same component tree
- Arabic applies proper RTL behavior on native and web

### Phase 5 acceptance
- user can create a vault end to end
- metadata persists after onchain create
- new vault appears in list and detail views
- create flow feels natural in both English and Arabic

### Phase 6 acceptance
- user can approve USDC and deposit
- progress and activity update correctly
- error states are explicit
- deposit UI remains visually correct in RTL

### Phase 7 acceptance
- locked state explains why withdrawal is unavailable
- eligible withdrawal works
- status, balance, and activity update correctly
- withdrawal confirmation remains serious and clear in both languages

### Phase 8 acceptance
- phone, tablet, and web layouts feel intentionally designed
- no screen feels like a stretched phone UI or shrunken website
- translation coverage for launch surfaces is complete
- RTL regressions are not present on core flows
- core flows feel launchable
- English and Arabic namespace parity is verified for all launch routes

## 19. Key Technical Risks And Edge Cases

### Risks
- wallet UX divergence between native deep-link flows and browser wallets
- React Native web layout regressions if components assume phone sizes only
- indexing lag causing temporary mismatch between chain state and activity feed
- decimal precision mistakes around USDC display and storage
- route and modal behavior drifting across platforms if presentation is not centralized
- RTL drift caused by direction being handled ad hoc instead of through shared primitives
- native reload requirement when switching direction could create confusing UX if not handled explicitly

### Edge cases
- wrong network
- wallet disconnect during transaction
- failed approval
- failed deposit
- failed withdraw
- duplicate metadata save after successful onchain create
- onchain vault exists before metadata save completes
- indexed activity missing immediately after transaction
- native deep-link return flow timing issues
- web wallet popup rejection
- zero amount deposit
- zero amount withdraw
- withdraw before unlock
- withdraw by non-owner
- withdraw more than balance
- English strings missing but Arabic exists
- Arabic strings missing but English exists
- mirrored icons not matching direction
- mixed LTR/RTL content such as wallet addresses and currency amounts inside Arabic UI

## 20. Files And Folders To Create First

### Monorepo root
- `pnpm-workspace.yaml`
- `turbo.json`
- `package.json`
- `tsconfig.base.json`

### Expo app
- `apps/mobile/package.json`
- `apps/mobile/app.json`
- `apps/mobile/babel.config.js`
- `apps/mobile/metro.config.js`
- `apps/mobile/tsconfig.json`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/app/index.tsx`
- `apps/mobile/src/app/(marketing)/_layout.tsx`
- `apps/mobile/src/app/(marketing)/how-it-works.tsx`
- `apps/mobile/src/app/(marketing)/security.tsx`
- `apps/mobile/src/app/(app)/_layout.tsx`
- `apps/mobile/src/app/(app)/index.tsx`
- `apps/mobile/src/app/(app)/vaults/new.tsx`
- `apps/mobile/src/app/(app)/vaults/[vaultAddress].tsx`
- `apps/mobile/src/app/(app)/activity.tsx`
- `apps/mobile/src/providers/AppProviders.tsx`
- `apps/mobile/src/providers/LocalizationProvider.tsx`
- `apps/mobile/src/components/layout/LanguageSwitcher.tsx`
- `apps/mobile/src/theme/tokens.ts`
- `apps/mobile/src/hooks/useBreakpoint.ts`
- `apps/mobile/src/lib/platform/direction.native.ts`
- `apps/mobile/src/lib/platform/direction.ts`

### Localization package
- `packages/localization/package.json`
- `packages/localization/src/config/i18n.ts`
- `packages/localization/src/config/locales.ts`
- `packages/localization/src/config/direction.ts`
- `packages/localization/src/resources/en/common.json`
- `packages/localization/src/resources/en/marketing.json`
- `packages/localization/src/resources/en/vaults.json`
- `packages/localization/src/resources/en/activity.json`
- `packages/localization/src/resources/ar/common.json`
- `packages/localization/src/resources/ar/marketing.json`
- `packages/localization/src/resources/ar/vaults.json`
- `packages/localization/src/resources/ar/activity.json`
- `packages/localization/src/hooks/useAppLocale.ts`
- `packages/localization/src/hooks/useDirection.ts`

### Shared packages
- `packages/shared/package.json`
- `packages/shared/src/domain/vault.ts`
- `packages/shared/src/validation/vault.ts`
- `packages/shared/src/format/currency.ts`
- `packages/shared/src/state/vaultStatus.ts`

### Contracts packages
- `packages/contracts/package.json`
- `packages/contracts/src/GoalVault.sol`
- `packages/contracts/src/GoalVaultFactory.sol`
- `packages/contracts/test/GoalVault.t.sol`
- `packages/contracts/test/GoalVaultFactory.t.sol`
- `packages/contracts-sdk/package.json`
- `packages/contracts-sdk/src/abi/`
- `packages/contracts-sdk/src/addresses/`

### Backend
- `services/api/package.json`
- `services/api/src/app.ts`
- `services/api/src/server.ts`
- `services/api/src/modules/health/routes.ts`
- `services/api/src/modules/vaults/routes.ts`
- `services/api/src/modules/vault-events/routes.ts`
- `services/api/src/modules/indexer/service.ts`
- `services/api/prisma/schema.prisma`

### API client
- `packages/api-client/package.json`
- `packages/api-client/src/client/index.ts`
- `packages/api-client/src/vaults/index.ts`
- `packages/api-client/src/activity/index.ts`
- `packages/api-client/src/schemas/vault.ts`

## Validation Checklist

### Translation coverage
- every launch route has English and Arabic content
- no fallback keys appear in UI
- all shared namespaces load successfully

### RTL switching
- native startup in Arabic is RTL
- web runtime switch updates `lang` and `dir`
- native direction switch performs a controlled reload when needed

### Layout integrity
- header, cards, forms, buttons, sheets, and timelines remain visually correct in both directions
- touch targets remain correct on mobile
- expanded layouts remain balanced on web

### Regression risk
- wallet flows still work on web and native after localization layer is added
- formatting of addresses, amounts, and dates remains correct in English and Arabic
- no platform-specific implementation leaks into shared product logic
