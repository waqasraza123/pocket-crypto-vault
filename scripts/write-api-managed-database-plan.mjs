import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const engineValues = new Set(["postgresql"]);
const strategyValues = new Set(["cold-cutover", "shadow-restore"]);

const schemaInventory = [
  {
    store: "indexer",
    sourceFile: "goal-vault-indexer.sqlite",
    table: "vaults",
    primaryKey: ["key"],
    indexes: ["vaults_chain_contract_idx", "vaults_owner_idx"],
    columns: [
      "key",
      "chain_id",
      "contract_address",
      "owner_wallet",
      "asset_address",
      "target_amount_atomic",
      "rule_type",
      "unlock_date",
      "cooldown_duration_seconds",
      "guardian_address",
      "unlock_requested_at",
      "unlock_eligible_at",
      "unlock_request_status",
      "guardian_approval_state",
      "guardian_decision_at",
      "created_at",
      "created_tx_hash",
      "display_name",
      "category",
      "note",
      "accent_theme",
      "metadata_status",
      "reconciliation_status",
      "total_deposited_atomic",
      "total_withdrawn_atomic",
      "current_balance_atomic",
      "last_activity_at",
      "last_indexed_at",
      "onchain_found",
    ],
    containsPrivateMetadata: true,
  },
  {
    store: "indexer",
    sourceFile: "goal-vault-indexer.sqlite",
    table: "vault_events",
    primaryKey: ["id"],
    indexes: ["vault_events_chain_vault_idx", "vault_events_chain_owner_idx"],
    columns: [
      "id",
      "chain_id",
      "tx_hash",
      "block_number",
      "log_index",
      "vault_address",
      "owner_address",
      "actor_address",
      "event_type",
      "amount_atomic",
      "occurred_at",
      "indexed_at",
    ],
    containsPrivateMetadata: false,
  },
  {
    store: "indexer",
    sourceFile: "goal-vault-indexer.sqlite",
    table: "sync_states",
    primaryKey: ["key"],
    indexes: ["sync_states_chain_stream_idx"],
    columns: [
      "key",
      "chain_id",
      "stream_type",
      "scope_key",
      "lifecycle",
      "latest_indexed_block",
      "latest_indexed_log_index",
      "latest_chain_block",
      "last_synced_at",
      "error_message",
    ],
    containsPrivateMetadata: false,
  },
  {
    store: "analytics",
    sourceFile: "goal-vault-analytics.sqlite",
    table: "analytics_events",
    primaryKey: ["id"],
    indexes: ["analytics_events_name_idx", "analytics_events_route_idx", "analytics_events_vault_idx"],
    columns: [
      "id",
      "name",
      "category",
      "occurred_at",
      "platform",
      "route",
      "environment",
      "deployment_target",
      "chain_id",
      "wallet_status",
      "sync_freshness",
      "vault_address",
      "tx_hash",
      "context_json",
      "payload_json",
    ],
    containsPrivateMetadata: false,
  },
  {
    store: "support",
    sourceFile: "goal-vault-analytics.sqlite",
    table: "support_requests",
    primaryKey: ["id"],
    indexes: [
      "support_requests_status_created_idx",
      "support_requests_priority_created_idx",
      "support_requests_wallet_idx",
      "support_requests_vault_idx",
    ],
    columns: [
      "id",
      "status",
      "category",
      "priority",
      "subject",
      "message",
      "reporter_wallet",
      "contact_email",
      "route",
      "environment",
      "deployment_target",
      "chain_id",
      "wallet_status",
      "vault_address",
      "user_agent",
      "requester_ip_hash",
      "created_at",
    ],
    containsPrivateMetadata: true,
  },
];

const readText = (name, fallback = "") => (process.env[name] || fallback).trim();

const requireText = (name) => {
  const value = readText(name);

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
};

const optionalText = (name) => {
  const value = readText(name);
  return value || null;
};

const requireTarget = () => {
  const target = requireText("API_DATABASE_PLAN_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("API_DATABASE_PLAN_TARGET must be staging or production.");
  }

  return target;
};

const requireEngine = () => {
  const engine = requireText("API_DATABASE_ENGINE");

  if (!engineValues.has(engine)) {
    throw new Error("API_DATABASE_ENGINE must be postgresql.");
  }

  return engine;
};

const requireStrategy = () => {
  const strategy = requireText("API_DATABASE_CUTOVER_STRATEGY");

  if (!strategyValues.has(strategy)) {
    throw new Error("API_DATABASE_CUTOVER_STRATEGY must be cold-cutover or shadow-restore.");
  }

  return strategy;
};

const requireNonSecretReference = (name) => {
  const value = requireText(name);

  if (value.includes("://") || value.includes("@") || /password|secret|token/i.test(value)) {
    throw new Error(`${name} must be a non-secret reference, not a connection string or credential.`);
  }

  return value;
};

const requirePositiveInteger = (name, fallback) => {
  const value = Number.parseInt(readText(name, fallback), 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
};

const sanitizeLabel = (value) => value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");

const buildCutoverSteps = (strategy) => {
  if (strategy === "shadow-restore") {
    return [
      "Create a fresh API data snapshot from the current SQLite data directory.",
      "Restore the snapshot into a non-public managed database target using an operator-owned migration procedure.",
      "Run read-only parity checks against vaults, vault_events, sync_states, analytics_events, and support_requests.",
      "Run API preflight with the managed database target configured in the selected runtime environment.",
      "Deploy a candidate API host pointed at the managed database target.",
      "Generate an API traffic plan before any public traffic movement.",
    ];
  }

  return [
    "Stop public API traffic or keep the API in a maintenance window.",
    "Create a fresh API data snapshot from the current SQLite data directory.",
    "Restore the snapshot into the managed database target using an operator-owned migration procedure.",
    "Run API preflight with the managed database target configured in the selected runtime environment.",
    "Deploy the API image pointed at the managed database target.",
    "Generate an API traffic plan before public traffic movement resumes.",
  ];
};

const target = requireTarget();
const engine = requireEngine();
const cutoverStrategy = requireStrategy();
const planLabel = sanitizeLabel(requireText("API_DATABASE_PLAN_LABEL"));
const outputDir = readText("API_DATABASE_PLAN_DIR", path.join(process.cwd(), "artifacts"));
const sourceSnapshot = requireText("API_DATABASE_SOURCE_SNAPSHOT");
const rollbackSnapshot = requireText("API_DATABASE_ROLLBACK_SNAPSHOT");
const targetReference = requireNonSecretReference("API_DATABASE_TARGET_REFERENCE");
const observeMinutes = requirePositiveInteger("API_DATABASE_OBSERVE_MINUTES", "30");

const plan = {
  app: "pocket-vault",
  component: "api-managed-database-plan",
  target,
  engine,
  currentPersistence: "sqlite",
  targetReference,
  cutoverStrategy,
  planLabel,
  generatedAt: new Date().toISOString(),
  noDatabaseMutated: true,
  artifacts: {
    sourceSnapshot,
    rollbackSnapshot,
    apiPreflightReport: optionalText("API_DATABASE_PREFLIGHT_REPORT"),
    apiTrafficPlan: optionalText("API_DATABASE_TRAFFIC_PLAN"),
  },
  controls: {
    changeWindow: optionalText("API_DATABASE_CHANGE_WINDOW"),
    observeMinutes,
    operator: optionalText("API_DATABASE_OPERATOR"),
    notes: optionalText("API_DATABASE_NOTES"),
  },
  schemaInventory,
  dataClassification: {
    containsWalletAddresses: true,
    containsPrivateVaultMetadata: true,
    containsAnalyticsContext: true,
    containsSupportContext: true,
    commitAllowed: false,
  },
  migrationRequirements: [
    "Managed database credentials must stay in the hosting provider or GitHub Environment secrets.",
    "Source and rollback snapshots must be stored only in approved operational storage.",
    "API writes must be paused during cold cutover.",
    "Parity checks must compare row counts and latest indexed block state before traffic movement.",
    "Rollback must keep the previous SQLite snapshot available until the managed database cutover is accepted.",
  ],
  cutoverSteps: buildCutoverSteps(cutoverStrategy),
  rollbackSteps: [
    "Stop public traffic to the managed-database-backed API host.",
    "Restore the API to the previous known-good image and persistence configuration.",
    "Restore SQLite data only from the planned rollback snapshot and only while the API is stopped.",
    "Run /health and /ready checks after recovery.",
    "Record the managed database target reference, failure reason, and restored snapshot reference.",
  ],
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-api-database-${target}-${planLabel}.json`);
writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `plan_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, engine, cutoverStrategy, planLabel }, null, 2));
