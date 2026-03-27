#!/usr/bin/env node
/**
 * RAG Manifest Manager — 增量 ingest 的文件变更检测
 *
 * Usage:
 *   node manifest.mjs diff   <outputDir>              → 输出 JSON diff (new/modified/deleted/unchanged)
 *   node manifest.mjs build  <outputDir>              → 从当前文件状态构建 manifest（不触发 ingest）
 *   node manifest.mjs update <outputDir> [files...]   → 更新 manifest 中指定文件的记录
 *   node manifest.mjs remove <outputDir> [files...]   → 从 manifest 中移除指定文件记录
 */

import fs from "fs";
import path from "path";

const MANIFEST_NAME = ".rag-manifest.json";

function getManifestPath(outputDir) {
  return path.join(outputDir, MANIFEST_NAME);
}

function readManifest(outputDir) {
  const p = getManifestPath(outputDir);
  if (!fs.existsSync(p)) return { model: null, lastSync: null, files: {} };
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeManifest(outputDir, manifest) {
  const p = getManifestPath(outputDir);
  fs.writeFileSync(p, JSON.stringify(manifest, null, 2), "utf-8");
}

/** Recursively find all .md files */
function walkMd(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMd(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

function getFileMeta(filePath) {
  const stat = fs.statSync(filePath);
  return {
    mtime: stat.mtimeMs,
    size: stat.size,
  };
}

// ─── Commands ───

function cmdDiff(outputDir) {
  const manifest = readManifest(outputDir);
  const currentFiles = walkMd(outputDir);

  const newFiles = [];
  const modified = [];
  const unchanged = [];
  const currentSet = new Set();

  for (const f of currentFiles) {
    const rel = path.relative(outputDir, f);
    currentSet.add(rel);
    const meta = getFileMeta(f);
    const prev = manifest.files[rel];

    if (!prev) {
      newFiles.push(rel);
    } else if (prev.mtime !== meta.mtime || prev.size !== meta.size) {
      modified.push(rel);
    } else {
      unchanged.push(rel);
    }
  }

  const deleted = Object.keys(manifest.files).filter((r) => !currentSet.has(r));

  console.log(
    JSON.stringify(
      {
        summary: {
          new: newFiles.length,
          modified: modified.length,
          deleted: deleted.length,
          unchanged: unchanged.length,
          total: currentFiles.length,
        },
        new: newFiles,
        modified,
        deleted,
      },
      null,
      2
    )
  );
}

function cmdBuild(outputDir) {
  const currentFiles = walkMd(outputDir);
  const files = {};
  for (const f of currentFiles) {
    const rel = path.relative(outputDir, f);
    files[rel] = getFileMeta(f);
  }
  const manifest = {
    model: "jinaai/jina-embeddings-v2-base-zh",
    lastSync: new Date().toISOString(),
    files,
  };
  writeManifest(outputDir, manifest);
  console.log(
    JSON.stringify({
      action: "build",
      filesRecorded: Object.keys(files).length,
      manifestPath: getManifestPath(outputDir),
    })
  );
}

function cmdUpdate(outputDir, filePaths) {
  const manifest = readManifest(outputDir);
  for (const f of filePaths) {
    const abs = path.isAbsolute(f) ? f : path.join(outputDir, f);
    const rel = path.relative(outputDir, abs);
    if (fs.existsSync(abs)) {
      manifest.files[rel] = getFileMeta(abs);
    }
  }
  manifest.lastSync = new Date().toISOString();
  writeManifest(outputDir, manifest);
  console.log(JSON.stringify({ action: "update", updatedFiles: filePaths.length }));
}

function cmdRemove(outputDir, filePaths) {
  const manifest = readManifest(outputDir);
  for (const f of filePaths) {
    const abs = path.isAbsolute(f) ? f : path.join(outputDir, f);
    const rel = path.relative(outputDir, abs);
    delete manifest.files[rel];
  }
  manifest.lastSync = new Date().toISOString();
  writeManifest(outputDir, manifest);
  console.log(JSON.stringify({ action: "remove", removedFiles: filePaths.length }));
}

// ─── Main ───

const [, , cmd, outputDir, ...rest] = process.argv;

if (!cmd || !outputDir) {
  console.error("Usage: node manifest.mjs <diff|build|update|remove> <outputDir> [files...]");
  process.exit(1);
}

const resolvedDir = path.resolve(outputDir);

switch (cmd) {
  case "diff":
    cmdDiff(resolvedDir);
    break;
  case "build":
    cmdBuild(resolvedDir);
    break;
  case "update":
    cmdUpdate(resolvedDir, rest);
    break;
  case "remove":
    cmdRemove(resolvedDir, rest);
    break;
  default:
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
}
