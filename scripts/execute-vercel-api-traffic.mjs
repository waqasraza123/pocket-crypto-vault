import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const actionValues = new Set(["promote", "rollback"]);
const secretPattern = /(password|passwd|secret|token|credential|private[_-]?key|api[_-]?key|bearer\s+|basic\s+)/i;

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
    throw new Error("VERCEL_API_TRAFFIC_EXECUTION_LABEL must contain at least one alphanumeric character.");
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
};

const normalizeUrl = (name, value) => {
  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error(`${name} must use https.`);
  }

  if (url.username || url.password) {
    throw new Error(`${name} must not include URL credentials.`);
  }

  return url.toString().replace(/\/$/, "");
};

const requireTarget = () => {
  const target = requireText("VERCEL_API_TRAFFIC_EXECUTION_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("VERCEL_API_TRAFFIC_EXECUTION_TARGET must be staging or production.");
  }

  return target;
};

const readCommandPlan = (planReference, target) => {
  const planPath = path.resolve(planReference);

  if (!existsSync(planPath)) {
    throw new Error(`VERCEL_API_TRAFFIC_COMMAND_PLAN does not exist: ${planPath}`);
  }

  const plan = JSON.parse(readFileSync(planPath, "utf8"));

  if (plan.component !== "vercel-api-traffic-command") {
    throw new Error("Command plan component must be vercel-api-traffic-command.");
  }

  if (plan.provider !== "vercel") {
    throw new Error("Command plan provider must be vercel.");
  }

  if (plan.target !== target) {
    throw new Error("Command plan target must match execution target.");
  }

  if (!actionValues.has(plan.action)) {
    throw new Error("Only promote and rollback command plans can be executed.");
  }

  if (plan.noTrafficMoved !== true || plan.noDeploymentPerformed !== true) {
    throw new Error("Command plan must be a non-mutating generated artifact.");
  }

  if (!Array.isArray(plan.commands) || plan.commands.length !== 1) {
    throw new Error("Command plan must include exactly one executable command.");
  }

  const command = plan.commands[0].command;

  if (typeof command !== "string" || !command.startsWith("pnpm dlx vercel ")) {
    throw new Error("Command plan command must be a pnpm dlx vercel command.");
  }

  return {
    path: planPath,
    plan,
    command,
  };
};

const runCommand = (command) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({
          exitCode: code,
          stdoutBytes: Buffer.byteLength(stdout),
          stderrBytes: Buffer.byteLength(stderr),
        });
        return;
      }

      reject(new Error(`Vercel command failed with exit code ${code}.`));
    });
  });

const checkEndpoint = async (baseUrl, pathname) => {
  const url = `${baseUrl}${pathname}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  return {
    url,
    ok: response.ok,
    status: response.status,
  };
};

const target = requireTarget();
const label = sanitizeLabel(requireText("VERCEL_API_TRAFFIC_EXECUTION_LABEL"));
const commandPlan = readCommandPlan(requireText("VERCEL_API_TRAFFIC_COMMAND_PLAN"), target);
const confirmExecute = requireText("VERCEL_API_TRAFFIC_CONFIRM_EXECUTE");
const productionDomain = normalizeUrl("VERCEL_API_PRODUCTION_DOMAIN", requireText("VERCEL_API_PRODUCTION_DOMAIN"));
const operator = optionalText("VERCEL_API_TRAFFIC_OPERATOR");
const outputDir = readText("VERCEL_API_TRAFFIC_EXECUTION_DIR", path.join(process.cwd(), "artifacts"));

validateNonSecretText("VERCEL_API_TRAFFIC_OPERATOR", operator);

if (confirmExecute !== "execute") {
  throw new Error("VERCEL_API_TRAFFIC_CONFIRM_EXECUTE must be execute.");
}

if (!process.env.VERCEL_TOKEN) {
  throw new Error("VERCEL_TOKEN is required for Vercel traffic execution.");
}

if (commandPlan.plan.vercel?.productionDomain !== productionDomain) {
  throw new Error("Command plan productionDomain must match VERCEL_API_PRODUCTION_DOMAIN.");
}

const startedAt = new Date().toISOString();
const commandResult = await runCommand(commandPlan.command);
const health = await checkEndpoint(productionDomain, "/health");
const ready = await checkEndpoint(productionDomain, "/ready");

if (!health.ok || !ready.ok) {
  throw new Error("Post-execution API health checks failed.");
}

const finishedAt = new Date().toISOString();

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-vercel-api-traffic-execute-${target}-${commandPlan.plan.action}-${label}.json`);
const result = {
  app: "pocket-vault",
  component: "vercel-api-traffic-execution",
  provider: "vercel",
  target,
  action: commandPlan.plan.action,
  label,
  operator,
  startedAt,
  finishedAt,
  trafficMoved: true,
  credentialsRedacted: true,
  commandPlan: {
    path: commandPlan.path,
    label: commandPlan.plan.label,
    action: commandPlan.plan.action,
    productionDomain,
    candidateDeploymentUrl: commandPlan.plan.vercel?.candidateDeploymentUrl ?? null,
    rollbackDeploymentUrl: commandPlan.plan.vercel?.rollbackDeploymentUrl ?? null,
  },
  commandResult,
  checks: {
    health,
    ready,
  },
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `result_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, action: commandPlan.plan.action, label }, null, 2));
