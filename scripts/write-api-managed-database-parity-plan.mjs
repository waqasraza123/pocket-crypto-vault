import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const engineValues = new Set(["postgresql"]);
const modeValues = new Set(["restore-validation", "pre-traffic", "post-rollback"]);
const identifierPattern = /^[a-z_][a-z0-9_]*$/;

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

const sanitizeLabel = (value) => value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");

const requireSetValue = (name, allowedValues) => {
  const value = requireText(name);

  if (!allowedValues.has(value)) {
    throw new Error(`${name} must be one of ${Array.from(allowedValues).join(", ")}.`);
  }

  return value;
};

const requireNonSecretReference = (name) => {
  const value = requireText(name);

  if (value.includes("://") || value.includes("@") || /password|secret|token|credential/i.test(value)) {
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

const requireIdentifier = (name, fallback) => {
  const value = readText(name, fallback);

  if (!identifierPattern.test(value)) {
    throw new Error(`${name} must be a lowercase PostgreSQL identifier.`);
  }

  return value;
};

const buildTableName = (schemaName, tableName) => `${schemaName}.${tableName}`;

const tableParityChecks = [
  {
    table: "vaults",
    sourceFile: "goal-vault-indexer.sqlite",
    classification: "wallet-and-private-metadata",
    sqliteQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM vaults;",
      chainContractCount: "SELECT COUNT(DISTINCT chain_id || ':' || lower(contract_address)) AS chain_contract_count FROM vaults;",
      onchainFoundCount: "SELECT COUNT(*) AS onchain_found_count FROM vaults WHERE onchain_found = 1;",
      latestIndexedAt: "SELECT MAX(last_indexed_at) AS latest_indexed_at FROM vaults;",
    },
    postgresqlQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM goal_vault_api.vaults;",
      chainContractCount: "SELECT COUNT(DISTINCT chain_id::text || ':' || lower(contract_address)) AS chain_contract_count FROM goal_vault_api.vaults;",
      onchainFoundCount: "SELECT COUNT(*) AS onchain_found_count FROM goal_vault_api.vaults WHERE onchain_found = TRUE;",
      latestIndexedAt: "SELECT MAX(last_indexed_at) AS latest_indexed_at FROM goal_vault_api.vaults;",
    },
    acceptance: [
      "row_count must match exactly",
      "chain_contract_count must match exactly",
      "onchain_found_count must match exactly",
      "latest_indexed_at must match or be intentionally advanced by a post-restore sync",
    ],
  },
  {
    table: "vault_events",
    sourceFile: "goal-vault-indexer.sqlite",
    classification: "chain-activity",
    sqliteQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM vault_events;",
      chainVaultCount: "SELECT COUNT(DISTINCT chain_id || ':' || lower(vault_address)) AS chain_vault_count FROM vault_events;",
      latestBlockByChain: "SELECT chain_id, MAX(block_number) AS latest_block_number FROM vault_events GROUP BY chain_id ORDER BY chain_id;",
    },
    postgresqlQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM goal_vault_api.vault_events;",
      chainVaultCount: "SELECT COUNT(DISTINCT chain_id::text || ':' || lower(vault_address)) AS chain_vault_count FROM goal_vault_api.vault_events;",
      latestBlockByChain: "SELECT chain_id, MAX(block_number) AS latest_block_number FROM goal_vault_api.vault_events GROUP BY chain_id ORDER BY chain_id;",
    },
    acceptance: [
      "row_count must match exactly",
      "chain_vault_count must match exactly",
      "latest_block_number per chain must match or be intentionally advanced by a post-restore sync",
    ],
  },
  {
    table: "sync_states",
    sourceFile: "goal-vault-indexer.sqlite",
    classification: "indexer-control-plane",
    sqliteQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM sync_states;",
      latestStateByKey: "SELECT key, lifecycle, latest_indexed_block, latest_indexed_log_index, latest_chain_block, last_synced_at FROM sync_states ORDER BY key;",
    },
    postgresqlQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM goal_vault_api.sync_states;",
      latestStateByKey: "SELECT key, lifecycle, latest_indexed_block, latest_indexed_log_index, latest_chain_block, last_synced_at FROM goal_vault_api.sync_states ORDER BY key;",
    },
    acceptance: [
      "row_count must match exactly",
      "latest_indexed_block and latest_indexed_log_index by key must match unless a controlled sync has advanced the target",
      "error lifecycle states must be reviewed before traffic movement",
    ],
  },
  {
    table: "analytics_events",
    sourceFile: "goal-vault-analytics.sqlite",
    classification: "analytics-context",
    sqliteQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM analytics_events;",
      latestEventByEnvironment: "SELECT environment, MAX(occurred_at) AS latest_occurred_at FROM analytics_events GROUP BY environment ORDER BY environment;",
      eventCountByCategory: "SELECT category, COUNT(*) AS row_count FROM analytics_events GROUP BY category ORDER BY category;",
    },
    postgresqlQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM goal_vault_api.analytics_events;",
      latestEventByEnvironment: "SELECT environment, MAX(occurred_at) AS latest_occurred_at FROM goal_vault_api.analytics_events GROUP BY environment ORDER BY environment;",
      eventCountByCategory: "SELECT category, COUNT(*) AS row_count FROM goal_vault_api.analytics_events GROUP BY category ORDER BY category;",
    },
    acceptance: [
      "row_count must match exactly unless analytics is intentionally reset",
      "latest_occurred_at by environment should match before traffic movement",
      "category row counts should match before traffic movement",
    ],
  },
  {
    table: "support_requests",
    sourceFile: "goal-vault-analytics.sqlite",
    classification: "support-private-context",
    sqliteQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM support_requests;",
      latestRequestByStatus: "SELECT status, MAX(created_at) AS latest_created_at FROM support_requests GROUP BY status ORDER BY status;",
      requestCountByCategory: "SELECT category, COUNT(*) AS row_count FROM support_requests GROUP BY category ORDER BY category;",
    },
    postgresqlQueries: {
      rowCount: "SELECT COUNT(*) AS row_count FROM goal_vault_api.support_requests;",
      latestRequestByStatus: "SELECT status, MAX(created_at) AS latest_created_at FROM goal_vault_api.support_requests GROUP BY status ORDER BY status;",
      requestCountByCategory: "SELECT category, COUNT(*) AS row_count FROM goal_vault_api.support_requests GROUP BY category ORDER BY category;",
    },
    acceptance: [
      "row_count must match exactly unless support intake is intentionally reset",
      "latest_created_at by status should match before traffic movement",
      "category row counts should match before traffic movement",
    ],
  },
];

const buildParityChecks = (schemaName) =>
  tableParityChecks.map((check) => {
    const tableName = buildTableName(schemaName, check.table);

    if (check.table === "vaults") {
      return {
        ...check,
        postgresqlQueries: {
          rowCount: `SELECT COUNT(*) AS row_count FROM ${tableName};`,
          chainContractCount: `SELECT COUNT(DISTINCT chain_id::text || ':' || lower(contract_address)) AS chain_contract_count FROM ${tableName};`,
          onchainFoundCount: `SELECT COUNT(*) AS onchain_found_count FROM ${tableName} WHERE onchain_found = TRUE;`,
          latestIndexedAt: `SELECT MAX(last_indexed_at) AS latest_indexed_at FROM ${tableName};`,
        },
      };
    }

    if (check.table === "vault_events") {
      return {
        ...check,
        postgresqlQueries: {
          rowCount: `SELECT COUNT(*) AS row_count FROM ${tableName};`,
          chainVaultCount: `SELECT COUNT(DISTINCT chain_id::text || ':' || lower(vault_address)) AS chain_vault_count FROM ${tableName};`,
          latestBlockByChain: `SELECT chain_id, MAX(block_number) AS latest_block_number FROM ${tableName} GROUP BY chain_id ORDER BY chain_id;`,
        },
      };
    }

    if (check.table === "sync_states") {
      return {
        ...check,
        postgresqlQueries: {
          rowCount: `SELECT COUNT(*) AS row_count FROM ${tableName};`,
          latestStateByKey: `SELECT key, lifecycle, latest_indexed_block, latest_indexed_log_index, latest_chain_block, last_synced_at FROM ${tableName} ORDER BY key;`,
        },
      };
    }

    if (check.table === "support_requests") {
      return {
        ...check,
        postgresqlQueries: {
          rowCount: `SELECT COUNT(*) AS row_count FROM ${tableName};`,
          latestRequestByStatus: `SELECT status, MAX(created_at) AS latest_created_at FROM ${tableName} GROUP BY status ORDER BY status;`,
          requestCountByCategory: `SELECT category, COUNT(*) AS row_count FROM ${tableName} GROUP BY category ORDER BY category;`,
        },
      };
    }

    return {
      ...check,
      postgresqlQueries: {
        rowCount: `SELECT COUNT(*) AS row_count FROM ${tableName};`,
        latestEventByEnvironment: `SELECT environment, MAX(occurred_at) AS latest_occurred_at FROM ${tableName} GROUP BY environment ORDER BY environment;`,
        eventCountByCategory: `SELECT category, COUNT(*) AS row_count FROM ${tableName} GROUP BY category ORDER BY category;`,
      },
    };
  });

const target = requireSetValue("API_DATABASE_PARITY_TARGET", targetValues);
const engine = requireSetValue("API_DATABASE_PARITY_ENGINE", engineValues);
const mode = requireSetValue("API_DATABASE_PARITY_MODE", modeValues);
const parityLabel = sanitizeLabel(requireText("API_DATABASE_PARITY_LABEL"));
const targetReference = requireNonSecretReference("API_DATABASE_PARITY_TARGET_REFERENCE");
const schemaName = requireIdentifier("API_DATABASE_PARITY_SCHEMA_NAME", "goal_vault_api");
const outputDir = readText("API_DATABASE_PARITY_DIR", path.join(process.cwd(), "artifacts"));
const observeMinutes = requirePositiveInteger("API_DATABASE_PARITY_OBSERVE_MINUTES", "30");

const plan = {
  app: "pocket-vault",
  component: "api-managed-database-parity-plan",
  target,
  engine,
  mode,
  parityLabel,
  targetReference,
  schemaName,
  generatedAt: new Date().toISOString(),
  noDatabaseConnected: true,
  noDataCompared: true,
  artifacts: {
    sourceSnapshot: requireText("API_DATABASE_PARITY_SOURCE_SNAPSHOT"),
    schemaManifest: requireText("API_DATABASE_PARITY_SCHEMA_MANIFEST"),
    managedDatabasePlan: optionalText("API_DATABASE_PARITY_DATABASE_PLAN"),
    schemaSql: optionalText("API_DATABASE_PARITY_SCHEMA_SQL"),
    trafficPlan: optionalText("API_DATABASE_PARITY_TRAFFIC_PLAN"),
  },
  controls: {
    observeMinutes,
    operator: optionalText("API_DATABASE_PARITY_OPERATOR"),
    notes: optionalText("API_DATABASE_PARITY_NOTES"),
  },
  tableParityChecks: buildParityChecks(schemaName),
  acceptanceGate: [
    "All required source snapshot and schema artifacts are reviewed before executing parity queries.",
    "Every table row count matches exactly unless the operator records an intentional reset or controlled sync advancement.",
    "Sync state latest indexed blocks and log indexes match before public traffic movement unless a controlled sync advancement is recorded.",
    "Private vault metadata parity is reviewed only through approved operational access.",
    "Support request subject, message, contact, wallet, and route context parity is reviewed only through approved operational access.",
    "The managed-database-backed API is not promoted until parity, API preflight, and API traffic plan artifacts are all accepted.",
  ],
  rollbackTriggers: [
    "Required table is missing from the managed database target.",
    "Row counts differ without an approved reset or sync advancement.",
    "Latest sync state regresses from the source snapshot.",
    "Private metadata rows are missing or malformed.",
    "Support request rows are missing or malformed.",
    "API /ready reports blocked checks after the managed database target is configured.",
  ],
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-api-database-parity-${target}-${parityLabel}.json`);
writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `plan_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, engine, mode, parityLabel }, null, 2));
