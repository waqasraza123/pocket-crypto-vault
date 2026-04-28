import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const requireFromApi = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { Client } = requireFromApi("pg");

const targetValues = new Set(["staging", "production"]);
const identifierPattern = /^[a-z_][a-z0-9_]*$/;
const secretPattern = /(password|passwd|secret|token|credential|private[_-]?key|api[_-]?key|bearer\s+|basic\s+)/i;

const tableConfigs = [
  {
    table: "vaults",
    exportFileName: "vaults.jsonl",
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

const sanitizeLabel = (value) => {
  const label = value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  if (!label) {
    throw new Error("API_DATABASE_IMPORT_EXECUTION_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const requireTarget = () => {
  const target = requireText("API_DATABASE_IMPORT_EXECUTION_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("API_DATABASE_IMPORT_EXECUTION_TARGET must be staging or production.");
  }

  return target;
};

const requireIdentifier = (name, fallback) => {
  const value = readText(name, fallback);

  if (!identifierPattern.test(value)) {
    throw new Error(`${name} must be a lowercase PostgreSQL identifier.`);
  }

  return value;
};

const validateNonSecretText = (name, value) => {
  if (!value) {
    return;
  }

  if (secretPattern.test(value) || value.includes("://") || value.includes("@")) {
    throw new Error(`${name} must be a non-secret reference.`);
  }
};

const quoteIdentifier = (value) => `"${value.replaceAll('"', '""')}"`;

const buildTableName = (schemaName, tableName) => `${quoteIdentifier(schemaName)}.${quoteIdentifier(tableName)}`;

const hashFile = (filePath) => createHash("sha256").update(readFileSync(filePath)).digest("hex");

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

const readExportBundle = (source, target) => {
  const manifestPath = findManifestPath(source);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (manifest.component !== "api-managed-database-export") {
    throw new Error("Export manifest component must be api-managed-database-export.");
  }

  if (manifest.target !== target) {
    throw new Error("Export manifest target must match import execution target.");
  }

  const exportDir = path.dirname(manifestPath);
  const manifestExports = new Map(manifest.exports.map((item) => [item.table, item]));

  return {
    manifest,
    manifestPath,
    exportDir,
    files: tableConfigs.map((config) => {
      const exported = manifestExports.get(config.table);

      if (!exported) {
        throw new Error(`Export manifest is missing ${config.table}.`);
      }

      const filePath = path.join(exportDir, exported.exportFileName);

      if (!existsSync(filePath)) {
        throw new Error(`Export file was not found: ${exported.exportFileName}`);
      }

      if (exported.sha256 && hashFile(filePath) !== exported.sha256) {
        throw new Error(`Export checksum mismatch for ${exported.exportFileName}.`);
      }

      return {
        config,
        exported,
        filePath,
      };
    }),
  };
};

const readImportPlan = (planReference, target, schemaName) => {
  const planPath = path.resolve(planReference);

  if (!existsSync(planPath)) {
    throw new Error(`API_DATABASE_IMPORT_PLAN does not exist: ${planPath}`);
  }

  const plan = JSON.parse(readFileSync(planPath, "utf8"));

  if (plan.component !== "api-managed-database-import-plan") {
    throw new Error("Import plan component must be api-managed-database-import-plan.");
  }

  if (plan.target !== target) {
    throw new Error("Import plan target must match import execution target.");
  }

  if (plan.schemaName !== schemaName) {
    throw new Error("Import plan schemaName must match API_DATABASE_IMPORT_SCHEMA_NAME.");
  }

  if (plan.noDataImported !== true || plan.noDatabaseConnected !== true) {
    throw new Error("Import plan must be a non-mutating generated artifact.");
  }

  return {
    path: planPath,
    importLabel: plan.importLabel,
    mode: plan.mode,
  };
};

const normalizeValue = (value, type) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (type === "boolean") {
    return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
  }

  if (type === "integer" || type === "bigint") {
    return Number(value);
  }

  return String(value);
};

const buildUpsert = (schemaName, config) => {
  const columns = config.columns.map(([column]) => column);
  const columnSql = columns.map(quoteIdentifier).join(", ");
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  const conflictTarget = config.primaryKey.map(quoteIdentifier).join(", ");
  const updateSql = columns
    .filter((column) => !config.primaryKey.includes(column))
    .map((column) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`)
    .join(", ");

  return `INSERT INTO ${buildTableName(schemaName, config.table)} (${columnSql}) VALUES (${placeholders}) ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updateSql}`;
};

const importTable = async ({ client, schemaName, filePath, config }) => {
  const statement = buildUpsert(schemaName, config);
  const input = createReadStream(filePath);
  const lines = createInterface({ input, crlfDelay: Infinity });
  let rows = 0;

  for await (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const payload = JSON.parse(line);
    const values = config.columns.map(([column, type]) => normalizeValue(payload[column], type));
    await client.query(statement, values);
    rows += 1;
  }

  return rows;
};

const target = requireTarget();
const label = sanitizeLabel(requireText("API_DATABASE_IMPORT_EXECUTION_LABEL"));
const schemaName = requireIdentifier("API_DATABASE_IMPORT_SCHEMA_NAME", "goal_vault_api");
const targetReference = optionalText("API_DATABASE_IMPORT_TARGET_REFERENCE");
const planEvidence = readImportPlan(requireText("API_DATABASE_IMPORT_PLAN"), target, schemaName);
const exportBundle = readExportBundle(requireText("API_DATABASE_IMPORT_EXPORT_SOURCE"), target);
const connectionString = requireText("API_DATABASE_URL");
const confirmImport = requireText("API_DATABASE_IMPORT_CONFIRM_EXECUTE");
const outputDir = readText("API_DATABASE_IMPORT_EXECUTION_DIR", path.join(process.cwd(), "artifacts"));

validateNonSecretText("API_DATABASE_IMPORT_TARGET_REFERENCE", targetReference);

if (confirmImport !== "import") {
  throw new Error("API_DATABASE_IMPORT_CONFIRM_EXECUTE must be import.");
}

const client = new Client({ connectionString });
const startedAt = new Date().toISOString();
const importedTables = [];

await client.connect();

try {
  await client.query("BEGIN");

  for (const file of exportBundle.files) {
    const importedRows = await importTable({
      client,
      schemaName,
      filePath: file.filePath,
      config: file.config,
    });

    if (file.exported.rows !== undefined && importedRows !== file.exported.rows) {
      throw new Error(`Imported row count mismatch for ${file.exported.exportFileName}.`);
    }

    importedTables.push({
      table: file.config.table,
      exportFileName: file.exported.exportFileName,
      rows: importedRows,
      sha256: file.exported.sha256 ?? null,
    });
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}

const finishedAt = new Date().toISOString();

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-api-database-import-execute-${target}-${label}.json`);
const result = {
  app: "pocket-vault",
  component: "api-managed-database-import-execute",
  target,
  label,
  schemaName,
  targetReference,
  startedAt,
  finishedAt,
  databaseMutated: true,
  credentialsRedacted: true,
  importPlan: planEvidence,
  exportBundle: {
    manifestPath: exportBundle.manifestPath,
    exportLabel: exportBundle.manifest.exportLabel,
    generatedAt: exportBundle.manifest.generatedAt,
  },
  importedTables,
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

writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `result_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, label, schemaName, tables: importedTables.length }, null, 2));
