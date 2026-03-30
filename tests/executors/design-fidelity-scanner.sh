#!/usr/bin/env bash
# tests/executors/design-fidelity-scanner.sh — SCAN Phase: Design-Fidelity Gap Scanner
#
# Compares spec acceptance criteria from completed conductor tracks
# against actual implementation files to find specs not implemented.
#
# Usage: bash tests/executors/design-fidelity-scanner.sh
# Output: GAP|design-fidelity|spec-driven|{category}|{description}|{priority}
#         DESIGN_FIDELITY_SCAN|{gap_count}|{details}
#
# Schedule: every_3_rounds (from scan-strategies.yaml)
# Performance: Single Node.js process does all analysis (builds word Set, checks all criteria).

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

log_info "=== Design-Fidelity Scanner ==="

# Run entire analysis in a single Node.js process for performance
# (Avoids per-track/per-criterion process spawning on Windows)
TRACKS_PATH="$PROJECT_ROOT/conductor/tracks" \
CODE_DIRS="$PROJECT_ROOT/dashboard/src,$PROJECT_ROOT/dashboard/web/src,$PROJECT_ROOT/.claude/skills" \
NODE_PATH="$DASHBOARD_DIR/node_modules" \
node -e '
const fs = require("fs");
const path = require("path");

const tracksDir = process.env.TRACKS_PATH;
const codeDirs = process.env.CODE_DIRS.split(",");

// Step 1: Build word index from code files
const wordSet = new Set();
for (const dir of codeDirs) {
  try {
    const walk = (d) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules") {
          walk(full);
        } else if (/\.(tsx?|md|js)$/.test(entry.name)) {
          try {
            const content = fs.readFileSync(full, "utf8").toLowerCase();
            // Extract words 3+ chars
            for (const w of content.match(/[a-z]{3,}/g) || []) {
              wordSet.add(w);
            }
          } catch {}
        }
      }
    };
    walk(dir);
  } catch {}
}

// Step 2: Find completed tracks
const trackIds = [];
try {
  for (const d of fs.readdirSync(tracksDir, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const metaPath = path.join(tracksDir, d.name, "metadata.json");
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      if (meta.status === "complete" || meta.status === "done") {
        trackIds.push({ id: meta.id || d.name, dir: d.name });
      }
    } catch {}
  }
} catch {}

// Step 3: Classify criterion
function classify(text) {
  const lower = text.toLowerCase();
  if (/unit test|npm test|vitest/.test(lower)) return "unit-test";
  if (/button|click|dialog|modal|toggle|form|input/.test(lower)) return "ui-interaction";
  if (/layout|theme|style|color|visual|screenshot/.test(lower)) return "ui-visual";
  if (/api|endpoint|http|response|status.code/.test(lower)) return "backend-api";
  if (/probe|baseline|metric|audit/.test(lower)) return "observability";
  return "workflow-e2e";
}

// Step 4: Check each track specs criteria
let gapCount = 0;
let totalCriteria = 0;
let checkedTracks = 0;

for (const track of trackIds) {
  const specPath = path.join(tracksDir, track.dir, "spec.md");
  let specContent;
  try { specContent = fs.readFileSync(specPath, "utf8"); } catch { continue; }
  checkedTracks++;

  // Find criteria section
  const lines = specContent.split("\n");
  let inCriteria = false;
  for (const line of lines) {
    const trimmed = line.replace(/\r/g, "");
    if (/^## (Success|Acceptance) Criteria/i.test(trimmed)) { inCriteria = true; continue; }
    if (/^## /.test(trimmed) && inCriteria) { inCriteria = false; continue; }
    if (!inCriteria) continue;

    // Extract criterion from checklist
    const match = trimmed.match(/^- \[(.)\] (.+)/);
    if (!match) continue;
    totalCriteria++;
    if (match[1] === "x") continue; // already checked

    const criterion = match[2];
    // Extract keywords (4+ char words)
    const keywords = criterion.toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 4)
      .slice(0, 5);

    if (keywords.length === 0) continue;

    // Check how many keywords exist in code
    const found = keywords.filter(kw => wordSet.has(kw)).length;
    const threshold = keywords.length <= 2 ? 1 : 2;

    if (found < threshold) {
      const category = classify(criterion);
      let priority = "P2";
      if (category === "backend-api" || category === "workflow-e2e") priority = "P1";
      if (category === "ui-visual" || category === "observability") priority = "P3";
      const short = criterion.substring(0, 120);
      console.log(`GAP|design-fidelity|spec-driven|${category}|${track.id}: ${short}|${priority}`);
      gapCount++;
    }
  }
}

// Summary
process.stderr.write(`[INFO] Tracks checked: ${checkedTracks}\n`);
process.stderr.write(`[INFO] Total criteria: ${totalCriteria}\n`);
process.stderr.write(`[INFO] Gaps found: ${gapCount}\n`);
console.log(`DESIGN_FIDELITY_SCAN|${gapCount}|tracks=${checkedTracks} criteria=${totalCriteria}`);
' 2>&1

EXIT_CODE=$?
if [ "$EXIT_CODE" -ne 0 ]; then
  log_fail "Design-fidelity scanner failed with exit code $EXIT_CODE"
  echo "DESIGN_FIDELITY_SCAN|0|error"
fi
