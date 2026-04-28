import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const decimalPattern = /^(0|[1-9][0-9]*)(\.[0-9]{1,6})?$/;

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
    throw new Error("BETA_INVITATION_WAVE_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const requireTarget = () => {
  const target = requireText("BETA_INVITATION_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("BETA_INVITATION_TARGET must be staging or production.");
  }

  return target;
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

const requirePositiveDecimal = (name) => {
  const value = requireText(name);

  if (!decimalPattern.test(value) || Number(value) <= 0) {
    throw new Error(`${name} must be a positive decimal with up to six fractional digits.`);
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

const inspectBetaReadiness = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_INVITATION_READINESS_PLAN");

  if (!result.inspected) {
    return result;
  }

  const readiness = result.parsed;
  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: readiness.target,
    readinessLabel: readiness.readinessLabel,
    readinessStatus: readiness.readinessStatus,
    participantLimit: readiness.audience?.participantLimit ?? null,
    maxVaultUsdc: readiness.audience?.maxVaultUsdc ?? null,
    supportReference: readiness.audience?.supportReference ?? null,
    incidentOwner: readiness.audience?.incidentOwner ?? null,
    observeMinutes: readiness.controls?.observeMinutes ?? null,
  };
  const failures = [];

  if (readiness?.app !== "pocket-vault" || readiness?.component !== "beta-readiness-plan") {
    failures.push("readiness component is not beta-readiness-plan");
  }

  if (evidence.target !== target) {
    failures.push("readiness target does not match invitation target");
  }

  if (evidence.readinessStatus !== "ready") {
    failures.push("readiness status is not ready");
  }

  if (!evidence.participantLimit || !evidence.maxVaultUsdc || !evidence.supportReference || !evidence.incidentOwner) {
    failures.push("readiness must include participant limit, max vault USDC, support reference, and incident owner");
  }

  if (failures.length > 0) {
    throw new Error(`Beta invitation wave requires accepted readiness evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectObservationReport = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_INVITATION_OBSERVATION_REPORT");

  if (!result.inspected) {
    return result;
  }

  const observation = result.parsed;
  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: observation.target,
    label: observation.label,
    observationStatus: observation.observationStatus,
    healthOk: observation.checks?.health?.ok === true,
    readyOk: observation.checks?.ready?.ok === true,
    indexerStatus: observation.signals?.indexerStatus ?? null,
    supportStatus: observation.signals?.supportStatus ?? null,
    analyticsStatus: observation.signals?.analyticsStatus ?? null,
    errorBudgetStatus: observation.signals?.errorBudgetStatus ?? null,
    incidentCount: observation.signals?.incidentCount ?? null,
    supportReference: observation.controls?.supportReference ?? null,
    incidentOwner: observation.controls?.incidentOwner ?? null,
  };
  const failures = [];

  if (observation?.app !== "pocket-vault" || observation?.component !== "production-observation-report") {
    failures.push("observation component is not production-observation-report");
  }

  if (evidence.target !== target) {
    failures.push("observation target does not match invitation target");
  }

  if (evidence.observationStatus !== "stable") {
    failures.push("observation status is not stable");
  }

  if (!evidence.healthOk || !evidence.readyOk) {
    failures.push("observation did not pass public /health and /ready");
  }

  if (evidence.indexerStatus !== "healthy") {
    failures.push("observation indexer status is not healthy");
  }

  if (evidence.supportStatus === "blocked") {
    failures.push("observation support status is blocked");
  }

  if (evidence.analyticsStatus === "degraded") {
    failures.push("observation analytics status is degraded");
  }

  if (evidence.errorBudgetStatus !== "within-budget") {
    failures.push("observation error budget is not within budget");
  }

  if (evidence.incidentCount !== 0) {
    failures.push("observation incident count is not zero");
  }

  if (failures.length > 0) {
    throw new Error(`Beta invitation wave requires stable observation evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const buildInvitationSteps = (observeMinutes) => [
  "Confirm this wave plan is stored with beta readiness and observation evidence.",
  "Invite only the approved wave size through the operator-owned communication channel.",
  "Include limited beta scope, real USDC risk, max recommended vault amount, support path, and pause criteria in the invite communication.",
  "Do not include private participant names, emails, wallet addresses, or contact details in committed artifacts.",
  `Observe health, readiness, indexer freshness, support queue, analytics, failed transactions, and incidents for at least ${observeMinutes} minutes after the wave starts.`,
  "Generate a new production observation report before any next invitation wave.",
];

const pauseCriteria = [
  "Any loss or incorrect display of real user funds.",
  "Repeated failed create, deposit, unlock, or withdraw attempts.",
  "Public /health or /ready stops passing.",
  "Indexer remains lagging beyond the approved observation window.",
  "Support intake or triage is blocked.",
  "Error budget is breached or an incident is opened.",
];

const target = requireTarget();
const waveLabel = sanitizeLabel(requireText("BETA_INVITATION_WAVE_LABEL"));
const betaReadiness = requireText("BETA_INVITATION_READINESS_PLAN");
const observationReport = requireText("BETA_INVITATION_OBSERVATION_REPORT");
const waveNumber = requirePositiveInteger("BETA_INVITATION_WAVE_NUMBER", "1");
const waveSize = requirePositiveInteger("BETA_INVITATION_WAVE_SIZE", "1");
const previouslyInvitedCount = requireNonNegativeInteger("BETA_INVITATION_PREVIOUSLY_INVITED_COUNT", "0");
const maxVaultUsdc = requirePositiveDecimal("BETA_INVITATION_MAX_VAULT_USDC");
const communicationReference = requireText("BETA_INVITATION_COMMUNICATION_REFERENCE");
const supportReference = requireText("BETA_INVITATION_SUPPORT_REFERENCE");
const incidentOwner = requireText("BETA_INVITATION_INCIDENT_OWNER");
const inviteOwner = requireText("BETA_INVITATION_OWNER");
const confirmPlan = requireText("BETA_INVITATION_CONFIRM_PLAN");
const outputDir = readText("BETA_INVITATION_DIR", path.join(process.cwd(), "artifacts"));

if (confirmPlan !== "plan") {
  throw new Error("BETA_INVITATION_CONFIRM_PLAN must be plan.");
}

const readinessEvidence = inspectBetaReadiness({ reference: betaReadiness, target });
const observationEvidence = inspectObservationReport({ reference: observationReport, target });
const participantLimit = readinessEvidence.inspected
  ? Number(readinessEvidence.participantLimit)
  : requirePositiveInteger("BETA_INVITATION_PARTICIPANT_LIMIT", "1");
const cumulativeInvitedCount = previouslyInvitedCount + waveSize;

if (cumulativeInvitedCount > participantLimit) {
  throw new Error("Beta invitation wave would exceed the approved participant limit.");
}

if (readinessEvidence.inspected && Number(maxVaultUsdc) > Number(readinessEvidence.maxVaultUsdc)) {
  throw new Error("BETA_INVITATION_MAX_VAULT_USDC exceeds the beta readiness max vault USDC.");
}

if (readinessEvidence.inspected && supportReference !== readinessEvidence.supportReference) {
  throw new Error("BETA_INVITATION_SUPPORT_REFERENCE does not match beta readiness support reference.");
}

if (readinessEvidence.inspected && incidentOwner !== readinessEvidence.incidentOwner) {
  throw new Error("BETA_INVITATION_INCIDENT_OWNER does not match beta readiness incident owner.");
}

if (observationEvidence.inspected && supportReference !== observationEvidence.supportReference) {
  throw new Error("BETA_INVITATION_SUPPORT_REFERENCE does not match observation support reference.");
}

if (observationEvidence.inspected && incidentOwner !== observationEvidence.incidentOwner) {
  throw new Error("BETA_INVITATION_INCIDENT_OWNER does not match observation incident owner.");
}

const observeMinutes = readinessEvidence.inspected && readinessEvidence.observeMinutes ? readinessEvidence.observeMinutes : 30;
const outputPath = path.join(outputDir, `pocket-vault-beta-invitation-wave-${target}-${waveLabel}.json`);
const plan = {
  app: "pocket-vault",
  component: "beta-invitation-wave-plan",
  target,
  waveLabel,
  generatedAt: new Date().toISOString(),
  invitationPlanApproved: true,
  noInvitesSent: true,
  noDeploymentPerformed: true,
  noDatabaseMutated: true,
  noTrafficMoved: true,
  noChainTransactionSent: true,
  artifacts: {
    betaReadiness,
    observationReport,
  },
  audience: {
    waveNumber,
    waveSize,
    previouslyInvitedCount,
    cumulativeInvitedCount,
    participantLimit,
    maxVaultUsdc,
    participantIdentifiersRecorded: false,
  },
  controls: {
    communicationReference,
    supportReference,
    incidentOwner,
    inviteOwner,
    operator: optionalText("BETA_INVITATION_OPERATOR"),
    notes: optionalText("BETA_INVITATION_NOTES"),
  },
  evidence: {
    betaReadiness: readinessEvidence,
    observationReport: observationEvidence,
  },
  acceptanceGates: [
    "Beta readiness status is ready.",
    "Production observation status is stable.",
    "Wave size plus previously invited count stays within the approved participant limit.",
    "Max recommended USDC per vault does not exceed the beta readiness value limit.",
    "Support reference and incident owner match readiness and observation evidence when those artifacts are locally inspected.",
    "No participant names, emails, wallet addresses, or contact details are recorded in this artifact.",
  ],
  invitationSteps: buildInvitationSteps(observeMinutes),
  pauseCriteria,
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `wave_plan_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, waveLabel, waveNumber, waveSize, cumulativeInvitedCount }, null, 2));
