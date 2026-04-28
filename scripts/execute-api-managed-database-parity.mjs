import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import process from "node:process";

const requireFromApi = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { Client } = requireFromApi("pg");

const targetValues = new Set(["staging", "production"]);
const identifierPattern = /^[a-z_][a-z0-9_]*$/;
const secretPattern = /(password|passwd|secret|token|credential|private[_-]?key|api[_-]?key|bearer\s+|basic\s+)/i;

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
    throw new Error("API_DATABASE_PARITY_EXECUTION_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const requireTarget = () => {
  const target = requireText("API_DATABASE_PARITY_EXECUTION_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("API_DATABASE_PARITY_EXECUTION_TARGET must be staging or production.");
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

const findManifestPath = (source) => {
  const sourcePath = path.resolve(source);

  if (!existsSync(sourcePath)) {
    throw new Error(`API_DATABASE_PARITY_SOURCE_SNAPSHOT does not exist: ${sourcePath}`);
  }

  const sourceStat = statSync(sourcePath);

  if (sourceStat.isFile()) {
    if (path.basename(sourcePath) !== "manifest.json") {
      throw new Error("API_DATABASE_PARITY_SOURCE_SNAPSHOT file must be named manifest.json.");
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
    throw new Error(`Expected one snapshot manifest under ${sourcePath}, found ${matches.length}.`);
  }

  return matches[0];
};

const readSnapshot = (source) => {
  const manifestPath = findManifestPath(source);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error("Snapshot manifest has no files.");
  }

  const snapshotDir = path.dirname(manifestPath);
  const filesByName = new Map(manifest.files.map((file) => [file.fileName, path.join(snapshotDir, file.fileName)]));

  for (const filePath of filesByName.values()) {
    if (!existsSync(filePath)) {
      throw new Error(`Snapshot file does not exist: ${filePath}`);
    }
  }

  return {
    manifestPath,
    manifest,
    filesByName,
  };
};

const readParityPlan = (planReference, target, schemaName) => {
  const planPath = path.resolve(planReference);

  if (!existsSync(planPath)) {
    throw new Error(`API_DATABASE_PARITY_PLAN does not exist: ${planPath}`);
  }

  const plan = JSON.parse(readFileSync(planPath, "utf8"));

  if (plan.component !== "api-managed-database-parity-plan") {
    throw new Error("Parity plan component must be api-managed-database-parity-plan.");
  }

  if (plan.target !== target) {
    throw new Error("Parity plan target must match parity execution target.");
  }

  if (plan.schemaName !== schemaName) {
    throw new Error("Parity plan schemaName must match API_DATABASE_PARITY_SCHEMA_NAME.");
  }

  if (plan.noDataCompared !== true || plan.noDatabaseConnected !== true) {
    throw new Error("Parity plan must be a non-mutating generated artifact.");
  }

  return {
    path: planPath,
    parityLabel: plan.parityLabel,
    checks: plan.tableParityChecks,
  };
};

const runSqliteQuery = (snapshot, sourceFile, query) => {
  const filePath = snapshot.filesByName.get(sourceFile);

  if (!filePath) {
    return [];
  }

  const database = new DatabaseSync(filePath);

  try {
    return database.prepare(query).all();
  } finally {
    database.close();
  }
};

const normalizeRows = (rows) =>
  rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, value === null || value === undefined ? null : String(value)]),
    ),
  );

const compareRows = (left, right) => JSON.stringify(normalizeRows(left)) === JSON.stringify(normalizeRows(right));

const target = requireTarget();
const label = sanitizeLabel(requireText("API_DATABASE_PARITY_EXECUTION_LABEL"));
const schemaName = requireIdentifier("API_DATABASE_PARITY_SCHEMA_NAME", "goal_vault_api");
const targetReference = optionalText("API_DATABASE_PARITY_TARGET_REFERENCE");
const parityPlan = readParityPlan(requireText("API_DATABASE_PARITY_PLAN"), target, schemaName);
const snapshot = readSnapshot(requireText("API_DATABASE_PARITY_SOURCE_SNAPSHOT"));
const connectionString = requireText("API_DATABASE_URL");
const confirmParity = requireText("API_DATABASE_PARITY_CONFIRM_EXECUTE");
const outputDir = readText("API_DATABASE_PARITY_EXECUTION_DIR", path.join(process.cwd(), "artifacts"));

validateNonSecretText("API_DATABASE_PARITY_TARGET_REFERENCE", targetReference);

if (confirmParity !== "compare") {
  throw new Error("API_DATABASE_PARITY_CONFIRM_EXECUTE must be compare.");
}

const client = new Client({ connectionString });
const startedAt = new Date().toISOString();
const results = [];

await client.connect();

try {
  for (const check of parityPlan.checks) {
    const queryResults = [];

    for (const [queryName, sqliteQuery] of Object.entries(check.sqliteQueries)) {
      const postgresqlQuery = check.postgresqlQueries[queryName];

      if (!postgresqlQuery) {
        throw new Error(`PostgreSQL parity query missing for ${check.table}.${queryName}.`);
      }

      const sqliteRows = runSqliteQuery(snapshot, check.sourceFile, sqliteQuery);
      const postgresqlRows = (await client.query(postgresqlQuery)).rows;
      const matched = compareRows(sqliteRows, postgresqlRows);

      queryResults.push({
        name: queryName,
        matched,
        sqliteRows: sqliteRows.length,
        postgresqlRows: postgresqlRows.length,
      });

      if (!matched) {
        throw new Error(`Parity mismatch for ${check.table}.${queryName}.`);
      }
    }

    results.push({
      table: check.table,
      classification: check.classification,
      queries: queryResults,
    });
  }
} finally {
  await client.end();
}

const finishedAt = new Date().toISOString();

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-api-database-parity-execute-${target}-${label}.json`);
const result = {
  app: "pocket-vault",
  component: "api-managed-database-parity-execute",
  target,
  label,
  schemaName,
  targetReference,
  startedAt,
  finishedAt,
  dataCompared: true,
  credentialsRedacted: true,
  parityPlan,
  sourceSnapshot: {
    manifestPath: snapshot.manifestPath,
    snapshotLabel: snapshot.manifest.snapshotLabel ?? null,
    generatedAt: snapshot.manifest.generatedAt ?? null,
  },
  results,
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

console.log(JSON.stringify({ outputPath, target, label, schemaName, tables: results.length }, null, 2));
