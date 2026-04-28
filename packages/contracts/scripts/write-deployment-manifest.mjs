import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const target = process.env.DEPLOYMENT_TARGET || "local";
const chainId = process.env.DEPLOYMENT_CHAIN_ID;
const factoryAddress = process.env.GOAL_VAULT_FACTORY_ADDRESS;
const usdcAddress = process.env.USDC_ADDRESS;
const outputDir = process.env.DEPLOYMENT_MANIFEST_DIR || path.join(root, "deployments");
const workflowRunId = process.env.GITHUB_RUN_ID || null;
const commitSha = process.env.GITHUB_SHA || null;
const addressPattern = /^0x[a-fA-F0-9]{40}$/;

const requireValue = (name, value) => {
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required.`);
  }

  return value.trim();
};

const requireAddress = (name, value) => {
  const address = requireValue(name, value);

  if (!addressPattern.test(address)) {
    throw new Error(`${name} must be a valid EVM address.`);
  }

  return address;
};

const requireChainId = (value) => {
  const parsed = Number.parseInt(requireValue("DEPLOYMENT_CHAIN_ID", value), 10);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error("DEPLOYMENT_CHAIN_ID must be a positive integer.");
  }

  return parsed;
};

const readBroadcastResult = () => {
  const requestedChainId = String(requireChainId(chainId));
  const broadcastPath = path.join(root, "broadcast", "Deploy.s.sol", requestedChainId, "run-latest.json");

  if (!existsSync(broadcastPath)) {
    return null;
  }

  const result = JSON.parse(readFileSync(broadcastPath, "utf8"));
  const transaction = Array.isArray(result.transactions)
    ? result.transactions.find((entry) => entry.contractName === "GoalVaultFactory") ||
      result.transactions.find((entry) => entry.transactionType === "CREATE" && entry.contractAddress)
    : null;

  if (!transaction) {
    return null;
  }

  return {
    transactionHash: transaction.hash || null,
    contractAddress: transaction.contractAddress || null,
    broadcastPath,
  };
};

const resolveFactoryAddress = () => {
  if (factoryAddress) {
    return requireAddress("GOAL_VAULT_FACTORY_ADDRESS", factoryAddress);
  }

  const broadcastResult = readBroadcastResult();

  if (broadcastResult?.contractAddress) {
    return requireAddress("broadcast contractAddress", broadcastResult.contractAddress);
  }

  throw new Error("GOAL_VAULT_FACTORY_ADDRESS is required when no Foundry broadcast result is available.");
};

const latestBroadcastResult = readBroadcastResult();
const manifest = {
  app: "pocket-vault",
  component: "contracts",
  contract: "GoalVaultFactory",
  target,
  chainId: requireChainId(chainId),
  factoryAddress: resolveFactoryAddress(),
  usdcAddress: requireAddress("USDC_ADDRESS", usdcAddress),
  transactionHash: latestBroadcastResult?.transactionHash || null,
  commitSha,
  workflowRunId,
  generatedAt: new Date().toISOString(),
};

mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `pocket-vault-factory-${target}-${manifest.chainId}.json`);
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

const githubOutput = process.env.GITHUB_OUTPUT;

if (githubOutput) {
  writeFileSync(githubOutput, `manifest_path=${outputPath}\nfactory_address=${manifest.factoryAddress}\n`, {
    flag: "a",
  });
}

const existingManifests = readdirSync(outputDir)
  .filter((fileName) => fileName.startsWith("pocket-vault-factory-"))
  .sort();

console.log(JSON.stringify({ outputPath, manifests: existingManifests }, null, 2));
