#!/usr/bin/env bash
# tests/executors/observability-scanner.sh — SCAN Phase: Auto-discover observability gaps
#
# Usage: bash tests/executors/observability-scanner.sh
# Called during SCAN phase to find new observability probe needs
#
# Scans 5 sources:
# 1. Agent configs — new agents without coverage in frontmatter-audit
# 2. SKILL prompts — new skills without coverage in prompt-lean
# 3. Bash anti-patterns — "; VAR=" + pipe in code
# 4. Timing drift — latest timing.json vs baselines.yaml
# 5. Learnings gaps — new learnings without regression checks
#
# Output: SCAN_OBS|{discovered_count}|{details}
# Side effect: prints discovered gaps as JSON lines to stdout

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

BASELINES_FILE="$TESTS_ROOT/baselines.yaml"
LEARNINGS_FILE="$TESTS_ROOT/learnings.yaml"
CONFIG_FILE="$PROJECT_ROOT/config.json"

GAPS_FOUND=0
DETAILS=""

log_info "=== Observability Scanner ==="

# ============================================================
# 1. Agent Config Audit — check for uncovered agents
# ============================================================
log_info "Scanning agent configs..."

AGENT_COUNT=$(ls "$PROJECT_ROOT/.claude/agents/"*.md 2>/dev/null | wc -l)
# Check current baseline max_agents
BASELINE_MAX=$(grep "max_agents:" "$BASELINES_FILE" 2>/dev/null | head -1 | sed 's/.*: *//' | tr -d '\r')
BASELINE_MAX="${BASELINE_MAX:-10}"

if [ "$AGENT_COUNT" -gt "$BASELINE_MAX" ]; then
  GAPS_FOUND=$((GAPS_FOUND + 1))
  DETAILS="${DETAILS}agent_count_exceeded($AGENT_COUNT>$BASELINE_MAX) "
  log_warn "Agent count ($AGENT_COUNT) exceeds baseline max ($BASELINE_MAX) — baselines.yaml needs update"
fi

# Check for agents without name/description (quick pre-check)
MISSING_FM=0
for f in "$PROJECT_ROOT/.claude/agents/"*.md; do
  [ -f "$f" ] || continue
  HAS_NAME=$(head -20 "$f" | grep -c "^name:" || true)
  HAS_DESC=$(head -20 "$f" | grep -c "^description:" || true)
  if [ "$HAS_NAME" -eq 0 ] || [ "$HAS_DESC" -eq 0 ]; then
    MISSING_FM=$((MISSING_FM + 1))
    log_warn "Agent $(basename "$f") missing frontmatter — will fail agent-frontmatter-audit"
  fi
done
if [ "$MISSING_FM" -gt 0 ]; then
  GAPS_FOUND=$((GAPS_FOUND + 1))
  DETAILS="${DETAILS}agents_missing_frontmatter($MISSING_FM) "
fi

# ============================================================
# 2. SKILL Prompt Audit — check for new uncovered skills
# ============================================================
log_info "Scanning SKILL prompts..."

SKILL_COUNT=$(ls "$PROJECT_ROOT/.claude/skills/"*/SKILL.md 2>/dev/null | wc -l)
# Count skills that have spawn prompts (Prompt: inside code blocks)
SKILLS_WITH_PROMPTS=0
for skill_file in "$PROJECT_ROOT/.claude/skills/"*/SKILL.md; do
  [ -f "$skill_file" ] || continue
  if grep -q "Prompt:" "$skill_file" 2>/dev/null; then
    SKILLS_WITH_PROMPTS=$((SKILLS_WITH_PROMPTS + 1))
  fi
done

log_info "Found $SKILL_COUNT skills, $SKILLS_WITH_PROMPTS with spawn prompts"

# ============================================================
# 3. Bash Anti-pattern Scan
# ============================================================
log_info "Scanning for bash anti-patterns..."

# Pattern: semicolon variable assignment followed by pipe on same line
# Exclude comments (#) and markdown table rows (|)
ANTIPATTERN_HITS=$(grep -rn ';\s*[A-Z_]\+=' "$EXECUTORS_DIR/"*.sh "$PROJECT_ROOT/.claude/skills/"*/SKILL.md 2>/dev/null | grep '|' | grep -v '^\s*#' | grep -v '^\s*|' | grep -v '`.*; VAR=.*`' | wc -l)

if [ "$ANTIPATTERN_HITS" -gt 0 ]; then
  GAPS_FOUND=$((GAPS_FOUND + 1))
  DETAILS="${DETAILS}bash_antipattern_found($ANTIPATTERN_HITS) "
  log_warn "Found $ANTIPATTERN_HITS bash anti-pattern instances (semicolon+variable+pipe)"
fi

# Also check for Windows-style paths in shell scripts
WIN_PATHS=$(grep -rn '[A-Z]:\\' "$EXECUTORS_DIR/"*.sh 2>/dev/null | grep -v '#' | wc -l)
if [ "$WIN_PATHS" -gt 0 ]; then
  GAPS_FOUND=$((GAPS_FOUND + 1))
  DETAILS="${DETAILS}windows_paths_in_scripts($WIN_PATHS) "
  log_warn "Found $WIN_PATHS Windows-style paths in executor scripts"
fi

# ============================================================
# 4. Timing Drift Detection
# ============================================================
log_info "Scanning for timing drift..."

# Read cases root from config
CASES_ROOT=""
if [ -f "$CONFIG_FILE" ]; then
  CASES_ROOT=$(cd "$PROJECT_ROOT" && NODE_PATH="$DASHBOARD_DIR/node_modules" node --input-type=commonjs <<'NODEEOF'
    const path = require('path');
    const c = JSON.parse(require('fs').readFileSync('config.json','utf8'));
    let p = c.casesRoot || 'cases';
    p = path.resolve(p);
    p = p.split(path.sep).join('/').replace(/^([A-Z]):/, (m,d) => '/' + d.toLowerCase());
    console.log(p);
NODEEOF
  )
fi
CASES_ROOT="${CASES_ROOT:-$PROJECT_ROOT/cases}"

# Find most recent timing.json
LATEST_TIMING=""
LATEST_TIME=0
for tf in "$CASES_ROOT/active/"*/timing.json; do
  [ -f "$tf" ] || continue
  # Get file modification time
  MTIME=$(stat -c %Y "$tf" 2>/dev/null || stat -f %m "$tf" 2>/dev/null || echo "0")
  if [ "$MTIME" -gt "$LATEST_TIME" ]; then
    LATEST_TIME="$MTIME"
    LATEST_TIMING="$tf"
  fi
done

if [ -n "$LATEST_TIMING" ]; then
  # Check if total exceeds baseline warn threshold
  TOTAL_SEC=$(cd "$PROJECT_ROOT" && TIMING_FILE="$LATEST_TIMING" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const t = JSON.parse(require('fs').readFileSync(process.env.TIMING_FILE,'utf8'));
    console.log(t.totalSeconds || 0);
  " 2>/dev/null || echo "0")

  BL_TOTAL=$(grep "baseline:" "$BASELINES_FILE" 2>/dev/null | head -1 | sed 's/.*: *//' | tr -d '\r')
  BL_TOTAL="${BL_TOTAL:-500}"

  if [ -n "$TOTAL_SEC" ] && [ "$TOTAL_SEC" != "0" ]; then
    RATIO=$(cd "$PROJECT_ROOT" && node -e "console.log(($TOTAL_SEC / $BL_TOTAL).toFixed(2))" 2>/dev/null || echo "0")
    log_info "Latest timing: ${TOTAL_SEC}s (baseline: ${BL_TOTAL}s, ratio: ${RATIO}x)"

    # Check if baselines are stale (> 7 days since updated_at)
    BL_DATE=$(grep "updated_at:" "$BASELINES_FILE" 2>/dev/null | head -1 | sed 's/.*: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '\r"')
    if [ -n "$BL_DATE" ]; then
      DAYS_OLD=$(cd "$PROJECT_ROOT" && node -e "
        const d = new Date('${BL_DATE}');
        const now = new Date();
        console.log(Math.floor((now - d) / 86400000));
      " 2>/dev/null || echo "0")

      if [ "$DAYS_OLD" -gt 7 ]; then
        GAPS_FOUND=$((GAPS_FOUND + 1))
        DETAILS="${DETAILS}baselines_stale(${DAYS_OLD}d) "
        log_warn "Baselines are $DAYS_OLD days old — consider running baseline-updater.sh"
      fi
    fi
  fi
else
  log_info "No timing.json files found — timing drift check skipped"
fi

# ============================================================
# 5. Learnings Regression Gap
# ============================================================
log_info "Scanning for uncovered learnings..."

if [ -f "$LEARNINGS_FILE" ]; then
  # Count total learnings
  TOTAL_LEARNINGS=$(grep "^- id:" "$LEARNINGS_FILE" | wc -l)

  # Get actually covered learnings from the probe definition
  PROBE_FILE="$REGISTRY_DIR/observability/learnings-regression.yaml"
  if [ -f "$PROBE_FILE" ]; then
    # Count learning_id entries in the probe
    COVERED_LEARNINGS=$(grep "learning_id:" "$PROBE_FILE" | wc -l)
    # Get covered IDs for comparison
    COVERED_IDS=$(grep "learning_id:" "$PROBE_FILE" | sed 's/.*learning_id: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '\r"')
  else
    COVERED_LEARNINGS=0
    COVERED_IDS=""
  fi

  # Find learnings NOT covered by the probe
  UNCOVERED=0
  UNCOVERED_LIST=""
  while IFS= read -r lid; do
    lid=$(echo "$lid" | tr -d '\r')
    if ! echo "$COVERED_IDS" | grep -q "^${lid}$"; then
      UNCOVERED=$((UNCOVERED + 1))
      UNCOVERED_LIST="${UNCOVERED_LIST}  - $lid\n"
    fi
  done < <(grep "^- id:" "$LEARNINGS_FILE" | sed 's/^- id: *//' | tr -d '\r')

  if [ "$UNCOVERED" -gt 0 ]; then
    log_warn "$UNCOVERED of $TOTAL_LEARNINGS learnings not covered by regression probe:"
    echo -e "$UNCOVERED_LIST" | while read -r line; do
      [ -n "$line" ] && log_warn "$line"
    done
    GAPS_FOUND=$((GAPS_FOUND + 1))
    DETAILS="${DETAILS}uncovered_learnings($UNCOVERED/$TOTAL_LEARNINGS) "
  else
    log_info "All $TOTAL_LEARNINGS learnings covered by regression probe"
  fi
else
  log_warn "learnings.yaml not found"
fi

# ============================================================
# Summary
# ============================================================
log_info "=== Scanner Complete ==="
log_info "Gaps found: $GAPS_FOUND"
log_info "Details: ${DETAILS:-none}"

echo "SCAN_OBS|$GAPS_FOUND|${DETAILS:-none}"
