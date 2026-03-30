#!/usr/bin/env bash
# tests/executors/issue-scanner.sh — Issue-Driven Test Gap Scanner
#
# Scans issues/*.json by status and compares linked spec ACs
# against existing test registry to find untested criteria.
#
# Usage: bash tests/executors/issue-scanner.sh
# Output: ISSUE_SCAN|{gap_count}|{details}
#         Each gap:           ISSUE_GAP|{issueId}|{criterion}|{category}
#         Each regression gap: ISSUE_REGRESSION_GAP|{issueId}|{criterion}|regression
#         Each covered:        ISSUE_COVERED|{issueId}|{testCount}
#         Each skip:           ISSUE_SKIP|{issueId}|{reason}

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

log_info "=== Issue-Driven Test Gap Scanner ==="

# Convert POSIX paths to Windows for Node.js
ISSUES_WIN=$(cygpath -w "$PROJECT_ROOT/issues" 2>/dev/null || echo "$PROJECT_ROOT/issues")
TRACKS_WIN=$(cygpath -w "$PROJECT_ROOT/conductor/tracks" 2>/dev/null || echo "$PROJECT_ROOT/conductor/tracks")
REGISTRY_WIN=$(cygpath -w "$REGISTRY_DIR" 2>/dev/null || echo "$REGISTRY_DIR")

# Run the entire scan in a single Node.js process for performance
# (avoids 400+ subprocess spawns for 135 issues × 3 fields each)
NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const fs = require('fs');
const path = require('path');

const ISSUES_DIR = '$(echo "$ISSUES_WIN" | sed "s/\\\\/\\\\\\\\/g")';
const TRACKS_DIR = '$(echo "$TRACKS_WIN" | sed "s/\\\\/\\\\\\\\/g")';
const REGISTRY_DIR = '$(echo "$REGISTRY_WIN" | sed "s/\\\\/\\\\\\\\/g")';

// ============================================================
// Load all registry YAML content into memory for fast matching
// ============================================================
function loadRegistryContent() {
  const contents = [];
  try {
    const cats = fs.readdirSync(REGISTRY_DIR).filter(d => {
      try { return fs.statSync(path.join(REGISTRY_DIR, d)).isDirectory(); } catch { return false; }
    });
    for (const cat of cats) {
      const catDir = path.join(REGISTRY_DIR, cat);
      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.yaml'));
      for (const f of files) {
        try {
          contents.push(fs.readFileSync(path.join(catDir, f), 'utf8').toLowerCase());
        } catch {}
      }
    }
  } catch {}
  return contents;
}

const registryContents = loadRegistryContent();

// ============================================================
// Check if a criterion is covered by existing registry
// ============================================================
function isCovered(criterion) {
  if (registryContents.length === 0) return false;

  const lower = criterion.toLowerCase();

  // Direct match
  if (registryContents.some(c => c.includes(lower))) return true;

  // Keyword match - supports both Latin and CJK (Chinese) criteria
  // Fix: original regex [^a-z0-9 ] strips all CJK chars → Chinese ACs always return false
  const hasCJK = /[\u4e00-\u9fff]/.test(lower);
  let words;
  if (hasCJK) {
    // CJK: extract 2-char bigrams as keywords + any Latin words
    const cjkBigrams = lower.match(/[\u4e00-\u9fff]{2}/g) || [];
    const latinWords = lower.replace(/[\u4e00-\u9fff]/g, '').replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length >= 3);
    words = [...cjkBigrams, ...latinWords].slice(0, 5);
  } else {
    words = lower.replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length >= 3).slice(0, 3);
  }
  if (words.length < 2) return false;

  return registryContents.some(c => {
    let matches = 0;
    for (const w of words) {
      if (c.includes(w)) matches++;
    }
    return matches >= 2;
  });
}

// ============================================================
// Extract ACs from a spec.md file
// ============================================================
function extractACs(specFile) {
  let content;
  try { content = fs.readFileSync(specFile, 'utf8'); } catch { return []; }

  const lines = content.split(/\\r?\\n/);
  const acs = [];
  let inSection = false;

  for (const line of lines) {
    if (/^## Acceptance Criteria/.test(line)) { inSection = true; continue; }
    if (/^## /.test(line) && inSection) break;
    if (inSection) {
      const m = line.match(/^- \\[.\\] *(.*)/);
      if (m && m[1]) {
        acs.push(m[1].replace(/^AC\\d+:\\s*/, ''));
      }
    }
  }
  return acs;
}

// ============================================================
// Classify criterion into test category
// ============================================================
function classify(criterion) {
  const l = criterion.toLowerCase();
  if (/unit test|npm test|vitest/.test(l)) return 'unit-test';
  if (/\\b(ui|button|click|dialog|panel|tab)\\b/.test(l)) return 'ui-interaction';
  if (/\\b(visual|theme|layout|style|screenshot)\\b/.test(l)) return 'ui-visual';
  if (/\\b(api|endpoint|http|response)\\b/.test(l)) return 'backend-api';
  if (/\\b(probe|baseline|metric|audit)\\b/.test(l)) return 'observability';
  return 'workflow-e2e';
}

// ============================================================
// Main scan
// ============================================================
let gapCount = 0, regressionGapCount = 0, skipCount = 0, coveredCount = 0;

const files = fs.readdirSync(ISSUES_DIR)
  .filter(f => f.startsWith('ISS-') && f.endsWith('.json'))
  .sort();

for (const f of files) {
  let issue;
  try { issue = JSON.parse(fs.readFileSync(path.join(ISSUES_DIR, f), 'utf8')); } catch { continue; }

  const { id, status, trackId } = issue;
  if (!id) continue;

  // Skip issues where testLoopScan is explicitly set to false
  if (issue.testLoopScan === false) {
    skipCount++;
    console.log('ISSUE_SKIP|' + id + '|testLoopScan disabled');
    continue;
  }

  switch (status) {
    case 'tracked':
    case 'implemented': {
      if (!trackId) {
        skipCount++;
        console.log('ISSUE_SKIP|' + id + '|no trackId');
        break;
      }
      const specFile = path.join(TRACKS_DIR, trackId, 'spec.md');
      if (!fs.existsSync(specFile)) {
        skipCount++;
        console.log('ISSUE_SKIP|' + id + '|spec not found: ' + trackId);
        break;
      }
      const acs = extractACs(specFile);
      for (const ac of acs) {
        if (!isCovered(ac)) {
          gapCount++;
          console.log('ISSUE_GAP|' + id + '|' + ac + '|' + classify(ac));
        }
      }
      break;
    }

    case 'done': {
      if (!trackId) {
        skipCount++;
        console.log('ISSUE_SKIP|' + id + '|done but no trackId');
        break;
      }
      const specFile = path.join(TRACKS_DIR, trackId, 'spec.md');
      if (!fs.existsSync(specFile)) {
        skipCount++;
        console.log('ISSUE_SKIP|' + id + '|done but spec not found: ' + trackId);
        break;
      }
      const acs = extractACs(specFile);
      let localCovered = 0, localUncovered = 0;
      for (const ac of acs) {
        if (isCovered(ac)) {
          localCovered++;
        } else {
          localUncovered++;
          regressionGapCount++;
          console.log('ISSUE_REGRESSION_GAP|' + id + '|' + ac + '|regression');
        }
      }
      if (localUncovered === 0 && localCovered > 0) {
        coveredCount++;
        console.log('ISSUE_COVERED|' + id + '|' + localCovered);
      }
      break;
    }

    case 'pending':
      skipCount++;
      console.log('ISSUE_SKIP|' + id + '|pending');
      break;

    default:
      skipCount++;
      console.log('ISSUE_SKIP|' + id + '|status=' + status);
      break;
  }
}

const totalGaps = gapCount + regressionGapCount;
console.log('ISSUE_SCAN|' + totalGaps + '|gaps=' + gapCount + ' regression_gaps=' + regressionGapCount + ' covered=' + coveredCount + ' skipped=' + skipCount);
" 2>/dev/null

EXIT_CODE=$?

# Parse the final summary line from stdout for logging
# (Node already printed everything, just add color log)
if [ $EXIT_CODE -ne 0 ]; then
  log_fail "issue-scanner.sh Node.js execution failed (exit $EXIT_CODE)"
fi
