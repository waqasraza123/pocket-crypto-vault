import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const reviewCadenceValues = new Set(["weekly", "monthly", "quarterly"]);
const secretPattern = /(password|passwd|secret|token|credential|private[_-]?key|api[_-]?key|mnemonic|seed phrase|recovery phrase|bearer\s+|basic\s+)/i;

const retentionDefaults = {
  supportRequestsDays: "180",
  supportExportsDays: "30",
  analyticsEventsDays: "180",
  apiSnapshotsDays: "30",
  managedDatabaseExportsDays: "14",
  releaseArtifactsDays: "365",
  runtimeLogsDays: "30",
  incidentRecordsDays: "730",
};

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

const requireTarget = () => {
  const value = requireText("BETA_DATA_RETENTION_TARGET");

  if (!targetValues.has(value)) {
    throw new Error("BETA_DATA_RETENTION_TARGET must be staging or production.");
  }

  return value;
};

const optionalSetValue = (name, allowedValues, fallback) => {
  const value = readText(name, fallback);

  if (!allowedValues.has(value)) {
    throw new Error(`${name} must be one of ${Array.from(allowedValues).join(", ")}.`);
  }

  return value;
};

const sanitizeLabel = (value) => {
  const label = value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  if (!label) {
    throw new Error("BETA_DATA_RETENTION_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const requirePositiveInteger = (name, fallback, maximum) => {
  const value = Number.parseInt(readText(name, fallback), 10);

  if (!Number.isInteger(value) || value <= 0 || value > maximum) {
    throw new Error(`${name} must be a positive integer no greater than ${maximum}.`);
  }

  return value;
};

const validateNonSecretText = (name, value) => {
  if (!value) {
    return;
  }

  if (secretPattern.test(value)) {
    throw new Error(`${name} appears to contain sensitive credential text.`);
  }

  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)) {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      throw new Error(`${name} must use https when a URL is provided.`);
    }

    if (url.username || url.password) {
      throw new Error(`${name} must not include URL credentials.`);
    }
  }
};

const addDaysDescription = (days) => `${days} days`;

const buildRetentionClasses = (windows) => [
  {
    name: "onchain-vault-events",
    examples: ["Vault creation events", "deposits", "withdrawals", "rule-state events"],
    retention: "Public chain data is immutable and outside application deletion control.",
    deletionAction: "Remove local index copies only when rebuilding or decommissioning API persistence.",
    containsPrivateUserContent: false,
    deletionByUserRequest: false,
  },
  {
    name: "vault-display-metadata",
    examples: ["goal name", "goal note", "target amount display context"],
    retention: "Retain while the vault is active or while needed for beta support and rollback.",
    deletionAction: "Delete or redact application-owned metadata rows after explicit owner request and support review.",
    containsPrivateUserContent: true,
    deletionByUserRequest: true,
  },
  {
    name: "support-requests",
    examples: ["support subject", "support message", "optional contact email", "wallet/runtime context"],
    retention: addDaysDescription(windows.supportRequestsDays),
    deletionAction: "Delete or redact closed requests after the retention window unless incident or legal hold is active.",
    containsPrivateUserContent: true,
    deletionByUserRequest: true,
  },
  {
    name: "support-exports",
    examples: ["summary JSONL", "private JSONL", "support export manifest"],
    retention: addDaysDescription(windows.supportExportsDays),
    deletionAction: "Delete from operational storage after review window; never commit to repository.",
    containsPrivateUserContent: true,
    deletionByUserRequest: true,
  },
  {
    name: "analytics-events",
    examples: ["route context", "wallet status", "environment", "non-freeform event properties"],
    retention: addDaysDescription(windows.analyticsEventsDays),
    deletionAction: "Delete event rows after aggregate review and beta metrics extraction.",
    containsPrivateUserContent: false,
    deletionByUserRequest: true,
  },
  {
    name: "api-data-snapshots",
    examples: ["SQLite snapshot files", "snapshot manifest", "restore source artifacts"],
    retention: addDaysDescription(windows.apiSnapshotsDays),
    deletionAction: "Delete snapshots after rollback window closes and newer recovery evidence exists.",
    containsPrivateUserContent: true,
    deletionByUserRequest: true,
  },
  {
    name: "managed-database-exports",
    examples: ["JSONL table exports", "import SQL handoffs", "export manifests"],
    retention: addDaysDescription(windows.managedDatabaseExportsDays),
    deletionAction: "Delete after import, parity review, and rollback decision are complete.",
    containsPrivateUserContent: true,
    deletionByUserRequest: true,
  },
  {
    name: "release-artifacts",
    examples: ["release manifest", "traffic plan", "Vercel command plan", "beta readiness plan"],
    retention: addDaysDescription(windows.releaseArtifactsDays),
    deletionAction: "Retain for release audit unless artifact contains private operational data.",
    containsPrivateUserContent: false,
    deletionByUserRequest: false,
  },
  {
    name: "runtime-logs",
    examples: ["API request logs", "provider runtime logs", "container logs"],
    retention: addDaysDescription(windows.runtimeLogsDays),
    deletionAction: "Delete through provider log retention controls; avoid logging support bodies or secrets.",
    containsPrivateUserContent: false,
    deletionByUserRequest: true,
  },
  {
    name: "incident-records",
    examples: ["incident notes", "operator timeline", "support escalation summary"],
    retention: addDaysDescription(windows.incidentRecordsDays),
    deletionAction: "Retain final incident summary; remove copied private support bodies and contact details.",
    containsPrivateUserContent: true,
    deletionByUserRequest: true,
  },
];

const buildReviewChecklist = (target) => [
  "Confirm support intake does not request seed phrases, private keys, recovery phrases, credentials, or secret RPC URLs.",
  "Confirm support exports are stored only in approved operational storage and are not committed.",
  "Confirm API data snapshots are deleted after the rollback window unless a production incident requires hold.",
  "Confirm analytics events avoid freeform private vault content.",
  "Confirm provider log retention is configured before inviting a broader beta cohort.",
  `Confirm ${target} operators know who owns deletion requests, retention exceptions, and incident holds.`,
];

const target = requireTarget();
const label = sanitizeLabel(requireText("BETA_DATA_RETENTION_LABEL"));
const outputDir = readText("BETA_DATA_RETENTION_DIR", path.join(process.cwd(), "artifacts/beta-data-retention"));
const reviewCadence = optionalSetValue("BETA_DATA_RETENTION_REVIEW_CADENCE", reviewCadenceValues, "monthly");
const policyOwner = requireText("BETA_DATA_RETENTION_POLICY_OWNER");
const supportOwner = requireText("BETA_DATA_RETENTION_SUPPORT_OWNER");
const incidentOwner = requireText("BETA_DATA_RETENTION_INCIDENT_OWNER");
const snapshotReference = requireText("BETA_DATA_RETENTION_SNAPSHOT_REFERENCE");
const supportExportReference = requireText("BETA_DATA_RETENTION_SUPPORT_EXPORT_REFERENCE");
const readinessReference = optionalText("BETA_DATA_RETENTION_READINESS_REFERENCE");
const notes = optionalText("BETA_DATA_RETENTION_NOTES");

[
  ["BETA_DATA_RETENTION_POLICY_OWNER", policyOwner],
  ["BETA_DATA_RETENTION_SUPPORT_OWNER", supportOwner],
  ["BETA_DATA_RETENTION_INCIDENT_OWNER", incidentOwner],
  ["BETA_DATA_RETENTION_SNAPSHOT_REFERENCE", snapshotReference],
  ["BETA_DATA_RETENTION_SUPPORT_EXPORT_REFERENCE", supportExportReference],
  ["BETA_DATA_RETENTION_READINESS_REFERENCE", readinessReference],
  ["BETA_DATA_RETENTION_NOTES", notes],
].forEach(([name, value]) => validateNonSecretText(name, value));

const windows = {
  supportRequestsDays: requirePositiveInteger("BETA_DATA_RETENTION_SUPPORT_REQUESTS_DAYS", retentionDefaults.supportRequestsDays, 3650),
  supportExportsDays: requirePositiveInteger("BETA_DATA_RETENTION_SUPPORT_EXPORTS_DAYS", retentionDefaults.supportExportsDays, 365),
  analyticsEventsDays: requirePositiveInteger("BETA_DATA_RETENTION_ANALYTICS_EVENTS_DAYS", retentionDefaults.analyticsEventsDays, 3650),
  apiSnapshotsDays: requirePositiveInteger("BETA_DATA_RETENTION_API_SNAPSHOTS_DAYS", retentionDefaults.apiSnapshotsDays, 365),
  managedDatabaseExportsDays: requirePositiveInteger(
    "BETA_DATA_RETENTION_MANAGED_DATABASE_EXPORTS_DAYS",
    retentionDefaults.managedDatabaseExportsDays,
    365,
  ),
  releaseArtifactsDays: requirePositiveInteger("BETA_DATA_RETENTION_RELEASE_ARTIFACTS_DAYS", retentionDefaults.releaseArtifactsDays, 3650),
  runtimeLogsDays: requirePositiveInteger("BETA_DATA_RETENTION_RUNTIME_LOGS_DAYS", retentionDefaults.runtimeLogsDays, 365),
  incidentRecordsDays: requirePositiveInteger("BETA_DATA_RETENTION_INCIDENT_RECORDS_DAYS", retentionDefaults.incidentRecordsDays, 3650),
};

const plan = {
  app: "pocket-vault",
  component: "beta-data-retention-plan",
  target,
  label,
  generatedAt: new Date().toISOString(),
  noLiveDataRead: true,
  noDataDeleted: true,
  noRetentionPolicyApplied: true,
  commitAllowed: false,
  controls: {
    policyOwner,
    supportOwner,
    incidentOwner,
    reviewCadence,
    notes,
  },
  evidence: {
    apiDataSnapshot: snapshotReference,
    betaSupportExport: supportExportReference,
    betaReadiness: readinessReference,
  },
  windows,
  dataClasses: buildRetentionClasses(windows),
  deletionRequestFlow: [
    "Receive request through approved support or privacy channel.",
    "Verify requester control of the relevant wallet or contact route without asking for secrets.",
    "Identify mutable application-owned records; do not promise deletion of immutable public chain data.",
    "Apply deletion or redaction through approved operational access after backup and rollback impact review.",
    "Record a minimal deletion receipt without copying private request content.",
  ],
  legalHoldFlow: [
    "Assign incident owner before pausing deletion.",
    "Record affected data classes, reason, start timestamp, and expected review date.",
    "Limit access to held support exports, snapshots, and incident records.",
    "Resume deletion schedule when hold is released.",
  ],
  operatorChecklist: buildReviewChecklist(target),
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-beta-data-retention-${target}-${label}.json`);
writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `plan_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, label, reviewCadence }, null, 2));
