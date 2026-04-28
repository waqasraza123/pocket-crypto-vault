# Pocket Vault Universal React Native Phase 9

## 1. What Phase 9 Implements
- Deployment-oriented environment handling for the universal Expo app and API.
- Environment-aware Expo package config and EAS profile setup.
- Clearer API startup validation plus separated health and readiness behavior.
- Launch checklist and env reference docs for staging and production preparation.

## 2. Environment / Config Strategy
- Centralize shared launch env parsing in `packages/config`.
- Distinguish `development`, `staging`, and `production` explicitly.
- Treat malformed or unsafe deployment combinations as startup-blocking validation errors.
- Treat missing chain RPC or factory values as readiness failures, not hidden app assumptions.

## 3. Expo / App Packaging Strategy
- Move app packaging to `apps/mobile/app.config.ts` so naming, scheme, bundle IDs, and web metadata can vary by environment.
- Keep one coherent Pocket Vault identity with environment-specific dev and staging suffixes.
- Add `eas.json` build profiles for development, preview, and production packaging.

## 4. Backend Readiness Strategy
- Keep `/health` lightweight so operators can confirm the service is alive.
- Use `/ready` for real launch readiness: env validation, chain config, sync state, staging readiness, and release readiness.
- Fail API startup on malformed or unsafe deployment configuration instead of silently continuing.

## 5. Web / Mobile Deployment Assumptions
- Web export remains the same Expo Router app, but now uses environment-aware metadata and static output packaging.
- Mobile package identity uses environment-specific names, schemes, and bundle/package IDs.
- Staging expects Base Sepolia as the main launch path. Production expects Base mainnet.

## 6. Smoke-Check Strategy
- Keep verification pragmatic: typecheck, API boot, `/health`, `/ready`, web export, iOS export, and explicit manual create/deposit/withdraw checks.
- Use the launch checklist for staged human verification instead of building a large automation layer.

## 7. Launch Checklist Structure
- One checklist for env values, backend deployment, web/mobile packaging, smoke checks, post-deploy checks, and trust/copy review.
- One env reference for variable names, meanings, and staging/production expectations.

## 8. What Remains for Later Phases
- Cooldown unlock remains deferred.
- Guardian approval remains deferred.
- Automated release pipelines, external persistence, and full store-art production remain outside this phase.

## 9. Risks and Edge Cases
- Expo package identity values are coherent placeholders, but final public-store ownership details may still need product-specific naming decisions.
- Production safety now depends on env validation staying aligned with actual deployment infrastructure.
- The API can now fail fast on unsafe config, so operators need to keep `.env` values disciplined.
