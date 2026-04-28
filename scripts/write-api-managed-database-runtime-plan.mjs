import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

const resolveLocalArtifactPath = (reference) => {
  if (reference.includes("://")) {
    return null;
  }

  const resolvedPath = path.isAbsolute(reference) ? reference : path.resolve(process.cwd(), reference);

  if (!existsSync(resolvedPath)) {
    return null;
  }

  return resolvedPath;
};

const readLocalJsonArtifact = (reference, label) => {
  const artifactPath = resolveLocalArtifactPath(reference);

  if (!artifactPath) {
    return {
      inspected: false,
      reference,
      reason: "Artifact reference is not a local file path in this workspace.",
    };
  }

  let parsed;

  try {
    parsed = JSON.parse(readFileSync(artifactPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSON parse failure.";
    throw new Error(`${label} must be valid JSON when it points to a local file: ${message}`);
  }

  return {
    inspected: true,
    reference,
    path: artifactPath,
    parsed,
  };
};

const requireBoolean = (value, label) => {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be boolean in the API preflight report.`);
  }

  return value;
};

const referencesMatch = (left, right) => {
  if (!left || !right) {
    return false;
  }

  if (left === right) {
    return true;
  }

  const leftPath = resolveLocalArtifactPath(left);
  const rightPath = resolveLocalArtifactPath(right);

  if (leftPath && rightPath && leftPath === rightPath) {
    return true;
  }

  return path.basename(left) === path.basename(right);
};

const inspectApiPreflightReport = ({ reference, mode }) => {
  const result = readLocalJsonArtifact(reference, "API_DATABASE_RUNTIME_PREFLIGHT_REPORT");

  if (!result.inspected) {
    return result;
  }

  const report = result.parsed;
  const persistence = report?.persistence;
  const capabilities = persistence?.capabilities;

  if (report?.app !== "pocket-vault" || report?.component !== "api") {
    throw new Error("API_DATABASE_RUNTIME_PREFLIGHT_REPORT must reference a Pocket Vault API preflight report.");
  }

  if (!persistence || typeof persistence !== "object") {
    throw new Error("API_DATABASE_RUNTIME_PREFLIGHT_REPORT is missing persistence evidence.");
  }

  if (!capabilities || typeof capabilities !== "object") {
    throw new Error("API_DATABASE_RUNTIME_PREFLIGHT_REPORT is missing persistence capability evidence.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    status: report.status,
    environment: report.environment,
    deploymentTarget: report.deploymentTarget,
    persistence: {
      driver: persistence.driver,
      postgresqlDriver: persistence.postgresqlDriver,
      postgresUrlConfigured: requireBoolean(persistence.postgresUrlConfigured, "postgresUrlConfigured"),
      runtimeReady: requireBoolean(persistence.runtimeReady, "runtimeReady"),
      schemaName: persistence.schemaName,
      postgresqlRuntimeReady: requireBoolean(capabilities.postgresqlRuntimeReady, "postgresqlRuntimeReady"),
      postgresqlDriverAdapterReady: requireBoolean(capabilities.postgresqlDriverAdapterReady, "postgresqlDriverAdapterReady"),
      neonPostgresqlDriverAdapterReady: requireBoolean(
        capabilities.neonPostgresqlDriverAdapterReady,
        "neonPostgresqlDriverAdapterReady",
      ),
      postgresqlFactoryWiringReady: requireBoolean(capabilities.postgresqlFactoryWiringReady, "postgresqlFactoryWiringReady"),
      postgresqlPreflightConnectionCheckReady: requireBoolean(
        capabilities.postgresqlPreflightConnectionCheckReady,
        "postgresqlPreflightConnectionCheckReady",
      ),
      blockedReasons: Array.isArray(capabilities.blockedReasons) ? capabilities.blockedReasons : [],
    },
  };

  const mustBePostgresqlReady = mode === "cutover";

  if (mustBePostgresqlReady) {
    const failures = [];

    if (evidence.status !== "valid") {
      failures.push("preflight status is not valid");
    }

    if (evidence.persistence.driver !== "postgresql") {
      failures.push("persistence driver is not postgresql");
    }

    if (!["pg", "neon"].includes(evidence.persistence.postgresqlDriver)) {
      failures.push("PostgreSQL client driver is not recorded");
    }

    if (!evidence.persistence.postgresUrlConfigured) {
      failures.push("PostgreSQL URL is not configured");
    }

    if (!evidence.persistence.runtimeReady) {
      failures.push("persistence runtime is not ready");
    }

    if (!evidence.persistence.postgresqlRuntimeReady) {
      failures.push("PostgreSQL runtime capability is not ready");
    }

    if (!evidence.persistence.postgresqlDriverAdapterReady) {
      failures.push("PostgreSQL driver adapter capability is not ready");
    }

    if (evidence.persistence.postgresqlDriver === "neon" && !evidence.persistence.neonPostgresqlDriverAdapterReady) {
      failures.push("Neon PostgreSQL driver adapter capability is not ready");
    }

    if (!evidence.persistence.postgresqlFactoryWiringReady) {
      failures.push("PostgreSQL factory wiring capability is not ready");
    }

    if (!evidence.persistence.postgresqlPreflightConnectionCheckReady) {
      failures.push("PostgreSQL preflight connection-check capability is not ready");
    }

    if (failures.length > 0) {
      throw new Error(`Cutover runtime plan requires accepted PostgreSQL preflight evidence: ${failures.join("; ")}.`);
    }
  }

  return evidence;
};

const inspectReleaseManifest = ({ reference, target, candidateApiImage, rollbackApiImage, mode }) => {
  const result = readLocalJsonArtifact(reference, "API_DATABASE_RUNTIME_RELEASE_MANIFEST");

  if (!result.inspected) {
    return result;
  }

  const manifest = result.parsed;

  if (manifest?.app !== "pocket-vault" || manifest?.component !== "release") {
    throw new Error("API_DATABASE_RUNTIME_RELEASE_MANIFEST must reference a Pocket Vault release manifest.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: manifest.target,
    releaseLabel: manifest.releaseLabel,
    apiUrl: manifest.apiUrl,
    apiImage: manifest.apiImage,
    rollbackApiImage: manifest.rollback?.previousApiImage ?? null,
  };

  if (mode === "cutover") {
    const failures = [];

    if (evidence.target !== target) {
      failures.push("release manifest target does not match runtime target");
    }

    if (evidence.apiImage !== candidateApiImage) {
      failures.push("release manifest API image does not match runtime candidate image");
    }

    if (evidence.rollbackApiImage && evidence.rollbackApiImage !== rollbackApiImage) {
      failures.push("release manifest rollback image does not match runtime rollback image");
    }

    if (failures.length > 0) {
      throw new Error(`Cutover runtime plan requires matching release manifest evidence: ${failures.join("; ")}.`);
    }
  }

  return evidence;
};

const inspectTrafficPlan = ({
  reference,
  target,
  candidateApiImage,
  rollbackApiImage,
  releaseManifestReference,
  preflightReportReference,
  mode,
}) => {
  const result = readLocalJsonArtifact(reference, "API_DATABASE_RUNTIME_TRAFFIC_PLAN");

  if (!result.inspected) {
    return result;
  }

  const trafficPlan = result.parsed;

  if (trafficPlan?.app !== "pocket-vault" || trafficPlan?.component !== "api-traffic-plan") {
    throw new Error("API_DATABASE_RUNTIME_TRAFFIC_PLAN must reference a Pocket Vault API traffic plan.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: trafficPlan.target,
    action: trafficPlan.action,
    planLabel: trafficPlan.planLabel,
    candidateApiUrl: trafficPlan.urls?.candidateApiUrl ?? null,
    rollbackApiUrl: trafficPlan.urls?.rollbackApiUrl ?? null,
    candidateApiImage: trafficPlan.images?.apiImage ?? null,
    rollbackApiImage: trafficPlan.images?.rollbackApiImage ?? null,
    releaseManifest: trafficPlan.artifacts?.releaseManifest ?? null,
    preflightReport: trafficPlan.artifacts?.preflightReport ?? null,
    dataSnapshot: trafficPlan.artifacts?.dataSnapshot ?? null,
  };

  if (mode === "cutover") {
    const failures = [];

    if (evidence.target !== target) {
      failures.push("traffic plan target does not match runtime target");
    }

    if (evidence.action !== "promote") {
      failures.push("traffic plan action is not promote");
    }

    if (evidence.candidateApiImage !== candidateApiImage) {
      failures.push("traffic plan candidate image does not match runtime candidate image");
    }

    if (evidence.rollbackApiImage !== rollbackApiImage) {
      failures.push("traffic plan rollback image does not match runtime rollback image");
    }

    if (!referencesMatch(evidence.releaseManifest, releaseManifestReference)) {
      failures.push("traffic plan release manifest reference does not match runtime release manifest");
    }

    if (!referencesMatch(evidence.preflightReport, preflightReportReference)) {
      failures.push("traffic plan preflight report reference does not match runtime preflight report");
    }

    if (failures.length > 0) {
      throw new Error(`Cutover runtime plan requires matching traffic plan evidence: ${failures.join("; ")}.`);
    }
  }

  return evidence;
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
const preflightReport = requireArtifactReference("API_DATABASE_RUNTIME_PREFLIGHT_REPORT");
const preflightEvidence = inspectApiPreflightReport({
  reference: preflightReport,
  mode,
});
const releaseManifest = requireArtifactReference("API_DATABASE_RUNTIME_RELEASE_MANIFEST");
const trafficPlan = requireArtifactReference("API_DATABASE_RUNTIME_TRAFFIC_PLAN");
const candidateApiImage = requireImage("API_DATABASE_RUNTIME_API_IMAGE");
const rollbackApiImage = requireImage("API_DATABASE_RUNTIME_ROLLBACK_API_IMAGE");
const releaseManifestEvidence = inspectReleaseManifest({
  reference: releaseManifest,
  target,
  candidateApiImage,
  rollbackApiImage,
  mode,
});
const trafficPlanEvidence = inspectTrafficPlan({
  reference: trafficPlan,
  target,
  candidateApiImage,
  rollbackApiImage,
  releaseManifestReference: releaseManifest,
  preflightReportReference: preflightReport,
  mode,
});

const plan = {
  app: "pocket-vault",
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
    preflightReport,
    releaseManifest,
    trafficPlan,
    sourceSnapshot: requireArtifactReference("API_DATABASE_RUNTIME_SOURCE_SNAPSHOT"),
    rollbackSnapshot: requireArtifactReference("API_DATABASE_RUNTIME_ROLLBACK_SNAPSHOT"),
  },
  images: {
    candidateApiImage,
    rollbackApiImage,
  },
  controls: {
    changeWindow: optionalText("API_DATABASE_RUNTIME_CHANGE_WINDOW"),
    observeMinutes,
    operator: optionalText("API_DATABASE_RUNTIME_OPERATOR"),
    notes: optionalText("API_DATABASE_RUNTIME_NOTES"),
  },
  evidence: {
    preflight: preflightEvidence,
    releaseManifest: releaseManifestEvidence,
    trafficPlan: trafficPlanEvidence,
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
    "API preflight passes PostgreSQL connection and schema checks for this runtime target.",
    "Schema, import, parity, release manifest, and traffic plan artifacts are reviewed for this runtime label.",
    "Rollback snapshot, rollback image, and rollback URL are available in approved operational storage.",
  ],
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-api-database-runtime-${target}-${mode}-${runtimeLabel}.json`);
writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `plan_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, engine, mode, runtimeLabel, schemaName }, null, 2));
