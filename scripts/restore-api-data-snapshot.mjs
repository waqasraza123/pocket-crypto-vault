import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const dataDir = path.resolve(process.env.API_DATA_DIR || path.join(repoRoot, "apps/api/.data"));
const snapshotDir = path.resolve(process.env.API_DATA_RESTORE_SOURCE || "");
const confirm = process.env.API_DATA_RESTORE_CONFIRM;
const expectedFiles = new Set([
  "goal-vault-indexer.sqlite",
  "goal-vault-analytics.sqlite",
  "goal-vault-indexer.json",
  "goal-vault-analytics.ndjson",
]);

if (!snapshotDir) {
  throw new Error("API_DATA_RESTORE_SOURCE is required.");
}

if (confirm !== "restore") {
  throw new Error("API_DATA_RESTORE_CONFIRM=restore is required.");
}

const manifestPath = path.join(snapshotDir, "manifest.json");

if (!existsSync(manifestPath)) {
  throw new Error("Snapshot manifest.json was not found.");
}

const hashFile = (filePath) => createHash("sha256").update(readFileSync(filePath)).digest("hex");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
  throw new Error("Snapshot manifest has no files.");
}

mkdirSync(dataDir, { recursive: true });

const restoreLabel = new Date().toISOString().replace(/[^A-Za-z0-9._-]/g, "-");
const backupDir = path.join(dataDir, `.restore-backup-${restoreLabel}`);
mkdirSync(backupDir, { recursive: true });

const restored = [];

const backupCurrentFile = (fileName) => {
  const targetPath = path.join(dataDir, fileName);

  if (!existsSync(targetPath)) {
    return;
  }

  writeFileSync(path.join(backupDir, fileName), readFileSync(targetPath));
};

for (const file of manifest.files) {
  if (!file?.fileName || !expectedFiles.has(file.fileName)) {
    throw new Error(`Unexpected snapshot file ${file?.fileName || ""}.`);
  }

  const sourcePath = path.join(snapshotDir, file.fileName);

  if (!existsSync(sourcePath)) {
    throw new Error(`Snapshot file ${file.fileName} was not found.`);
  }

  if (hashFile(sourcePath) !== file.sha256) {
    throw new Error(`Snapshot checksum mismatch for ${file.fileName}.`);
  }

  const targetPath = path.join(dataDir, file.fileName);
  backupCurrentFile(file.fileName);

  if (file.fileName.endsWith(".sqlite")) {
    for (const sidecar of [`${file.fileName}-wal`, `${file.fileName}-shm`]) {
      backupCurrentFile(sidecar);

      const sidecarPath = path.join(dataDir, sidecar);

      if (existsSync(sidecarPath)) {
        rmSync(sidecarPath);
      }
    }
  }

  writeFileSync(targetPath, readFileSync(sourcePath));

  restored.push({
    fileName: file.fileName,
    bytes: statSync(targetPath).size,
    sha256: hashFile(targetPath),
  });
}

const restoreManifest = {
  app: "pocket-vault",
  component: "api-data-restore",
  dataDir,
  snapshotDir,
  backupDir,
  restored,
  restoredAt: new Date().toISOString(),
};

writeFileSync(path.join(backupDir, "restore-manifest.json"), `${JSON.stringify(restoreManifest, null, 2)}\n`);

console.log(JSON.stringify(restoreManifest, null, 2));
