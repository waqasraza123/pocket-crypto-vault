# Goal Vault API Image

## Purpose
This runbook covers the repository-owned container path for the Fastify API and indexer service.

The workflow builds an immutable API image and can publish it to GitHub Container Registry. It does not deploy the image to a hosting provider, promote traffic, run database migrations, or mutate production infrastructure.

## Files
- `apps/api/Dockerfile`
  - builds the API from the monorepo root context
  - installs the pinned pnpm workspace
  - copies only API and shared workspace package sources needed by the backend
  - exposes port `3001`
  - starts `@goal-vault/api`
- `apps/api/package.json`
  - keeps `tsx` in runtime dependencies because the current API start path executes TypeScript directly
- `.dockerignore`
  - excludes local dependencies, build output, Expo native folders, contract artifacts, API data files, and secrets
- `.github/workflows/api-image.yml`
  - manual workflow for build-only or publish mode
  - binds to `staging` or `production` GitHub Environments
  - pushes to GHCR only with explicit confirmation
  - uploads an image manifest artifact
- `docs/deployment/api-preflight.md`
  - validates runtime environment wiring before image deployment or traffic movement
- `docs/deployment/api-traffic-plan.md`
  - records the intended promotion, rollback, or disablement steps before provider-specific traffic changes

## Workflow Modes
### Build
Use build mode for pull-free image validation:

- `target`: `staging` or `production`
- `mode`: `build`
- `confirm_publish`: empty

Expected behavior:

- Docker builds the API image.
- No image is pushed.
- An image manifest artifact is uploaded.

### Publish
Use publish mode only after the release candidate is acceptable:

- `target`: `staging` or `production`
- `mode`: `publish`
- `confirm_publish`: `publish`
- `image_tag`: optional operator-selected tag

Expected behavior:

- Docker builds the API image.
- The workflow logs in to GHCR with `GITHUB_TOKEN`.
- The image is pushed with target and commit-based tags.
- An image manifest artifact is uploaded.

## Image Tags
The workflow always creates:

- `<target>-<commit-sha>`
- `<target>-<run-number>`

It also creates the optional `image_tag` when provided.

Prefer commit-based tags for production promotion because they are immutable in operator records even when registry tags are later moved.

## Runtime Contract
The image expects environment configuration at runtime:

- `APP_ENV`
- `EXPO_PUBLIC_APP_ENV`
- `API_HOST`
- `API_PORT`
- `API_PUBLIC_BASE_URL`
- `API_DATA_DIR`
- `API_PERSISTENCE_DRIVER`
- `API_PERSISTENCE_SCHEMA_NAME`
- `API_SYNC_INTERVAL_MS`
- `API_ENABLE_INDEXER`
- `API_ENABLE_ANALYTICS`
- `API_INTERNAL_TOKEN`
- `API_DATABASE_URL`
- `EXPO_PUBLIC_BASE_RPC_URL`
- `EXPO_PUBLIC_BASE_FACTORY_ADDRESS`
- `EXPO_PUBLIC_BASE_SEPOLIA_RPC_URL`
- `EXPO_PUBLIC_BASE_SEPOLIA_FACTORY_ADDRESS`
- `API_BASE_START_BLOCK`
- `API_BASE_SEPOLIA_START_BLOCK`

Use `API_HOST=0.0.0.0` in container hosting. Keep `API_PERSISTENCE_DRIVER=sqlite` for the current API image and mount durable storage for `API_DATA_DIR` when relying on indexed history. `API_DATABASE_URL` is reserved for the future PostgreSQL adapter and must remain secret.

## Promotion Flow
1. Run release-candidate verification for the target.
2. Run `API Preflight` for the target and resolve any validation errors.
3. Run `API Image` in build mode.
4. Run `API Image` in publish mode with explicit confirmation.
5. Deploy the published image in the hosting provider.
6. Configure runtime environment variables and durable storage.
7. Check `/health`.
8. Check `/ready`.
9. Create an API data snapshot.
10. Generate the release manifest.
11. Generate an API traffic plan.
12. Run create, deposit, withdraw smoke checks before opening broader traffic.

## Rollback Flow
1. Stop traffic promotion.
2. Redeploy the previous known-good image tag.
3. Keep `API_DATA_DIR` attached to the expected persistent volume.
4. Check `/health` and `/ready`.
5. Confirm indexer freshness before claiming activity freshness.

## Current Boundary
This phase creates and publishes a backend artifact. API preflight validates runtime environment readiness, and API traffic plans record promotion or rollback intent, but the repository still intentionally does not choose the hosting platform or automate traffic movement.
