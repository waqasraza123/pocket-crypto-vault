# Pocket Vault Universal React Native Phase 18

## Focus
Phase 18 adds guarded contract deployment automation for the existing `GoalVaultFactory` path.

## Implemented
- Converted the Foundry deploy helper into a real `run()` script.
- Added deployment scripts for simulation, broadcast, and deployment manifest generation.
- Added a manual GitHub Actions workflow for staging and production contract deployment.
- Added environment-gated broadcast confirmation.
- Added deployment manifest artifact generation after broadcast.
- Added a contract deployment runbook covering setup, simulation, broadcast, post-deploy configuration, and rollback reality.

## Boundaries
- No deployment was run.
- No contract was broadcast.
- No tests or builds were executed locally.
- No app/API production promotion was added.
- No EAS store submission path was added.

## Required Operator Setup
- Add `USDC_ADDRESS` as a GitHub Environment variable for `staging` and `production`.
- Add `CONTRACT_DEPLOY_RPC_URL` and `CONTRACT_DEPLOYER_PRIVATE_KEY` as GitHub Environment secrets.
- Require approval on the `production` GitHub Environment.

## Follow-Up
- Run staging simulation before the first staging broadcast.
- Feed the staged factory address into app/API environment variables after broadcast.
- Run release-candidate verification after any contract broadcast.
- Add backend deployment promotion only after the hosting target and rollback policy are finalized.
