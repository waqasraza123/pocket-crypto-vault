# Goal Vault Universal React Native Phase 45

## Objective

Add an operator-only support triage API so beta support requests can be reviewed and moved through a simple lifecycle without direct database access.

## Implemented Scope

- Extended the shared support model with list filters, detail responses, and status update shape.
- Extended the API support persistence port with list, get, and status-update operations.
- Implemented SQLite support request listing, detail lookup, and status update.
- Implemented PostgreSQL support request listing, detail lookup, and status update through the same persistence port.
- Added internal support routes protected by the existing internal access boundary:
  - `GET /internal/support/requests`
  - `GET /internal/support/requests/:id`
  - `PATCH /internal/support/requests/:id`
- Added structured observability signals for internal support listing and status updates.
- Updated the beta support runbook with internal route usage, filters, status transitions, and private-data handling.

## Support Lifecycle

Current statuses:

- `open`
- `triage`
- `closed`

The lifecycle is intentionally small for beta. It supports operator review without adding assignment, comments, email, paging, or a public ticketing workflow.

## Access Boundary

Internal review routes use `x-goal-vault-internal-token` and `API_INTERNAL_TOKEN`, with the existing loopback-only development fallback when no token is configured.

Support request text, contact email, wallet address, vault address, route, user agent, and requester IP hash are private operational data.

## Not Included

- No public support request reads.
- No user-facing status tracking.
- No admin dashboard.
- No third-party ticket sync.
- No email or incident notification.
- No production build, deployment, database migration execution, traffic movement, or test suite execution.
