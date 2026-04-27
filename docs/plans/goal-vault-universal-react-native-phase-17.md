# Goal Vault Universal React Native Phase 17

## Focus
Phase 17 adds production-oriented repository automation for CI and release-candidate verification.

## Implemented
- Added a reusable GitHub composite action for pinned Node and pnpm workspace setup.
- Added pull request and push CI for workspace typechecks, TypeScript unit tests, contract tests, and Expo exports.
- Added manual staging and production release-candidate verification with GitHub Environment binding.
- Added release-candidate artifact uploads for selected web, iOS, and Android Expo exports.
- Added CI-specific root script aliases so local and GitHub commands share the same vocabulary.
- Documented required GitHub Environment variables, secrets, operator flow, and deferred deployment automation.

## Boundaries
- No automatic contract deployment.
- No backend deployment or traffic promotion.
- No EAS cloud build or app-store submission.
- No production database migration orchestration.
- No new product scope.

## Operational Expectations
- Pull requests should pass CI before merging.
- Staging and production release candidates should be run manually through GitHub Actions.
- Production should require GitHub Environment approval.
- Release-candidate artifacts are verification outputs, not final store releases.

## Follow-Up
- Add deployment promotion only after the staging backend target and rollback policy are finalized.
- Add EAS cloud build submission only after signing, store, and channel decisions are complete.
- Add managed database migration automation when the backend moves beyond repo-local SQLite.
