# Goal Vault Release Manifest

## Purpose
The release manifest records the exact artifacts and configuration an operator intends to promote.

It is not a deployment workflow. It does not move traffic, deploy the API image, submit store builds, or mutate contracts. It creates a reviewable artifact that connects the release candidate, deployed factory, API image, mobile build references, and rollback pointers.

## Files
- `scripts/write-release-manifest.mjs`
  - validates release target, HTTPS app/API URLs, factory address, and API image tag
  - writes a JSON release manifest
  - emits the manifest path for GitHub artifact upload
- `.github/workflows/release-manifest.yml`
  - manual staging or production workflow
  - binds to the matching GitHub Environment
  - uploads the release manifest artifact
- `docs/deployment/api-preflight.md`
  - produces the redacted API environment readiness report that should accompany backend promotion records
- `docs/deployment/api-traffic-plan.md`
  - records the provider-neutral traffic movement or rollback plan that should be reviewed before manual provider changes
- `docs/deployment/api-managed-database-plan.md`
  - records the provider-neutral managed database migration plan when persistence is changing
- `docs/deployment/api-managed-database-schema.md`
  - records the provider-neutral PostgreSQL schema artifact when persistence is changing
- `docs/deployment/api-managed-database-export.md`
  - records the provider-neutral JSONL export bundle when persistence is changing
- `docs/deployment/api-managed-database-import-plan.md`
  - records the provider-neutral import SQL handoff when persistence is changing
- `docs/deployment/api-managed-database-parity.md`
  - records the provider-neutral parity checks required before managed-database traffic movement

## Required Inputs
- `target`
  - `staging` or `production`
- `release_label`
  - operator label such as `v0.1.0-rc.1`
- `api_image`
  - exact registry image reference with tag

## Optional Inputs
- `rollback_api_image`
  - previous known-good API image tag
- `rollback_factory_address`
  - previous known-good factory address when different
- `ios_build_reference`
  - EAS build ID, App Store build number, or store release reference
- `android_build_reference`
  - EAS build ID, Play build reference, or track reference
- `rollback_notes`
  - short operator note for manual rollback context

## GitHub Environment Values
The workflow reads non-secret values from the selected GitHub Environment:

- `EXPO_PUBLIC_APP_URL`
- `API_PUBLIC_BASE_URL`
- `EXPO_PUBLIC_BASE_FACTORY_ADDRESS`
- `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS`

RPC URLs, deployer keys, EAS tokens, and internal API tokens are intentionally not included.

## Manifest Contents
The manifest records:

- target
- release label
- chain ID
- app URL
- API URL
- factory address
- API image
- rollback image and factory pointers
- iOS and Android build references
- optional artifact references
- commit SHA
- GitHub workflow run ID
- generation timestamp

## Promotion Use
Use this manifest before manual promotion:

1. Confirm contract deployment manifest matches the factory address.
2. Confirm API image manifest matches the API image tag.
3. Confirm API preflight report is passing for the target environment.
4. Confirm managed database plan, schema bundle, export bundle, import plan, and parity plan are reviewed when persistence is changing.
5. Confirm mobile distribution manifest or EAS dashboard matches the build references.
6. Generate and review the API traffic plan.
7. Confirm `/ready` is acceptable on the target API.
8. Save the release manifest, managed database plan/schema/export/import/parity artifacts when applicable, and traffic plan artifacts with the release notes.
9. Promote traffic manually through the selected hosting provider.

## Rollback Use
Use this manifest during rollback:

1. Stop or pause traffic promotion.
2. Generate an API traffic rollback plan when time allows.
3. Redeploy `rollback.previousApiImage` if it is present.
4. Restore `rollback.previousFactoryAddress` if the new factory address caused the issue.
5. Verify `/health` and `/ready`.
6. Confirm app clients still point to a coherent API and factory combination.

## Boundary
This workflow creates a source-of-truth artifact for operators. Provider-specific promotion and rollback remain manual until a backend host and traffic policy are chosen.
