import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const decisionValues = new Set(["graduate", "extend-beta", "hold", "rollback", "disable"]);
const readinessValues = new Set(["ready", "watch", "blocked"]);

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
    throw new Error("BETA_GRADUATION_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const requireTarget = () => {
  const target = requireText("BETA_GRADUATION_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("BETA_GRADUATION_TARGET must be staging or production.");
  }

  return target;
};

const requireDecision = () => {
  const decision = requireText("BETA_GRADUATION_DECISION");

  if (!decisionValues.has(decision)) {
    throw new Error("BETA_GRADUATION_DECISION must be graduate, extend-beta, hold, rollback, or disable.");
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

const requireNonNegativeInteger = (name, fallback) => {
  const value = Number.parseInt(readText(name, fallback), 10);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
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

const inspectExpansionDecision = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_GRADUATION_EXPANSION_DECISION");

  if (!result.inspected) {
    return result;
  }

  const report = result.parsed;
  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: report.target,
    expansionLabel: report.expansionLabel,
    decision: report.decision,
    expansionApproved: report.expansionApproved === true,
    noInvitesSent: report.noInvitesSent === true,
    noParticipantIdentifiersRecorded: report.noParticipantIdentifiersRecorded === true,
    projectedParticipantCount: report.capacity?.projectedParticipantCount ?? null,
    participantLimit: report.capacity?.participantLimit ?? null,
    openSupportRequestCount: report.capacity?.openSupportRequestCount ?? null,
    unresolvedIncidentCount: report.capacity?.unresolvedIncidentCount ?? null,
    failedTransactionCount: report.capacity?.failedTransactionCount ?? null,
    supportBacklogStatus: report.capacity?.supportBacklogStatus ?? null,
    operatorCapacityStatus: report.capacity?.operatorCapacityStatus ?? null,
    retentionReviewAccepted: report.reviews?.retentionReviewAccepted === true,
    supportReviewAccepted: report.reviews?.supportReviewAccepted === true,
    privacyReviewAccepted: report.reviews?.privacyReviewAccepted === true,
    supportReference: report.controls?.supportReference ?? null,
    incidentOwner: report.controls?.incidentOwner ?? null,
    expansionOwner: report.controls?.expansionOwner ?? null,
  };
  const failures = [];

  if (report?.app !== "pocket-vault" || report?.component !== "beta-expansion-decision-report") {
    failures.push("expansion decision component is not beta-expansion-decision-report");
  }

  if (evidence.target !== target) {
    failures.push("expansion decision target does not match graduation target");
  }

  if (!evidence.noInvitesSent || !evidence.noParticipantIdentifiersRecorded) {
    failures.push("expansion decision must preserve non-sending and non-PII boundaries");
  }

  if (!evidence.supportReference || !evidence.incidentOwner || !evidence.expansionOwner) {
    failures.push("expansion decision must include support reference, incident owner, and expansion owner");
  }

  if (failures.length > 0) {
    throw new Error(`Beta graduation requires accepted expansion evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectWaveOutcome = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_GRADUATION_LATEST_WAVE_OUTCOME");

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
    failures.push("latest wave outcome target does not match graduation target");
  }

  if (!evidence.noParticipantIdentifiersRecorded) {
    failures.push("latest wave outcome must not record participant identifiers");
  }

  if (!evidence.supportReference || !evidence.incidentOwner) {
    failures.push("latest wave outcome must include support reference and incident owner");
  }

  if (failures.length > 0) {
    throw new Error(`Beta graduation requires accepted wave outcome evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const inspectRetentionPlan = ({ reference, target }) => {
  const result = readLocalJsonArtifact(reference, "BETA_GRADUATION_RETENTION_PLAN");

  if (!result.inspected) {
    return result;
  }

  const plan = result.parsed;
  const evidence = {
    inspected: true,
    reference,
    path: result.path,
    target: plan.target,
    noLiveDataRead: plan.noLiveDataRead === true,
    noDataDeleted: plan.noDataDeleted === true,
    noRetentionPolicyApplied: plan.noRetentionPolicyApplied === true,
    commitAllowed: plan.commitAllowed === false,
    policyOwner: plan.controls?.policyOwner ?? null,
    supportOwner: plan.controls?.supportOwner ?? null,
    incidentOwner: plan.controls?.incidentOwner ?? null,
  };
  const failures = [];

  if (plan?.app !== "pocket-vault" || plan?.component !== "beta-data-retention-plan") {
    failures.push("retention component is not beta-data-retention-plan");
  }

  if (evidence.target !== target) {
    failures.push("retention target does not match graduation target");
  }

  if (!evidence.noLiveDataRead || !evidence.noDataDeleted || !evidence.noRetentionPolicyApplied || !evidence.commitAllowed) {
    failures.push("retention evidence must preserve planning-only and non-committable boundaries");
  }

  if (!evidence.policyOwner || !evidence.supportOwner || !evidence.incidentOwner) {
    failures.push("retention evidence must include policy, support, and incident owners");
  }

  if (failures.length > 0) {
    throw new Error(`Beta graduation requires accepted retention evidence: ${failures.join("; ")}.`);
  }

  return evidence;
};

const buildNextActions = (decision) => {
  if (decision === "graduate") {
    return [
      "Store this graduation decision with beta outcome, expansion, retention, support, privacy, and reliability evidence.",
      "Prepare public launch planning artifacts without changing production traffic automatically.",
      "Generate a fresh release manifest, preflight, traffic plan, smoke, activation, and observation record before public launch.",
    ];
  }

  if (decision === "extend-beta") {
    return [
      "Keep the product in limited beta.",
      "Generate another observation report, invitation wave plan, wave outcome report, and expansion decision before increasing access.",
      "Review support, privacy, retention, reliability, and communication readiness before graduation is reconsidered.",
    ];
  }

  if (decision === "hold") {
    return [
      "Hold graduation and additional expansion.",
      "Resolve support, privacy, retention, reliability, store, or communication blockers.",
      "Generate a new graduation decision report after blockers are resolved.",
    ];
  }

  if (decision === "rollback") {
    return [
      "Hold graduation and additional expansion.",
      "Use approved rollback artifacts before changing traffic or restoring data.",
      "Record the rollback reason and aggregate affected counts in the incident system.",
      "Generate fresh beta evidence before reconsidering graduation.",
    ];
  }

  return [
    "Hold graduation and additional expansion.",
    "Use approved disablement artifacts before removing public API access.",
    "Confirm app clients show honest degraded backend messaging.",
    "Generate fresh beta evidence before reconsidering graduation.",
  ];
};

const target = requireTarget();
const graduationLabel = sanitizeLabel(requireText("BETA_GRADUATION_LABEL"));
const decision = requireDecision();
const expansionDecision = requireText("BETA_GRADUATION_EXPANSION_DECISION");
const latestWaveOutcome = requireText("BETA_GRADUATION_LATEST_WAVE_OUTCOME");
const retentionPlan = requireText("BETA_GRADUATION_RETENTION_PLAN");
const participantCount = requireNonNegativeInteger("BETA_GRADUATION_PARTICIPANT_COUNT", "0");
const minimumParticipantCount = requirePositiveInteger("BETA_GRADUATION_MINIMUM_PARTICIPANT_COUNT", "1");
const openSupportRequestCount = requireNonNegativeInteger("BETA_GRADUATION_OPEN_SUPPORT_REQUEST_COUNT", "0");
const unresolvedIncidentCount = requireNonNegativeInteger("BETA_GRADUATION_UNRESOLVED_INCIDENT_COUNT", "0");
const failedTransactionCount = requireNonNegativeInteger("BETA_GRADUATION_FAILED_TRANSACTION_COUNT", "0");
const supportReadiness = requireSetValue("BETA_GRADUATION_SUPPORT_READINESS", readinessValues, "watch");
const privacyReadiness = requireSetValue("BETA_GRADUATION_PRIVACY_READINESS", readinessValues, "watch");
const reliabilityReadiness = requireSetValue("BETA_GRADUATION_RELIABILITY_READINESS", readinessValues, "watch");
const communicationsReadiness = requireSetValue("BETA_GRADUATION_COMMUNICATIONS_READINESS", readinessValues, "watch");
const storeReadiness = requireSetValue("BETA_GRADUATION_STORE_READINESS", readinessValues, "watch");
const supportReviewAccepted = requireBoolean("BETA_GRADUATION_SUPPORT_REVIEW_ACCEPTED", "false");
const privacyReviewAccepted = requireBoolean("BETA_GRADUATION_PRIVACY_REVIEW_ACCEPTED", "false");
const reliabilityReviewAccepted = requireBoolean("BETA_GRADUATION_RELIABILITY_REVIEW_ACCEPTED", "false");
const retentionReviewAccepted = requireBoolean("BETA_GRADUATION_RETENTION_REVIEW_ACCEPTED", "false");
const communicationsReviewAccepted = requireBoolean("BETA_GRADUATION_COMMUNICATIONS_REVIEW_ACCEPTED", "false");
const participantIdentifiersRecorded = requireBoolean("BETA_GRADUATION_PARTICIPANT_IDENTIFIERS_RECORDED", "false");
const supportReference = requireText("BETA_GRADUATION_SUPPORT_REFERENCE");
const incidentOwner = requireText("BETA_GRADUATION_INCIDENT_OWNER");
const graduationOwner = requireText("BETA_GRADUATION_OWNER");
const confirmReport = requireText("BETA_GRADUATION_CONFIRM_REPORT");
const outputDir = readText("BETA_GRADUATION_DIR", path.join(process.cwd(), "artifacts"));

if (confirmReport !== "report") {
  throw new Error("BETA_GRADUATION_CONFIRM_REPORT must be report.");
}

if (participantIdentifiersRecorded) {
  throw new Error("BETA_GRADUATION_PARTICIPANT_IDENTIFIERS_RECORDED must be false.");
}

const expansionEvidence = inspectExpansionDecision({ reference: expansionDecision, target });
const waveOutcomeEvidence = inspectWaveOutcome({ reference: latestWaveOutcome, target });
const retentionEvidence = inspectRetentionPlan({ reference: retentionPlan, target });

if (expansionEvidence.inspected && supportReference !== expansionEvidence.supportReference) {
  throw new Error("BETA_GRADUATION_SUPPORT_REFERENCE does not match expansion support reference.");
}

if (expansionEvidence.inspected && incidentOwner !== expansionEvidence.incidentOwner) {
  throw new Error("BETA_GRADUATION_INCIDENT_OWNER does not match expansion incident owner.");
}

if (waveOutcomeEvidence.inspected && supportReference !== waveOutcomeEvidence.supportReference) {
  throw new Error("BETA_GRADUATION_SUPPORT_REFERENCE does not match wave outcome support reference.");
}

if (waveOutcomeEvidence.inspected && incidentOwner !== waveOutcomeEvidence.incidentOwner) {
  throw new Error("BETA_GRADUATION_INCIDENT_OWNER does not match wave outcome incident owner.");
}

if ((decision === "rollback" || decision === "disable" || unresolvedIncidentCount > 0) && !optionalText("BETA_GRADUATION_INCIDENT_REFERENCE")) {
  throw new Error("BETA_GRADUATION_INCIDENT_REFERENCE is required for rollback, disable, or unresolved incidents.");
}

if (decision === "graduate") {
  const failures = [];

  if (expansionEvidence.inspected && expansionEvidence.decision !== "expand") {
    failures.push("latest expansion decision must be expand");
  }

  if (waveOutcomeEvidence.inspected && waveOutcomeEvidence.decision !== "continue") {
    failures.push("latest wave outcome decision must be continue");
  }

  if (waveOutcomeEvidence.inspected && waveOutcomeEvidence.observationStatus !== "stable") {
    failures.push("latest wave outcome observation status must be stable");
  }

  if (participantCount < minimumParticipantCount) {
    failures.push("participant count must meet the minimum graduation sample");
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

  [
    ["support readiness", supportReadiness],
    ["privacy readiness", privacyReadiness],
    ["reliability readiness", reliabilityReadiness],
    ["communications readiness", communicationsReadiness],
    ["store readiness", storeReadiness],
  ].forEach(([label, value]) => {
    if (value !== "ready") {
      failures.push(`${label} must be ready`);
    }
  });

  if (!supportReviewAccepted || !privacyReviewAccepted || !reliabilityReviewAccepted || !retentionReviewAccepted || !communicationsReviewAccepted) {
    failures.push("support, privacy, reliability, retention, and communications reviews must be accepted");
  }

  if (failures.length > 0) {
    throw new Error(`Graduate decision requires clean beta graduation evidence: ${failures.join("; ")}.`);
  }
}

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-beta-graduation-decision-${target}-${graduationLabel}.json`);
const report = {
  app: "pocket-vault",
  component: "beta-graduation-decision-report",
  target,
  graduationLabel,
  generatedAt: new Date().toISOString(),
  decision,
  graduationApproved: decision === "graduate",
  noPublicLaunchPerformed: true,
  noInvitesSent: true,
  noParticipantIdentifiersRecorded: true,
  noDeploymentPerformed: true,
  noDatabaseMutated: true,
  noTrafficMoved: true,
  noChainTransactionSent: true,
  artifacts: {
    expansionDecision,
    latestWaveOutcome,
    retentionPlan,
  },
  aggregateSignals: {
    participantCount,
    minimumParticipantCount,
    openSupportRequestCount,
    unresolvedIncidentCount,
    failedTransactionCount,
  },
  readiness: {
    supportReadiness,
    privacyReadiness,
    reliabilityReadiness,
    communicationsReadiness,
    storeReadiness,
  },
  reviews: {
    supportReviewAccepted,
    privacyReviewAccepted,
    reliabilityReviewAccepted,
    retentionReviewAccepted,
    communicationsReviewAccepted,
    participantIdentifiersRecorded: false,
  },
  controls: {
    supportReference,
    incidentOwner,
    graduationOwner,
    incidentReference: optionalText("BETA_GRADUATION_INCIDENT_REFERENCE"),
    operator: optionalText("BETA_GRADUATION_OPERATOR"),
    notes: optionalText("BETA_GRADUATION_NOTES"),
  },
  evidence: {
    expansionDecision: expansionEvidence,
    latestWaveOutcome: waveOutcomeEvidence,
    retentionPlan: retentionEvidence,
  },
  acceptanceGates: [
    "Latest beta expansion decision evidence is present.",
    "Latest beta wave outcome evidence is present.",
    "Beta data retention evidence is present.",
    "Graduate decisions require expansion decision expand, latest wave outcome continue, stable observation, minimum participant sample, zero open support requests, zero unresolved incidents, zero failed transactions, ready support/privacy/reliability/communications/store readiness, and accepted support/privacy/reliability/retention/communications reviews.",
    "Extend-beta and hold decisions block public launch until a new graduation decision is recorded.",
    "Rollback and disable decisions require an incident reference.",
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
  writeFileSync(process.env.GITHUB_OUTPUT, `graduation_report_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, graduationLabel, decision, participantCount }, null, 2));
