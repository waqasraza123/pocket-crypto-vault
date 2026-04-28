import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
    throw new Error("API_DATABASE_SCHEMA_EXECUTION_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const validateNonSecretText = (name, value) => {
  if (!value) {
    return;
  }

  if (secretPattern.test(value) || value.includes("://") || value.includes("@")) {
    throw new Error(`${name} must be a non-secret reference.`);
  }
};

const requireTarget = () => {
  const target = requireText("API_DATABASE_SCHEMA_EXECUTION_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("API_DATABASE_SCHEMA_EXECUTION_TARGET must be staging or production.");
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

const readSchemaManifest = (manifestReference) => {
  if (!manifestReference) {
    return {
      reference: null,
      inspected: false,
    };
  }

  validateNonSecretText("API_DATABASE_SCHEMA_MANIFEST", manifestReference);

  const manifestPath = path.resolve(manifestReference);

  if (!existsSync(manifestPath)) {
    return {
      reference: manifestReference,
      inspected: false,
      reason: "Schema manifest reference is not a runner-local file path.",
    };
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (manifest.component !== "api-managed-database-schema") {
    throw new Error("Schema manifest component must be api-managed-database-schema.");
  }

  if (manifest.noDatabaseMutated !== true) {
    throw new Error("Schema manifest must be a non-mutating generated artifact.");
  }

  return {
    reference: manifestReference,
    inspected: true,
    path: manifestPath,
    schemaName: manifest.schemaName,
    schemaLabel: manifest.schemaLabel,
  };
};

const target = requireTarget();
const label = sanitizeLabel(requireText("API_DATABASE_SCHEMA_EXECUTION_LABEL"));
const schemaName = requireIdentifier("API_DATABASE_SCHEMA_NAME", "goal_vault_api");
const schemaSqlPath = path.resolve(requireText("API_DATABASE_SCHEMA_SQL"));
const schemaManifest = readSchemaManifest(optionalText("API_DATABASE_SCHEMA_MANIFEST"));
const connectionString = requireText("API_DATABASE_URL");
const confirmApply = requireText("API_DATABASE_SCHEMA_CONFIRM_APPLY");
const outputDir = readText("API_DATABASE_SCHEMA_EXECUTION_DIR", path.join(process.cwd(), "artifacts"));
const targetReference = optionalText("API_DATABASE_SCHEMA_TARGET_REFERENCE");

validateNonSecretText("API_DATABASE_SCHEMA_TARGET_REFERENCE", targetReference);

if (confirmApply !== "apply") {
  throw new Error("API_DATABASE_SCHEMA_CONFIRM_APPLY must be apply.");
}

if (!existsSync(schemaSqlPath)) {
  throw new Error(`API_DATABASE_SCHEMA_SQL does not exist: ${schemaSqlPath}`);
}

if (schemaManifest.inspected && schemaManifest.schemaName !== schemaName) {
  throw new Error("Schema manifest schemaName must match API_DATABASE_SCHEMA_NAME.");
}

const schemaSql = readFileSync(schemaSqlPath, "utf8");
const client = new Client({ connectionString });
const startedAt = new Date().toISOString();

await client.connect();

try {
  await client.query(schemaSql);
} finally {
  await client.end();
}

const finishedAt = new Date().toISOString();

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-api-database-schema-apply-${target}-${label}.json`);
const result = {
  app: "pocket-vault",
  component: "api-managed-database-schema-apply",
  target,
  label,
  schemaName,
  targetReference,
  startedAt,
  finishedAt,
  databaseMutated: true,
  credentialsRedacted: true,
  schemaSql: path.basename(schemaSqlPath),
  schemaManifest,
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

console.log(JSON.stringify({ outputPath, target, label, schemaName }, null, 2));
