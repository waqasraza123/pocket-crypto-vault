# Pocket Vault Universal React Native Phase 19

## Focus
Phase 19 adds a production-shaped API image path so backend releases can be packaged as immutable artifacts.

## Implemented
- Added a monorepo-aware Dockerfile for `@pocket-vault/api`.
- Added root Docker ignore rules for secrets, generated output, local data, contract artifacts, and native build folders.
- Added a manual GitHub Actions workflow for API image build or GHCR publish.
- Added explicit publish confirmation.
- Added target-scoped image tags and image manifest artifacts.
- Added a backend image runbook covering build, publish, runtime config, promotion, and rollback.

## Boundaries
- No image was built locally.
- No image was published.
- No backend host was selected.
- No traffic promotion was automated.
- No database migration or external database infrastructure was added.

## Operator Setup
- Ensure GitHub Packages is enabled for the repository.
- Use `API Image` build mode before publish mode.
- Use `confirm_publish=publish` for publish mode.
- Configure container runtime environment variables from `docs/deployment/api-image.md`.
- Provide durable storage for `API_DATA_DIR` before depending on indexed state.

## Follow-Up
- Select the backend hosting target.
- Add provider-specific deploy and rollback only after the hosting target is fixed.
- Decide whether SQLite remains acceptable for staging or whether managed database work should come next.
