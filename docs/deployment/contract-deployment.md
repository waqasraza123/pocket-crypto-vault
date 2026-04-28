# Pocket Vault Contract Deployment

## Purpose
This runbook covers the guarded GitHub Actions path for deploying `GoalVaultFactory` to Base Sepolia or Base mainnet.

The workflow is intentionally manual. Simulation is the default mode, broadcast requires an explicit confirmation input, and production should be protected by GitHub Environment approval.

## Workflow
- `.github/workflows/contracts-deploy.yml`
  - manual dispatch only
  - targets `staging` or `production`
  - simulates by default
  - broadcasts only when `mode` is `broadcast` and `confirm_broadcast` is `deploy`
  - validates the RPC chain ID against the selected target
  - runs the existing contract test suite before simulation or broadcast
  - uploads a deployment manifest after broadcast

## Contract Script
- `packages/contracts/script/Deploy.s.sol`
  - reads `USDC_ADDRESS`
  - reads `CONTRACT_DEPLOYER_PRIVATE_KEY`
  - deploys `GoalVaultFactory`
  - rejects the zero USDC address

## GitHub Environment Setup
Create or update the existing GitHub Environments:

- `staging`
- `production`

Use Environment variables:

- `USDC_ADDRESS`
  - staging should use the Base Sepolia USDC address selected for testing
  - production should use the canonical Base USDC address

Use Environment secrets:

- `CONTRACT_DEPLOY_RPC_URL`
- `CONTRACT_DEPLOYER_PRIVATE_KEY`

Production should require reviewer approval before any job starts.

The workflow maps targets to chain IDs:

- `staging`: Base Sepolia `84532`
- `production`: Base mainnet `8453`

## Staging Simulation
Run `Contract Deployment` with:

- `target`: `staging`
- `mode`: `simulate`
- `confirm_broadcast`: empty

Expected result:

- dependencies install
- contract tests run
- Forge simulates `GoalVaultFactory` deployment against Base Sepolia RPC
- no transaction is broadcast
- no deployment manifest is uploaded

## Staging Broadcast
Run `Contract Deployment` with:

- `target`: `staging`
- `mode`: `broadcast`
- `confirm_broadcast`: `deploy`

Expected result:

- preflight checks run
- Forge broadcasts `GoalVaultFactory`
- deployment manifest is uploaded as a workflow artifact

After broadcast:

- copy the manifest values into release notes
- set `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS` in the staging app/API environment
- run the release-candidate workflow for `staging`
- run create, deposit, withdraw smoke checks with a staging wallet

## Production Broadcast
Run production only after staging smoke checks have passed.

Run `Contract Deployment` with:

- `target`: `production`
- `mode`: `broadcast`
- `confirm_broadcast`: `deploy`

Expected result:

- GitHub Environment approval is required before execution
- Forge broadcasts `GoalVaultFactory` to Base mainnet
- deployment manifest is uploaded as a workflow artifact

After broadcast:

- set `EXPO_PUBLIC_BASE_FACTORY_ADDRESS` in production app/API environments
- run the release-candidate workflow for `production`
- do not open production traffic until `/ready` reports an acceptable state

## Deployment Manifest
Broadcast mode writes:

- `deployments/pocket-vault-factory-<target>-<chainId>.json`

The manifest includes:

- target environment
- chain ID
- factory address
- USDC address
- transaction hash when available
- commit SHA
- GitHub workflow run ID
- generation timestamp

The `deployments/` directory is a generated artifact location and should not be committed unless a future release process explicitly adopts committed deployment manifests.

## Rollback Reality
The contracts are not upgradeable. Rollback means:

- stop pointing app/API config to the new factory
- restore the previous factory address in the affected environment
- pause launch or traffic promotion
- investigate with the broadcast transaction, manifest, and release-candidate artifacts

Existing user vaults remain tied to the factory that created them, so rollback cannot erase deployed vaults.
