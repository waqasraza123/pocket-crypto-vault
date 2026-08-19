import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const decisionValues = new Set(["expand", "hold", "rollback", "disable"]);
const supportBacklogValues = new Set(["clear", "watch", "blocked"]);
const capacityValues = new Set(["ready", "constrained", "blocked"]);

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
    throw new Error("BETA_EXPANSION_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const requireTarget = () => {
  const target = requireText("BETA_EXPANSION_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("BETA_EXPANSION_TARGET must be staging or production.");
  }

  return target;
};

const requireDecision = () => {
  const decision = requireText("BETA_EXPANSION_DECISION");

  if (!decisionValues.has(decision)) {
    throw new Error("BETA_EXPANSION_DECISION must be expand, hold, rollback, or disable.");
  }

  return decision;
};

const requireSetValue = (name, values, fallback) => {
  const value = readText(name, fallback);

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

const requireBoolean = (name, fallback = "false") => {
  const value = readText(name, fallback);

  if (["true", "1", "yes"].includes(value)) {
    return true;
  }

  if (["false", "0", "no"].includes(value)) {
    return false;
  }

  throw new Error(`${name} must be true, false, 1, 0, yes, or no.`);
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

const inspectWaveOutcome = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_EXPANSION_LATEST_WAVE_OUTCOME");

  if (!result.inspected) {
    return result;
  }

  const outcome = result.parsed;
  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: outcome.target,
    outcomeLabel: outcome.outcomeLabel,
    decision: outcome.decision,
    observationStatus: outcome.observationStatus,
    noInvitesSent: outcome.noInvitesSent === true,
    noParticipantIdentifiersRecorded: outcome.noParticipantIdentifiersRecorded === true,
    invitedCount: outcome.aggregateCounts?.invitedCount ?? null,
    activatedWalletCount: outcome.aggregateCounts?.activatedWalletCount ?? null,
    vaultCreatedCount: outcome.aggregateCounts?.vaultCreatedCount ?? null,
    depositCount: outcome.aggregateCounts?.depositCount ?? null,
    supportRequestCount: outcome.aggregateCounts?.supportRequestCount ?? null,
    failedTransactionCount: outcome.aggregateCounts?.failedTransactionCount ?? null,
    incidentCount: outcome.aggregateCounts?.incidentCount ?? null,
    supportReference: outcome.controls?.supportReference ?? null,
    incidentOwner: outcome.controls?.incidentOwner ?? null,
  };
  const failures = [];

  if (outcome?.app !== "pocket-vault" || outcome?.component !== "beta-wave-outcome-report") {
    failures.push("latest wave outcome component is not beta-wave-outcome-report");
  }

  if (evidence.target !== target) {
    failures.push("latest wave outcome target does not match expansion target");
  }

  if (!evidence.noInvitesSent || !evidence.noParticipantIdentifiersRecorded) {
    failures.push("latest wave outcome must preserve non-sending and non-PII boundaries");
  }

  if (!evidence.supportReference || !evidence.incidentOwner) {
    failures.push("latest wave outcome must include support reference and incident owner");
  }

  if (failures.length > 0) {
    throw new Error(`Beta expansion requires accepted wave outcome evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectRetentionPlan = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_EXPANSION_RETENTION_PLAN");

  if (!result.inspected) {
    return result;
  }

  const plan = result.parsed;
  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: plan.target,
    component: plan.component,
    noLiveDataRead: plan.noLiveDataRead === true,
    noDataDeleted: plan.noDataDeleted === true,
    noRetentionPolicyApplied: plan.noRetentionPolicyApplied === true,
    commitAllowed: plan.commitAllowed === false,
    policyOwner: plan.controls?.policyOwner ?? null,
    supportOwner: plan.controls?.supportOwner ?? null,
    incidentOwner: plan.controls?.incidentOwner ?? null,
    reviewCadence: plan.controls?.reviewCadence ?? null,
  };
  const failures = [];

  if (plan?.app !== "pocket-vault" || plan?.component !== "beta-data-retention-plan") {
    failures.push("retention component is not beta-data-retention-plan");
  }

  if (evidence.target !== target) {
    failures.push("retention target does not match expansion target");
  }

  if (!evidence.noLiveDataRead || !evidence.noDataDeleted || !evidence.noRetentionPolicyApplied || evidence.commitAllowed !== true) {
    failures.push("retention plan must preserve planning-only and non-committable boundaries");
  }

  if (!evidence.policyOwner || !evidence.supportOwner || !evidence.incidentOwner) {
    failures.push("retention plan must include policy, support, and incident owners");
  }

  if (failures.length > 0) {
    throw new Error(`Beta expansion requires accepted retention evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const buildNextActions = (decision) => {
  if (decision === "expand") {
    return [
      "Store this expansion decision with beta wave outcome and retention evidence.",
      "Generate a fresh production observation report before the next invitation wave.",
      "Generate a new beta invitation wave plan before sending any additional invitations.",
      "Keep participant PII in approved private operational systems only.",
    ];
  }

  if (decision === "hold") {
    return [
      "Hold additional invitation waves.",
      "Review support backlog, failed transactions, operational capacity, retention readiness, and latest outcome evidence.",
      "Generate a new expansion decision after blockers are resolved.",
    ];
  }

  if (decision === "rollback") {
    return [
      "Hold additional invitation waves.",
      "Use approved rollback artifacts before changing traffic or restoring data.",
      "Record the rollback reason and aggregate affected counts in the incident system.",
      "Generate fresh activation, observation, wave outcome, and expansion evidence before re-expanding access.",
    ];
  }

  return [
    "Hold additional invitation waves.",
    "Use approved disablement artifacts before removing public API access.",
    "Confirm app clients show honest degraded backend messaging.",
    "Generate fresh activation, observation, wave outcome, and expansion evidence before re-enabling access.",
  ];
};

const target = requireTarget();
const expansionLabel = sanitizeLabel(requireText("BETA_EXPANSION_LABEL"));
const decision = requireDecision();
const latestWaveOutcome = requireText("BETA_EXPANSION_LATEST_WAVE_OUTCOME");
const retentionPlan = requireText("BETA_EXPANSION_RETENTION_PLAN");
const currentParticipantCount = requireNonNegativeInteger("BETA_EXPANSION_CURRENT_PARTICIPANT_COUNT", "0");
const nextWaveSize = requirePositiveInteger("BETA_EXPANSION_NEXT_WAVE_SIZE", "1");
const participantLimit = requirePositiveInteger("BETA_EXPANSION_PARTICIPANT_LIMIT", "1");
const openSupportRequestCount = requireNonNegativeInteger("BETA_EXPANSION_OPEN_SUPPORT_REQUEST_COUNT", "0");
const unresolvedIncidentCount = requireNonNegativeInteger("BETA_EXPANSION_UNRESOLVED_INCIDENT_COUNT", "0");
const failedTransactionCount = requireNonNegativeInteger("BETA_EXPANSION_FAILED_TRANSACTION_COUNT", "0");
const supportBacklogStatus = requireSetValue("BETA_EXPANSION_SUPPORT_BACKLOG_STATUS", supportBacklogValues, "clear");
const operatorCapacityStatus = requireSetValue("BETA_EXPANSION_OPERATOR_CAPACITY_STATUS", capacityValues, "ready");
const retentionReviewAccepted = requireBoolean("BETA_EXPANSION_RETENTION_REVIEW_ACCEPTED", "false");
const supportReviewAccepted = requireBoolean("BETA_EXPANSION_SUPPORT_REVIEW_ACCEPTED", "false");
const privacyReviewAccepted = requireBoolean("BETA_EXPANSION_PRIVACY_REVIEW_ACCEPTED", "false");
const participantIdentifiersRecorded = requireBoolean("BETA_EXPANSION_PARTICIPANT_IDENTIFIERS_RECORDED", "false");
const supportReference = requireText("BETA_EXPANSION_SUPPORT_REFERENCE");
const incidentOwner = requireText("BETA_EXPANSION_INCIDENT_OWNER");
const expansionOwner = requireText("BETA_EXPANSION_OWNER");
const confirmReport = requireText("BETA_EXPANSION_CONFIRM_REPORT");
const outputDir = readText("BETA_EXPANSION_DIR", path.join(process.cwd(), "artifacts"));

if (confirmReport !== "report") {
  throw new Error("BETA_EXPANSION_CONFIRM_REPORT must be report.");
}

if (participantIdentifiersRecorded) {
  throw new Error("BETA_EXPANSION_PARTICIPANT_IDENTIFIERS_RECORDED must be false.");
}

const waveOutcomeEvidence = inspectWaveOutcome({ reference: latestWaveOutcome, target });
const retentionEvidence = inspectRetentionPlan({ reference: retentionPlan, target });
const projectedParticipantCount = currentParticipantCount + nextWaveSize;

if (projectedParticipantCount > participantLimit) {
  throw new Error("Beta expansion would exceed the approved participant limit.");
}

if (waveOutcomeEvidence.inspected && supportReference !== waveOutcomeEvidence.supportReference) {
  throw new Error("BETA_EXPANSION_SUPPORT_REFERENCE does not match latest wave outcome support reference.");
}

if (waveOutcomeEvidence.inspected && incidentOwner !== waveOutcomeEvidence.incidentOwner) {
  throw new Error("BETA_EXPANSION_INCIDENT_OWNER does not match latest wave outcome incident owner.");
}

if ((decision === "rollback" || decision === "disable" || unresolvedIncidentCount > 0) && !optionalText("BETA_EXPANSION_INCIDENT_REFERENCE")) {
  throw new Error("BETA_EXPANSION_INCIDENT_REFERENCE is required for rollback, disable, or unresolved incidents.");
}

if (decision === "expand") {
  const failures = [];

  if (waveOutcomeEvidence.inspected && waveOutcomeEvidence.decision !== "continue") {
    failures.push("latest wave outcome decision must be continue");
  }

  if (waveOutcomeEvidence.inspected && waveOutcomeEvidence.observationStatus !== "stable") {
    failures.push("latest wave outcome observation status must be stable");
  }

  if (openSupportRequestCount !== 0) {
    failures.push("open support request count must be zero");
  }

  if (unresolvedIncidentCount !== 0) {
    failures.push("unresolved incident count must be zero");
  }

  if (failedTransactionCount !== 0) {
    failures.push("failed transaction count must be zero");
  }

  if (supportBacklogStatus !== "clear") {
    failures.push("support backlog status must be clear");
  }

  if (operatorCapacityStatus !== "ready") {
    failures.push("operator capacity status must be ready");
  }

  if (!retentionReviewAccepted || !supportReviewAccepted || !privacyReviewAccepted) {
    failures.push("retention, support, and privacy reviews must be accepted");
  }

  if (failures.length > 0) {
    throw new Error(`Expand decision requires clean beta expansion evidence: ${failures.join("; ")}.`);
  }
}

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-beta-expansion-decision-${target}-${expansionLabel}.json`);
const report = {
  app: "pocket-vault",
  component: "beta-expansion-decision-report",
  target,
  expansionLabel,
  generatedAt: new Date().toISOString(),
  decision,
  expansionApproved: decision === "expand",
  noInvitesSent: true,
  noParticipantIdentifiersRecorded: true,
  noDeploymentPerformed: true,
  noDatabaseMutated: true,
  noTrafficMoved: true,
  noChainTransactionSent: true,
  artifacts: {
    latestWaveOutcome,
    retentionPlan,
  },
  capacity: {
    currentParticipantCount,
    nextWaveSize,
    projectedParticipantCount,
    participantLimit,
    openSupportRequestCount,
    unresolvedIncidentCount,
    failedTransactionCount,
    supportBacklogStatus,
    operatorCapacityStatus,
  },
  reviews: {
    retentionReviewAccepted,
    supportReviewAccepted,
    privacyReviewAccepted,
    participantIdentifiersRecorded: false,
  },
  controls: {
    supportReference,
    incidentOwner,
    expansionOwner,
    incidentReference: optionalText("BETA_EXPANSION_INCIDENT_REFERENCE"),
    operator: optionalText("BETA_EXPANSION_OPERATOR"),
    notes: optionalText("BETA_EXPANSION_NOTES"),
  },
  evidence: {
    latestWaveOutcome: waveOutcomeEvidence,
    retentionPlan: retentionEvidence,
  },
  acceptanceGates: [
    "Latest beta wave outcome evidence is present.",
    "Beta data retention evidence is present.",
    "Projected participant count stays within the approved participant limit.",
    "Expand decisions require latest wave outcome decision continue, stable observation, zero open support requests, zero unresolved incidents, zero failed transactions, clear support backlog, ready operator capacity, and accepted retention, support, and privacy reviews.",
    "Hold, rollback, and disable decisions block the next invitation wave until a new expansion decision is recorded.",
    "Participant identifiers are not recorded in this artifact.",
  ],
  nextActions: buildNextActions(decision),
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `expansion_report_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, expansionLabel, decision, projectedParticipantCount }, null, 2));
