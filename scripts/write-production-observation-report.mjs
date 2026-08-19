import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const persistenceDriverValues = new Set(["sqlite", "postgresql"]);
const observationStatusValues = new Set(["stable", "degraded", "incident"]);
const indexerStatusValues = new Set(["healthy", "lagging", "disabled", "unknown"]);
const supportStatusValues = new Set(["quiet", "active", "blocked", "unknown"]);
const analyticsStatusValues = new Set(["healthy", "degraded", "disabled", "unknown"]);
const errorBudgetStatusValues = new Set(["within-budget", "watch", "breached", "unknown"]);

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
    throw new Error("PRODUCTION_OBSERVATION_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const requireEnum = (name, values, fallback = "") => {
  const value = fallback ? readText(name, fallback) : requireText(name);

  if (!values.has(value)) {
    throw new Error(`${name} must be one of: ${Array.from(values).join(", ")}.`);
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

const requireNonNegativeInteger = (name, fallback) => {
  const value = Number.parseInt(readText(name, fallback), 10);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }

  return value;
};

const normalizeUrl = (name, value) => {
  rejectSecretText(name, value);

  const url = new URL(value);

  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error(`${name} must use https outside local development.`);
  }

  if (url.username || url.password) {
    throw new Error(`${name} must not include URL credentials.`);
  }

  return url.toString().replace(/\/$/, "");
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

const summarizeHealthPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return {
    status: typeof payload.status === "string" ? payload.status : null,
    app: typeof payload.app === "string" ? payload.app : null,
    component: typeof payload.component === "string" ? payload.component : null,
    environment: typeof payload.environment === "string" ? payload.environment : null,
  };
};

const summarizeReadyPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const persistence = payload.persistence && typeof payload.persistence === "object" ? payload.persistence : null;
  const productionActivation =
    payload.productionActivation && typeof payload.productionActivation === "object" ? payload.productionActivation : null;

  return {
    status: typeof payload.status === "string" ? payload.status : null,
    environment: typeof payload.environment === "string" ? payload.environment : null,
    deploymentTarget: typeof payload.deploymentTarget === "string" ? payload.deploymentTarget : null,
    supportEnabled: typeof payload.supportEnabled === "boolean" ? payload.supportEnabled : null,
    analyticsEnabled: typeof payload.analyticsEnabled === "boolean" ? payload.analyticsEnabled : null,
    persistence: persistence
      ? {
          driver: typeof persistence.driver === "string" ? persistence.driver : null,
          runtimeReady: typeof persistence.runtimeReady === "boolean" ? persistence.runtimeReady : null,
          connectionCheck: typeof persistence.connectionCheck === "string" ? persistence.connectionCheck : null,
          schemaCheck: typeof persistence.schemaCheck === "string" ? persistence.schemaCheck : null,
        }
      : null,
    productionActivation: productionActivation
      ? {
          status: typeof productionActivation.status === "string" ? productionActivation.status : null,
          safeForLimitedBetaTraffic:
            typeof productionActivation.safeForLimitedBetaTraffic === "boolean"
              ? productionActivation.safeForLimitedBetaTraffic
              : null,
          databaseCutoverReady:
            typeof productionActivation.databaseCutoverReady === "boolean" ? productionActivation.databaseCutoverReady : null,
        }
      : null,
  };
};

const parseJsonSafely = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const checkEndpoint = async ({ apiBaseUrl, pathname, timeoutMs }) => {
  const url = `${apiBaseUrl}${pathname}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    });
    const payload = await parseJsonSafely(response);

    return {
      url,
      ok: response.ok,
      status: response.status,
      summary: pathname === "/ready" ? summarizeReadyPayload(payload) : summarizeHealthPayload(payload),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch failure.";

    return {
      url,
      ok: false,
      status: null,
      error: message,
      summary: null,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const inspectActivationRecord = ({ reference, target, persistenceDriver }) => {
  const result = readLocalJsonArtifact(reference, "PRODUCTION_OBSERVATION_ACTIVATION_RECORD");

  if (!result.inspected) {
    return result;
  }

  const record = result.parsed;
  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: record.target,
    activationLabel: record.activationLabel,
    activationOutcome: record.activationOutcome,
    activationAccepted: record.activationAccepted === true,
    persistenceDriver: record.persistence?.driver ?? null,
    noDeploymentPerformed: record.noDeploymentPerformed === true,
    noDatabaseMutated: record.noDatabaseMutated === true,
    noTrafficMoved: record.noTrafficMoved === true,
    supportReference: record.controls?.supportReference ?? null,
    incidentOwner: record.controls?.incidentOwner ?? null,
  };
  const failures = [];

  if (record?.app !== "pocket-vault" || record?.component !== "production-activation-record") {
    failures.push("activation record component is not production-activation-record");
  }

  if (evidence.target !== target) {
    failures.push("activation record target does not match observation target");
  }

  if (!evidence.activationAccepted || evidence.activationOutcome !== "accepted") {
    failures.push("activation record is not accepted");
  }

  if (evidence.persistenceDriver !== persistenceDriver) {
    failures.push("activation record persistence driver does not match observation driver");
  }

  if (!evidence.noDeploymentPerformed || !evidence.noDatabaseMutated || !evidence.noTrafficMoved) {
    failures.push("activation record does not preserve non-mutating artifact boundaries");
  }

  if (!evidence.supportReference || !evidence.incidentOwner) {
    failures.push("activation record must include support reference and incident owner");
  }

  if (failures.length > 0) {
    throw new Error(`Production observation requires an accepted activation record: ${failures.join("; ")}.`);
  }

  return evidence;
};

const buildAcceptanceGates = (observationStatus) => [
  "Accepted production activation record is present.",
  "Public API /health and /ready were read during the observation window.",
  "Indexer status, support status, analytics status, error budget status, support count, failed transaction count, and incident count are recorded.",
  "Support reference and incident owner are recorded for escalation.",
  ...(observationStatus === "stable"
    ? ["Stable observation requires healthy public API checks, healthy indexer, non-blocked support, within-budget errors, and zero incidents."]
    : ["Degraded or incident observation requires operator review before beta expansion."]),
];

const buildNextActions = (observationStatus) => {
  if (observationStatus === "stable") {
    return [
      "Store this observation report with activation evidence.",
      "Continue limited beta only within the approved participant and value limits.",
      "Repeat observation after each beta invitation wave.",
    ];
  }

  if (observationStatus === "degraded") {
    return [
      "Keep beta expansion paused until the degraded signal is resolved.",
      "Review support queue, indexer freshness, analytics ingestion, and API readiness with the incident owner.",
      "Generate a new observation report before expanding invitations.",
    ];
  }

  return [
    "Keep beta expansion paused.",
    "Open or update the incident record with this report.",
    "Generate rollback or disablement artifacts before recovery action when time allows.",
    "Generate a new activation and observation report before re-expanding beta access.",
  ];
};

const target = requireEnum("PRODUCTION_OBSERVATION_TARGET", targetValues);
const label = sanitizeLabel(requireText("PRODUCTION_OBSERVATION_LABEL"));
const observationStatus = requireEnum("PRODUCTION_OBSERVATION_STATUS", observationStatusValues, "stable");
const persistenceDriver = requireEnum("PRODUCTION_OBSERVATION_PERSISTENCE_DRIVER", persistenceDriverValues, "postgresql");
const apiBaseUrl = normalizeUrl("PRODUCTION_OBSERVATION_API_BASE_URL", requireText("PRODUCTION_OBSERVATION_API_BASE_URL"));
const activationRecord = requireText("PRODUCTION_OBSERVATION_ACTIVATION_RECORD");
const supportReference = requireText("PRODUCTION_OBSERVATION_SUPPORT_REFERENCE");
const incidentOwner = requireText("PRODUCTION_OBSERVATION_INCIDENT_OWNER");
const confirmObserve = requireText("PRODUCTION_OBSERVATION_CONFIRM");
const observeMinutes = requirePositiveInteger("PRODUCTION_OBSERVATION_MINUTES", "60");
const timeoutMs = requirePositiveInteger("PRODUCTION_OBSERVATION_TIMEOUT_MS", "10000");
const supportRequestCount = requireNonNegativeInteger("PRODUCTION_OBSERVATION_SUPPORT_REQUEST_COUNT", "0");
const failedTransactionCount = requireNonNegativeInteger("PRODUCTION_OBSERVATION_FAILED_TRANSACTION_COUNT", "0");
const incidentCount = requireNonNegativeInteger("PRODUCTION_OBSERVATION_INCIDENT_COUNT", "0");
const indexerStatus = requireEnum("PRODUCTION_OBSERVATION_INDEXER_STATUS", indexerStatusValues, "unknown");
const supportStatus = requireEnum("PRODUCTION_OBSERVATION_SUPPORT_STATUS", supportStatusValues, "unknown");
const analyticsStatus = requireEnum("PRODUCTION_OBSERVATION_ANALYTICS_STATUS", analyticsStatusValues, "unknown");
const errorBudgetStatus = requireEnum("PRODUCTION_OBSERVATION_ERROR_BUDGET_STATUS", errorBudgetStatusValues, "unknown");
const outputDir = readText("PRODUCTION_OBSERVATION_DIR", path.join(process.cwd(), "artifacts"));

if (confirmObserve !== "observe") {
  throw new Error("PRODUCTION_OBSERVATION_CONFIRM must be observe.");
}

if (observationStatus === "stable") {
  const stableFailures = [];

  if (indexerStatus !== "healthy") {
    stableFailures.push("indexer status must be healthy");
  }

  if (supportStatus === "blocked") {
    stableFailures.push("support status must not be blocked");
  }

  if (analyticsStatus === "degraded") {
    stableFailures.push("analytics status must not be degraded");
  }

  if (errorBudgetStatus !== "within-budget") {
    stableFailures.push("error budget status must be within-budget");
  }

  if (incidentCount !== 0) {
    stableFailures.push("incident count must be zero");
  }

  if (stableFailures.length > 0) {
    throw new Error(`Stable production observation requires clean operational signals: ${stableFailures.join("; ")}.`);
  }
}

if (observationStatus === "incident" && !optionalText("PRODUCTION_OBSERVATION_INCIDENT_REFERENCE")) {
  throw new Error("PRODUCTION_OBSERVATION_INCIDENT_REFERENCE is required when PRODUCTION_OBSERVATION_STATUS=incident.");
}

const activationEvidence = inspectActivationRecord({ reference: activationRecord, target, persistenceDriver });
const checks = {
  health: await checkEndpoint({ apiBaseUrl, pathname: "/health", timeoutMs }),
  ready: await checkEndpoint({ apiBaseUrl, pathname: "/ready", timeoutMs }),
};

if (observationStatus === "stable" && (!checks.health.ok || !checks.ready.ok)) {
  throw new Error("Stable production observation requires healthy /health and /ready checks.");
}

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-production-observation-${target}-${label}.json`);
const report = {
  app: "pocket-vault",
  component: "production-observation-report",
  target,
  label,
  generatedAt: new Date().toISOString(),
  observationStatus,
  apiBaseUrl,
  persistence: {
    driver: persistenceDriver,
  },
  artifacts: {
    activationRecord,
  },
  controls: {
    observeMinutes,
    supportReference,
    incidentOwner,
    incidentReference: optionalText("PRODUCTION_OBSERVATION_INCIDENT_REFERENCE"),
    operator: optionalText("PRODUCTION_OBSERVATION_OPERATOR"),
    notes: optionalText("PRODUCTION_OBSERVATION_NOTES"),
  },
  checks,
  signals: {
    indexerStatus,
    supportStatus,
    analyticsStatus,
    errorBudgetStatus,
    supportRequestCount,
    failedTransactionCount,
    incidentCount,
  },
  evidence: {
    activationRecord: activationEvidence,
  },
  acceptanceGates: buildAcceptanceGates(observationStatus),
  nextActions: buildNextActions(observationStatus),
  credentialsRedacted: true,
  noDeploymentPerformed: true,
  noDatabaseMutated: true,
  noTrafficMoved: true,
  noChainTransactionSent: true,
  noUserInvitesSent: true,
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `observation_report_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, label, observationStatus, persistenceDriver }, null, 2));
