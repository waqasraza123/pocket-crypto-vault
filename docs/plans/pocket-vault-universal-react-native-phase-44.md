# Pocket Vault Universal React Native Phase 44

## Objective

Add a production-shaped beta support intake path so real users can report problems from inside the app and operators can triage them with structured product context.

## Implemented Scope

- Added shared support request categories, priorities, statuses, request input, stored record, and response types.
- Added `POST /support/requests` to the Fastify API.
- Added durable support storage behind the API persistence boundary:
  - SQLite support records in `goal-vault-analytics.sqlite`
  - PostgreSQL support records in `support_requests`
- Added `API_ENABLE_SUPPORT` runtime control.
- Added app route `/support` with category, priority, subject, details, optional contact email, attached wallet/runtime context, and success/error states.
- Added support navigation in the authenticated app shell.
- Added API client parsing and mobile submission helper.
- Updated managed database schema, export, import, parity, plan, and preflight expectations to include `support_requests`.
- Added operator runbook documentation for beta support intake.

## Data Boundary

Support intake may contain private user context:
- message text
- contact email
- wallet address
- route
- vault address
- user agent
- hashed requester IP

Support records are operational data and must not be committed as artifacts.

## Safety Controls

- The API rejects requests that explicitly mention seed phrases, private keys, mnemonics, or recovery phrases.
- Raw requester IPs are not stored.
- Requests are rate-limited in process to reduce accidental spam during beta.
- The app warns users not to submit credentials or recovery material.

## Not Included

- No email sending.
- No third-party ticket-system integration.
- No admin dashboard.
- No public support request listing.
- No deployment, database migration execution, traffic movement, build, or test suite execution.
