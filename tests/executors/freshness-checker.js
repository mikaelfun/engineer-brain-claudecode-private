#!/usr/bin/env node
// tests/executors/freshness-checker.js — Code Anchor Freshness Checker
//
// Extracts code anchors from Issue JSON and verifies they still exist.
// Usage: node freshness-checker.js --issue ISS-192
//        or require('./freshness-checker.js').checkFreshness(issueJson, projectRoot)
//
// Output: { freshness: 'fresh'|'stale'|'unknown', anchors: [...], reason: string }

const fs = require('fs');
const path = require('path');

// --- Helpers (Windows-safe, no shell commands) ---

/**
 * Recursively find files matching a name pattern under a directory.
 * Returns array of absolute paths. Replaces `find` command.
 */
function findFiles(dir, fileName) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        results.push(...findFiles(fullPath, fileName));
      } else if (entry.isFile() && entry.name === fileName) {
        results.push(fullPath);
      }
    }
  } catch { /* permission errors, etc. */ }
  return results;
}

/**
 * Search for a text pattern in all files under a directory.
 * Returns true if any file contains the pattern. Replaces `grep -rl`.
 */
function grepDir(dir, pattern) {
  if (!fs.existsSync(dir)) return false;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        if (grepDir(fullPath, pattern)) return true;
      } else if (entry.isFile() && /\.(ts|js|tsx|jsx)$/.test(entry.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(pattern)) return true;
        } catch { /* skip unreadable files */ }
      }
    }
  } catch { /* permission errors */ }
  return false;
}

// --- Anchor Extraction ---

function extractAnchors(issueJson, projectRoot) {
  const anchors = [];
  const desc = (issueJson.description || '') + '\n' + (issueJson.title || '');

  // 1. File paths from "涉及文件" section
  const fileSection = desc.match(/涉及文件[\s\S]*?(?=\n##|\n\n\n|$)/i);
  if (fileSection) {
    const filePaths = fileSection[0].match(/[\w\-./]+\.\w{1,4}/g) || [];
    for (const fp of filePaths) {
      if (fp.includes('/') || fp.endsWith('.ts') || fp.endsWith('.tsx') || fp.endsWith('.sh') || fp.endsWith('.js')) {
        anchors.push({ type: 'file', path: fp, exists: fs.existsSync(path.join(projectRoot, fp)) });
      }
    }
  }

  // 2. API endpoints: /api/xxx
  const apiMatches = desc.match(/\/api\/[\w/:.\-]+/g) || [];
  for (const api of apiMatches) {
    const routesDir = path.join(projectRoot, 'dashboard', 'src', 'routes');
    // Strip dynamic params for search: /api/cases/:id/drafts → /api/cases/
    const searchTerm = api.replace(/:\w+/g, '').replace(/\/\//g, '/');
    const exists = grepDir(routesDir, searchTerm);
    anchors.push({ type: 'route', path: api, exists });
  }

  // 3. Component files: *.tsx references (not already captured by 涉及文件)
  const tsxMatches = desc.match(/[\w-]+\.tsx/g) || [];
  for (const tsx of tsxMatches) {
    // Skip if already captured as a full path
    if (anchors.some(a => a.path.endsWith(tsx))) continue;
    const searchDirs = ['dashboard/web/src', 'dashboard/src'];
    let found = false;
    for (const dir of searchDirs) {
      const fullDir = path.join(projectRoot, dir);
      if (findFiles(fullDir, tsx).length > 0) {
        found = true;
        break;
      }
    }
    anchors.push({ type: 'file', path: tsx, exists: found });
  }

  // 4. Shell scripts: *.sh references (not already captured)
  const shMatches = desc.match(/[\w-]+\.sh/g) || [];
  for (const sh of shMatches) {
    if (anchors.some(a => a.path.endsWith(sh))) continue;
    const searchPaths = [
      path.join(projectRoot, 'tests', 'executors', sh),
      path.join(projectRoot, 'skills', sh),
    ];
    const found = searchPaths.some(p => fs.existsSync(p));
    anchors.push({ type: 'file', path: sh, exists: found });
  }

  // Deduplicate by path
  const seen = new Set();
  return anchors.filter(a => {
    if (seen.has(a.path)) return false;
    seen.add(a.path);
    return true;
  });
}

// --- Freshness Judgment ---

function checkFreshness(issueJson, projectRoot) {
  const anchors = extractAnchors(issueJson, projectRoot);

  if (anchors.length === 0) {
    return { freshness: 'unknown', anchors, reason: 'no code anchors found in issue' };
  }

  const total = anchors.length;
  const missing = anchors.filter(a => !a.exists);
  const missingRatio = missing.length / total;

  // Check updatedAt age
  const updatedAt = issueJson.updatedAt ? new Date(issueJson.updatedAt) : null;
  const ageMs = updatedAt ? Date.now() - updatedAt.getTime() : Infinity;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (missingRatio >= 0.5) {
    const missingPaths = missing.map(a => a.path).join(', ');
    return { freshness: 'stale', anchors, reason: `${missing.length}/${total} anchors missing: ${missingPaths}` };
  }

  if (missing.length > 0 && ageDays > 30) {
    const missingPaths = missing.map(a => a.path).join(', ');
    return { freshness: 'stale', anchors, reason: `${missing.length}/${total} anchors missing + issue >30d old: ${missingPaths}` };
  }

  if (missing.length === 0) {
    return { freshness: 'fresh', anchors, reason: `${total}/${total} anchors verified` };
  }

  return { freshness: 'unknown', anchors, reason: `${missing.length}/${total} anchors missing but <50%` };
}

// --- CLI ---

if (require.main === module) {
  const args = process.argv.slice(2);
  const issueFlag = args.indexOf('--issue');
  if (issueFlag === -1 || !args[issueFlag + 1]) {
    console.error('Usage: node freshness-checker.js --issue ISS-192');
    process.exit(1);
  }
  const issueId = args[issueFlag + 1];
  const projectRoot = path.resolve(__dirname, '../..');
  const issuePath = path.join(projectRoot, 'issues', `${issueId}.json`);

  if (!fs.existsSync(issuePath)) {
    console.error(`Issue not found: ${issuePath}`);
    process.exit(1);
  }

  const issueJson = JSON.parse(fs.readFileSync(issuePath, 'utf8'));
  const result = checkFreshness(issueJson, projectRoot);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { checkFreshness, extractAnchors };
