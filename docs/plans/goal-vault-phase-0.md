# Goal Vault Phase 0 Engineering Spec

## Purpose
This document freezes the build-ready implementation plan for `v1` of Goal Vault.

## Locked Scope

### Included in `v1`
- Base
- USDC
- wallet connect
- create vault
- time-locked withdrawal
- deposit anytime
- withdraw after unlock date
- vault list
- vault detail
- offchain metadata for vault display name, note, category, accent theme
- thin backend for metadata and indexed onchain activity
- premium light-theme UI that feels calm and elegant

### Excluded from `v1`
- cooldown unlock
- guardian approval
- yield
- swaps
- multi-asset support
- multichain
- social features
- AI assistant
- public vault sharing
- post-creation rule edits

## Assumptions
- The repo will be scaffolded as a `pnpm` workspace with Turborepo.
- The frontend will use Next.js App Router, TypeScript, Tailwind CSS, wagmi, viem, TanStack Query, and Framer Motion.
- The backend will use Fastify, TypeScript, Prisma, PostgreSQL, and zod.
- The contracts will use Solidity, Foundry, OpenZeppelin, Base Sepolia, and Base mainnet.
- If the actual implementation scaffold differs, map this spec into the existing structure instead of rewriting architecture only to match this document.

## 1. Repo Implementation Map

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
        layout/
          AppShell.tsx
          MarketingShell.tsx
          TopNav.tsx
          WalletMenu.tsx
          SectionContainer.tsx
        marketing/
          HeroVaultPreview.tsx
          HowItWorksStrip.tsx
          SampleVaultGrid.tsx
          TrustSection.tsx
          PrimaryCtaBanner.tsx
        vaults/
          VaultCard.tsx
          VaultCardAmount.tsx
          VaultCardProgress.tsx
          VaultStatusChip.tsx
          VaultHeader.tsx
          VaultProgressPanel.tsx
          VaultRulePanel.tsx
          VaultActionPanel.tsx
          VaultActivityTimeline.tsx
          VaultStatsGrid.tsx
        forms/
          VaultCreateStepper.tsx
          GoalDetailsStep.tsx
          TimeLockStep.tsx
          ReviewVaultStep.tsx
          CreateVaultPreviewCard.tsx
          DepositDialog.tsx
          WithdrawDialog.tsx
        feedback/
          EmptyVaultState.tsx
          LoadingVaultCard.tsx
          VaultDetailSkeleton.tsx
          InlineErrorState.tsx
          TransactionStatusModal.tsx
      hooks/
        useWalletNetworkGuard.ts
        useVaults.ts
        useVault.ts
        useVaultActivity.ts
        useCreateVault.ts
        useDepositToVault.ts
        useWithdrawFromVault.ts
        useUsdcAllowance.ts
        useCountdown.ts
        useVaultPreviewState.ts
      lib/
        api/
          client.ts
          vaults.ts
          activity.ts
        chains/
          base.ts
        contracts/
          abi.ts
          addresses.ts
          read.ts
          write.ts
        format/
          currency.ts
          date.ts
          percent.ts
          address.ts
        validation/
          vault.ts
          metadata.ts
      styles/
        tokens.css
  api/
    src/
      app.ts
      server.ts
      modules/
        health/
          routes.ts
        users/
          routes.ts
          service.ts
        vaults/
          routes.ts
          service.ts
          schemas.ts
        vault-events/
          routes.ts
          service.ts
          schemas.ts
        indexer/
          routes.ts
          service.ts
      lib/
        db/
          prisma.ts
        chain/
          publicClient.ts
          addresses.ts
          events.ts
        env/
          schema.ts
        validation/
          common.ts
      jobs/
        syncFactoryEvents.ts
        syncVaultEvents.ts
      prisma/
        schema.prisma
        migrations/
packages/
  contracts/
    src/
      GoalVault.sol
      GoalVaultFactory.sol
    script/
      Deploy.s.sol
    test/
      GoalVaultFactory.t.sol
      GoalVault.t.sol
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

## 2. Exact Routes

### Marketing routes
- `/`
- `/how-it-works`
- `/security`

### Authenticated app routes
- `/app`
- `/app/vaults/new`
- `/app/vaults/[vaultAddress]`
- `/app/activity`

### Route responsibilities

`/`
- headline, subhead, CTA
- premium sample vault card
- 3-step explanation
- trust/security section
- final CTA

`/how-it-works`
- product explanation
- creation, deposit, withdrawal flows
- why time locks matter

`/security`
- Base + USDC scope
- onchain rule enforcement
- no lending, no yield, no swaps
- metadata vs chain truth explanation

`/app`
- wallet-aware dashboard
- vault cards
- total saved
- vault count
- primary create action

`/app/vaults/new`
- 3-step create flow
- goal details
- time lock selection
- review and submit

`/app/vaults/[vaultAddress]`
- merged vault detail
- progress
- rule status
- deposit action
- withdraw action
- activity timeline

`/app/activity`
- cross-vault event feed for the connected wallet

## 3. Exact Components

### Layout
- `AppShell`
- `MarketingShell`
- `TopNav`
- `WalletMenu`
- `SectionContainer`

### Marketing
- `HeroVaultPreview`
- `HowItWorksStrip`
- `SampleVaultGrid`
- `TrustSection`
- `PrimaryCtaBanner`

### Vault overview
- `VaultCard`
- `VaultCardAmount`
- `VaultCardProgress`
- `VaultStatusChip`

### Vault detail
- `VaultHeader`
- `VaultProgressPanel`
- `VaultRulePanel`
- `VaultActionPanel`
- `VaultActivityTimeline`
- `VaultStatsGrid`

### Create flow
- `VaultCreateStepper`
- `GoalDetailsStep`
- `TimeLockStep`
- `ReviewVaultStep`
- `CreateVaultPreviewCard`

### Transaction flows
- `DepositDialog`
- `WithdrawDialog`
- `TransactionStatusModal`

### Feedback states
- `EmptyVaultState`
- `LoadingVaultCard`
- `VaultDetailSkeleton`
- `InlineErrorState`

## 4. Exact Contract Interfaces

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

### Contract invariants
- asset is USDC only
- unlock time must be in the future at creation
- deposits allowed anytime
- withdrawals allowed only by owner
- withdrawals allowed only after unlock time
- zero-value deposit and withdraw revert
- withdrawal larger than available balance reverts
- no upgradeability
- no proxy pattern
- no cooldown state
- no guardian state

## 5. Exact Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  walletAddress String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  vaults        Vault[]
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

## 6. Exact API Endpoints

Prefix: `/v1`

### Health
- `GET /v1/health`

Response:

```json
{
  "ok": true,
  "service": "goal-vault-api"
}
```

### Users
- `GET /v1/users/:walletAddress`

Response:

```json
{
  "walletAddress": "0x...",
  "vaultCount": 2,
  "totalSavedUsdc": "1550.000000"
}
```

### Vault metadata
- `POST /v1/vaults`
- `GET /v1/vaults?owner=0x...`
- `GET /v1/vaults/:vaultAddress`

`PATCH /v1/vaults/:vaultAddress` is deferred unless cosmetic metadata editing is explicitly enabled after initial launch scope review.

#### `POST /v1/vaults`

Request:

```json
{
  "contractAddress": "0x...",
  "chainId": 84532,
  "ownerWallet": "0x...",
  "displayName": "Laptop Fund",
  "category": "personal",
  "note": "Upgrade before freelance sprint",
  "accentTheme": "gold",
  "targetAmount": "2000.000000",
  "unlockAt": "2026-09-01T00:00:00.000Z"
}
```

Response:

```json
{
  "vaultAddress": "0x...",
  "saved": true
}
```

#### `GET /v1/vaults?owner=0x...`

Response:

```json
{
  "items": [
    {
      "vaultAddress": "0x...",
      "ownerWallet": "0x...",
      "displayName": "Laptop Fund",
      "category": "personal",
      "note": "Upgrade before freelance sprint",
      "accentTheme": "gold",
      "targetAmount": "2000.000000",
      "unlockAt": "2026-09-01T00:00:00.000Z",
      "totalDeposited": "1280.000000",
      "totalWithdrawn": "0.000000",
      "balance": "1280.000000",
      "isUnlocked": false,
      "status": "locked",
      "progressPercent": 64
    }
  ]
}
```

#### `GET /v1/vaults/:vaultAddress`

Response:

```json
{
  "vaultAddress": "0x...",
  "ownerWallet": "0x...",
  "assetAddress": "0x...",
  "displayName": "Laptop Fund",
  "category": "personal",
  "note": "Upgrade before freelance sprint",
  "accentTheme": "gold",
  "targetAmount": "2000.000000",
  "unlockAt": "2026-09-01T00:00:00.000Z",
  "totalDeposited": "1280.000000",
  "totalWithdrawn": "0.000000",
  "balance": "1280.000000",
  "isUnlocked": false,
  "status": "locked",
  "progressPercent": 64
}
```

### Activity
- `GET /v1/vaults/:vaultAddress/activity`

Response:

```json
{
  "items": [
    {
      "eventType": "vault_created",
      "txHash": "0x...",
      "actorWallet": "0x...",
      "amount": null,
      "createdAt": "2026-04-23T10:00:00.000Z"
    },
    {
      "eventType": "deposit",
      "txHash": "0x...",
      "actorWallet": "0x...",
      "amount": "500.000000",
      "createdAt": "2026-04-25T10:00:00.000Z"
    }
  ]
}
```

### Internal indexing
- `POST /v1/internal/indexer/sync-factory`
- `POST /v1/internal/indexer/sync-vault/:vaultAddress`

## 7. State Model

### Onchain vault state
- `locked`: `block.timestamp < unlockAt` and `balance > 0`
- `withdrawable`: `block.timestamp >= unlockAt` and `balance > 0`
- `closed`: `balance == 0` and `totalWithdrawn > 0`

### UI transaction state
- `idle`
- `awaiting_wallet_signature`
- `submitted`
- `confirming`
- `confirmed`
- `failed`

### Create vault form state
- `goal_details`
- `time_lock`
- `review`
- `submitting`
- `success`
- `error`

### Deposit flow state
- `idle`
- `checking_allowance`
- `approval_required`
- `approving`
- `depositing`
- `success`
- `error`

### Withdraw flow state
- `locked`
- `ready`
- `submitting`
- `success`
- `error`

### Indexer state
- `factory_sync_pending`
- `factory_syncing`
- `factory_synced`
- `vault_sync_pending`
- `vault_syncing`
- `vault_synced`
- `sync_error`

## 8. Phased Build Order

### Phase 0: Architecture freeze
- finalize this engineering spec
- confirm repo structure
- confirm route map
- confirm contract interfaces
- confirm API contracts
- confirm schema and state model

### Phase 1: UI scaffold
- scaffold web app shells
- add route files
- add design tokens and shared layout
- build static marketing, dashboard, create, and detail screens
- implement premium light theme and component structure

### Phase 2: Contracts
- implement `GoalVaultFactory.sol`
- implement `GoalVault.sol`
- add Foundry tests
- add deploy script
- export ABI and addresses package

### Phase 3: Backend foundation
- scaffold Fastify app
- add Prisma schema and migrations
- implement vault metadata endpoints
- implement activity read endpoints
- implement indexer jobs

### Phase 4: Wallet integration and read flows
- connect wallet
- add Base network guard
- wire dashboard and detail reads
- merge API metadata with onchain data
- add fallback to direct chain reads

### Phase 5: Create vault flow
- implement stepper form
- validate fields
- submit onchain create
- persist offchain metadata after successful create
- redirect into vault detail

### Phase 6: Deposit flow
- implement allowance detection
- implement approve flow
- implement deposit flow
- update progress and activity

### Phase 7: Withdraw flow
- implement locked-state UX
- implement withdraw dialog
- enforce owner-only action in UI
- update activity and closed-state handling

### Phase 8: Polish and deploy prep
- refine responsive layouts
- polish empty and error states
- finalize security page
- run Base Sepolia smoke test
- prepare Base mainnet config path

## 9. Acceptance Criteria Per Phase

### Phase 0 acceptance
- no ambiguity remains around `v1` scope
- no excluded features appear in interfaces or routes
- repo map, schema, contracts, APIs, and states are all defined

### Phase 1 acceptance
- all main routes render
- UI is light-themed, spacious, and premium
- vault card is visually strong enough to represent the product
- create flow, dashboard, and detail screens exist as polished static screens

### Phase 2 acceptance
- contracts compile
- tests cover create, deposit, early-withdraw rejection, owner-only withdraw, multiple deposits, and accounting
- Base Sepolia deployment succeeds
- ABI package is generated for app consumption

### Phase 3 acceptance
- metadata can be created and fetched through the API
- indexed activity can be fetched per vault
- repeated event syncs do not create duplicates
- API returns stable merged shapes for list and detail views

### Phase 4 acceptance
- connected user on Base can open the app and see real vault data
- wrong-network handling is explicit
- chain fallback prevents empty screens when indexing lags
- loading and error states are clear

### Phase 5 acceptance
- user can create a vault end to end
- review step clearly explains restrictions
- metadata persists after onchain success
- new vault appears without inconsistent refresh behavior

### Phase 6 acceptance
- allowance flow is clear
- first deposit works reliably
- repeated deposits work reliably
- progress and activity update correctly

### Phase 7 acceptance
- locked state always explains why withdrawal is unavailable
- eligible withdrawal succeeds
- non-owner withdrawal path is not exposed in the UI
- zero-balance vaults classify cleanly as closed

### Phase 8 acceptance
- marketing and app surfaces feel like one coherent product
- core flows have no obvious UX rough edges
- security language is clear and calm
- Base Sepolia smoke test passes for create, deposit, list, detail, and withdraw-after-unlock flows
