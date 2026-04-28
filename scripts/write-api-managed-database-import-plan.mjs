import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const engineValues = new Set(["postgresql"]);
const modeValues = new Set(["initial-import", "retry-import", "rollback-restore"]);
const identifierPattern = /^[a-z_][a-z0-9_]*$/;

const tableConfigs = [
  {
    table: "vaults",
    exportFileName: "vaults.jsonl",
    psqlVariable: "vaults_jsonl",
    rawTable: "goal_vault_import_vaults_raw",
    primaryKey: ["key"],
    columns: [
      ["key", "text"],
      ["chain_id", "integer"],
      ["contract_address", "text"],
      ["owner_wallet", "text"],
      ["asset_address", "text"],
      ["target_amount_atomic", "text"],
      ["rule_type", "text"],
      ["unlock_date", "text"],
      ["cooldown_duration_seconds", "integer"],
      ["guardian_address", "text"],
      ["unlock_requested_at", "text"],
      ["unlock_eligible_at", "text"],
      ["unlock_request_status", "text"],
      ["guardian_approval_state", "text"],
      ["guardian_decision_at", "text"],
      ["created_at", "text"],
      ["created_tx_hash", "text"],
      ["display_name", "text"],
      ["category", "text"],
      ["note", "text"],
      ["accent_theme", "text"],
      ["metadata_status", "text"],
      ["reconciliation_status", "text"],
      ["total_deposited_atomic", "text"],
      ["total_withdrawn_atomic", "text"],
      ["current_balance_atomic", "text"],
      ["last_activity_at", "text"],
      ["last_indexed_at", "text"],
      ["onchain_found", "boolean"],
    ],
  },
  {
    table: "vault_events",
    exportFileName: "vault_events.jsonl",
    psqlVariable: "vault_events_jsonl",
    rawTable: "goal_vault_import_vault_events_raw",
    primaryKey: ["id"],
    columns: [
      ["id", "text"],
      ["chain_id", "integer"],
      ["tx_hash", "text"],
      ["block_number", "bigint"],
      ["log_index", "integer"],
      ["vault_address", "text"],
      ["owner_address", "text"],
      ["actor_address", "text"],
      ["event_type", "text"],
      ["amount_atomic", "text"],
      ["occurred_at", "text"],
      ["indexed_at", "text"],
    ],
  },
  {
    table: "sync_states",
    exportFileName: "sync_states.jsonl",
    psqlVariable: "sync_states_jsonl",
    rawTable: "goal_vault_import_sync_states_raw",
    primaryKey: ["key"],
    columns: [
      ["key", "text"],
      ["chain_id", "integer"],
      ["stream_type", "text"],
      ["scope_key", "text"],
      ["lifecycle", "text"],
      ["latest_indexed_block", "bigint"],
      ["latest_indexed_log_index", "integer"],
      ["latest_chain_block", "bigint"],
      ["last_synced_at", "text"],
      ["error_message", "text"],
    ],
  },
  {
    table: "analytics_events",
    exportFileName: "analytics_events.jsonl",
    psqlVariable: "analytics_events_jsonl",
    rawTable: "goal_vault_import_analytics_events_raw",
    primaryKey: ["id"],
    columns: [
      ["id", "bigint"],
      ["name", "text"],
      ["category", "text"],
      ["occurred_at", "text"],
      ["platform", "text"],
      ["route", "text"],
      ["environment", "text"],
      ["deployment_target", "text"],
      ["chain_id", "integer"],
      ["wallet_status", "text"],
      ["sync_freshness", "text"],
      ["vault_address", "text"],
      ["tx_hash", "text"],
      ["context_json", "text"],
      ["payload_json", "text"],
    ],
  },
  {
    table: "support_requests",
    exportFileName: "support_requests.jsonl",
    psqlVariable: "support_requests_jsonl",
    rawTable: "goal_vault_import_support_requests_raw",
    primaryKey: ["id"],
    columns: [
      ["id", "text"],
      ["status", "text"],
      ["category", "text"],
      ["priority", "text"],
      ["subject", "text"],
      ["message", "text"],
      ["reporter_wallet", "text"],
      ["contact_email", "text"],
      ["route", "text"],
      ["environment", "text"],
      ["deployment_target", "text"],
      ["chain_id", "integer"],
      ["wallet_status", "text"],
      ["vault_address", "text"],
      ["user_agent", "text"],
      ["requester_ip_hash", "text"],
      ["created_at", "text"],
    ],
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

const sanitizeLabel = (value) => value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");

const requireSetValue = (name, allowedValues) => {
  const value = requireText(name);

  if (!allowedValues.has(value)) {
    throw new Error(`${name} must be one of ${Array.from(allowedValues).join(", ")}.`);
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

const quoteIdentifier = (value) => `"${value.replaceAll('"', '""')}"`;

const buildTableName = (schemaName, tableName) => `${quoteIdentifier(schemaName)}.${quoteIdentifier(tableName)}`;

const findManifestPath = (source) => {
  const sourcePath = path.resolve(source);

  if (!existsSync(sourcePath)) {
    throw new Error(`API_DATABASE_IMPORT_EXPORT_SOURCE does not exist: ${sourcePath}`);
  }

  const sourceStat = statSync(sourcePath);

  if (sourceStat.isFile()) {
    if (path.basename(sourcePath) !== "manifest.json") {
      throw new Error("API_DATABASE_IMPORT_EXPORT_SOURCE file must be named manifest.json.");
    }

    return sourcePath;
  }

  const rootManifestPath = path.join(sourcePath, "manifest.json");

  if (existsSync(rootManifestPath)) {
    return rootManifestPath;
  }

  const matches = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.name === "manifest.json") {
        matches.push(entryPath);
      }
    }
  };

  visit(sourcePath);

  if (matches.length !== 1) {
    throw new Error(`Expected one export manifest under ${sourcePath}, found ${matches.length}.`);
  }

  return matches[0];
};

const inspectExportFile = async (filePath, expected) =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    let bytes = 0;
    let rows = 0;

    stream.on("data", (chunk) => {
      bytes += chunk.length;
      hash.update(chunk);

      for (const byte of chunk) {
        if (byte === 10) {
          rows += 1;
        }
      }
    });

    stream.on("error", reject);
    stream.on("end", () => {
      const sha256 = hash.digest("hex");

      if (expected.bytes !== undefined && bytes !== expected.bytes) {
        reject(new Error(`Export file byte mismatch for ${expected.exportFileName}.`));
        return;
      }

      if (expected.sha256 && sha256 !== expected.sha256) {
        reject(new Error(`Export file checksum mismatch for ${expected.exportFileName}.`));
        return;
      }

      if (expected.rows !== undefined && rows !== expected.rows) {
        reject(new Error(`Export file row count mismatch for ${expected.exportFileName}.`));
        return;
      }

      resolve({ bytes, rows, sha256 });
    });
  });

const readExportManifest = async (exportSource) => {
  const manifestPath = findManifestPath(exportSource);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (manifest.component !== "api-managed-database-export") {
    throw new Error("Export manifest component must be api-managed-database-export.");
  }

  if (manifest.format !== "jsonl") {
    throw new Error("Export manifest format must be jsonl.");
  }

  if (!Array.isArray(manifest.exports) || manifest.exports.length === 0) {
    throw new Error("Export manifest has no table exports.");
  }

  const exportDir = path.dirname(manifestPath);
  const manifestExports = new Map(manifest.exports.map((item) => [item.table, item]));
  const files = [];

  for (const config of tableConfigs) {
    const exported = manifestExports.get(config.table);

    if (!exported) {
      throw new Error(`Export manifest is missing ${config.table}.`);
    }

    if (exported.exportFileName !== config.exportFileName) {
      throw new Error(`Export file for ${config.table} must be ${config.exportFileName}.`);
    }

    const filePath = path.join(exportDir, exported.exportFileName);

    if (!existsSync(filePath)) {
      throw new Error(`Export file ${exported.exportFileName} was not found.`);
    }

    const inspected = await inspectExportFile(filePath, exported);

    files.push({
      table: config.table,
      exportFileName: exported.exportFileName,
      psqlVariable: config.psqlVariable,
      rows: inspected.rows,
      bytes: inspected.bytes,
      sha256: inspected.sha256,
    });
  }

  return {
    manifest,
    manifestPath,
    exportDir,
    files,
  };
};

const buildColumnExpression = ([column, type]) => {
  if (type === "integer") {
    return `NULLIF(payload->>'${column}', '')::INTEGER`;
  }

  if (type === "bigint") {
    return `NULLIF(payload->>'${column}', '')::BIGINT`;
  }

  if (type === "boolean") {
    return `CASE WHEN lower(payload->>'${column}') IN ('1', 'true') THEN TRUE WHEN lower(payload->>'${column}') IN ('0', 'false') THEN FALSE ELSE FALSE END`;
  }

  return `payload->>'${column}'`;
};

const buildImportStatement = (schemaName, config) => {
  const tableName = buildTableName(schemaName, config.table);
  const columnNames = config.columns.map(([column]) => quoteIdentifier(column));
  const selectExpressions = config.columns.map(buildColumnExpression);
  const conflictTarget = config.primaryKey.map(quoteIdentifier).join(", ");
  const updateColumns = config.columns
    .filter(([column]) => !config.primaryKey.includes(column))
    .map(([column]) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`);

  return [
    `CREATE TEMP TABLE ${quoteIdentifier(config.rawTable)} (payload jsonb NOT NULL) ON COMMIT DROP;`,
    `\\copy ${quoteIdentifier(config.rawTable)} (payload) FROM :'${config.psqlVariable}' WITH (FORMAT text)`,
    `INSERT INTO ${tableName} (`,
    `  ${columnNames.join(",\n  ")}`,
    ")",
    "SELECT",
    `  ${selectExpressions.join(",\n  ")}`,
    `FROM ${quoteIdentifier(config.rawTable)}`,
    `ON CONFLICT (${conflictTarget}) DO UPDATE SET`,
    `  ${updateColumns.join(",\n  ")};`,
    `SELECT '${config.table}' AS imported_table, COUNT(*) AS current_row_count FROM ${tableName};`,
  ].join("\n");
};

const buildImportSql = (schemaName) =>
  [
    "\\set ON_ERROR_STOP on",
    "BEGIN;",
    "SET LOCAL lock_timeout = '10s';",
    ...tableConfigs.map((config) => buildImportStatement(schemaName, config)),
    "COMMIT;",
    "",
  ].join("\n\n");

const target = requireSetValue("API_DATABASE_IMPORT_TARGET", targetValues);
const engine = requireSetValue("API_DATABASE_IMPORT_ENGINE", engineValues);
const mode = requireSetValue("API_DATABASE_IMPORT_MODE", modeValues);
const importLabel = sanitizeLabel(requireText("API_DATABASE_IMPORT_LABEL"));
const targetReference = requireNonSecretReference("API_DATABASE_IMPORT_TARGET_REFERENCE");
const schemaName = requireIdentifier("API_DATABASE_IMPORT_SCHEMA_NAME", "goal_vault_api");
const exportSource = requireText("API_DATABASE_IMPORT_EXPORT_SOURCE");
const outputDir = path.resolve(readText("API_DATABASE_IMPORT_DIR", path.join(process.cwd(), "artifacts")));
const observeMinutes = requirePositiveInteger("API_DATABASE_IMPORT_OBSERVE_MINUTES", "30");
const exportBundle = await readExportManifest(exportSource);

if (exportBundle.manifest.target !== target) {
  throw new Error(`Export target ${exportBundle.manifest.target} does not match import target ${target}.`);
}

mkdirSync(outputDir, { recursive: true });

const baseName = `pocket-vault-api-database-import-${target}-${importLabel}`;
const sqlPath = path.join(outputDir, `${baseName}.sql`);
const planPath = path.join(outputDir, `${baseName}.json`);
const importSql = buildImportSql(schemaName);

const plan = {
  app: "pocket-vault",
  component: "api-managed-database-import-plan",
  target,
  engine,
  mode,
  importLabel,
  targetReference,
  schemaName,
  generatedAt: new Date().toISOString(),
  noDatabaseConnected: true,
  noDataImported: true,
  exportBundle: {
    manifestPath: exportBundle.manifestPath,
    exportLabel: exportBundle.manifest.exportLabel,
    generatedAt: exportBundle.manifest.generatedAt,
    files: exportBundle.files,
  },
  artifacts: {
    managedDatabasePlan: optionalText("API_DATABASE_IMPORT_DATABASE_PLAN"),
    schemaManifest: optionalText("API_DATABASE_IMPORT_SCHEMA_MANIFEST"),
    parityPlan: optionalText("API_DATABASE_IMPORT_PARITY_PLAN"),
    importSql: path.basename(sqlPath),
  },
  psqlVariables: Object.fromEntries(exportBundle.files.map((file) => [file.psqlVariable, file.exportFileName])),
  controls: {
    changeWindow: optionalText("API_DATABASE_IMPORT_CHANGE_WINDOW"),
    observeMinutes,
    operator: optionalText("API_DATABASE_IMPORT_OPERATOR"),
    notes: optionalText("API_DATABASE_IMPORT_NOTES"),
  },
  executionBoundary: [
    "Review the export manifest, schema manifest, and generated import SQL before execution.",
    "Run the generated SQL only through approved operational access with credentials outside this repository.",
    "Pass local file paths for every psql variable recorded in this plan.",
    "Run managed database parity checks after import and before traffic movement.",
  ],
  rollbackTriggers: [
    "A JSONL file checksum or row count does not match the export manifest.",
    "The import SQL fails before COMMIT.",
    "Post-import parity row counts differ without an approved reset or controlled sync advancement.",
    "API /ready reports blocked checks after the managed database target is configured.",
  ],
  dataClassification: {
    containsWalletAddresses: true,
    containsPrivateVaultMetadata: true,
    containsAnalyticsContext: true,
    containsSupportContext: true,
    commitAllowed: false,
  },
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

writeFileSync(sqlPath, importSql);
writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `plan_path=${planPath}\nsql_path=${sqlPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ planPath, sqlPath, target, engine, mode, importLabel, schemaName }, null, 2));
