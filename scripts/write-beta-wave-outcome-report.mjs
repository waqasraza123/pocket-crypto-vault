import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const decisionValues = new Set(["continue", "pause", "rollback", "disable"]);
const observationStatusValues = new Set(["stable", "degraded", "incident"]);

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
    throw new Error("BETA_WAVE_OUTCOME_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const requireTarget = () => {
  const target = requireText("BETA_WAVE_OUTCOME_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("BETA_WAVE_OUTCOME_TARGET must be staging or production.");
  }

  return target;
};

const requireDecision = () => {
  const decision = requireText("BETA_WAVE_OUTCOME_DECISION");

  if (!decisionValues.has(decision)) {
    throw new Error("BETA_WAVE_OUTCOME_DECISION must be continue, pause, rollback, or disable.");
  }

  return decision;
};

const requireObservationStatus = () => {
  const status = requireText("BETA_WAVE_OUTCOME_OBSERVATION_STATUS");

  if (!observationStatusValues.has(status)) {
    throw new Error("BETA_WAVE_OUTCOME_OBSERVATION_STATUS must be stable, degraded, or incident.");
  }

  return status;
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

const inspectInvitationWavePlan = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_WAVE_OUTCOME_INVITATION_WAVE_PLAN");

  if (!result.inspected) {
    return result;
  }

  const plan = result.parsed;
  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: plan.target,
    waveLabel: plan.waveLabel,
    invitationPlanApproved: plan.invitationPlanApproved === true,
    noInvitesSent: plan.noInvitesSent === true,
    waveNumber: plan.audience?.waveNumber ?? null,
    waveSize: plan.audience?.waveSize ?? null,
    previouslyInvitedCount: plan.audience?.previouslyInvitedCount ?? null,
    cumulativeInvitedCount: plan.audience?.cumulativeInvitedCount ?? null,
    participantLimit: plan.audience?.participantLimit ?? null,
    participantIdentifiersRecorded: plan.audience?.participantIdentifiersRecorded === false,
    supportReference: plan.controls?.supportReference ?? null,
    incidentOwner: plan.controls?.incidentOwner ?? null,
    inviteOwner: plan.controls?.inviteOwner ?? null,
  };
  const failures = [];

  if (plan?.app !== "pocket-vault" || plan?.component !== "beta-invitation-wave-plan") {
    failures.push("invitation wave component is not beta-invitation-wave-plan");
  }

  if (evidence.target !== target) {
    failures.push("invitation wave target does not match outcome target");
  }

  if (!evidence.invitationPlanApproved) {
    failures.push("invitation wave plan is not approved");
  }

  if (!evidence.noInvitesSent) {
    failures.push("invitation wave plan must be a non-sending artifact");
  }

  if (!evidence.participantIdentifiersRecorded) {
    failures.push("invitation wave plan must not record participant identifiers");
  }

  if (!evidence.waveSize || !evidence.participantLimit || !evidence.supportReference || !evidence.incidentOwner || !evidence.inviteOwner) {
    failures.push("invitation wave plan must include wave size, participant limit, support reference, incident owner, and invite owner");
  }

  if (failures.length > 0) {
    throw new Error(`Beta wave outcome requires an accepted invitation wave plan: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectObservationReport = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_WAVE_OUTCOME_OBSERVATION_REPORT");

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
    supportRequestCount: observation.signals?.supportRequestCount ?? null,
    failedTransactionCount: observation.signals?.failedTransactionCount ?? null,
    incidentCount: observation.signals?.incidentCount ?? null,
    supportReference: observation.controls?.supportReference ?? null,
    incidentOwner: observation.controls?.incidentOwner ?? null,
  };
  const failures = [];

  if (observation?.app !== "pocket-vault" || observation?.component !== "production-observation-report") {
    failures.push("observation component is not production-observation-report");
  }

  if (evidence.target !== target) {
    failures.push("observation target does not match outcome target");
  }

  if (!evidence.observationStatus) {
    failures.push("observation status is missing");
  }

  if (failures.length > 0) {
    throw new Error(`Beta wave outcome requires observation evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const buildNextActions = (decision) => {
  if (decision === "continue") {
    return [
      "Store this outcome report with invitation wave and observation evidence.",
      "Generate a fresh stable production observation report before the next invitation wave.",
      "Generate the next beta invitation wave plan before sending more invitations.",
    ];
  }

  if (decision === "pause") {
    return [
      "Pause additional invitations.",
      "Review support queue, failed transactions, indexer freshness, analytics, and observation evidence with the incident owner.",
      "Generate a new stable observation report before approving the next wave.",
    ];
  }

  if (decision === "rollback") {
    return [
      "Pause additional invitations.",
      "Use approved rollback artifacts before changing traffic or restoring data.",
      "Record affected aggregate counts and support handling in the incident system.",
      "Generate fresh activation, observation, and invitation evidence before re-expanding beta access.",
    ];
  }

  return [
    "Pause additional invitations.",
    "Use approved disablement artifacts before removing public API access.",
    "Confirm app clients show honest degraded backend messaging.",
    "Generate fresh activation, observation, and invitation evidence before re-enabling beta access.",
  ];
};

const target = requireTarget();
const outcomeLabel = sanitizeLabel(requireText("BETA_WAVE_OUTCOME_LABEL"));
const decision = requireDecision();
const recordedObservationStatus = requireObservationStatus();
const invitationWavePlan = requireText("BETA_WAVE_OUTCOME_INVITATION_WAVE_PLAN");
const observationReport = requireText("BETA_WAVE_OUTCOME_OBSERVATION_REPORT");
const invitedCount = requireNonNegativeInteger("BETA_WAVE_OUTCOME_INVITED_COUNT", "0");
const activatedWalletCount = requireNonNegativeInteger("BETA_WAVE_OUTCOME_ACTIVATED_WALLET_COUNT", "0");
const vaultCreatedCount = requireNonNegativeInteger("BETA_WAVE_OUTCOME_VAULT_CREATED_COUNT", "0");
const depositCount = requireNonNegativeInteger("BETA_WAVE_OUTCOME_DEPOSIT_COUNT", "0");
const withdrawCount = requireNonNegativeInteger("BETA_WAVE_OUTCOME_WITHDRAW_COUNT", "0");
const supportRequestCount = requireNonNegativeInteger("BETA_WAVE_OUTCOME_SUPPORT_REQUEST_COUNT", "0");
const failedTransactionCount = requireNonNegativeInteger("BETA_WAVE_OUTCOME_FAILED_TRANSACTION_COUNT", "0");
const incidentCount = requireNonNegativeInteger("BETA_WAVE_OUTCOME_INCIDENT_COUNT", "0");
const participantIdentifiersRecorded = requireBoolean("BETA_WAVE_OUTCOME_PARTICIPANT_IDENTIFIERS_RECORDED", "false");
const supportReference = requireText("BETA_WAVE_OUTCOME_SUPPORT_REFERENCE");
const incidentOwner = requireText("BETA_WAVE_OUTCOME_INCIDENT_OWNER");
const confirmReport = requireText("BETA_WAVE_OUTCOME_CONFIRM_REPORT");
const outputDir = readText("BETA_WAVE_OUTCOME_DIR", path.join(process.cwd(), "artifacts"));

if (confirmReport !== "report") {
  throw new Error("BETA_WAVE_OUTCOME_CONFIRM_REPORT must be report.");
}

if (participantIdentifiersRecorded) {
  throw new Error("BETA_WAVE_OUTCOME_PARTICIPANT_IDENTIFIERS_RECORDED must be false.");
}

const waveEvidence = inspectInvitationWavePlan({ reference: invitationWavePlan, target });
const observationEvidence = inspectObservationReport({ reference: observationReport, target });

if (waveEvidence.inspected && invitedCount > Number(waveEvidence.waveSize)) {
  throw new Error("BETA_WAVE_OUTCOME_INVITED_COUNT exceeds the approved invitation wave size.");
}

if (activatedWalletCount > invitedCount) {
  throw new Error("BETA_WAVE_OUTCOME_ACTIVATED_WALLET_COUNT cannot exceed invited count.");
}

if (waveEvidence.inspected && supportReference !== waveEvidence.supportReference) {
  throw new Error("BETA_WAVE_OUTCOME_SUPPORT_REFERENCE does not match invitation wave support reference.");
}

if (waveEvidence.inspected && incidentOwner !== waveEvidence.incidentOwner) {
  throw new Error("BETA_WAVE_OUTCOME_INCIDENT_OWNER does not match invitation wave incident owner.");
}

if (observationEvidence.inspected && supportReference !== observationEvidence.supportReference) {
  throw new Error("BETA_WAVE_OUTCOME_SUPPORT_REFERENCE does not match observation support reference.");
}

if (observationEvidence.inspected && incidentOwner !== observationEvidence.incidentOwner) {
  throw new Error("BETA_WAVE_OUTCOME_INCIDENT_OWNER does not match observation incident owner.");
}

if (observationEvidence.inspected && recordedObservationStatus !== observationEvidence.observationStatus) {
  throw new Error("BETA_WAVE_OUTCOME_OBSERVATION_STATUS does not match observation report status.");
}

if (decision === "continue") {
  const failures = [];

  if (recordedObservationStatus !== "stable") {
    failures.push("observation status must be stable");
  }

  if (incidentCount !== 0) {
    failures.push("incident count must be zero");
  }

  if (observationEvidence.inspected && (!observationEvidence.healthOk || !observationEvidence.readyOk)) {
    failures.push("observation health and readiness must pass");
  }

  if (observationEvidence.inspected && observationEvidence.indexerStatus !== "healthy") {
    failures.push("observation indexer status must be healthy");
  }

  if (observationEvidence.inspected && observationEvidence.supportStatus === "blocked") {
    failures.push("observation support status must not be blocked");
  }

  if (observationEvidence.inspected && observationEvidence.analyticsStatus === "degraded") {
    failures.push("observation analytics status must not be degraded");
  }

  if (observationEvidence.inspected && observationEvidence.errorBudgetStatus !== "within-budget") {
    failures.push("observation error budget must be within budget");
  }

  if (failures.length > 0) {
    throw new Error(`Continue decision requires clean wave outcome evidence: ${failures.join("; ")}.`);
  }
}

if ((decision === "rollback" || decision === "disable" || recordedObservationStatus === "incident" || incidentCount > 0) && !optionalText("BETA_WAVE_OUTCOME_INCIDENT_REFERENCE")) {
  throw new Error("BETA_WAVE_OUTCOME_INCIDENT_REFERENCE is required for rollback, disable, incident status, or non-zero incidents.");
}

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-beta-wave-outcome-${target}-${outcomeLabel}.json`);
const report = {
  app: "pocket-vault",
  component: "beta-wave-outcome-report",
  target,
  outcomeLabel,
  generatedAt: new Date().toISOString(),
  decision,
  observationStatus: recordedObservationStatus,
  noInvitesSent: true,
  noParticipantIdentifiersRecorded: true,
  noDeploymentPerformed: true,
  noDatabaseMutated: true,
  noTrafficMoved: true,
  noChainTransactionSent: true,
  artifacts: {
    invitationWavePlan,
    observationReport,
  },
  aggregateCounts: {
    invitedCount,
    activatedWalletCount,
    vaultCreatedCount,
    depositCount,
    withdrawCount,
    supportRequestCount,
    failedTransactionCount,
    incidentCount,
  },
  controls: {
    supportReference,
    incidentOwner,
    incidentReference: optionalText("BETA_WAVE_OUTCOME_INCIDENT_REFERENCE"),
    operator: optionalText("BETA_WAVE_OUTCOME_OPERATOR"),
    notes: optionalText("BETA_WAVE_OUTCOME_NOTES"),
  },
  evidence: {
    invitationWavePlan: waveEvidence,
    observationReport: observationEvidence,
  },
  acceptanceGates: [
    "Invitation wave plan is approved and non-sending.",
    "Post-wave observation evidence is recorded.",
    "Only aggregate counts are recorded.",
    "Participant identifiers are not recorded.",
    "Continue decisions require stable observation and zero incidents.",
    "Rollback, disable, and incident outcomes require an incident reference.",
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
  writeFileSync(process.env.GITHUB_OUTPUT, `outcome_report_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, outcomeLabel, decision, invitedCount, incidentCount }, null, 2));
