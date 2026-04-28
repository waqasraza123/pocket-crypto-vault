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
const modeValues = new Set(["summary", "private"]);
const statusValues = new Set(["open", "triage", "closed"]);
const categoryValues = new Set(["transaction", "vault_data", "wallet", "access", "security", "feedback", "other"]);
const priorityValues = new Set(["normal", "urgent"]);
const analyticsDatabaseFileName = "goal-vault-analytics.sqlite";
const privateExportConfirmation = "export-private-support";
const secretPattern = /(password|passwd|secret|token|credential|private[_-]?key|api[_-]?key|mnemonic|seed phrase|recovery phrase)/i;

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

const optionalSetValue = (name, allowedValues) => {
  const value = optionalText(name);

  if (value && !allowedValues.has(value)) {
    throw new Error(`${name} must be one of ${Array.from(allowedValues).join(", ")} when set.`);
  }

  return value;
};

const requirePositiveInteger = (name, fallback, maximum) => {
  const value = Number.parseInt(readText(name, fallback), 10);

  if (!Number.isInteger(value) || value <= 0 || value > maximum) {
    throw new Error(`${name} must be a positive integer no greater than ${maximum}.`);
  }

  return value;
};

const sanitizeLabel = (value) => {
  const label = value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  if (!label) {
    throw new Error("BETA_SUPPORT_EXPORT_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const validateNonSecretText = (name, value) => {
  if (!value) {
    return;
  }

  if (secretPattern.test(value)) {
    throw new Error(`${name} appears to contain sensitive credential text.`);
  }

  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)) {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      throw new Error(`${name} must use https when a URL is provided.`);
    }

    if (url.username || url.password) {
      throw new Error(`${name} must not include URL credentials.`);
    }
  }
};

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

  if (manifest.app !== "pocket-vault" || manifest.component !== "api-data") {
    throw new Error("Snapshot manifest must be a Pocket Vault API data snapshot.");
  }

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

const assertSupportTableExists = (database) => {
  const row = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'support_requests'").get();

  if (!row) {
    throw new Error("Snapshot analytics database is missing support_requests.");
  }
};

const truncateText = (value, maxLength) => {
  if (!value) {
    return null;
  }

  const compact = String(value).replace(/\s+/g, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}...` : compact;
};

const hashValue = (value) => {
  if (!value) {
    return null;
  }

  return createHash("sha256").update(String(value).toLowerCase()).digest("hex");
};

const buildWhereClause = ({ status, category, priority }) => {
  const clauses = [];
  const values = [];

  if (status) {
    clauses.push("status = ?");
    values.push(status);
  }

  if (category) {
    clauses.push("category = ?");
    values.push(category);
  }

  if (priority) {
    clauses.push("priority = ?");
    values.push(priority);
  }

  return {
    sql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
};

const readSupportRows = (database, filters) => {
  const where = buildWhereClause(filters);
  const rows = database
    .prepare(
      `SELECT
        id,
        status,
        category,
        priority,
        subject,
        message,
        reporter_wallet,
        contact_email,
        route,
        environment,
        deployment_target,
        chain_id,
        wallet_status,
        vault_address,
        user_agent,
        requester_ip_hash,
        created_at
      FROM support_requests
      ${where.sql}
      ORDER BY
        CASE priority WHEN 'urgent' THEN 0 ELSE 1 END,
        CASE status WHEN 'open' THEN 0 WHEN 'triage' THEN 1 ELSE 2 END,
        created_at ASC,
        id ASC
      LIMIT ?`,
    )
    .all(...where.values, filters.limit);

  return rows;
};

const createEmptyCounts = (values) => Object.fromEntries(Array.from(values).map((value) => [value, 0]));

const summarizeRows = (rows) => {
  const byStatus = createEmptyCounts(statusValues);
  const byCategory = createEmptyCounts(categoryValues);
  const byPriority = createEmptyCounts(priorityValues);
  let urgentOpen = 0;
  let oldestOpenCreatedAt = null;
  let newestCreatedAt = null;

  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    byCategory[row.category] = (byCategory[row.category] ?? 0) + 1;
    byPriority[row.priority] = (byPriority[row.priority] ?? 0) + 1;

    if (row.status === "open" && row.priority === "urgent") {
      urgentOpen += 1;
    }

    if (row.status === "open" && (!oldestOpenCreatedAt || row.created_at < oldestOpenCreatedAt)) {
      oldestOpenCreatedAt = row.created_at;
    }

    if (!newestCreatedAt || row.created_at > newestCreatedAt) {
      newestCreatedAt = row.created_at;
    }
  }

  return {
    total: rows.length,
    byStatus,
    byCategory,
    byPriority,
    urgentOpen,
    oldestOpenCreatedAt,
    newestCreatedAt,
  };
};

const mapSummaryRow = (row) => ({
  id: row.id,
  status: row.status,
  category: row.category,
  priority: row.priority,
  subjectPreview: truncateText(row.subject, 80),
  messagePreview: truncateText(row.message, 180),
  reporterWalletHash: hashValue(row.reporter_wallet),
  contactEmailHash: hashValue(row.contact_email),
  route: row.route,
  environment: row.environment,
  deploymentTarget: row.deployment_target,
  chainId: row.chain_id,
  walletStatus: row.wallet_status,
  vaultAddressHash: hashValue(row.vault_address),
  requesterIpHash: row.requester_ip_hash,
  createdAt: row.created_at,
});

const mapPrivateRow = (row) => ({
  id: row.id,
  status: row.status,
  category: row.category,
  priority: row.priority,
  subject: row.subject,
  message: row.message,
  reporterWallet: row.reporter_wallet,
  contactEmail: row.contact_email,
  route: row.route,
  environment: row.environment,
  deploymentTarget: row.deployment_target,
  chainId: row.chain_id,
  walletStatus: row.wallet_status,
  vaultAddress: row.vault_address,
  userAgent: row.user_agent,
  requesterIpHash: row.requester_ip_hash,
  createdAt: row.created_at,
});

const writeJsonl = (outputPath, rows, mapper) => {
  const file = openSync(outputPath, "w");

  try {
    for (const row of rows) {
      writeSync(file, `${JSON.stringify(mapper(row))}\n`);
    }
  } finally {
    closeSync(file);
  }

  return {
    rows: rows.length,
    bytes: statSync(outputPath).size,
    sha256: hashFile(outputPath),
  };
};

const target = requireSetValue("BETA_SUPPORT_EXPORT_TARGET", targetValues);
const label = sanitizeLabel(requireText("BETA_SUPPORT_EXPORT_LABEL"));
const mode = requireSetValue("BETA_SUPPORT_EXPORT_MODE", modeValues);
const snapshotSource = path.resolve(requireText("BETA_SUPPORT_EXPORT_SOURCE"));
const outputRoot = path.resolve(readText("BETA_SUPPORT_EXPORT_DIR", path.join(process.cwd(), "artifacts/beta-support-exports")));
const limit = requirePositiveInteger("BETA_SUPPORT_EXPORT_LIMIT", "500", 1000);
const status = optionalSetValue("BETA_SUPPORT_EXPORT_STATUS", statusValues);
const category = optionalSetValue("BETA_SUPPORT_EXPORT_CATEGORY", categoryValues);
const priority = optionalSetValue("BETA_SUPPORT_EXPORT_PRIORITY", priorityValues);
const operator = optionalText("BETA_SUPPORT_EXPORT_OPERATOR");
const incidentReference = optionalText("BETA_SUPPORT_EXPORT_INCIDENT_REFERENCE");
const notes = optionalText("BETA_SUPPORT_EXPORT_NOTES");

[
  ["BETA_SUPPORT_EXPORT_OPERATOR", operator],
  ["BETA_SUPPORT_EXPORT_INCIDENT_REFERENCE", incidentReference],
  ["BETA_SUPPORT_EXPORT_NOTES", notes],
].forEach(([name, value]) => validateNonSecretText(name, value));

if (mode === "private" && readText("BETA_SUPPORT_EXPORT_CONFIRM_PRIVATE") !== privateExportConfirmation) {
  throw new Error(`BETA_SUPPORT_EXPORT_CONFIRM_PRIVATE must be ${privateExportConfirmation} for private exports.`);
}

if (!existsSync(snapshotSource)) {
  throw new Error(`BETA_SUPPORT_EXPORT_SOURCE does not exist: ${snapshotSource}`);
}

const { manifest: snapshotManifest, manifestPath, snapshotDir } = readSnapshotManifest(snapshotSource);
const analyticsSnapshot = snapshotManifest.files.find((file) => file.fileName === analyticsDatabaseFileName);

if (!analyticsSnapshot) {
  throw new Error(`Snapshot manifest does not include ${analyticsDatabaseFileName}.`);
}

const analyticsDatabasePath = verifySnapshotFile(snapshotDir, analyticsSnapshot);
const outputDir = path.join(outputRoot, `${target}-${label}`);

mkdirSync(outputDir, { recursive: true });

const database = new DatabaseSync(analyticsDatabasePath);
let rows;

try {
  assertSupportTableExists(database);
  rows = readSupportRows(database, { status, category, priority, limit });
} finally {
  database.close();
}

const summary = summarizeRows(rows);
const exportFileName = mode === "private" ? "support-requests.private.jsonl" : "support-requests.summary.jsonl";
const exportPath = path.join(outputDir, exportFileName);
const exportResult = writeJsonl(exportPath, rows, mode === "private" ? mapPrivateRow : mapSummaryRow);

const summaryPath = path.join(outputDir, "support-summary.json");
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

const manifest = {
  app: "pocket-vault",
  component: "beta-support-export",
  target,
  label,
  mode,
  generatedAt: new Date().toISOString(),
  noLiveDatabaseConnected: true,
  noSupportStatusMutated: true,
  commitAllowed: false,
  source: {
    snapshotManifestPath: manifestPath,
    snapshotLabel: snapshotManifest.snapshotLabel ?? null,
    snapshotGeneratedAt: snapshotManifest.generatedAt ?? null,
    analyticsDatabaseFileName,
    analyticsDatabaseSha256: analyticsSnapshot.sha256 ?? null,
  },
  filters: {
    status,
    category,
    priority,
    limit,
  },
  controls: {
    operator,
    incidentReference,
    notes,
    privateExportConfirmed: mode === "private",
  },
  outputs: [
    {
      fileName: exportFileName,
      classification: mode === "private" ? "support-private-context" : "support-redacted-summary",
      format: "jsonl",
      containsFullContactEmail: mode === "private",
      containsFullReporterWallet: mode === "private",
      containsFullSupportMessage: mode === "private",
      containsUserWrittenPreview: mode === "summary",
      ...exportResult,
    },
    {
      fileName: "support-summary.json",
      classification: "support-aggregate-summary",
      format: "json",
      rows: 1,
      bytes: statSync(summaryPath).size,
      sha256: hashFile(summaryPath),
    },
  ],
  summary,
  handling: {
    storeOnlyInApprovedOperationalStorage: true,
    doNotCommit: true,
    doNotAttachToPublicIssues: true,
    deleteAfterReviewWindow: true,
  },
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

const manifestOutputPath = path.join(outputDir, "manifest.json");
writeFileSync(manifestOutputPath, `${JSON.stringify(manifest, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `export_dir=${outputDir}\nmanifest_path=${manifestOutputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputDir, manifestPath: manifestOutputPath, mode, rows: rows.length }, null, 2));
