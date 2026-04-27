import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const actionValues = new Set(["promote", "rollback", "disable"]);
const remoteReferencePattern = /^https:\/\/[^\s]+$/;
const secretPattern = /(password|passwd|secret|token|credential|private[_-]?key|api[_-]?key|bearer\s+|basic\s+)/i;
const localReferencePattern = /^\.{0,2}\//;

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

const sanitizeLabel = (value) => {
  const label = value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  if (!label) {
    throw new Error("VERCEL_API_TRAFFIC_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const validateNonSecretText = (name, value) => {
  if (!value) {
    return;
  }

  if (secretPattern.test(value)) {
    throw new Error(`${name} appears to contain a secret or credential label.`);
  }

  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value) && !remoteReferencePattern.test(value)) {
    throw new Error(`${name} must use an https URL when a URL is provided.`);
  }

  if (remoteReferencePattern.test(value)) {
    const url = new URL(value);

    if (url.username || url.password) {
      throw new Error(`${name} must not include URL credentials.`);
    }
  }
};

const requireTarget = () => {
  const target = requireText("VERCEL_API_TRAFFIC_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("VERCEL_API_TRAFFIC_TARGET must be staging or production.");
  }

  return target;
};

const requireAction = () => {
  const action = requireText("VERCEL_API_TRAFFIC_ACTION");

  if (!actionValues.has(action)) {
    throw new Error("VERCEL_API_TRAFFIC_ACTION must be promote, rollback, or disable.");
  }

  return action;
};

const normalizeUrl = (name, value) => {
  if (!value) {
    return null;
  }

  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error(`${name} must use https.`);
  }

  if (url.username || url.password) {
    throw new Error(`${name} must not include URL credentials.`);
  }

  return url.toString().replace(/\/$/, "");
};

const optionalUrl = (name) => normalizeUrl(name, optionalText(name));

const requirePositiveInteger = (name, fallback) => {
  const value = Number.parseInt(readText(name, fallback), 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
};

const shellQuote = (value) => `'${value.replace(/'/g, "'\\''")}'`;

const readTrafficPlan = (trafficPlanReference) => {
  const planPath = path.resolve(process.cwd(), trafficPlanReference);

  if (!existsSync(planPath) && !localReferencePattern.test(trafficPlanReference) && !path.isAbsolute(trafficPlanReference)) {
    validateNonSecretText("VERCEL_API_TRAFFIC_PLAN", trafficPlanReference);
    return {
      reference: trafficPlanReference,
      inspected: false,
      reason: "Traffic plan reference is not a runner-local file path.",
    };
  }

  if (!existsSync(planPath)) {
    throw new Error(`VERCEL_API_TRAFFIC_PLAN was treated as a local file but does not exist: ${planPath}`);
  }

  const plan = JSON.parse(readFileSync(planPath, "utf8"));

  return {
    reference: trafficPlanReference,
    inspected: true,
    path: planPath,
    plan,
  };
};

const requireTrafficPlanMatch = ({ action, target, candidateDeploymentUrl, rollbackDeploymentUrl, productionDomain, trafficPlanEvidence }) => {
  if (!trafficPlanEvidence.inspected) {
    return [
      "Traffic plan was recorded as a remote artifact reference and could not be inspected by this command plan.",
      "Operator must compare target, action, candidate URL, rollback URL, and public API domain before executing commands.",
    ];
  }

  const plan = trafficPlanEvidence.plan;

  if (plan.app !== "goal-vault") {
    throw new Error("Traffic plan app must be goal-vault.");
  }

  if (plan.component !== "api-traffic-plan") {
    throw new Error("Traffic plan component must be api-traffic-plan.");
  }

  if (plan.target !== target) {
    throw new Error("Traffic plan target must match VERCEL_API_TRAFFIC_TARGET.");
  }

  if (plan.action !== action) {
    throw new Error("Traffic plan action must match VERCEL_API_TRAFFIC_ACTION.");
  }

  if (plan.noTrafficMoved !== true) {
    throw new Error("Traffic plan must have noTrafficMoved: true.");
  }

  if (action === "promote" && plan.urls?.candidateApiUrl !== candidateDeploymentUrl) {
    throw new Error("Traffic plan candidateApiUrl must match VERCEL_API_CANDIDATE_DEPLOYMENT_URL.");
  }

  if ((action === "promote" || action === "rollback") && rollbackDeploymentUrl && plan.urls?.rollbackApiUrl !== rollbackDeploymentUrl) {
    throw new Error("Traffic plan rollbackApiUrl must match VERCEL_API_ROLLBACK_DEPLOYMENT_URL.");
  }

  if (action === "disable" && productionDomain && plan.urls?.currentApiUrl !== productionDomain) {
    throw new Error("Traffic plan currentApiUrl must match VERCEL_API_PRODUCTION_DOMAIN for disable actions.");
  }

  return [
    "Traffic plan JSON was inspected locally.",
    "Traffic plan target, action, and noTrafficMoved boundary match this Vercel command plan.",
  ];
};

const buildCommand = (parts, scope) => {
  const command = [...parts, "--token", '"$VERCEL_TOKEN"'];

  if (scope) {
    command.push("--scope", shellQuote(scope));
  }

  return command.join(" ");
};

const buildCommands = ({ action, candidateDeploymentUrl, scope }) => {
  if (action === "promote") {
    return [
      {
        name: "promote-candidate-deployment",
        command: buildCommand(["pnpm", "dlx", "vercel", "promote", shellQuote(candidateDeploymentUrl)], scope),
        mutatesTraffic: true,
        requiresHumanApproval: true,
      },
    ];
  }

  if (action === "rollback") {
    return [
      {
        name: "rollback-production-deployment",
        command: buildCommand(["pnpm", "dlx", "vercel", "rollback"], scope),
        mutatesTraffic: true,
        requiresHumanApproval: true,
      },
    ];
  }

  return [];
};

const buildManualSteps = ({ action, observeMinutes }) => {
  if (action === "promote") {
    return [
      "Confirm Vercel project, scope, candidate deployment URL, production API domain, and traffic plan are aligned.",
      "Confirm release manifest, API preflight, data snapshot, and rollback references are available to the operator.",
      "Run the promote command from an authenticated operator workstation or approved CI job with VERCEL_TOKEN.",
      `Observe production API /health, /ready, indexer freshness, support intake, and product smoke checks for at least ${observeMinutes} minutes.`,
      "Record the promoted deployment URL and observation result with release notes.",
    ];
  }

  if (action === "rollback") {
    return [
      "Confirm the current incident reason and the previous known-good deployment reference.",
      "Run the rollback command from an authenticated operator workstation or approved CI job with VERCEL_TOKEN.",
      "Check production API /health and /ready before declaring recovery.",
      "Restore API data only from the approved rollback snapshot and only while the affected API process is stopped.",
      "Record the rollback reason, restored deployment, data handling notes, and follow-up owner.",
    ];
  }

  return [
    "Disablement is manual-only in this artifact because it depends on the selected Vercel project routing policy.",
    "Use the approved Vercel dashboard or provider API procedure to remove public API routing, protect the project, or redirect clients to degraded-state messaging.",
    "Confirm app clients no longer claim indexed freshness while public API traffic is unavailable.",
    "Preserve logs, support requests, API snapshots, and release artifacts for incident review.",
    "Record the disablement reason and re-enable criteria.",
  ];
};

const target = requireTarget();
const action = requireAction();
const label = sanitizeLabel(requireText("VERCEL_API_TRAFFIC_LABEL"));
const outputDir = readText("VERCEL_API_TRAFFIC_DIR", path.join(process.cwd(), "artifacts"));
const observeMinutes = requirePositiveInteger("VERCEL_API_TRAFFIC_OBSERVE_MINUTES", "15");
const project = requireText("VERCEL_API_PROJECT");
const scope = optionalText("VERCEL_SCOPE");
const trafficPlanReference = requireText("VERCEL_API_TRAFFIC_PLAN");
const candidateDeploymentUrl = optionalUrl("VERCEL_API_CANDIDATE_DEPLOYMENT_URL");
const rollbackDeploymentUrl = optionalUrl("VERCEL_API_ROLLBACK_DEPLOYMENT_URL");
const productionDomain = optionalUrl("VERCEL_API_PRODUCTION_DOMAIN");
const changeWindow = optionalText("VERCEL_API_TRAFFIC_CHANGE_WINDOW");
const operator = optionalText("VERCEL_API_TRAFFIC_OPERATOR");
const notes = optionalText("VERCEL_API_TRAFFIC_NOTES");

[
  ["VERCEL_API_PROJECT", project],
  ["VERCEL_SCOPE", scope],
  ["VERCEL_API_TRAFFIC_CHANGE_WINDOW", changeWindow],
  ["VERCEL_API_TRAFFIC_OPERATOR", operator],
  ["VERCEL_API_TRAFFIC_NOTES", notes],
].forEach(([name, value]) => validateNonSecretText(name, value));

if (action === "promote" && !candidateDeploymentUrl) {
  throw new Error("VERCEL_API_CANDIDATE_DEPLOYMENT_URL is required for promote command plans.");
}

if ((action === "promote" || action === "rollback") && !rollbackDeploymentUrl) {
  throw new Error("VERCEL_API_ROLLBACK_DEPLOYMENT_URL is required for promote and rollback command plans.");
}

if (!productionDomain) {
  throw new Error("VERCEL_API_PRODUCTION_DOMAIN is required.");
}

const trafficPlanEvidence = readTrafficPlan(trafficPlanReference);
const trafficPlanValidation = requireTrafficPlanMatch({
  action,
  target,
  candidateDeploymentUrl,
  rollbackDeploymentUrl,
  productionDomain,
  trafficPlanEvidence,
});

const commandPlan = {
  app: "goal-vault",
  component: "vercel-api-traffic-command",
  provider: "vercel",
  target,
  action,
  label,
  generatedAt: new Date().toISOString(),
  noDeploymentPerformed: true,
  noTrafficMoved: true,
  manualOnly: action === "disable",
  requiredSecrets: ["VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"],
  vercel: {
    project,
    scope,
    productionDomain,
    candidateDeploymentUrl,
    rollbackDeploymentUrl,
  },
  trafficPlan: {
    reference: trafficPlanEvidence.reference,
    inspected: trafficPlanEvidence.inspected,
    path: trafficPlanEvidence.path || null,
    validation: trafficPlanValidation,
  },
  controls: {
    changeWindow,
    observeMinutes,
    operator,
    notes,
  },
  preExecutionChecks: [
    "Confirm this artifact was generated after the matching API Traffic Plan artifact.",
    "Confirm Vercel project, team scope, production domain, and candidate deployment belong to the intended target environment.",
    "Confirm VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID are available only in the approved execution environment.",
    "Confirm API preflight, release manifest, support intake, data snapshot, and rollback references are available.",
  ],
  commands: buildCommands({ action, candidateDeploymentUrl, scope }),
  steps: buildManualSteps({ action, observeMinutes }),
  rollbackTriggers: [
    "Production /ready reports blocked checks after promotion.",
    "Production /health fails after promotion or rollback.",
    "Indexer freshness becomes materially stale for the release target.",
    "Create, deposit, withdraw, support intake, or metadata smoke checks fail against the public API.",
  ],
  postExecutionChecks: [
    "Check /health on the production API domain.",
    "Check /ready on the production API domain.",
    "Run product smoke checks against the app configured for this API domain.",
    "Record the final deployment URL, operator, timestamp, observation result, and rollback readiness.",
  ],
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `goal-vault-vercel-api-traffic-${target}-${action}-${label}.json`);
writeFileSync(outputPath, `${JSON.stringify(commandPlan, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `command_plan_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, action, label }, null, 2));
