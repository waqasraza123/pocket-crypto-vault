import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";

const repoRoot = process.cwd();
const dataDir = path.resolve(process.env.API_DATA_DIR || path.join(repoRoot, "apps/api/.data"));
const snapshotRoot = path.resolve(process.env.API_DATA_SNAPSHOT_DIR || path.join(repoRoot, "artifacts/api-data-snapshots"));
const label = (process.env.API_DATA_SNAPSHOT_LABEL || new Date().toISOString()).replace(/[^A-Za-z0-9._-]/g, "-");
const snapshotDir = path.join(snapshotRoot, label);
const sqliteFiles = ["goal-vault-indexer.sqlite", "goal-vault-analytics.sqlite"];
const legacyFiles = ["goal-vault-indexer.json", "goal-vault-analytics.ndjson"];

const hashFile = (filePath) => createHash("sha256").update(readFileSync(filePath)).digest("hex");

const writeSqliteSnapshot = (fileName) => {
  const sourcePath = path.join(dataDir, fileName);

  if (!existsSync(sourcePath)) {
    return null;
  }

  const targetPath = path.join(snapshotDir, fileName);
  const database = new DatabaseSync(sourcePath);
  database.exec(`VACUUM INTO '${targetPath.replaceAll("'", "''")}'`);
  database.close();

  const stat = statSync(targetPath);

  return {
    fileName,
    type: "sqlite",
    bytes: stat.size,
    sha256: hashFile(targetPath),
  };
};

const writeFileSnapshot = (fileName) => {
  const sourcePath = path.join(dataDir, fileName);

  if (!existsSync(sourcePath)) {
    return null;
  }

  const targetPath = path.join(snapshotDir, fileName);
  writeFileSync(targetPath, readFileSync(sourcePath));

  const stat = statSync(targetPath);

  return {
    fileName,
    type: "file",
    bytes: stat.size,
    sha256: hashFile(targetPath),
  };
};

mkdirSync(snapshotDir, { recursive: true });

const files = [
  ...sqliteFiles.map(writeSqliteSnapshot),
  ...legacyFiles.map(writeFileSnapshot),
].filter(Boolean);

if (files.length === 0) {
  throw new Error(`No supported API data files were found in ${dataDir}.`);
}

const manifest = {
  app: "pocket-vault",
  component: "api-data",
  snapshotLabel: label,
  dataDir,
  snapshotDir,
  files,
  git: {
    commitSha: process.env.GITHUB_SHA || null,
    refName: process.env.GITHUB_REF_NAME || null,
    workflowRunId: process.env.GITHUB_RUN_ID || null,
  },
  generatedAt: new Date().toISOString(),
};

writeFileSync(path.join(snapshotDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `snapshot_dir=${snapshotDir}\nmanifest_path=${path.join(snapshotDir, "manifest.json")}\n`, {
    flag: "a",
  });
}

console.log(JSON.stringify({ snapshotDir, files: files.map((file) => file.fileName), existingDataFiles: existsSync(dataDir) ? readdirSync(dataDir).sort() : [] }, null, 2));
