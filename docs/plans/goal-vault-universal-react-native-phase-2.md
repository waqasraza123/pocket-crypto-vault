# Goal Vault Universal React Native Phase 2

## What Phase 2 Implements
- Real universal wallet boundary inside `apps/mobile` with app-owned hooks and typed connection state.
- Centralized Base and Base Sepolia config for chains, RPC URLs, USDC addresses, and factory addresses.
- A new `packages/contracts` boundary with initial `GoalVault` and `GoalVaultFactory` Solidity contracts plus placeholder deploy/test structure.
- A production-oriented `packages/contracts-sdk` layout for ABIs, addresses, chain helpers, read helpers, write scaffolding, and vault mappers.
- Read-only chain access through `viem` public clients and typed app queries for vault lists and vault details.
- Hybrid UI behavior where real connection and network state is live, real reads run when config exists, and fallback mock vault data keeps screens stable when factory deployment or RPC config is incomplete.
- App shell and core screens updated to distinguish disconnected, connecting, unsupported network, loading, empty, fallback, and ready states.

## Wallet Strategy Chosen And Why
- Chosen stack: Reown AppKit.
- Web uses `@reown/appkit` with `@reown/appkit-adapter-ethers`.
- Native uses `@reown/appkit-react-native` with `@reown/appkit-ethers-react-native`.
- Why this fits:
  - It supports Expo-compatible React Native and web without forcing separate product implementations.
  - It provides connect, disconnect, account, network, and switch-network surfaces for Base and Base Sepolia.
  - The platform-specific details stay inside `apps/mobile/src/lib/blockchain/wallet/`.
- Leakage control:
  - UI components consume `useWalletConnection`, `useWalletAccount`, and app-owned connection types.
  - Reown hooks and adapters do not appear in presentation components.

## Chain And Config Strategy
- Shared config lives in `packages/config`.
- `chains.ts` centralizes supported chain IDs, chain metadata, and `viem` chain objects.
- `tokens.ts` centralizes USDC addresses:
  - Base mainnet: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
  - Base Sepolia: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- `env.ts` validates runtime env for Reown, RPC URLs, and factory addresses.
- App-level env access stays in `apps/mobile/src/lib/env/` and `apps/mobile/src/lib/blockchain/config.ts`.
- Base Sepolia remains the default development chain while Base mainnet is fully represented in the typed config model.

## Contracts SDK Boundary
- `packages/contracts` now holds:
  - `src/GoalVault.sol`
  - `src/GoalVaultFactory.sol`
  - `script/Deploy.s.sol`
  - `test/GoalVault.t.sol`
- `packages/contracts-sdk` now holds:
  - `abi/`
  - `addresses/`
  - `chains/`
  - `read/`
  - `write/`
  - `mappers/`
  - `types/`
- The app consumes the SDK through app-local boundaries in `apps/mobile/src/lib/contracts/`.

## What Reads Are Real Vs Mocked
- Real now:
  - wallet connection status
  - active chain and supported/unsupported state
  - read client creation from validated RPC config
  - factory vault address lookup when factory config exists
  - per-vault summary reads through `getSummary`
  - mapping raw contract reads into `VaultSummary` and `VaultDetail`
- Still mocked or hybrid:
  - offchain vault metadata such as goal title and note
  - activity feed indexing
  - empty-state fallback data when factory address or RPC config is missing
  - create, deposit, and withdraw write UX

## Platform-Specific Handling Introduced And Why
- `provider.web.tsx` and `provider.native.tsx` exist only inside the wallet boundary.
- Web uses Reown React hooks and provider components.
- Native uses Reown React Native provider, modal component, and a storage adapter backed by AsyncStorage.
- A thin `provider.tsx` chooses the correct provider at runtime so the rest of the app imports one stable `WalletProvider`.

## What Remains For Later Phases
- Real create-vault transaction flow.
- Deposit and withdraw transaction UX.
- Allowance handling.
- Contract deployment automation and fuller contract test coverage.
- Backend metadata persistence and indexed activity.
- Unsupported network recovery polish beyond the current switch action.
- Arabic localization and full RTL rollout on top of the new wallet-aware shell.

## Risks And Edge Cases
- Without `EXPO_PUBLIC_REOWN_PROJECT_ID` and `EXPO_PUBLIC_WALLETCONNECT_METADATA_URL`, wallet connectivity stays intentionally unavailable.
- Without per-chain RPC URLs, read clients stay unavailable and the UI falls back to safe placeholder data.
- Without per-chain factory addresses, vault list reads cannot resolve deployed vaults yet.
- Web export currently succeeds, but Metro emits third-party package export warnings from wallet dependencies.
- Native runtime should be verified on simulator/device in the next phase because this turn validated type safety and web bundling, not live native wallet sessions.
