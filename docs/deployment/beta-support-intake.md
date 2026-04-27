# Beta Support Intake

Goal Vault beta support intake gives real users a structured way to report product issues from the app while giving operators enough context to triage without asking for secrets.

## Runtime Surface

- App route: `/support`
- API route: `POST /support/requests`
- Internal review routes:
  - `GET /internal/support/requests`
  - `GET /internal/support/requests/:id`
  - `PATCH /internal/support/requests/:id`
- Runtime toggle: `API_ENABLE_SUPPORT`
- Default state: enabled
- Storage:
  - SQLite: `goal-vault-analytics.sqlite`, table `support_requests`
  - PostgreSQL: `<API_PERSISTENCE_SCHEMA_NAME>.support_requests`

The app includes current route, environment, deployment target, wallet status, connected wallet address when present, and supported chain ID when present. The user may add a contact email, but it is optional.

## Request Fields

Required:
- `category`
  - `transaction`
  - `vault_data`
  - `wallet`
  - `access`
  - `security`
  - `feedback`
  - `other`
- `priority`
  - `normal`
  - `urgent`
- `subject`
  - 4 to 120 characters
- `message`
  - 20 to 2,000 characters
- `context.route`
- `context.environment`
- `context.deploymentTarget`

Optional:
- `reporterWallet`
- `contactEmail`
- `context.chainId`
- `context.walletStatus`
- `context.vaultAddress`

## Stored Record

The API writes:
- request ID
- status, currently `open`
- category and priority
- subject and message
- optional reporter wallet, contact email, route, chain ID, wallet status, and vault address
- environment and deployment target
- user agent
- hashed requester IP
- created timestamp

The API does not store raw requester IP addresses.

## Internal Review

Internal review routes require the same internal access model as indexer operations:

- header: `x-goal-vault-internal-token`
- value: `API_INTERNAL_TOKEN`
- local development fallback: loopback requests are allowed when no internal token is configured

List requests:

```http
GET /internal/support/requests?status=open&priority=urgent&limit=50
```

Optional filters:

- `status`
  - `open`
  - `triage`
  - `closed`
- `category`
- `priority`
- `limit`
  - 1 to 100
  - defaults to 50

Read one request:

```http
GET /internal/support/requests/{id}
```

Update triage status:

```http
PATCH /internal/support/requests/{id}
Content-Type: application/json

{
  "status": "triage"
}
```

The internal routes return full support request text and contact details. They should be used only through approved operator access.

## Secret Boundary

Users and operators must not submit or store:
- seed phrases
- private keys
- recovery phrases
- credentials
- API tokens
- RPC URLs with credentials

The API rejects support requests that explicitly mention seed phrases, private keys, mnemonics, or recovery phrases. Transaction hashes are allowed because they are needed for support triage.

## Abuse Boundary

The API applies a lightweight in-process limit of 5 support requests per connection every 10 minutes. Provider-level rate limiting or WAF rules should still be used for public production traffic.

## PostgreSQL Requirement

PostgreSQL runtime mode now requires the `support_requests` table in addition to:
- `vaults`
- `vault_events`
- `sync_states`
- `analytics_events`

The managed database schema, export, import, parity, runtime preflight, and runtime activation artifacts all treat `support_requests` as part of the API persistence contract.

## Operator Flow

1. Keep `API_ENABLE_SUPPORT=true` for beta environments.
2. Confirm `/support` is visible in app navigation.
3. Confirm the support reference in the beta readiness artifact points to the app route or the operator support channel.
4. Review submitted support rows only through approved operational access.
5. Do not copy sensitive user messages into commits, release manifests, readiness plans, or public issue trackers.

## Boundary

This feature does not send email, create tickets in a third-party system, page an incident tool, expose an admin dashboard, or provide public support-request reads. It creates a durable intake record that operators can inspect through approved database or internal API access during beta.
