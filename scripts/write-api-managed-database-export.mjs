import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";

const targetValues = new Set(["staging", "production"]);
const formatValues = new Set(["jsonl"]);

const tableConfigs = [
  {
    table: "vaults",
    sourceFile: "goal-vault-indexer.sqlite",
    orderBy: "chain_id ASC, lower(contract_address) ASC",
    classification: "wallet-and-private-metadata",
  },
  {
    table: "vault_events",
    sourceFile: "goal-vault-indexer.sqlite",
    orderBy: "chain_id ASC, block_number ASC, log_index ASC",
    classification: "chain-activity",
  },
  {
    table: "sync_states",
    sourceFile: "goal-vault-indexer.sqlite",
    orderBy: "key ASC",
    classification: "indexer-control-plane",
  },
  {
    table: "analytics_events",
    sourceFile: "goal-vault-analytics.sqlite",
    orderBy: "id ASC",
    classification: "analytics-context",
  },
  {
    table: "support_requests",
    sourceFile: "goal-vault-analytics.sqlite",
    orderBy: "created_at ASC, id ASC",
    classification: "support-private-context",
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

const requireSetValue = (name, allowedValues) => {
  const value = requireText(name);

  if (!allowedValues.has(value)) {
    throw new Error(`${name} must be one of ${Array.from(allowedValues).join(", ")}.`);
  }

  return value;
};

const sanitizeLabel = (value) => value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");

const hashFile = (filePath) => createHash("sha256").update(readFileSync(filePath)).digest("hex");

const findManifestPath = (snapshotSource) => {
  const rootManifestPath = path.join(snapshotSource, "manifest.json");

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

  visit(snapshotSource);

  if (matches.length !== 1) {
    throw new Error(`Expected one snapshot manifest under ${snapshotSource}, found ${matches.length}.`);
  }

  return matches[0];
};

const readSnapshotManifest = (snapshotSource) => {
  const manifestPath = findManifestPath(snapshotSource);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error("Snapshot manifest has no files.");
  }

  return {
    manifest,
    manifestPath,
    snapshotDir: path.dirname(manifestPath),
  };
};

const verifySnapshotFile = (snapshotDir, file) => {
  const filePath = path.join(snapshotDir, file.fileName);

  if (!existsSync(filePath)) {
    throw new Error(`Snapshot file ${file.fileName} was not found.`);
  }

  if (file.sha256 && hashFile(filePath) !== file.sha256) {
    throw new Error(`Snapshot checksum mismatch for ${file.fileName}.`);
  }

  return filePath;
};

const assertTableExists = (database, table) => {
  const row = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(table);

  if (!row) {
    throw new Error(`Snapshot database is missing required table ${table}.`);
  }
};

const writeTableExport = ({ database, table, orderBy, outputPath }) => {
  const statement = database.prepare(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
  const file = openSync(outputPath, "w");
  let rows = 0;

  try {
    for (const row of statement.iterate()) {
      writeSync(file, `${JSON.stringify(row)}\n`);
      rows += 1;
    }
  } finally {
    closeSync(file);
  }

  return {
    rows,
    bytes: statSync(outputPath).size,
    sha256: hashFile(outputPath),
  };
};

const target = requireSetValue("API_DATABASE_EXPORT_TARGET", targetValues);
const format = requireSetValue("API_DATABASE_EXPORT_FORMAT", formatValues);
const exportLabel = sanitizeLabel(requireText("API_DATABASE_EXPORT_LABEL"));
const snapshotSource = path.resolve(requireText("API_DATABASE_EXPORT_SNAPSHOT_SOURCE"));
const outputRoot = path.resolve(readText("API_DATABASE_EXPORT_DIR", path.join(process.cwd(), "artifacts/api-managed-database-exports")));

if (!existsSync(snapshotSource)) {
  throw new Error(`API_DATABASE_EXPORT_SNAPSHOT_SOURCE does not exist: ${snapshotSource}`);
}

const { manifest: snapshotManifest, manifestPath, snapshotDir } = readSnapshotManifest(snapshotSource);
const filesByName = new Map(snapshotManifest.files.map((file) => [file.fileName, file]));
const outputDir = path.join(outputRoot, `${target}-${exportLabel}`);

mkdirSync(outputDir, { recursive: true });

const exports = [];
const databases = new Map();

try {
  for (const config of tableConfigs) {
    const snapshotFile = filesByName.get(config.sourceFile);

    if (!snapshotFile) {
      continue;
    }

    let database = databases.get(config.sourceFile);

    if (!database) {
      database = new DatabaseSync(verifySnapshotFile(snapshotDir, snapshotFile));
      databases.set(config.sourceFile, database);
    }

    assertTableExists(database, config.table);

    const exportFileName = `${config.table}.${format}`;
    const outputPath = path.join(outputDir, exportFileName);
    const written = writeTableExport({
      database,
      table: config.table,
      orderBy: config.orderBy,
      outputPath,
    });

    exports.push({
      table: config.table,
      sourceFile: config.sourceFile,
      classification: config.classification,
      exportFileName,
      format,
      ...written,
    });
  }
} finally {
  for (const database of databases.values()) {
    database.close();
  }
}

if (exports.length === 0) {
  throw new Error("No SQLite snapshot files were available for managed database export.");
}

const exportManifest = {
  app: "pocket-vault",
  component: "api-managed-database-export",
  target,
  exportLabel,
  format,
  generatedAt: new Date().toISOString(),
  noDatabaseConnected: true,
  noDataImported: true,
  snapshot: {
    manifestPath,
    snapshotLabel: snapshotManifest.snapshotLabel ?? null,
    generatedAt: snapshotManifest.generatedAt ?? null,
  },
  artifacts: {
    managedDatabasePlan: optionalText("API_DATABASE_EXPORT_DATABASE_PLAN"),
    schemaManifest: optionalText("API_DATABASE_EXPORT_SCHEMA_MANIFEST"),
    parityPlan: optionalText("API_DATABASE_EXPORT_PARITY_PLAN"),
  },
  exports,
  dataClassification: {
    containsWalletAddresses: true,
    containsPrivateVaultMetadata: exports.some((item) => item.classification === "wallet-and-private-metadata"),
    containsAnalyticsContext: exports.some((item) => item.classification === "analytics-context"),
    commitAllowed: false,
  },
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

const manifestOutputPath = path.join(outputDir, "manifest.json");
writeFileSync(manifestOutputPath, `${JSON.stringify(exportManifest, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `export_dir=${outputDir}\nmanifest_path=${manifestOutputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputDir, manifestPath: manifestOutputPath, tables: exports.map((item) => item.table) }, null, 2));
