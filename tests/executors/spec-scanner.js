#!/usr/bin/env node
// tests/executors/spec-scanner.js — Spec-Driven Test Gap Scanner (Node.js batch implementation)
//
// Replaces the grep-based matching in spec-scanner.sh to avoid grep -qiF SIGABRT on Git Bash (MSYS2).
// Single process: loads all registry YAMLs into memory once, then matches all criteria in-memory.
//
// Usage: node tests/executors/spec-scanner.js
// Output: SPEC_SCAN|{gap_count}|{details}
//         SPEC_GAP|{trackId}|{criterion}|{category}  (for each gap)
//         [INFO]/[WARN]/[PASS] messages on stderr

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// ============================================================
// Paths
// ============================================================
const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '../..');
const TRACKS_DIR = path.join(PROJECT_ROOT, 'conductor', 'tracks');
const REGISTRY_DIR = path.join(PROJECT_ROOT, 'tests', 'registry');
const CACHE_FILE = path.join(PROJECT_ROOT, 'tests', '.cache', 'spec-hashes.json');

const log = (level, msg) => process.stderr.write(`\x1b[${level === 'INFO' ? '34' : level === 'WARN' ? '33' : '32'}m[${level}]\x1b[0m ${msg}\n`);

// ============================================================
// Step 1: Load all registry YAML content into memory (once)
// ============================================================
log('INFO', '=== Spec-Driven Test Gap Scanner (Node.js) ===');

const registryContent = []; // [{file, contentLower}]
try {
  const cats = fs.readdirSync(REGISTRY_DIR);
  for (const cat of cats) {
    const catDir = path.join(REGISTRY_DIR, cat);
    try {
      if (!fs.statSync(catDir).isDirectory()) continue;
    } catch (e) { continue; }
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.yaml'));
    for (const f of files) {
      try {
        const content = fs.readFileSync(path.join(catDir, f), 'utf8').toLowerCase();
        registryContent.push({ file: path.join(catDir, f), contentLower: content });
      } catch (e) { /* skip unreadable */ }
    }
  }
} catch (e) {
  log('WARN', `Failed to read registry: ${e.message}`);
}

log('INFO', `Loaded ${registryContent.length} registry YAML files into memory`);

// ============================================================
// Step 2: Helper — match criterion against registry
// ============================================================
function matchesCriterion(criterion) {
  const criterionLower = criterion.toLowerCase();

  // Full string match
  for (const { contentLower } of registryContent) {
    if (contentLower.includes(criterionLower)) return true;
  }

  // Key-term fallback (first 3 words, min 3 chars)
  const keyTerms = criterionLower
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3)
    .slice(0, 3);

  if (keyTerms.length === 0) return false;

  for (const { contentLower } of registryContent) {
    const matches = keyTerms.filter(t => contentLower.includes(t)).length;
    if (matches >= 2) return true;
  }

  return false;
}

// ============================================================
// Step 3: Classify criterion into category
// ============================================================
function classifyCriterion(criterionLower) {
  if (/unit test|npm test|vitest/.test(criterionLower)) return 'unit-test';
  if (/\bui\b|button|click|dialog|panel|\btab\b/.test(criterionLower)) return 'ui-interaction';
  if (/visual|theme|layout|style|screenshot/.test(criterionLower)) return 'ui-visual';
  if (/\bapi\b|endpoint|\bhttp\b|response/.test(criterionLower)) return 'backend-api';
  if (/probe|baseline|metric|audit/.test(criterionLower)) return 'observability';
  if (/workflow|casework|script|\bfile\b|generate|scan/.test(criterionLower)) return 'workflow-e2e';
  return 'workflow-e2e'; // default
}

// ============================================================
// Step 4: Load hash cache + detect changed tracks (delta mode)
// ============================================================
let oldHashes = {};
try {
  if (fs.existsSync(CACHE_FILE)) {
    oldHashes = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }
} catch (e) { /* first run or corrupt cache */ }

// Detect git-changed spec files since last commit
let gitChangedTracks = null; // null = full scan (no cache)
if (Object.keys(oldHashes).length > 0) {
  try {
    // Find spec.md files changed in working tree or last 3 commits
    const diffOutput = execSync(
      'git diff --name-only HEAD~3 -- "conductor/tracks/*/spec.md" 2>/dev/null || true',
      { cwd: PROJECT_ROOT, encoding: 'utf8', timeout: 5000 }
    ).trim();
    const untrackedOutput = execSync(
      'git diff --name-only -- "conductor/tracks/*/spec.md" 2>/dev/null || true',
      { cwd: PROJECT_ROOT, encoding: 'utf8', timeout: 5000 }
    ).trim();
    const allChanged = (diffOutput + '\n' + untrackedOutput)
      .split('\n')
      .filter(Boolean)
      .map(f => {
        const m = f.match(/conductor\/tracks\/([^/]+)\/spec\.md/);
        return m ? m[1] : null;
      })
      .filter(Boolean);
    gitChangedTracks = new Set(allChanged);
  } catch (e) {
    // git not available or error — fall back to full scan
    gitChangedTracks = null;
  }
}

const newHashes = {};
let skippedByCache = 0;

// ============================================================
// Step 5: Scan tracks (with delta optimization)
// ============================================================
let gapCount = 0;
let staleCount = 0;

// List tracks (skip _archived)
let trackDirs;
try {
  trackDirs = fs.readdirSync(TRACKS_DIR)
    .filter(d => !d.startsWith('_'))
    .map(d => path.join(TRACKS_DIR, d))
    .filter(d => { try { return fs.statSync(d).isDirectory(); } catch(e) { return false; } });
} catch (e) {
  log('WARN', `Failed to read tracks: ${e.message}`);
  trackDirs = [];
}

for (const trackDir of trackDirs) {
  const specFile = path.join(trackDir, 'spec.md');
  const metaFile = path.join(trackDir, 'metadata.json');

  if (!fs.existsSync(specFile) || !fs.existsSync(metaFile)) continue;

  // Filter to complete/in-progress
  let trackStatus, trackId;
  try {
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    trackStatus = meta.status || '';
    trackId = meta.id || '';
  } catch (e) { continue; }

  if (!['complete', 'in-progress'].includes(trackStatus)) continue;
  if (!trackId) continue;

  // Delta check: skip if spec hasn't changed (hash match + not in git diff)
  let specContent;
  try {
    specContent = fs.readFileSync(specFile, 'utf8');
  } catch (e) { continue; }

  const specHash = crypto.createHash('md5').update(specContent).digest('hex');
  newHashes[trackId] = specHash;

  if (gitChangedTracks !== null) {
    // We have cache — check if we can skip
    const inGitDiff = gitChangedTracks.has(trackId) || gitChangedTracks.has(path.basename(trackDir));
    const hashMatch = oldHashes[trackId] === specHash;
    if (hashMatch && !inGitDiff) {
      skippedByCache++;
      continue;
    }
  }

  // Freshness check: extract referenced file paths and verify they exist
  const fileRefPattern = /(?:^|[\s`"'(])([a-zA-Z0-9_./-]+\.(?:ts|tsx|js|sh|md))\b/g;
  const referencedFiles = [];
  let fileMatch;
  while ((fileMatch = fileRefPattern.exec(specContent)) !== null) {
    const ref = fileMatch[1];
    // Skip obvious non-paths (e.g. "v1.0.md", pure filenames without dir context)
    if (ref.includes('/') || ref.includes('\\')) {
      referencedFiles.push(ref);
    }
  }

  if (referencedFiles.length > 0) {
    let missingCount = 0;
    const missingFiles = [];
    for (const ref of referencedFiles) {
      const absPath = path.resolve(PROJECT_ROOT, ref);
      if (!fs.existsSync(absPath)) {
        missingCount++;
        missingFiles.push(ref);
      }
    }
    const missingRatio = missingCount / referencedFiles.length;
    if (missingRatio >= 0.5) {
      const pct = Math.round(missingRatio * 100);
      const reason = `${pct}% referenced files missing (${missingCount}/${referencedFiles.length}): ${missingFiles.slice(0, 3).join(', ')}${missingFiles.length > 3 ? '...' : ''}`;
      process.stdout.write(`SPEC_STALE|${trackId}|${reason}\n`);
      staleCount++;
      log('WARN', `Track ${trackId}: stale spec — ${reason}`);
      continue;
    }
  }

  const lines = specContent.split('\n');
  let inAcSection = false;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');

    // Section detection
    if (/^## Acceptance Criteria/.test(line)) { inAcSection = true; continue; }
    if (/^## /.test(line) && inAcSection) { inAcSection = false; continue; }

    if (!inAcSection) continue;

    // Extract criterion from "- [x] text" or "- [ ] text"
    const criterionMatch = line.match(/^- \[.\] *(.*)/);
    if (!criterionMatch) continue;

    let criterion = criterionMatch[1].trim();
    if (!criterion) continue;

    // Remove "ACN:" prefix
    criterion = criterion.replace(/^AC\d+: */, '');

    // Check against registry
    if (!matchesCriterion(criterion)) {
      const category = classifyCriterion(criterion.toLowerCase());
      gapCount++;
      process.stdout.write(`SPEC_GAP|${trackId}|${criterion}|${category}\n`);
    }
  }
}

// ============================================================
// Step 6: Write hash cache + Summary
// ============================================================
try {
  const cacheDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(newHashes, null, 2));
} catch (e) {
  log('WARN', `Failed to write spec hash cache: ${e.message}`);
}

process.stdout.write(`SPEC_SCAN|${gapCount}|Scanned specs in ${TRACKS_DIR} (${skippedByCache} skipped by cache, ${staleCount} stale)\n`);

if (gapCount > 0) {
  log('WARN', `${gapCount} acceptance criteria not covered by existing tests`);
} else {
  log('PASS', 'All acceptance criteria in completed tracks have matching tests');
}
