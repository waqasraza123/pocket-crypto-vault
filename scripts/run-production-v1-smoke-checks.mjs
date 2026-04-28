import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const rulePathValues = new Set(["timeLock", "cooldownUnlock", "guardianApproval", "notApplicable"]);
const addressPattern = /^0x[a-fA-F0-9]{40}$/;
const hashPattern = /^0x[a-fA-F0-9]{64}$/;
const secretPattern = /(password|passwd|secret|token|credential|private[_-]?key|api[_-]?key|bearer\s+|basic\s+|mnemonic|seed phrase)/i;

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
    throw new Error("PRODUCTION_V1_SMOKE_LABEL must contain at least one alphanumeric character.");
  }

  return label;
};

const validateNonSecretText = (name, value) => {
  if (!value) {
    return;
  }

  if (secretPattern.test(value)) {
    throw new Error(`${name} appears to contain a secret.`);
  }
};

const normalizeUrl = (name, value) => {
  const url = new URL(value);

  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error(`${name} must use https outside local development.`);
  }

  if (url.username || url.password) {
    throw new Error(`${name} must not include URL credentials.`);
  }

  return url.toString().replace(/\/$/, "");
};

const requireTarget = () => {
  const target = requireText("PRODUCTION_V1_SMOKE_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("PRODUCTION_V1_SMOKE_TARGET must be staging or production.");
  }

  return target;
};

const optionalHash = (name) => {
  const value = optionalText(name);

  if (value && !hashPattern.test(value)) {
    throw new Error(`${name} must be an EVM transaction hash.`);
  }

  return value;
};

const optionalAddress = (name) => {
  const value = optionalText(name);

  if (value && !addressPattern.test(value)) {
    throw new Error(`${name} must be an EVM address.`);
  }

  return value;
};

const optionalBooleanEvidence = (name) => {
  const value = optionalText(name);

  if (!value) {
    return false;
  }

  if (!["true", "1", "yes"].includes(value)) {
    throw new Error(`${name} must be true, 1, or yes when evidence is accepted.`);
  }

  return true;
};

const optionalRulePath = () => {
  const value = optionalText("PRODUCTION_V1_SMOKE_RULE_PATH") || "notApplicable";

  if (!rulePathValues.has(value)) {
    throw new Error("PRODUCTION_V1_SMOKE_RULE_PATH must be timeLock, cooldownUnlock, guardianApproval, or notApplicable.");
  }

  return value;
};

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
const label = sanitizeLabel(requireText("PRODUCTION_V1_SMOKE_LABEL"));
const apiBaseUrl = normalizeUrl("PRODUCTION_V1_SMOKE_API_BASE_URL", requireText("PRODUCTION_V1_SMOKE_API_BASE_URL"));
const appUrl = optionalText("PRODUCTION_V1_SMOKE_APP_URL");
const operator = optionalText("PRODUCTION_V1_SMOKE_OPERATOR");
const notes = optionalText("PRODUCTION_V1_SMOKE_NOTES");
const confirmSmoke = requireText("PRODUCTION_V1_SMOKE_CONFIRM");
const outputDir = readText("PRODUCTION_V1_SMOKE_DIR", path.join(process.cwd(), "artifacts"));

validateNonSecretText("PRODUCTION_V1_SMOKE_APP_URL", appUrl);
validateNonSecretText("PRODUCTION_V1_SMOKE_OPERATOR", operator);
validateNonSecretText("PRODUCTION_V1_SMOKE_NOTES", notes);

if (confirmSmoke !== "smoke") {
  throw new Error("PRODUCTION_V1_SMOKE_CONFIRM must be smoke.");
}

const evidence = {
  walletAddress: optionalAddress("PRODUCTION_V1_SMOKE_WALLET_ADDRESS"),
  vaultAddress: optionalAddress("PRODUCTION_V1_SMOKE_VAULT_ADDRESS"),
  createTxHash: optionalHash("PRODUCTION_V1_SMOKE_CREATE_TX_HASH"),
  depositTxHash: optionalHash("PRODUCTION_V1_SMOKE_DEPOSIT_TX_HASH"),
  rulePath: optionalRulePath(),
  unlockRequestTxHash: optionalHash("PRODUCTION_V1_SMOKE_UNLOCK_REQUEST_TX_HASH"),
  guardianDecisionTxHash: optionalHash("PRODUCTION_V1_SMOKE_GUARDIAN_DECISION_TX_HASH"),
  withdrawTxHash: optionalHash("PRODUCTION_V1_SMOKE_WITHDRAW_TX_HASH"),
  supportRequestId: optionalText("PRODUCTION_V1_SMOKE_SUPPORT_REQUEST_ID"),
  dashboardVerified: optionalBooleanEvidence("PRODUCTION_V1_SMOKE_DASHBOARD_VERIFIED"),
  detailVerified: optionalBooleanEvidence("PRODUCTION_V1_SMOKE_DETAIL_VERIFIED"),
  activityVerified: optionalBooleanEvidence("PRODUCTION_V1_SMOKE_ACTIVITY_VERIFIED"),
  indexerVerified: optionalBooleanEvidence("PRODUCTION_V1_SMOKE_INDEXER_VERIFIED"),
  metadataReconciliationVerified: optionalBooleanEvidence("PRODUCTION_V1_SMOKE_METADATA_RECONCILIATION_VERIFIED"),
  supportVerified: optionalBooleanEvidence("PRODUCTION_V1_SMOKE_SUPPORT_VERIFIED"),
};

const checks = {
  health: await checkEndpoint(apiBaseUrl, "/health"),
  ready: await checkEndpoint(apiBaseUrl, "/ready"),
};

if (!checks.health.ok || !checks.ready.ok) {
  throw new Error("Production v1 smoke API checks failed.");
}

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-production-v1-smoke-${target}-${label}.json`);
const result = {
  app: "pocket-vault",
  component: "production-v1-smoke",
  target,
  label,
  generatedAt: new Date().toISOString(),
  apiBaseUrl,
  appUrl,
  operator,
  checks,
  evidence,
  notes,
  credentialsRedacted: true,
  noChainTransactionSent: true,
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
};

writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `smoke_result_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, label }, null, 2));
