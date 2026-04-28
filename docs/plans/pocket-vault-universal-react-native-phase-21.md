# Pocket Vault Universal React Native Phase 21

## Focus
Phase 21 adds release manifest automation so operators can record exactly what is being promoted before moving traffic manually.

## Implemented
- Added a provider-neutral release manifest writer.
- Added a manual GitHub Actions workflow for staging and production release manifests.
- Added validation for release target, HTTPS app/API URLs, factory address, and explicit API image tags.
- Added rollback fields for previous API image, previous factory address, and operator notes.
- Added mobile build reference fields for iOS and Android.
- Added release manifest runbook covering inputs, environment values, promotion use, rollback use, and boundaries.

## Boundaries
- No deployment was run.
- No traffic was promoted.
- No API image was built or published.
- No mobile build was started or submitted.
- No contract was deployed.
- No provider-specific backend workflow was added.

## Operator Setup
- Keep `EXPO_PUBLIC_APP_URL`, `API_PUBLIC_BASE_URL`, and factory addresses current in GitHub Environments.
- Generate a release manifest after contract, API image, mobile, and release-candidate artifacts are ready.
- Store the manifest with release notes before traffic movement.

## Follow-Up
- Select a backend hosting provider and traffic policy.
- Add provider-specific deploy and rollback only after the host is fixed.
- Decide whether managed database infrastructure should replace SQLite before broader production usage.
