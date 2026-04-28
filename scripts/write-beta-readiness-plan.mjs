import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const persistenceDriverValues = new Set(["sqlite", "postgresql"]);
const decimalPattern = /^(0|[1-9][0-9]*)(\.[0-9]{1,6})?$/;

const readText = (name, fallback = "") => (process.env[name] || fallback).trim();

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

const rejectSecretText = (name, value) => {
  if (/password|secret|token|credential|private[_-]?key|postgres:\/\/|postgresql:\/\//i.test(value)) {
    throw new Error(`${name} must not include secrets, credential names, or connection strings.`);
  }
};

const sanitizeLabel = (value) => value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");

const requireTarget = () => {
  const target = requireText("BETA_READINESS_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("BETA_READINESS_TARGET must be staging or production.");
  }

  return target;
};

const requirePersistenceDriver = () => {
  const driver = readText("BETA_READINESS_PERSISTENCE_DRIVER", "postgresql");

  if (!persistenceDriverValues.has(driver)) {
    throw new Error("BETA_READINESS_PERSISTENCE_DRIVER must be sqlite or postgresql.");
  }

  return driver;
};

const requirePositiveInteger = (name, fallback) => {
  const value = Number.parseInt(readText(name, fallback), 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
};

const requirePositiveDecimal = (name) => {
  const value = requireText(name);

  if (!decimalPattern.test(value) || Number(value) <= 0) {
    throw new Error(`${name} must be a positive decimal with up to six fractional digits.`);
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

const requireReference = (name) => requireText(name);

const requireOptionalDatabaseRuntimeReference = (driver) => {
  const reference = optionalText("BETA_READINESS_DATABASE_RUNTIME_PLAN");

  if (driver === "postgresql" && !reference) {
    throw new Error("BETA_READINESS_DATABASE_RUNTIME_PLAN is required when BETA_READINESS_PERSISTENCE_DRIVER=postgresql.");
  }

  return reference;
};

const inspectSmokeResult = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_READINESS_SMOKE_RESULT");

  if (!result.inspected) {
    return result;
  }

  const smoke = result.parsed;

  if (smoke?.app !== "pocket-vault" || smoke?.component !== "production-v1-smoke") {
    throw new Error("BETA_READINESS_SMOKE_RESULT must reference a Pocket Vault production smoke result.");
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
    rulePath: smoke.evidence?.rulePath ?? null,
    unlockRequestTxHash: smoke.evidence?.unlockRequestTxHash ?? null,
    guardianDecisionTxHash: smoke.evidence?.guardianDecisionTxHash ?? null,
    withdrawTxHash: smoke.evidence?.withdrawTxHash ?? null,
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
    failures.push("smoke result target does not match beta readiness target");
  }

  if (!evidence.healthOk || !evidence.readyOk) {
    failures.push("smoke result did not pass /health and /ready");
  }

  if (!evidence.walletAddress || !evidence.vaultAddress || !evidence.createTxHash || !evidence.depositTxHash) {
    failures.push("smoke result must include wallet, vault, create, and deposit evidence");
  }

  if (!evidence.supportRequestId || !evidence.supportVerified) {
    failures.push("smoke result must include support intake evidence");
  }

  if (!evidence.dashboardVerified || !evidence.detailVerified || !evidence.activityVerified) {
    failures.push("smoke result must include dashboard, detail, and activity verification");
  }

  if (!evidence.indexerVerified || !evidence.metadataReconciliationVerified) {
    failures.push("smoke result must include backend indexing and metadata reconciliation verification");
  }

  if (failures.length > 0) {
    throw new Error(`Beta readiness requires accepted protected smoke evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectReleaseManifest = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_READINESS_RELEASE_MANIFEST");

  if (!result.inspected) {
    return result;
  }

  const manifest = result.parsed;

  if (manifest?.app !== "pocket-vault" || manifest?.component !== "release") {
    throw new Error("BETA_READINESS_RELEASE_MANIFEST must reference a Pocket Vault release manifest.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: manifest.target,
    releaseLabel: manifest.releaseLabel,
    appUrl: manifest.appUrl,
    apiUrl: manifest.apiUrl,
    chainId: manifest.chainId,
    apiImage: manifest.apiImage,
    rollbackApiImage: manifest.rollback?.previousApiImage ?? null,
    iosBuildReference: manifest.mobile?.iosBuildReference ?? null,
    androidBuildReference: manifest.mobile?.androidBuildReference ?? null,
  };

  if (evidence.target !== target) {
    throw new Error("Release manifest target does not match beta readiness target.");
  }

  if (!evidence.appUrl || !evidence.apiUrl || !evidence.apiImage) {
    throw new Error("Release manifest must include app URL, API URL, and API image.");
  }

  return evidence;
};

const inspectPreflightReport = ({ reference, target, persistenceDriver }) => {
  const result = readLocalJsonArtifact(reference, "BETA_READINESS_PREFLIGHT_REPORT");

  if (!result.inspected) {
    return result;
  }

  const report = result.parsed;
  const persistence = report?.persistence;

  if (report?.app !== "pocket-vault" || report?.component !== "api") {
    throw new Error("BETA_READINESS_PREFLIGHT_REPORT must reference a Pocket Vault API preflight report.");
  }

  if (!persistence || typeof persistence !== "object") {
    throw new Error("BETA_READINESS_PREFLIGHT_REPORT is missing persistence evidence.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    status: report.status,
    environment: report.environment,
    deploymentTarget: report.deploymentTarget,
    publicBaseUrl: report.publicBaseUrl ?? null,
    primaryChainId: report.primaryChainId ?? null,
    supportEnabled: report.supportEnabled ?? null,
    productionActivation: report.productionActivation ?? null,
    persistence: {
      driver: persistence.driver,
      runtimeReady: persistence.runtimeReady,
      postgresUrlConfigured: persistence.postgresUrlConfigured,
      schemaName: persistence.schemaName,
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
    failures.push("preflight environment does not match beta readiness target");
  }

  if (evidence.persistence.driver !== persistenceDriver) {
    failures.push("preflight persistence driver does not match beta readiness driver");
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
    throw new Error(`Beta readiness requires accepted API preflight evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectTrafficPlan = ({ reference, target, releaseManifestReference, preflightReportReference, releaseEvidence }) => {
  const result = readLocalJsonArtifact(reference, "BETA_READINESS_TRAFFIC_PLAN");

  if (!result.inspected) {
    return result;
  }

  const trafficPlan = result.parsed;

  if (trafficPlan?.app !== "pocket-vault" || trafficPlan?.component !== "api-traffic-plan") {
    throw new Error("BETA_READINESS_TRAFFIC_PLAN must reference a Pocket Vault API traffic plan.");
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
  const failures = [];

  if (evidence.target !== target) {
    failures.push("traffic plan target does not match beta readiness target");
  }

  if (evidence.action !== "promote") {
    failures.push("traffic plan action is not promote");
  }

  if (!evidence.candidateApiUrl || !evidence.rollbackApiUrl) {
    failures.push("traffic plan must include candidate and rollback API URLs");
  }

  if (releaseEvidence.inspected && evidence.candidateApiImage !== releaseEvidence.apiImage) {
    failures.push("traffic plan candidate image does not match release manifest API image");
  }

  if (releaseEvidence.inspected && releaseEvidence.rollbackApiImage && evidence.rollbackApiImage !== releaseEvidence.rollbackApiImage) {
    failures.push("traffic plan rollback image does not match release manifest rollback image");
  }

  if (!referencesMatch(evidence.releaseManifest, releaseManifestReference)) {
    failures.push("traffic plan release manifest reference does not match beta release manifest");
  }

  if (!referencesMatch(evidence.preflightReport, preflightReportReference)) {
    failures.push("traffic plan preflight report reference does not match beta preflight report");
  }

  if (failures.length > 0) {
    throw new Error(`Beta readiness requires accepted API traffic evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectDatabaseRuntimePlan = ({
  reference,
  target,
  persistenceDriver,
  releaseManifestReference,
  preflightReportReference,
  trafficPlanReference,
}) => {
  if (!reference) {
    return {
      inspected: false,
      reference: null,
      reason: "No managed database runtime plan is required for SQLite beta readiness.",
    };
  }

  const result = readLocalJsonArtifact(reference, "BETA_READINESS_DATABASE_RUNTIME_PLAN");

  if (!result.inspected) {
    return result;
  }

  const plan = result.parsed;

  if (plan?.app !== "pocket-vault" || plan?.component !== "api-managed-database-runtime-plan") {
    throw new Error("BETA_READINESS_DATABASE_RUNTIME_PLAN must reference a Pocket Vault managed database runtime plan.");
  }

  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: plan.target,
    mode: plan.mode,
    plannedRuntimePersistence: plan.plannedRuntimePersistence,
    runtimeLabel: plan.runtimeLabel,
    targetReference: plan.targetReference,
    schemaName: plan.schemaName,
    candidateApiImage: plan.images?.candidateApiImage ?? null,
    rollbackApiImage: plan.images?.rollbackApiImage ?? null,
    preflightReport: plan.artifacts?.preflightReport ?? null,
    releaseManifest: plan.artifacts?.releaseManifest ?? null,
    trafficPlan: plan.artifacts?.trafficPlan ?? null,
    sourceSnapshot: plan.artifacts?.sourceSnapshot ?? null,
    rollbackSnapshot: plan.artifacts?.rollbackSnapshot ?? null,
  };
  const failures = [];

  if (persistenceDriver === "postgresql") {
    if (evidence.target !== target) {
      failures.push("database runtime plan target does not match beta readiness target");
    }

    if (evidence.mode !== "cutover") {
      failures.push("database runtime plan mode is not cutover");
    }

    if (evidence.plannedRuntimePersistence !== "postgresql") {
      failures.push("database runtime plan does not target PostgreSQL persistence");
    }

    if (!referencesMatch(evidence.releaseManifest, releaseManifestReference)) {
      failures.push("database runtime plan release manifest reference does not match beta release manifest");
    }

    if (!referencesMatch(evidence.preflightReport, preflightReportReference)) {
      failures.push("database runtime plan preflight reference does not match beta preflight report");
    }

    if (!referencesMatch(evidence.trafficPlan, trafficPlanReference)) {
      failures.push("database runtime plan traffic plan reference does not match beta traffic plan");
    }
  }

  if (failures.length > 0) {
    throw new Error(`Beta readiness requires accepted managed database runtime evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const buildLaunchSteps = (observeMinutes) => [
  "Confirm release, API preflight, API traffic, persistence, rollback, and support evidence in this beta readiness artifact.",
  "Confirm invited participants understand this is a limited beta with real onchain USDC risk.",
  "Confirm candidate API /health and /ready before inviting participants.",
  "Move public API traffic only through the approved hosting-provider traffic plan.",
  "Invite only the recorded participant limit during the initial observation window.",
  `Observe /health, /ready, indexer freshness, support queue, and core product smoke checks for at least ${observeMinutes} minutes.`,
  "Record launch outcome, incidents, participant count, and rollback decision in release notes.",
];

const rollbackSteps = [
  "Pause new participant invites.",
  "Stop or reverse the active API traffic promotion.",
  "Route API traffic back to the rollback URL or rollback API image from the traffic plan.",
  "Restore API data only from the planned rollback snapshot and only while the API is stopped.",
  "Confirm app clients show honest degraded or recovered state.",
  "Record rollback reason, affected participants, data handling notes, and re-enable conditions.",
];

const target = requireTarget();
const persistenceDriver = requirePersistenceDriver();
const readinessLabel = sanitizeLabel(requireText("BETA_READINESS_LABEL"));
const outputDir = readText("BETA_READINESS_DIR", path.join(process.cwd(), "artifacts"));
const releaseManifest = requireReference("BETA_READINESS_RELEASE_MANIFEST");
const preflightReport = requireReference("BETA_READINESS_PREFLIGHT_REPORT");
const trafficPlan = requireReference("BETA_READINESS_TRAFFIC_PLAN");
const databaseRuntimePlan = requireOptionalDatabaseRuntimeReference(persistenceDriver);
const smokeResult = requireReference("BETA_READINESS_SMOKE_RESULT");
const sourceSnapshot = requireReference("BETA_READINESS_SOURCE_SNAPSHOT");
const rollbackSnapshot = requireReference("BETA_READINESS_ROLLBACK_SNAPSHOT");
const observeMinutes = requirePositiveInteger("BETA_READINESS_OBSERVE_MINUTES", "30");
const supportReference = requireText("BETA_READINESS_SUPPORT_REFERENCE");

const releaseEvidence = inspectReleaseManifest({ reference: releaseManifest, target });
const preflightEvidence = inspectPreflightReport({ reference: preflightReport, target, persistenceDriver });
const smokeEvidence = inspectSmokeResult({ reference: smokeResult, target });

if (supportReference.includes("/support") && preflightEvidence.inspected && preflightEvidence.supportEnabled !== true) {
  throw new Error("BETA_READINESS_SUPPORT_REFERENCE points to /support but API preflight does not show support intake enabled.");
}

const trafficEvidence = inspectTrafficPlan({
  reference: trafficPlan,
  target,
  releaseManifestReference: releaseManifest,
  preflightReportReference: preflightReport,
  releaseEvidence,
});
const databaseRuntimeEvidence = inspectDatabaseRuntimePlan({
  reference: databaseRuntimePlan,
  target,
  persistenceDriver,
  releaseManifestReference: releaseManifest,
  preflightReportReference: preflightReport,
  trafficPlanReference: trafficPlan,
});

const plan = {
  app: "pocket-vault",
  component: "beta-readiness-plan",
  target,
  readinessLabel,
  generatedAt: new Date().toISOString(),
  readinessStatus: "ready",
  noDeploymentPerformed: true,
  noDatabaseMutated: true,
  noTrafficMoved: true,
  persistence: {
    driver: persistenceDriver,
    databaseRuntimePlanRequired: persistenceDriver === "postgresql",
  },
  artifacts: {
    releaseManifest,
    preflightReport,
    trafficPlan,
    databaseRuntimePlan,
    smokeResult,
    sourceSnapshot,
    rollbackSnapshot,
  },
  audience: {
    participantLimit: requirePositiveInteger("BETA_READINESS_PARTICIPANT_LIMIT", "10"),
    maxVaultUsdc: requirePositiveDecimal("BETA_READINESS_MAX_VAULT_USDC"),
    supportReference,
    incidentOwner: requireText("BETA_READINESS_INCIDENT_OWNER"),
  },
  controls: {
    changeWindow: optionalText("BETA_READINESS_CHANGE_WINDOW"),
    observeMinutes,
    operator: optionalText("BETA_READINESS_OPERATOR"),
    notes: optionalText("BETA_READINESS_NOTES"),
  },
  evidence: {
    releaseManifest: releaseEvidence,
    preflight: preflightEvidence,
    trafficPlan: trafficEvidence,
    databaseRuntimePlan: databaseRuntimeEvidence,
    smokeResult: smokeEvidence,
  },
  acceptanceGates: [
    "Release manifest target, app URL, API URL, API image, and rollback image are reviewed.",
    "API preflight is valid for the beta target.",
    "API traffic plan is a promotion plan with candidate and rollback URLs.",
    "Managed database runtime plan is accepted when PostgreSQL persistence is selected.",
    "Protected production smoke evidence includes create, deposit, support, dashboard, detail, activity, indexer, and metadata checks.",
    "Source and rollback snapshots are available in approved operational storage.",
    "Participant limit, per-vault USDC limit, support route, and incident owner are recorded.",
    "Rollback procedure is reviewed before any beta invitations are sent.",
  ],
  launchSteps: buildLaunchSteps(observeMinutes),
  rollbackSteps,
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-beta-readiness-${target}-${readinessLabel}.json`);
writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `plan_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, readinessLabel, persistenceDriver }, null, 2));
