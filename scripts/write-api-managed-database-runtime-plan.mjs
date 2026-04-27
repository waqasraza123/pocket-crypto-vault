import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const engineValues = new Set(["postgresql"]);
const modeValues = new Set(["shadow", "cutover", "rollback-drill"]);
const identifierPattern = /^[a-z_][a-z0-9_]*$/;
const imagePattern = /^[a-z0-9.-]+\/[a-z0-9._/-]+:[A-Za-z0-9._-]+$/;

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

const requireTarget = () => {
  const target = requireText("API_DATABASE_RUNTIME_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("API_DATABASE_RUNTIME_TARGET must be staging or production.");
  }

  return target;
};

const requireEngine = () => {
  const engine = requireText("API_DATABASE_RUNTIME_ENGINE");

  if (!engineValues.has(engine)) {
    throw new Error("API_DATABASE_RUNTIME_ENGINE must be postgresql.");
  }

  return engine;
};

const requireMode = () => {
  const mode = requireText("API_DATABASE_RUNTIME_MODE");

  if (!modeValues.has(mode)) {
    throw new Error("API_DATABASE_RUNTIME_MODE must be shadow, cutover, or rollback-drill.");
  }

  return mode;
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

  if (value.includes("://") || value.includes("@") || /password|secret|token|credential|key/i.test(value)) {
    throw new Error(`${name} must be a non-secret reference, not a URL, credential, or connection string.`);
  }

  return value;
};

const requireArtifactReference = (name) => {
  const value = requireText(name);

  if (/password|secret|token|credential|private[_-]?key/i.test(value)) {
    throw new Error(`${name} must not include secret names or credentials.`);
  }

  return value;
};

const requireImage = (name) => {
  const value = requireText(name);

  if (!imagePattern.test(value)) {
    throw new Error(`${name} must be a registry image reference with an explicit tag.`);
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

const buildRuntimeSteps = (mode, observeMinutes) => {
  if (mode === "shadow") {
    return [
      "Keep public API traffic on the current SQLite-backed runtime.",
      "Deploy a private candidate API host using the planned PostgreSQL runtime image and managed database target.",
      "Run API preflight against the private candidate host and confirm PostgreSQL runtime checks are accepted.",
      "Run read-only smoke checks for vault list, vault detail, activity, metadata readiness, /health, and /ready.",
      `Observe candidate health, readiness, and indexer freshness for at least ${observeMinutes} minutes before requesting cutover approval.`,
      "Generate a cutover runtime activation plan before any public traffic movement.",
    ];
  }

  if (mode === "rollback-drill") {
    return [
      "Keep public API traffic on the current known-good runtime.",
      "Confirm rollback image, rollback persistence configuration, and rollback snapshot references are available.",
      "Run a private rollback drill against the rollback image and persistence configuration.",
      "Check /health and /ready on the rollback drill host.",
      "Record recovery timing, data restore notes, and failure conditions that would trigger rollback during cutover.",
    ];
  }

  return [
    "Confirm schema execution, import execution, parity acceptance, preflight acceptance, release manifest, and traffic plan artifacts match this runtime plan.",
    "Deploy the candidate API image with PostgreSQL persistence configured through approved secrets.",
    "Check candidate /health and /ready before public traffic movement.",
    "Move public API traffic only through the approved hosting-provider traffic plan.",
    `Observe /health, /ready, indexer freshness, and core product smoke checks for at least ${observeMinutes} minutes.`,
    "Record the accepted PostgreSQL runtime plan, promoted API image, managed database target reference, and rollback references in release notes.",
  ];
};

const rollbackSteps = [
  "Stop public traffic to the PostgreSQL-backed candidate or promoted API host.",
  "Route public API traffic back to the rollback URL or redeploy the rollback image.",
  "Restore the previous persistence configuration with SQLite mode unless an accepted fallback database target exists.",
  "Restore API data only from the planned rollback snapshot and only while the API is stopped.",
  "Run /health and /ready checks after recovery.",
  "Record rollback reason, restored image, restored persistence mode, restored snapshot reference, and managed database target reference.",
];

const target = requireTarget();
const engine = requireEngine();
const mode = requireMode();
const runtimeLabel = sanitizeLabel(requireText("API_DATABASE_RUNTIME_LABEL"));
const outputDir = readText("API_DATABASE_RUNTIME_DIR", path.join(process.cwd(), "artifacts"));
const schemaName = requireIdentifier("API_DATABASE_RUNTIME_SCHEMA_NAME", "goal_vault_api");
const driverPackage = requireText("API_DATABASE_RUNTIME_DRIVER_PACKAGE");
const targetReference = requireNonSecretReference("API_DATABASE_RUNTIME_TARGET_REFERENCE");
const observeMinutes = requirePositiveInteger("API_DATABASE_RUNTIME_OBSERVE_MINUTES", "30");

const plan = {
  app: "goal-vault",
  component: "api-managed-database-runtime-plan",
  target,
  engine,
  mode,
  currentRuntimePersistence: "sqlite",
  plannedRuntimePersistence: "postgresql",
  runtimeLabel,
  targetReference,
  schemaName,
  driverPackage,
  generatedAt: new Date().toISOString(),
  noRuntimeChanged: true,
  noDatabaseMutated: true,
  noTrafficMoved: true,
  artifacts: {
    managedDatabasePlan: requireArtifactReference("API_DATABASE_RUNTIME_DATABASE_PLAN"),
    schemaManifest: requireArtifactReference("API_DATABASE_RUNTIME_SCHEMA_MANIFEST"),
    schemaSql: requireArtifactReference("API_DATABASE_RUNTIME_SCHEMA_SQL"),
    exportBundle: requireArtifactReference("API_DATABASE_RUNTIME_EXPORT_BUNDLE"),
    importPlan: requireArtifactReference("API_DATABASE_RUNTIME_IMPORT_PLAN"),
    parityPlan: requireArtifactReference("API_DATABASE_RUNTIME_PARITY_PLAN"),
    preflightReport: requireArtifactReference("API_DATABASE_RUNTIME_PREFLIGHT_REPORT"),
    releaseManifest: requireArtifactReference("API_DATABASE_RUNTIME_RELEASE_MANIFEST"),
    trafficPlan: requireArtifactReference("API_DATABASE_RUNTIME_TRAFFIC_PLAN"),
    sourceSnapshot: requireArtifactReference("API_DATABASE_RUNTIME_SOURCE_SNAPSHOT"),
    rollbackSnapshot: requireArtifactReference("API_DATABASE_RUNTIME_ROLLBACK_SNAPSHOT"),
  },
  images: {
    candidateApiImage: requireImage("API_DATABASE_RUNTIME_API_IMAGE"),
    rollbackApiImage: requireImage("API_DATABASE_RUNTIME_ROLLBACK_API_IMAGE"),
  },
  controls: {
    changeWindow: optionalText("API_DATABASE_RUNTIME_CHANGE_WINDOW"),
    observeMinutes,
    operator: optionalText("API_DATABASE_RUNTIME_OPERATOR"),
    notes: optionalText("API_DATABASE_RUNTIME_NOTES"),
  },
  requiredSecrets: [
    "API_DATABASE_URL",
    "API_INTERNAL_TOKEN",
    "target-chain RPC secrets for the selected environment",
  ],
  acceptanceGates: [
    "PostgreSQL driver package and lockfile changes are reviewed.",
    "API preflight reports PostgreSQL runtime capability gates with secrets redacted.",
    "PostgreSQL connection pooling and shutdown behavior are reviewed.",
    "Managed database schema execution is completed through approved provider access.",
    "Managed database import execution is completed through approved provider access.",
    "Parity review accepts row counts, latest sync state, metadata samples, and analytics bounds.",
    "API preflight accepts PostgreSQL persistence without printing secrets.",
    "Release manifest records candidate and rollback API images.",
    "API traffic plan records candidate URL, rollback URL, candidate image, and rollback image.",
    "Rollback snapshot is available in approved operational storage.",
  ],
  runtimeSteps: buildRuntimeSteps(mode, observeMinutes),
  rollbackSteps,
  blockedUntil: [
    "A PostgreSQL driver adapter is added around the pooled executor boundary.",
    "`createApiPersistenceStores` wires PostgreSQL mode to the PostgreSQL store core.",
    "Runtime env validation is updated to allow PostgreSQL only when the connection layer is configured.",
    "Preflight capability checks report the PostgreSQL driver adapter, store factory wiring, and connection check as ready.",
    "Schema, import, parity, release manifest, and traffic plan artifacts are reviewed for this runtime label.",
  ],
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `goal-vault-api-database-runtime-${target}-${mode}-${runtimeLabel}.json`);
writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `plan_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, engine, mode, runtimeLabel, schemaName }, null, 2));
