# Pocket Vault Universal React Native Phase 20

## Focus
Phase 20 adds guarded mobile distribution automation around EAS build and submit operations.

## Implemented
- Moved EAS configuration beside the Expo app in `apps/mobile/eas.json`.
- Added `.easignore` for mobile upload hygiene.
- Added a manual GitHub Actions workflow for EAS build and production submit operations.
- Added submit confirmation and production-only submission gates.
- Added mobile distribution manifest artifacts.
- Added a mobile distribution runbook covering environment setup, build mode, submit mode, manifests, and rollback reality.

## Boundaries
- No EAS build was started.
- No app-store submission was started.
- No store credentials were added.
- No backend traffic promotion was automated.
- No contract deployment was run.

## Operator Setup
- Configure `EXPO_TOKEN` on `staging` and `production` GitHub Environments.
- Keep production protected by GitHub Environment approval.
- Configure store credentials in EAS before using submit mode.
- Increment `IOS_BUILD_NUMBER` and `ANDROID_VERSION_CODE` through GitHub Environment variables before production builds.

## Follow-Up
- Run staging mobile build after staging API and contract configuration are stable.
- Run production mobile build only after release-candidate verification.
- Use submit mode only after store metadata and binary review are complete.
- Add hosting-provider backend promotion after the backend host decision is fixed.
