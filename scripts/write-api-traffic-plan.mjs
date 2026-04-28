import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const actionValues = new Set(["promote", "rollback", "disable"]);
const imagePattern = /^[a-z0-9.-]+\/[a-z0-9._/-]+:[A-Za-z0-9._-]+$/;
const localhostValues = new Set(["127.0.0.1", "localhost", "::1"]);

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
  const target = requireText("API_TRAFFIC_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("API_TRAFFIC_TARGET must be staging or production.");
  }

  return target;
};

const requireAction = () => {
  const action = requireText("API_TRAFFIC_ACTION");

  if (!actionValues.has(action)) {
    throw new Error("API_TRAFFIC_ACTION must be promote, rollback, or disable.");
  }

  return action;
};

const normalizeUrl = (name, value, target) => {
  if (!value) {
    return null;
  }

  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error(`${name} must use https.`);
  }

  if (target === "production" && localhostValues.has(url.hostname)) {
    throw new Error(`${name} cannot point to localhost in production.`);
  }

  return url.toString().replace(/\/$/, "");
};

const optionalUrl = (name, target) => normalizeUrl(name, optionalText(name), target);

const requireImage = (name) => {
  const value = requireText(name);

  if (!imagePattern.test(value)) {
    throw new Error(`${name} must be a registry image reference with an explicit tag.`);
  }

  return value;
};

const optionalImage = (name) => {
  const value = optionalText(name);

  if (value && !imagePattern.test(value)) {
    throw new Error(`${name} must be a registry image reference with an explicit tag when set.`);
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

const sanitizeLabel = (value) => value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");

const buildPromoteSteps = (observeMinutes) => [
  "Confirm release-candidate, API image, API preflight, data snapshot, and release manifest artifacts match this plan.",
  "Confirm the candidate API host is deployed with the planned image and target environment variables.",
  "Check candidate /health and /ready before any public traffic movement.",
  "Move traffic in the selected hosting provider according to the operator-approved rollout policy.",
  `Observe /health, /ready, indexer freshness, and product smoke checks for at least ${observeMinutes} minutes.`,
  "Record the promoted URL and image with the release notes.",
];

const buildRollbackSteps = () => [
  "Stop or pause the active traffic promotion.",
  "Route public API traffic back to the rollback URL or redeploy the rollback image on the selected host.",
  "Check rollback /health and /ready before declaring recovery.",
  "Restore API data only from the planned snapshot and only while the API is stopped.",
  "Record the rollback reason, restored URL, restored image, and data handling notes.",
];

const buildDisableSteps = () => [
  "Stop public API traffic at the selected hosting provider.",
  "Keep the previous known-good API URL and image references available for recovery.",
  "Confirm app clients show degraded backend state instead of claiming indexed freshness.",
  "Preserve API data snapshots and logs for incident review.",
  "Record the disablement reason and expected re-enable conditions.",
];

const buildSteps = (action, observeMinutes) => {
  if (action === "promote") {
    return buildPromoteSteps(observeMinutes);
  }

  if (action === "rollback") {
    return buildRollbackSteps();
  }

  return buildDisableSteps();
};

const target = requireTarget();
const action = requireAction();
const planLabel = sanitizeLabel(requireText("API_TRAFFIC_PLAN_LABEL"));
const outputDir = readText("API_TRAFFIC_PLAN_DIR", path.join(process.cwd(), "artifacts"));
const observeMinutes = requirePositiveInteger("API_TRAFFIC_OBSERVE_MINUTES", "15");

const currentApiUrl = optionalUrl("API_TRAFFIC_CURRENT_URL", target);
const candidateApiUrl = optionalUrl("API_TRAFFIC_CANDIDATE_URL", target);
const rollbackApiUrl = optionalUrl("API_TRAFFIC_ROLLBACK_URL", target);
const apiImage = optionalImage("API_TRAFFIC_API_IMAGE");
const rollbackApiImage = optionalImage("API_TRAFFIC_ROLLBACK_API_IMAGE");
const releaseManifestArtifact = optionalText("API_TRAFFIC_RELEASE_MANIFEST");
const preflightReportArtifact = optionalText("API_TRAFFIC_PREFLIGHT_REPORT");
const dataSnapshotArtifact = optionalText("API_TRAFFIC_DATA_SNAPSHOT");

if (action === "promote") {
  if (!candidateApiUrl) {
    throw new Error("API_TRAFFIC_CANDIDATE_URL is required for promote plans.");
  }

  if (!rollbackApiUrl) {
    throw new Error("API_TRAFFIC_ROLLBACK_URL is required for promote plans.");
  }

  if (!apiImage) {
    throw new Error("API_TRAFFIC_API_IMAGE is required for promote plans.");
  }

  if (!rollbackApiImage) {
    throw new Error("API_TRAFFIC_ROLLBACK_API_IMAGE is required for promote plans.");
  }

  if (!releaseManifestArtifact) {
    throw new Error("API_TRAFFIC_RELEASE_MANIFEST is required for promote plans.");
  }

  if (!preflightReportArtifact) {
    throw new Error("API_TRAFFIC_PREFLIGHT_REPORT is required for promote plans.");
  }

  if (!dataSnapshotArtifact) {
    throw new Error("API_TRAFFIC_DATA_SNAPSHOT is required for promote plans.");
  }
}

if (action === "rollback") {
  if (!rollbackApiUrl) {
    throw new Error("API_TRAFFIC_ROLLBACK_URL is required for rollback plans.");
  }

  if (!rollbackApiImage) {
    throw new Error("API_TRAFFIC_ROLLBACK_API_IMAGE is required for rollback plans.");
  }
}

if (action === "disable" && !currentApiUrl) {
  throw new Error("API_TRAFFIC_CURRENT_URL is required for disable plans.");
}

const plan = {
  app: "pocket-vault",
  component: "api-traffic-plan",
  target,
  action,
  planLabel,
  generatedAt: new Date().toISOString(),
  noTrafficMoved: true,
  urls: {
    currentApiUrl,
    candidateApiUrl,
    rollbackApiUrl,
  },
  images: {
    apiImage,
    rollbackApiImage,
  },
  artifacts: {
    releaseManifest: releaseManifestArtifact,
    preflightReport: preflightReportArtifact,
    dataSnapshot: dataSnapshotArtifact,
  },
  controls: {
    changeWindow: optionalText("API_TRAFFIC_CHANGE_WINDOW"),
    observeMinutes,
    operator: optionalText("API_TRAFFIC_OPERATOR"),
    notes: optionalText("API_TRAFFIC_NOTES"),
  },
  steps: buildSteps(action, observeMinutes),
  rollback: {
    triggerConditions: [
      "API /ready reports blocked checks after traffic movement.",
      "API /health fails after traffic movement.",
      "Indexer freshness or activity reads become materially stale for the release target.",
      "Create, deposit, withdraw, or metadata smoke checks fail against the promoted API.",
    ],
    steps: buildRollbackSteps(),
  },
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-api-traffic-${target}-${action}-${planLabel}.json`);
writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `plan_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, action, planLabel }, null, 2));
