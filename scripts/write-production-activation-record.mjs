import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const persistenceDriverValues = new Set(["sqlite", "postgresql"]);
const activationOutcomeValues = new Set(["accepted", "rolled-back", "disabled"]);

const readText = (name, fallback = "") => (process.env[name] || fallback).trim();

const rejectSecretText = (name, value) => {
  if (/password|passwd|secret|token|credential|private[_-]?key|api[_-]?key|bearer\s+|basic\s+|postgres:\/\/|postgresql:\/\//i.test(value)) {
    throw new Error(`${name} must not include secrets, credential labels, tokens, or connection strings.`);
  }
};

const requireText = (name) => {
  const value = readText(name);

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  rejectSecretText(name, value);
  return value;
};

const optionalText = (name) => {
  const value = readText(name);

  if (!value) {
    return null;
  }

  rejectSecretText(name, value);
  return value;
};

const sanitizeLabel = (value) => {
  const label = value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  if (!label) {
    throw new Error("PRODUCTION_ACTIVATION_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const requireTarget = () => {
  const target = requireText("PRODUCTION_ACTIVATION_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("PRODUCTION_ACTIVATION_TARGET must be staging or production.");
  }

  return target;
};

const requirePersistenceDriver = () => {
  const driver = readText("PRODUCTION_ACTIVATION_PERSISTENCE_DRIVER", "postgresql");

  if (!persistenceDriverValues.has(driver)) {
    throw new Error("PRODUCTION_ACTIVATION_PERSISTENCE_DRIVER must be sqlite or postgresql.");
  }

  return driver;
};

const requireActivationOutcome = () => {
  const outcome = readText("PRODUCTION_ACTIVATION_OUTCOME", "accepted");

  if (!activationOutcomeValues.has(outcome)) {
    throw new Error("PRODUCTION_ACTIVATION_OUTCOME must be accepted, rolled-back, or disabled.");
  }

  return outcome;
};

const requirePositiveInteger = (name, fallback) => {
  const value = Number.parseInt(readText(name, fallback), 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
};

const resolveLocalArtifactPath = (reference) => {
  if (!reference || reference.includes("://")) {
    return null;
  }

  const resolvedPath = path.isAbsolute(reference) ? reference : path.resolve(process.cwd(), reference);
  return existsSync(resolvedPath) ? resolvedPath : null;
};

const readLocalJsonArtifact = (reference, label) => {
  const artifactPath = resolveLocalArtifactPath(reference);

  if (!artifactPath) {
    return {
      inspected: false,
      reference,
      reason: "Artifact reference is not a runner-local JSON file path.",
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

const requireArtifact = (name) => requireText(name);

const optionalDatabaseArtifact = (name, persistenceDriver) => {
  const reference = optionalText(name);

  if (persistenceDriver === "postgresql" && !reference) {
    throw new Error(`${name} is required when PRODUCTION_ACTIVATION_PERSISTENCE_DRIVER=postgresql.`);
  }

  return reference;
};

const inspectReleaseManifest = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "PRODUCTION_ACTIVATION_RELEASE_MANIFEST");

  if (!result.inspected) {
    return result;
  }

  const manifest = result.parsed;

  if (manifest?.app !== "pocket-vault" || manifest?.component !== "release") {
    throw new Error("PRODUCTION_ACTIVATION_RELEASE_MANIFEST must reference a Pocket Vault release manifest.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: manifest.target,
    releaseLabel: manifest.releaseLabel,
    appUrl: manifest.appUrl,
    apiUrl: manifest.apiUrl,
    apiImage: manifest.apiImage,
    rollbackApiImage: manifest.rollback?.previousApiImage ?? null,
  };

  if (evidence.target !== target) {
    throw new Error("Release manifest target does not match production activation target.");
  }

  if (!evidence.appUrl || !evidence.apiUrl || !evidence.apiImage) {
    throw new Error("Release manifest must include app URL, API URL, and API image.");
  }

  return evidence;
};

const inspectPreflightReport = ({ reference, target, persistenceDriver }) => {
  const result = readLocalJsonArtifact(reference, "PRODUCTION_ACTIVATION_PREFLIGHT_REPORT");

  if (!result.inspected) {
    return result;
  }

  const report = result.parsed;
  const persistence = report?.persistence;

  if (report?.app !== "pocket-vault" || report?.component !== "api") {
    throw new Error("PRODUCTION_ACTIVATION_PREFLIGHT_REPORT must reference a Pocket Vault API preflight report.");
  }

  if (!persistence || typeof persistence !== "object") {
    throw new Error("Production activation preflight report is missing persistence evidence.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    status: report.status,
    environment: report.environment,
    deploymentTarget: report.deploymentTarget,
    supportEnabled: report.supportEnabled ?? null,
    productionActivation: report.productionActivation ?? null,
    persistence: {
      driver: persistence.driver,
      runtimeReady: persistence.runtimeReady,
      postgresUrlConfigured: persistence.postgresUrlConfigured,
      connectionCheck: persistence.connectionCheck ?? "skipped",
      schemaCheck: persistence.schemaCheck ?? "skipped",
      missingTables: Array.isArray(persistence.missingTables) ? persistence.missingTables : [],
    },
  };
  const failures = [];

  if (evidence.status !== "valid") {
    failures.push("preflight status is not valid");
  }

  if (evidence.environment !== target || evidence.deploymentTarget !== target) {
    failures.push("preflight environment does not match production activation target");
  }

  if (evidence.persistence.driver !== persistenceDriver) {
    failures.push("preflight persistence driver does not match production activation driver");
  }

  if (!evidence.persistence.runtimeReady) {
    failures.push("preflight persistence runtime is not ready");
  }

  if (persistenceDriver === "postgresql") {
    if (!evidence.persistence.postgresUrlConfigured) {
      failures.push("PostgreSQL URL is not configured");
    }

    if (evidence.persistence.connectionCheck !== "passed") {
      failures.push("PostgreSQL connection check did not pass");
    }

    if (evidence.persistence.schemaCheck !== "passed") {
      failures.push("PostgreSQL schema check did not pass");
    }

    if (evidence.persistence.missingTables.length > 0) {
      failures.push(`PostgreSQL schema is missing tables: ${evidence.persistence.missingTables.join(", ")}`);
    }
  }

  if (target === "production") {
    if (!evidence.productionActivation || typeof evidence.productionActivation !== "object") {
      failures.push("preflight is missing production activation gates");
    } else if (evidence.productionActivation.safeForLimitedBetaTraffic !== true) {
      failures.push("production activation gates are not safe for limited beta traffic");
    }
  }

  if (failures.length > 0) {
    throw new Error(`Production activation requires accepted API preflight evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectRuntimePlan = ({ reference, target, persistenceDriver, releaseManifestReference, preflightReportReference, trafficPlanReference }) => {
  if (!reference) {
    return {
      inspected: false,
      reference: null,
      reason: "No managed database runtime plan is required for SQLite activation.",
    };
  }

  const result = readLocalJsonArtifact(reference, "PRODUCTION_ACTIVATION_DATABASE_RUNTIME_PLAN");

  if (!result.inspected) {
    return result;
  }

  const plan = result.parsed;

  if (plan?.app !== "pocket-vault" || plan?.component !== "api-managed-database-runtime-plan") {
    throw new Error("PRODUCTION_ACTIVATION_DATABASE_RUNTIME_PLAN must reference a Pocket Vault managed database runtime plan.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: plan.target,
    mode: plan.mode,
    plannedRuntimePersistence: plan.plannedRuntimePersistence,
    schemaName: plan.schemaName,
    releaseManifest: plan.artifacts?.releaseManifest ?? null,
    preflightReport: plan.artifacts?.preflightReport ?? null,
    trafficPlan: plan.artifacts?.trafficPlan ?? null,
    sourceSnapshot: plan.artifacts?.sourceSnapshot ?? null,
    rollbackSnapshot: plan.artifacts?.rollbackSnapshot ?? null,
  };
  const failures = [];

  if (persistenceDriver === "postgresql") {
    if (evidence.target !== target) {
      failures.push("database runtime plan target does not match production activation target");
    }

    if (evidence.mode !== "cutover") {
      failures.push("database runtime plan mode is not cutover");
    }

    if (evidence.plannedRuntimePersistence !== "postgresql") {
      failures.push("database runtime plan does not target PostgreSQL persistence");
    }

    if (!referencesMatch(evidence.releaseManifest, releaseManifestReference)) {
      failures.push("database runtime plan release manifest does not match activation release manifest");
    }

    if (!referencesMatch(evidence.preflightReport, preflightReportReference)) {
      failures.push("database runtime plan preflight report does not match activation preflight report");
    }

    if (!referencesMatch(evidence.trafficPlan, trafficPlanReference)) {
      failures.push("database runtime plan traffic plan does not match activation traffic plan");
    }
  }

  if (failures.length > 0) {
    throw new Error(`Production activation requires accepted runtime evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectTrafficPlan = ({ reference, target, releaseManifestReference, preflightReportReference, releaseEvidence }) => {
  const result = readLocalJsonArtifact(reference, "PRODUCTION_ACTIVATION_TRAFFIC_PLAN");

  if (!result.inspected) {
    return result;
  }

  const plan = result.parsed;

  if (plan?.app !== "pocket-vault" || plan?.component !== "api-traffic-plan") {
    throw new Error("PRODUCTION_ACTIVATION_TRAFFIC_PLAN must reference a Pocket Vault API traffic plan.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: plan.target,
    action: plan.action,
    candidateApiUrl: plan.urls?.candidateApiUrl ?? null,
    rollbackApiUrl: plan.urls?.rollbackApiUrl ?? null,
    apiImage: plan.images?.apiImage ?? null,
    rollbackApiImage: plan.images?.rollbackApiImage ?? null,
    releaseManifest: plan.artifacts?.releaseManifest ?? null,
    preflightReport: plan.artifacts?.preflightReport ?? null,
    dataSnapshot: plan.artifacts?.dataSnapshot ?? null,
  };
  const failures = [];

  if (evidence.target !== target) {
    failures.push("traffic plan target does not match production activation target");
  }

  if (evidence.action !== "promote") {
    failures.push("traffic plan action is not promote");
  }

  if (!evidence.candidateApiUrl || !evidence.rollbackApiUrl) {
    failures.push("traffic plan must include candidate and rollback API URLs");
  }

  if (releaseEvidence.inspected && evidence.apiImage !== releaseEvidence.apiImage) {
    failures.push("traffic plan API image does not match release manifest API image");
  }

  if (releaseEvidence.inspected && releaseEvidence.rollbackApiImage && evidence.rollbackApiImage !== releaseEvidence.rollbackApiImage) {
    failures.push("traffic plan rollback image does not match release manifest rollback image");
  }

  if (!referencesMatch(evidence.releaseManifest, releaseManifestReference)) {
    failures.push("traffic plan release manifest reference does not match activation release manifest");
  }

  if (!referencesMatch(evidence.preflightReport, preflightReportReference)) {
    failures.push("traffic plan preflight report reference does not match activation preflight report");
  }

  if (failures.length > 0) {
    throw new Error(`Production activation requires accepted traffic plan evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectTrafficExecution = ({ reference, target, trafficPlanEvidence }) => {
  const result = readLocalJsonArtifact(reference, "PRODUCTION_ACTIVATION_TRAFFIC_EXECUTION");

  if (!result.inspected) {
    return result;
  }

  const execution = result.parsed;

  if (execution?.app !== "pocket-vault" || execution?.component !== "vercel-api-traffic-execution") {
    throw new Error("PRODUCTION_ACTIVATION_TRAFFIC_EXECUTION must reference a Pocket Vault Vercel traffic execution result.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: execution.target,
    action: execution.action,
    trafficMoved: execution.trafficMoved === true,
    healthOk: execution.checks?.health?.ok === true,
    readyOk: execution.checks?.ready?.ok === true,
    productionDomain: execution.commandPlan?.productionDomain ?? null,
    candidateDeploymentUrl: execution.commandPlan?.candidateDeploymentUrl ?? null,
    rollbackDeploymentUrl: execution.commandPlan?.rollbackDeploymentUrl ?? null,
  };
  const failures = [];

  if (evidence.target !== target) {
    failures.push("traffic execution target does not match production activation target");
  }

  if (evidence.action !== "promote" || !evidence.trafficMoved) {
    failures.push("traffic execution must be a completed promote action");
  }

  if (!evidence.healthOk || !evidence.readyOk) {
    failures.push("traffic execution did not pass /health and /ready");
  }

  if (trafficPlanEvidence.inspected && evidence.candidateDeploymentUrl && trafficPlanEvidence.candidateApiUrl !== evidence.candidateDeploymentUrl) {
    failures.push("traffic execution candidate deployment does not match traffic plan candidate URL");
  }

  if (failures.length > 0) {
    throw new Error(`Production activation requires accepted traffic execution evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectDatabaseExecution = ({ reference, target, component, requiredFlag, label }) => {
  if (!reference) {
    return {
      inspected: false,
      reference: null,
      reason: `${label} is not required for SQLite activation.`,
    };
  }

  const result = readLocalJsonArtifact(reference, label);

  if (!result.inspected) {
    return result;
  }

  const artifact = result.parsed;

  if (artifact?.app !== "pocket-vault" || artifact?.component !== component) {
    throw new Error(`${label} must reference component ${component}.`);
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: artifact.target,
    label: artifact.label,
    schemaName: artifact.schemaName ?? null,
    completed: artifact[requiredFlag] === true,
    startedAt: artifact.startedAt ?? null,
    finishedAt: artifact.finishedAt ?? null,
  };

  if (evidence.target !== target) {
    throw new Error(`${label} target does not match production activation target.`);
  }

  if (!evidence.completed) {
    throw new Error(`${label} does not show ${requiredFlag}: true.`);
  }

  return evidence;
};

const inspectSmokeResult = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "PRODUCTION_ACTIVATION_SMOKE_RESULT");

  if (!result.inspected) {
    return result;
  }

  const smoke = result.parsed;

  if (smoke?.app !== "pocket-vault" || smoke?.component !== "production-v1-smoke") {
    throw new Error("PRODUCTION_ACTIVATION_SMOKE_RESULT must reference a Pocket Vault production smoke result.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: smoke.target,
    label: smoke.label,
    healthOk: smoke.checks?.health?.ok === true,
    readyOk: smoke.checks?.ready?.ok === true,
    walletAddress: smoke.evidence?.walletAddress ?? null,
    vaultAddress: smoke.evidence?.vaultAddress ?? null,
    createTxHash: smoke.evidence?.createTxHash ?? null,
    depositTxHash: smoke.evidence?.depositTxHash ?? null,
    supportRequestId: smoke.evidence?.supportRequestId ?? null,
    dashboardVerified: smoke.evidence?.dashboardVerified === true,
    detailVerified: smoke.evidence?.detailVerified === true,
    activityVerified: smoke.evidence?.activityVerified === true,
    indexerVerified: smoke.evidence?.indexerVerified === true,
    metadataReconciliationVerified: smoke.evidence?.metadataReconciliationVerified === true,
    supportVerified: smoke.evidence?.supportVerified === true,
  };
  const failures = [];

  if (evidence.target !== target) {
    failures.push("smoke target does not match production activation target");
  }

  if (!evidence.healthOk || !evidence.readyOk) {
    failures.push("smoke did not pass /health and /ready");
  }

  if (!evidence.walletAddress || !evidence.vaultAddress || !evidence.createTxHash || !evidence.depositTxHash) {
    failures.push("smoke must include wallet, vault, create, and deposit evidence");
  }

  if (!evidence.supportRequestId || !evidence.supportVerified) {
    failures.push("smoke must include support intake evidence");
  }

  if (!evidence.dashboardVerified || !evidence.detailVerified || !evidence.activityVerified) {
    failures.push("smoke must include dashboard, detail, and activity evidence");
  }

  if (!evidence.indexerVerified || !evidence.metadataReconciliationVerified) {
    failures.push("smoke must include indexer and metadata reconciliation evidence");
  }

  if (failures.length > 0) {
    throw new Error(`Production activation requires accepted smoke evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectBetaReadiness = ({ reference, target, persistenceDriver }) => {
  const result = readLocalJsonArtifact(reference, "PRODUCTION_ACTIVATION_BETA_READINESS");

  if (!result.inspected) {
    return result;
  }

  const readiness = result.parsed;

  if (readiness?.app !== "pocket-vault" || readiness?.component !== "beta-readiness-plan") {
    throw new Error("PRODUCTION_ACTIVATION_BETA_READINESS must reference a Pocket Vault beta readiness plan.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: readiness.target,
    readinessStatus: readiness.readinessStatus,
    persistenceDriver: readiness.persistence?.driver ?? null,
    participantLimit: readiness.audience?.participantLimit ?? null,
    maxVaultUsdc: readiness.audience?.maxVaultUsdc ?? null,
    supportReference: readiness.audience?.supportReference ?? null,
    incidentOwner: readiness.audience?.incidentOwner ?? null,
  };
  const failures = [];

  if (evidence.target !== target) {
    failures.push("beta readiness target does not match production activation target");
  }

  if (evidence.readinessStatus !== "ready") {
    failures.push("beta readiness status is not ready");
  }

  if (evidence.persistenceDriver !== persistenceDriver) {
    failures.push("beta readiness persistence driver does not match activation driver");
  }

  if (!evidence.participantLimit || !evidence.maxVaultUsdc || !evidence.supportReference || !evidence.incidentOwner) {
    failures.push("beta readiness must include audience limits, support reference, and incident owner");
  }

  if (failures.length > 0) {
    throw new Error(`Production activation requires accepted beta readiness evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const buildAcceptanceGates = (persistenceDriver) => [
  "Release manifest, API image, app URL, API URL, and rollback image are accepted.",
  "API preflight is valid and production activation gates are safe for limited beta traffic.",
  "Provider-neutral traffic plan and guarded Vercel promote execution are accepted.",
  ...(persistenceDriver === "postgresql"
    ? [
        "Managed database runtime cutover plan is accepted.",
        "PostgreSQL schema apply, import execution, and parity execution artifacts are accepted.",
      ]
    : ["SQLite persistence exception is explicitly recorded for this activation target."]),
  "Protected production smoke includes onchain and backend evidence.",
  "Beta readiness has participant limits, per-vault USDC limit, support reference, and incident owner.",
  "Source and rollback snapshots are retained in approved operational storage.",
  "Rollback or disablement path is reviewed before beta invitations expand.",
];

const buildNextSteps = (outcome) => {
  if (outcome === "accepted") {
    return [
      "Store this activation record with release evidence.",
      "Invite only the approved limited beta audience.",
      "Observe API readiness, indexer freshness, support intake, and product activity during the recorded window.",
      "Generate rollback or disablement artifacts before any recovery action when time allows.",
    ];
  }

  if (outcome === "rolled-back") {
    return [
      "Store this record with incident evidence.",
      "Keep beta invitations paused.",
      "Verify rollback traffic, database state, and support intake before considering a new activation.",
      "Generate fresh preflight, parity, smoke, and beta readiness artifacts before reactivation.",
    ];
  }

  return [
    "Store this record with incident evidence.",
    "Keep public API traffic disabled until a new promote or rollback plan is accepted.",
    "Confirm app clients show honest degraded backend messaging.",
    "Preserve logs, snapshots, support records, and traffic execution artifacts for review.",
  ];
};

const target = requireTarget();
const persistenceDriver = requirePersistenceDriver();
const activationOutcome = requireActivationOutcome();
const activationLabel = sanitizeLabel(requireText("PRODUCTION_ACTIVATION_LABEL"));
const outputDir = readText("PRODUCTION_ACTIVATION_DIR", path.join(process.cwd(), "artifacts"));
const releaseManifest = requireArtifact("PRODUCTION_ACTIVATION_RELEASE_MANIFEST");
const preflightReport = requireArtifact("PRODUCTION_ACTIVATION_PREFLIGHT_REPORT");
const trafficPlan = requireArtifact("PRODUCTION_ACTIVATION_TRAFFIC_PLAN");
const trafficExecution = requireArtifact("PRODUCTION_ACTIVATION_TRAFFIC_EXECUTION");
const smokeResult = requireArtifact("PRODUCTION_ACTIVATION_SMOKE_RESULT");
const betaReadiness = requireArtifact("PRODUCTION_ACTIVATION_BETA_READINESS");
const sourceSnapshot = requireArtifact("PRODUCTION_ACTIVATION_SOURCE_SNAPSHOT");
const rollbackSnapshot = requireArtifact("PRODUCTION_ACTIVATION_ROLLBACK_SNAPSHOT");
const databaseRuntimePlan = optionalDatabaseArtifact("PRODUCTION_ACTIVATION_DATABASE_RUNTIME_PLAN", persistenceDriver);
const schemaExecution = optionalDatabaseArtifact("PRODUCTION_ACTIVATION_SCHEMA_EXECUTION", persistenceDriver);
const importExecution = optionalDatabaseArtifact("PRODUCTION_ACTIVATION_IMPORT_EXECUTION", persistenceDriver);
const parityExecution = optionalDatabaseArtifact("PRODUCTION_ACTIVATION_PARITY_EXECUTION", persistenceDriver);
const confirmRecord = requireText("PRODUCTION_ACTIVATION_CONFIRM_RECORD");
const observeMinutes = requirePositiveInteger("PRODUCTION_ACTIVATION_OBSERVE_MINUTES", "60");
const supportReference = requireText("PRODUCTION_ACTIVATION_SUPPORT_REFERENCE");
const incidentOwner = requireText("PRODUCTION_ACTIVATION_INCIDENT_OWNER");

if (confirmRecord !== "record") {
  throw new Error("PRODUCTION_ACTIVATION_CONFIRM_RECORD must be record.");
}

const releaseEvidence = inspectReleaseManifest({ reference: releaseManifest, target });
const preflightEvidence = inspectPreflightReport({ reference: preflightReport, target, persistenceDriver });
const trafficPlanEvidence = inspectTrafficPlan({
  reference: trafficPlan,
  target,
  releaseManifestReference: releaseManifest,
  preflightReportReference: preflightReport,
  releaseEvidence,
});
const runtimeEvidence = inspectRuntimePlan({
  reference: databaseRuntimePlan,
  target,
  persistenceDriver,
  releaseManifestReference: releaseManifest,
  preflightReportReference: preflightReport,
  trafficPlanReference: trafficPlan,
});
const trafficExecutionEvidence = inspectTrafficExecution({ reference: trafficExecution, target, trafficPlanEvidence });
const schemaExecutionEvidence = inspectDatabaseExecution({
  reference: schemaExecution,
  target,
  component: "api-managed-database-schema-apply",
  requiredFlag: "databaseMutated",
  label: "PRODUCTION_ACTIVATION_SCHEMA_EXECUTION",
});
const importExecutionEvidence = inspectDatabaseExecution({
  reference: importExecution,
  target,
  component: "api-managed-database-import-execute",
  requiredFlag: "databaseMutated",
  label: "PRODUCTION_ACTIVATION_IMPORT_EXECUTION",
});
const parityExecutionEvidence = inspectDatabaseExecution({
  reference: parityExecution,
  target,
  component: "api-managed-database-parity-execute",
  requiredFlag: "dataCompared",
  label: "PRODUCTION_ACTIVATION_PARITY_EXECUTION",
});
const smokeEvidence = inspectSmokeResult({ reference: smokeResult, target });
const betaReadinessEvidence = inspectBetaReadiness({ reference: betaReadiness, target, persistenceDriver });

mkdirSync(outputDir, { recursive: true });

const record = {
  app: "pocket-vault",
  component: "production-activation-record",
  target,
  activationLabel,
  activationOutcome,
  generatedAt: new Date().toISOString(),
  activationAccepted: activationOutcome === "accepted",
  noDeploymentPerformed: true,
  noDatabaseMutated: true,
  noTrafficMoved: true,
  credentialsRedacted: true,
  persistence: {
    driver: persistenceDriver,
    postgresqlEvidenceRequired: persistenceDriver === "postgresql",
  },
  artifacts: {
    releaseManifest,
    preflightReport,
    databaseRuntimePlan,
    schemaExecution,
    importExecution,
    parityExecution,
    trafficPlan,
    trafficExecution,
    smokeResult,
    betaReadiness,
    sourceSnapshot,
    rollbackSnapshot,
  },
  controls: {
    changeWindow: optionalText("PRODUCTION_ACTIVATION_CHANGE_WINDOW"),
    observeMinutes,
    supportReference,
    incidentOwner,
    operator: optionalText("PRODUCTION_ACTIVATION_OPERATOR"),
    notes: optionalText("PRODUCTION_ACTIVATION_NOTES"),
  },
  evidence: {
    releaseManifest: releaseEvidence,
    preflight: preflightEvidence,
    databaseRuntimePlan: runtimeEvidence,
    schemaExecution: schemaExecutionEvidence,
    importExecution: importExecutionEvidence,
    parityExecution: parityExecutionEvidence,
    trafficPlan: trafficPlanEvidence,
    trafficExecution: trafficExecutionEvidence,
    smokeResult: smokeEvidence,
    betaReadiness: betaReadinessEvidence,
  },
  acceptanceGates: buildAcceptanceGates(persistenceDriver),
  nextSteps: buildNextSteps(activationOutcome),
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

const outputPath = path.join(outputDir, `pocket-vault-production-activation-${target}-${activationLabel}.json`);
writeFileSync(outputPath, `${JSON.stringify(record, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `record_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, activationLabel, activationOutcome, persistenceDriver }, null, 2));
