# Pocket Vault Build-Ready Execution Plan

## 1. Scope Lock

### `v1` must support only
- Base
- USDC
- wallet connect
- create vault
- time-locked withdrawal
- deposit anytime
- withdraw after unlock date
- vault list
- vault detail
- offchain vault metadata
- activity feed from indexed onchain events

### Explicitly not in `v1`
- cooldown unlock
- guardian approval
- yield
- swaps
- multi-asset support
- multichain
- social features
- AI assistant
- public vault sharing
- vault edit after creation beyond cosmetic metadata

This scope keeps the product aligned with the core idea instead of drifting into generic crypto software.

## 2. Technical Assumptions

Use this stack unless the real repo scaffold introduces a different backbone:

### Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- wagmi
- viem
- RainbowKit or Privy
- TanStack Query
- Zustand only if a small client store is truly needed
- Framer Motion only for subtle state transitions

### Backend
- Fastify
- TypeScript
- Prisma
- PostgreSQL
- zod for request and response validation
- lightweight indexer service inside the API app or a worker package

### Contracts
- Solidity
- Foundry
- OpenZeppelin
- Base Sepolia for test deployment
- Base mainnet for launch

### Repo shape
- `pnpm` workspace / Turborepo monorepo

If the codebase later differs, map this plan into the existing architecture instead of rewriting the repo to force the plan.

## 3. Recommended Monorepo Structure

```text
apps/
  web/
    src/
      app/
        (marketing)/
          page.tsx
          how-it-works/page.tsx
          security/page.tsx
        app/
          layout.tsx
          page.tsx
          vaults/
            new/page.tsx
            [vaultAddress]/page.tsx
          activity/page.tsx
      components/
        marketing/
        vaults/
        forms/
        feedback/
        layout/
      hooks/
      lib/
        api/
        chains/
        contracts/
        format/
        validation/
      state/
      styles/
  api/
    src/
      app.ts
      server.ts
      modules/
        health/
        users/
        vaults/
        vault-events/
        indexer/
      lib/
        db/
        chain/
        env/
        validation/
      jobs/
        sync-factory-events.ts
        sync-vault-events.ts
packages/
  contracts/
    src/
      GoalVault.sol
      GoalVaultFactory.sol
      interfaces/
      libraries/
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
  ui/
    src/
      components/
      tokens/
  config/
  types/
```

## 4. Product Architecture

### Core model
A vault is a hybrid object.

Onchain:
- owner
- asset address
- unlock timestamp
- target amount
- total deposited
- total withdrawn
- state derived from timestamps and balances

Offchain:
- display name
- category
- note
- accent theme
- created display timestamp
- optional archived flag later

This split keeps personal metadata offchain while leaving money and lock logic onchain.

## 5. `v1` Smart Contract Design

Keep the contracts boring.

### 5.1 `GoalVaultFactory`

Responsibilities:
- create a new vault
- register vault by owner
- emit vault creation event

Storage:

```solidity
address public immutable usdc;
mapping(address => address[]) private vaultsByOwner;
mapping(address => bool) public isGoalVault;
```

Functions:

```solidity
function createVault(
  uint256 targetAmount,
  uint64 unlockAt
) external returns (address vault);

function getVaultsByOwner(address owner) external view returns (address[] memory);
```

Events:

```solidity
event VaultCreated(
  address indexed owner,
  address indexed vault,
  address indexed asset,
  uint256 targetAmount,
  uint64 unlockAt,
  uint256 createdAt
);
```

### 5.2 `GoalVault`

Responsibilities:
- accept deposits in USDC
- block withdrawals before unlock time
- allow withdrawals only by owner after unlock
- expose read helpers for frontend and indexer

Storage:

```solidity
address public immutable owner;
address public immutable asset;
uint256 public immutable targetAmount;
uint64 public immutable unlockAt;

uint256 public totalDeposited;
uint256 public totalWithdrawn;
```

Derived values:
- current balance = token balance of contract
- `isUnlocked = block.timestamp >= unlockAt`
- `isClosed = current balance == 0 && totalWithdrawn > 0` for UI classification only

Functions:

```solidity
function deposit(uint256 amount) external;
function withdraw(uint256 amount, address to) external;
function getSummary() external view returns (
  address vaultOwner,
  address vaultAsset,
  uint256 vaultTargetAmount,
  uint64 vaultUnlockAt,
  uint256 vaultTotalDeposited,
  uint256 vaultTotalWithdrawn,
  uint256 vaultBalance,
  bool vaultIsUnlocked
);
```

Events:

```solidity
event Deposited(address indexed from, uint256 amount, uint256 timestamp);
event Withdrawn(address indexed to, uint256 amount, uint256 timestamp);
```

Guardrails:
- deposit rejects zero
- withdraw owner only
- withdraw rejects zero
- withdraw reverts before `unlockAt`
- withdraw reverts if `amount > balance`
- use `SafeERC20`
- use custom errors

Custom errors:

```solidity
error AmountMustBeGreaterThanZero();
error NotVaultOwner();
error VaultStillLocked(uint64 unlockAt);
error InsufficientVaultBalance(uint256 requested, uint256 available);
error InvalidUnlockTime();
```

### 5.3 Why this design is right for `v1`
- one token
- one rule
- one owner
- no upgradeability complexity
- no proxy pattern
- no guardian state machine yet

This matches the intended release strategy: strict scope, simple logic, time lock first.

## 6. `v1` Backend Design

The backend should be thin.

Responsibilities:
- store vault metadata
- serve user vault list quickly
- expose merged vault detail
- index factory and vault events
- power the activity feed
- support UI performance and trust clarity

Do not use the backend for:
- custody
- business logic that overrides chain truth
- simulated balances
- fake statuses

The chain is the source of truth for money and lock logic.

## 7. Database Schema

### `users`

```prisma
model User {
  id            String   @id @default(cuid())
  walletAddress String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  vaults        Vault[]
}
```

### `vaults`

```prisma
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
}
```

### `vault_events`

```prisma
model VaultEvent {
  id          String   @id @default(cuid())
  vaultId     String
  txHash      String   @unique
  blockNumber BigInt
  logIndex    Int
  eventType   String
  actorWallet String?
  amount      Decimal? @db.Decimal(36, 6)
  createdAt   DateTime

  vault       Vault    @relation(fields: [vaultId], references: [id], onDelete: Cascade)

  @@index([vaultId, createdAt])
}
```

### `chain_sync_state`

```prisma
model ChainSyncState {
  key       String   @id
  lastBlock BigInt
  updatedAt DateTime @updatedAt
}
```

## 8. API Surface

Prefix all routes with `/v1`.

Health:
- `GET /v1/health`

Users:
- `GET /v1/users/:walletAddress`

Vault metadata:
- `POST /v1/vaults`
- `GET /v1/vaults?owner=0x...`
- `GET /v1/vaults/:vaultAddress`
- `PATCH /v1/vaults/:vaultAddress`

Activity:
- `GET /v1/vaults/:vaultAddress/activity`

Internal indexing:
- `POST /v1/internal/indexer/sync-factory`
- `POST /v1/internal/indexer/sync-vault/:vaultAddress`

The internal routes can later be protected or replaced with scheduled jobs.

## 9. Indexing Strategy

Do not overbuild the event system.

Simple `v1` indexing flow:
- API stores latest synced block for the factory
- poll factory logs for `VaultCreated`
- upsert vault metadata shell records if metadata is not saved yet
- register each new vault for later event polling
- poll `Deposited` and `Withdrawn` logs for known vaults
- upsert normalized activity rows
- use chain reads as fallback if indexing lags

This is enough for a real-feeling product without building a full event platform.

## 10. Frontend Route Map

Marketing routes:
- `/`
- `/how-it-works`
- `/security`

App routes:
- `/app`
- `/app/vaults/new`
- `/app/vaults/[vaultAddress]`
- `/app/activity`

Responsibilities:
- `/`: hero, sample vault card, 3-step explanation, trust section, CTA
- `/app`: gallery-like vault overview
- `/app/vaults/new`: 3-step creation wizard
- `/app/vaults/[vaultAddress]`: vault detail with progress, rule, deposit, withdraw, activity
- `/app/activity`: cross-vault activity feed

## 11. Frontend Component Map

Layout:
- `AppShell`
- `MarketingShell`
- `TopNav`
- `WalletMenu`
- `SectionContainer`

Marketing:
- `HeroVaultPreview`
- `HowItWorksStrip`
- `RuleTypeCards`
- `SampleVaultGrid`
- `TrustSection`
- `PrimaryCtaBanner`

Vault cards:
- `VaultCard`
- `VaultCardAmount`
- `VaultCardProgressRing`
- `VaultCardRuleBadge`
- `VaultCardStatusChip`

Vault detail:
- `VaultHeader`
- `VaultProgressPanel`
- `VaultRulePanel`
- `VaultActionPanel`
- `VaultActivityTimeline`
- `VaultStatsRow`

Creation flow:
- `VaultCreateStepper`
- `GoalDetailsStep`
- `RuleSelectionStep`
- `ReviewCreateStep`
- `CreateVaultPreviewCard`

Transactions:
- `DepositDialog`
- `WithdrawDialog`
- `TransactionStatusModal`
- `WalletNetworkGuard`

Feedback states:
- `EmptyVaultState`
- `LoadingVaultCard`
- `VaultDetailSkeleton`
- `InlineErrorState`

## 12. Frontend Hooks And Lib Modules

Hooks:
- `useWalletNetworkGuard`
- `useVaults(ownerWallet)`
- `useVault(vaultAddress)`
- `useVaultActivity(vaultAddress)`
- `useCreateVault()`
- `useDepositToVault(vaultAddress)`
- `useWithdrawFromVault(vaultAddress)`
- `useUsdcAllowance(spender)`
- `useCountdown(unlockAt)`
- `useVaultPreviewState()`

Lib modules:
- `lib/contracts/addresses.ts`
- `lib/contracts/abi.ts`
- `lib/contracts/read.ts`
- `lib/contracts/write.ts`
- `lib/api/client.ts`
- `lib/api/vaults.ts`
- `lib/format/currency.ts`
- `lib/format/date.ts`
- `lib/format/percent.ts`
- `lib/validation/vault.ts`
- `lib/chains/base.ts`

## 13. UI/UX Implementation Rules

These rules prevent the build from drifting into generic fintech or generic crypto UI.

Global visual direction:
- light premium theme
- soft neutral background
- strong whitespace
- crisp dark text
- restrained accent color usage
- no neon crypto gradients
- no dark-theme-first assumptions
- no cluttered dashboards

Typography rules:
- large, elegant number styling for balances and targets
- clear hierarchy for hero numbers, section titles, and support copy
- use consistent tabular and numeric alignment where relevant

Vault card rules:
- visually strong enough to sell the product in one screenshot
- show only goal name, saved amount, target amount, percent funded, unlock summary, status chip
- avoid noisy metadata overload

Motion rules:
- subtle only
- use animation for vault creation success, progress changes, transaction completion, and countdown emphasis
- avoid decorative floating gimmicks

Wording rules:

Use:
- What are you saving for?
- Protect this goal
- Unlocks on...
- Deposit USDC
- Withdraw when eligible

Avoid:
- Deploy vault primitive
- Initialize lock mechanism
- DeFi-native savings infrastructure

## 14. Detailed UX By Screen

### 14.1 Landing page
Hero:
- left: headline, one supporting line, primary CTA, secondary CTA
- right: a real-looking sample vault card

Example hero card:
- Laptop Fund
- $1,280 / $2,000
- 64% funded
- Unlocks in 42 days

Sections:
- how it works
- why rules matter
- sample goal cards
- security and trust
- final CTA

Acceptance criteria:
- user understands product in under 10 seconds
- hero vault card looks like a real product artifact
- no page section feels like generic startup filler

### 14.2 My Vaults dashboard
Top row:
- My Vaults
- total saved across vaults
- vault count
- create vault button

Body:
- responsive grid of vault cards
- cards sorted by newest or most active
- empty state if no vaults

Acceptance criteria:
- user can scan all vaults in one pass
- vault states are immediately understandable
- create action is always visible

### 14.3 Create Vault wizard
Step 1 - Goal details:
- goal name
- target amount
- category optional
- note optional
- accent theme optional
- live preview card on side or below

Step 2 - Rule:
- time lock card
- date picker
- human-readable summary

Step 3 - Review:
- goal
- target
- asset
- network
- unlock date
- wallet address
- summary of restrictions

Success state:
- Vault active
- lock confirmation animation
- Deposit now
- View vault

Acceptance criteria:
- 3 steps max
- no field feels technical or blockchain-heavy
- preview card updates live
- review step makes the consequences obvious

### 14.4 Vault detail page
Above the fold:
- goal name
- note if present
- current saved amount
- target amount
- progress visualization
- unlock status
- deposit button
- withdraw button or disabled locked state

Below the fold:
- rule panel
- amount breakdown
- recent activity timeline

Acceptance criteria:
- user always knows how much is saved
- user always knows what the goal is
- user always knows when funds become available
- user always knows what action is currently possible

### 14.5 Deposit flow
Modal contents:
- vault name
- amount input
- wallet balance
- max button
- preview after deposit: new funded percentage and new remaining amount

Flow:
- enter amount
- approve USDC if needed
- deposit
- show transaction progress
- animate updated card/detail

Acceptance criteria:
- allowance flow is clean
- user sees exactly what changes after deposit
- progress updates feel satisfying

### 14.6 Withdraw flow
Locked state:
- primary action may be disabled
- show exact unlock date
- show countdown
- explain why it is locked

Unlocked state:
- open withdraw dialog
- amount input
- wallet destination default = connected wallet
- serious but not dramatic confirmation

Acceptance criteria:
- no confusion about why withdrawal is blocked
- after unlock, withdrawal feels deliberate
- status updates correctly after completion

## 15. Exact Implementation Phases

### Phase 0 - Architecture freeze
Outputs:
- product scope document
- repo implementation map
- final data model
- contract interface draft
- route map
- state definitions

Done when:
- zero ambiguity around `v1`
- cooldown and guardian explicitly deferred
- component and contract boundaries agreed

### Phase 1 - Design system and UI scaffold
Build:
- app shells
- route scaffold
- typography tokens
- spacing system
- buttons
- inputs
- cards
- status chips
- loading skeletons
- error states
- route scaffold for `/`, `/app`, `/app/vaults/new`, `/app/vaults/[vaultAddress]`

Done when:
- all main screens exist as static polished UI
- mobile layouts are handled
- vault card looks premium already

### Phase 2 - Contracts
Build:
- `GoalVaultFactory.sol`
- `GoalVault.sol`
- Foundry tests
- deployment scripts
- ABI export to `packages/contracts-sdk`

Tests:
- create vault
- deposit
- reject zero deposit
- reject early withdraw
- allow withdraw after unlock
- reject non-owner withdraw
- handle multiple deposits
- exact balance and accounting behavior

Done when:
- tests pass consistently
- contracts deploy to Base Sepolia
- frontend ABI package is generated

### Phase 3 - Backend foundation and indexing
Build:
- Fastify app scaffold
- Prisma schema and migrations
- vault metadata endpoints
- event indexing jobs
- merged response serializers

Done when:
- a created vault can be represented in the API
- deposits and withdrawals appear in activity
- API can serve list and detail views

### Phase 4 - Wallet integration and read flows
Build:
- wallet connect
- Base network guard
- read vaults from API with chain fallback
- dashboard wired with real data
- detail page wired with real data

Done when:
- connected user sees real vaults
- detail page reflects actual status and balances
- route loading and error states are correct

### Phase 5 - Create vault flow
Build:
- wizard form validation
- onchain create transaction
- post-success metadata save
- success transition to vault detail
- optimistic and safe UI state handling

Done when:
- user can create a time-locked vault end to end
- metadata persists
- created vault appears on dashboard without refresh weirdness

### Phase 6 - Deposit flow
Build:
- allowance check
- approve flow
- deposit flow
- transaction status modal
- progress update animations
- activity feed update

Done when:
- first deposit works reliably
- repeat deposit works reliably
- progress and activity update correctly

### Phase 7 - Withdraw flow and locked-state UX
Build:
- countdown and locked state
- withdraw dialog
- owner-only action guard
- post-withdraw activity update
- zero-balance and closed-state handling

Done when:
- early withdrawals are clearly blocked
- eligible withdrawals succeed
- UI never misstates lock status

### Phase 8 - Polish, trust, deploy
Build:
- security page
- responsive refinement
- empty state improvements
- skeleton polish
- metadata edit if allowed
- analytics/events
- staging deploy
- Base Sepolia smoke test
- Base mainnet config path

Done when:
- product feels launchable
- marketing and app feel like one coherent product
- no obvious UI rough edges exist in the core happy path

## 16. Acceptance Criteria By Surface

Landing page:
- hero explains product instantly
- sample vault card looks shippable
- security section clearly says what the product does not do

Dashboard:
- user sees all vaults with correct balances and unlock dates
- empty state guides first creation

Create flow:
- clear steps
- no chain jargon
- review state clearly explains restrictions

Detail page:
- unlock rule visible at all times
- amount progress is prominent
- actions are obvious and state-correct

Deposit flow:
- allowance state handled cleanly
- post-deposit progress feels updated instantly and correctly

Withdraw flow:
- blocked state is understandable
- unlocked state is obvious
- post-withdraw balance and activity are correct

## 17. Non-Negotiable Edge Cases

Contracts:
- `unlockAt` must be in the future
- zero amount checks
- withdraw before unlock
- withdraw more than balance
- withdraw by non-owner
- USDC transfer failure paths

Frontend:
- wrong network
- wallet disconnect during tx
- failed approval
- failed deposit
- failed withdraw
- index lag after tx
- empty API result while chain has data
- duplicate metadata save attempts

Backend:
- reprocessing the same event
- out-of-order events
- vault created onchain but metadata not yet saved
- API serving partial indexed state
