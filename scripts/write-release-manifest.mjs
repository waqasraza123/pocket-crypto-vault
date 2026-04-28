import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const targetValues = new Set(["staging", "production"]);
const addressPattern = /^0x[a-fA-F0-9]{40}$/;
const imagePattern = /^[a-z0-9.-]+\/[a-z0-9._/-]+:[A-Za-z0-9._-]+$/;

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
  const target = requireText("RELEASE_TARGET");

  if (!targetValues.has(target)) {
    throw new Error("RELEASE_TARGET must be staging or production.");
  }

  return target;
};

const requireUrl = (name) => {
  const value = requireText(name);
  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error(`${name} must use https.`);
  }

  return url.toString().replace(/\/$/, "");
};

const requireAddress = (name) => {
  const value = requireText(name);

  if (!addressPattern.test(value)) {
    throw new Error(`${name} must be a valid EVM address.`);
  }

  return value;
};

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

const sanitizeLabel = (value) => value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-");
const target = requireTarget();
const releaseLabel = sanitizeLabel(requireText("RELEASE_LABEL"));
const outputDir = readText("RELEASE_MANIFEST_DIR", path.join(process.cwd(), "artifacts"));
const chainId = target === "production" ? 8453 : 84532;

const manifest = {
  app: "pocket-vault",
  component: "release",
  target,
  releaseLabel,
  chainId,
  appUrl: requireUrl("RELEASE_APP_URL"),
  apiUrl: requireUrl("RELEASE_API_URL"),
  factoryAddress: requireAddress("RELEASE_FACTORY_ADDRESS"),
  apiImage: requireImage("RELEASE_API_IMAGE"),
  rollback: {
    previousApiImage: optionalImage("ROLLBACK_API_IMAGE"),
    previousFactoryAddress: optionalText("ROLLBACK_FACTORY_ADDRESS"),
    notes: optionalText("ROLLBACK_NOTES"),
  },
  mobile: {
    iosBuildReference: optionalText("RELEASE_IOS_BUILD_REFERENCE"),
    androidBuildReference: optionalText("RELEASE_ANDROID_BUILD_REFERENCE"),
  },
  artifacts: {
    contractDeploymentManifest: optionalText("CONTRACT_DEPLOYMENT_MANIFEST"),
    apiImageManifest: optionalText("API_IMAGE_MANIFEST"),
    mobileDistributionManifest: optionalText("MOBILE_DISTRIBUTION_MANIFEST"),
  },
  git: {
    commitSha: optionalText("GITHUB_SHA"),
    refName: optionalText("GITHUB_REF_NAME"),
    workflowRunId: optionalText("GITHUB_RUN_ID"),
  },
  generatedAt: new Date().toISOString(),
};

if (manifest.rollback.previousFactoryAddress && !addressPattern.test(manifest.rollback.previousFactoryAddress)) {
  throw new Error("ROLLBACK_FACTORY_ADDRESS must be a valid EVM address when set.");
}

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-release-${target}-${releaseLabel}.json`);
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `manifest_path=${outputPath}\n`, { flag: "a" });
}

console.log(JSON.stringify({ outputPath, target, releaseLabel, chainId }, null, 2));
