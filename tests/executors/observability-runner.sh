#!/usr/bin/env bash
# tests/executors/observability-runner.sh — Observability Probe Executor
#
# Usage: bash tests/executors/observability-runner.sh <probe-id> <round>
# Example: bash tests/executors/observability-runner.sh agent-frontmatter-audit 0
#
# Reads: tests/registry/observability/<probe-id>.yaml (probe definition)
#        tests/baselines.yaml (performance baselines)
# Writes: tests/results/<round>-<probe-id>.json (probe result)
#
# Probe types:
#   audit     — Scan files, check rules/patterns
#   metric    — Collect numeric metrics, compare against baselines
#   stability — Repeat tests N times, measure success rate

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
PROBE_ID="${1:?Usage: observability-runner.sh <probe-id> <round>}"
ROUND="${2:-0}"

PROBE_FILE="$REGISTRY_DIR/observability/${PROBE_ID}.yaml"
BASELINES_FILE="$TESTS_ROOT/baselines.yaml"

if [ ! -f "$PROBE_FILE" ]; then
  log_fail "Probe definition not found: $PROBE_FILE"
  exit 1
fi

log_info "=== Observability Runner ==="
log_info "Probe: $PROBE_ID (Round $ROUND)"

start_timer
reset_assertions

# ============================================================
# YAML Value Reader (simple grep+sed for flat/nested keys)
# ============================================================
read_yaml_value() {
  local file="$1"
  local key="$2"
  grep "^  *${key}:" "$file" 2>/dev/null | head -1 | sed 's/^[^:]*: *"\{0,1\}\(.*\)"\{0,1\}$/\1/' | tr -d '\r"'
}

# Read probe_type from YAML
PROBE_TYPE=$(grep "^probe_type:" "$PROBE_FILE" | sed 's/probe_type: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '\r"')
log_info "Probe type: $PROBE_TYPE"

# ============================================================
# Baseline Reader
# ============================================================
read_baseline() {
  local key="$1"
  # Handle dot-separated paths like "casework_timing.total_seconds.baseline"
  # Simple approach: search for the last segment under parent context
  local value
  value=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const fs = require('fs');
    const yaml = fs.readFileSync('$BASELINES_FILE', 'utf8');
    // Simple YAML parser for our flat structure
    const lines = yaml.split('\n');
    const path = '${key}'.split('.');
    let indent = 0;
    let found = false;
    let matchDepth = 0;
    for (const line of lines) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('#') || !trimmed) continue;
      const currentIndent = line.length - trimmed.length;
      const [k, ...vParts] = trimmed.split(':');
      const v = vParts.join(':').trim().replace(/^\"|\"$/g, '');
      if (matchDepth < path.length && k.trim() === path[matchDepth]) {
        matchDepth++;
        if (matchDepth === path.length) {
          console.log(v || '');
          found = true;
          break;
        }
        indent = currentIndent;
      } else if (currentIndent <= indent && matchDepth > 0) {
        // Reset if we've gone back to a higher level
        if (k.trim() === path[0]) {
          matchDepth = 1;
          indent = currentIndent;
        }
      }
    }
    if (!found) console.log('');
  " 2>/dev/null)
  echo "$value"
}

# ============================================================
# Threshold Checker
# ============================================================
check_ratio() {
  local actual="$1"
  local baseline="$2"
  local warn_ratio="$3"
  local critical_ratio="${4:-999}"

  if [ -z "$actual" ] || [ -z "$baseline" ] || [ "$baseline" = "0" ]; then
    echo "skip"
    return
  fi

  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
    const a = parseFloat('${actual}');
    const b = parseFloat('${baseline}');
    const w = parseFloat('${warn_ratio}');
    const c = parseFloat('${critical_ratio}');
    if (isNaN(a) || isNaN(b)) { console.log('skip'); process.exit(0); }
    const ratio = a / b;
    if (ratio >= c) console.log('fail');
    else if (ratio >= w) console.log('warn');
    else console.log('pass');
  " 2>/dev/null
}

# ============================================================
# Probe Dispatch
# ============================================================
case "$PROBE_TYPE" in

# ============================================================
# AUDIT Probe — Scan files, check rules
# ============================================================
audit)
  case "$PROBE_ID" in

  agent-frontmatter-audit)
    log_info "Auditing agent frontmatter..."
    AGENTS_DIR="$PROJECT_ROOT/.claude/agents"
    AGENT_COUNT=0
    MISSING_NAME=0
    MISSING_DESC=0
    BAD_TOOLS=0
    AGENT_DETAILS=""

    for agent_file in "$AGENTS_DIR"/*.md; do
      [ -f "$agent_file" ] || continue
      AGENT_COUNT=$((AGENT_COUNT + 1))
      fname=$(basename "$agent_file")

      # Extract frontmatter (between --- lines)
      HAS_NAME=$(head -30 "$agent_file" | grep -c "^name:" || true)
      HAS_DESC=$(head -30 "$agent_file" | grep -c "^description:" || true)
      TOOLS_LINE=$(head -30 "$agent_file" | grep "^tools:" | sed 's/^tools: *//' | tr -d '\r')

      if [ "$HAS_NAME" -eq 0 ]; then
        MISSING_NAME=$((MISSING_NAME + 1))
        log_fail "$fname: missing 'name' field"
      fi

      if [ "$HAS_DESC" -eq 0 ]; then
        MISSING_DESC=$((MISSING_DESC + 1))
        log_fail "$fname: missing 'description' field"
      fi

      # Check tools format — should NOT be JSON array
      if echo "$TOOLS_LINE" | grep -qE '^\[.*\]$'; then
        BAD_TOOLS=$((BAD_TOOLS + 1))
        log_fail "$fname: tools is JSON array, should be comma-separated"
      fi
    done

    # Max agents check
    MAX_AGENTS=$(read_baseline "agent_config.max_agents")
    MAX_AGENTS="${MAX_AGENTS:-10}"

    # Assertions
    add_assertion "All agents have name field" \
      "$([ "$MISSING_NAME" -eq 0 ] && echo true || echo false)" \
      "0 missing" "$MISSING_NAME missing"

    add_assertion "All agents have description field" \
      "$([ "$MISSING_DESC" -eq 0 ] && echo true || echo false)" \
      "0 missing" "$MISSING_DESC missing"

    add_assertion "Tools format is comma-separated (not JSON array)" \
      "$([ "$BAD_TOOLS" -eq 0 ] && echo true || echo false)" \
      "0 bad format" "$BAD_TOOLS bad format"

    add_assertion "Agent count under max ($MAX_AGENTS)" \
      "$([ "$AGENT_COUNT" -le "$MAX_AGENTS" ] && echo true || echo false)" \
      "<=$MAX_AGENTS" "$AGENT_COUNT"

    log_info "Scanned $AGENT_COUNT agents: $MISSING_NAME missing name, $MISSING_DESC missing desc, $BAD_TOOLS bad tools format"
    ;;

  skill-prompt-lean)
    log_info "Auditing skill prompt patterns..."
    SKILLS_DIR="$PROJECT_ROOT/.claude/skills"
    MAX_BYTES=2048

    # Use node to process all SKILL files at once (much faster than bash line-by-line)
    # Use relative path from PROJECT_ROOT to avoid spaces in path issues
    RESULT=$(cd "$PROJECT_ROOT" && NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
      const fs = require('fs');
      const path = require('path');
      const skillsDir = '.claude/skills';
      let totalPrompts = 0, oversized = 0, missingDelegation = 0;
      const maxBytes = ${MAX_BYTES};
      const delegationRe = /请先读取|read.*SKILL|读取.*获取/i;

      try {
        const dirs = fs.readdirSync(skillsDir, {withFileTypes: true}).filter(d => d.isDirectory());
        for (const dir of dirs) {
          const skillFile = path.join(skillsDir, dir.name, 'SKILL.md');
          if (!fs.existsSync(skillFile)) continue;
          const content = fs.readFileSync(skillFile, 'utf8');
          // Prompt blocks are inside fenced code blocks:
          //   \`\`\`            (opening fence)
          //   Prompt: ...       (prompt start marker)
          //   content lines...
          //   \`\`\`            (closing fence)
          const lines = content.split('\n');
          let inCodeBlock = false;
          let inPrompt = false;
          let promptContent = '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (/^\x60{3}/.test(trimmed)) {
              if (!inCodeBlock) {
                inCodeBlock = true;
                continue;
              } else {
                // Closing fence
                inCodeBlock = false;
                if (inPrompt) {
                  inPrompt = false;
                  const bytes = Buffer.byteLength(promptContent, 'utf8');
                  totalPrompts++;
                  if (bytes > maxBytes) {
                    oversized++;
                    process.stderr.write('[FAIL] ' + dir.name + ': prompt is ' + bytes + ' bytes (max: ' + maxBytes + ')\n');
                  }
                  if (bytes > 500 && !delegationRe.test(promptContent)) {
                    missingDelegation++;
                    process.stderr.write('[WARN] ' + dir.name + ': prompt lacks delegation pattern\n');
                  }
                  promptContent = '';
                }
                continue;
              }
            }
            if (inCodeBlock && /Prompt:/i.test(line) && !inPrompt) {
              inPrompt = true;
              promptContent = '';
              continue;
            }
            if (inPrompt) {
              promptContent += line + '\n';
            }
          }
        }
      } catch(e) { process.stderr.write('Error: ' + e.message + '\n'); }
      console.log(totalPrompts + '|' + oversized + '|' + missingDelegation);
    " 2>&1)

    # Parse result
    TOTAL_PROMPTS=$(echo "$RESULT" | tail -1 | cut -d'|' -f1)
    OVERSIZED=$(echo "$RESULT" | tail -1 | cut -d'|' -f2)
    MISSING_DELEGATION=$(echo "$RESULT" | tail -1 | cut -d'|' -f3)

    # Default to 0 if parsing failed
    TOTAL_PROMPTS="${TOTAL_PROMPTS:-0}"
    OVERSIZED="${OVERSIZED:-0}"
    MISSING_DELEGATION="${MISSING_DELEGATION:-0}"

    add_assertion "No oversized prompts (>max_inline_bytes)" \
      "$([ "$OVERSIZED" -eq 0 ] && echo true || echo false)" \
      "0 oversized" "$OVERSIZED oversized"

    add_assertion "Delegation pattern present in substantial prompts" \
      "$([ "$MISSING_DELEGATION" -eq 0 ] && echo true || echo false)" \
      "0 missing" "$MISSING_DELEGATION missing delegation"

    log_info "Scanned $TOTAL_PROMPTS prompt blocks: $OVERSIZED oversized, $MISSING_DELEGATION missing delegation"
    ;;

  obs-bash-antipattern-r28)
    log_info "Scanning for bash anti-patterns in executor scripts..."
    SCAN_OUTPUT=$(bash "$PROJECT_ROOT/tests/executors/observability-scanner.sh" 2>&1)
    ANTIPATTERN_COUNT=$(echo "$SCAN_OUTPUT" | grep -oP 'Found \K\d+(?= bash anti-pattern)' || echo "0")
    if [ -z "$ANTIPATTERN_COUNT" ] || ! echo "$ANTIPATTERN_COUNT" | grep -qE '^[0-9]+$'; then
      ANTIPATTERN_COUNT=0
    fi
    add_assertion "No bash anti-patterns in executors (semicolon+var+pipe)" \
      "$([ "$ANTIPATTERN_COUNT" -eq 0 ] && echo true || echo false)" \
      "0 antipatterns" "$ANTIPATTERN_COUNT antipatterns found"
    log_info "Bash anti-pattern count: $ANTIPATTERN_COUNT"
    ;;

  arch-posix-paths-skill)
    log_info "Auditing POSIX path usage in skill bash blocks..."
    SKILLS_DIR="$PROJECT_ROOT/.claude/skills"

    # Count skills with Windows path anti-patterns in bash blocks
    BACKSLASH_PATHS=0
    COLON_PATHS=0
    TOTAL_SKILLS=0

    for skill_dir in "$SKILLS_DIR"/*/; do
      [ -d "$skill_dir" ] || continue
      skill_file="$skill_dir/SKILL.md"
      [ -f "$skill_file" ] || continue
      TOTAL_SKILLS=$((TOTAL_SKILLS + 1))

      # Extract bash code blocks and check for Windows paths
      # Pattern 1: Backslash paths (C:\...)
      if awk '/```bash/,/```/ {print}' "$skill_file" | grep -qE '[A-Z]:\\'; then
        BACKSLASH_PATHS=$((BACKSLASH_PATHS + 1))
        log_fail "$(basename "$skill_dir"): found backslash Windows path (C:\\...) in bash block"
      fi

      # Pattern 2: Colon forward-slash paths (C:/..)
      if awk '/```bash/,/```/ {print}' "$skill_file" | grep -qE '[A-Z]:/'; then
        COLON_PATHS=$((COLON_PATHS + 1))
        log_fail "$(basename "$skill_dir"): found colon Windows path (C:/..) in bash block"
      fi
    done

    add_assertion "No backslash Windows paths (C:\\...) in skill bash blocks" \
      "$([ "$BACKSLASH_PATHS" -eq 0 ] && echo true || echo false)" \
      "0 violations" "$BACKSLASH_PATHS skills with backslash paths"

    add_assertion "No colon Windows paths (C:/..) in skill bash blocks" \
      "$([ "$COLON_PATHS" -eq 0 ] && echo true || echo false)" \
      "0 violations" "$COLON_PATHS skills with colon paths"

    log_info "Scanned $TOTAL_SKILLS skills: $BACKSLASH_PATHS backslash violations, $COLON_PATHS colon violations"
    ;;

  *)
    log_fail "Unknown audit probe: $PROBE_ID"
    add_assertion "Known probe ID" false "$PROBE_ID" "unknown"
    ;;
  esac
  ;;

# ============================================================
# STABILITY Probe — Repeat N times, measure success rate
# ============================================================
stability)
  case "$PROBE_ID" in

  bash-variable-stability)
    log_info "Running bash variable stability tests..."
    MIN_RUNS=5
    TOTAL_PASS=0
    TOTAL_FAIL=0

    for run in $(seq 1 $MIN_RUNS); do
      RUN_PASS=0
      RUN_FAIL=0

      # Test 1: variable survives pipe (newline separation)
      RESULT=$(bash -c '
        TESTVAR="/c/Users/fangkun/test/path"
        echo "$TESTVAR" | grep -q "/c/Users" && echo "PASS" || echo "FAIL"
      ' 2>/dev/null)
      if [ "$RESULT" = "PASS" ]; then
        RUN_PASS=$((RUN_PASS + 1))
      else
        RUN_FAIL=$((RUN_FAIL + 1))
      fi

      # Test 2: POSIX path with spaces in pipe
      RESULT=$(bash -c '
        CASE_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases/active/123"
        echo "$CASE_DIR" | grep -q "EngineerBrain" && echo "PASS" || echo "FAIL"
      ' 2>/dev/null)
      if [ "$RESULT" = "PASS" ]; then
        RUN_PASS=$((RUN_PASS + 1))
      else
        RUN_FAIL=$((RUN_FAIL + 1))
      fi

      # Test 3: no semicolon+pipe anti-pattern in executors
      # Exclude detector files (observability-scanner.sh / observability-runner.sh) to avoid self-match
      RESULT=$(bash -c '
        COUNT=$(grep -rn ";\s*[A-Z_]\+=" "'"$EXECUTORS_DIR"'"/*.sh 2>/dev/null | grep -v "observability-scanner\|observability-runner" | grep "|" | grep -v "grep\|#\|echo\|log_" | wc -l)
        [ "$COUNT" -eq 0 ] && echo "PASS" || echo "FAIL"
      ' 2>/dev/null)
      if [ "$RESULT" = "PASS" ]; then
        RUN_PASS=$((RUN_PASS + 1))
      else
        RUN_FAIL=$((RUN_FAIL + 1))
      fi

      if [ "$RUN_FAIL" -eq 0 ]; then
        TOTAL_PASS=$((TOTAL_PASS + 1))
      else
        TOTAL_FAIL=$((TOTAL_FAIL + 1))
      fi

      log_info "  Run $run: ${RUN_PASS} pass, ${RUN_FAIL} fail"
    done

    TOTAL=$((TOTAL_PASS + TOTAL_FAIL))
    if [ "$TOTAL" -gt 0 ]; then
      SUCCESS_RATE=$(node -e "console.log(($TOTAL_PASS / $TOTAL).toFixed(2))" 2>/dev/null || echo "0")
    else
      SUCCESS_RATE="0"
    fi

    add_assertion "Bash variable stability (${MIN_RUNS} runs)" \
      "$([ "$TOTAL_FAIL" -eq 0 ] && echo true || echo false)" \
      "100% success" "${SUCCESS_RATE} (${TOTAL_PASS}/${TOTAL} runs passed)"

    log_info "Stability: $TOTAL_PASS/$TOTAL runs passed (rate: $SUCCESS_RATE)"
    ;;

  learnings-regression)
    log_info "Running learnings regression checks..."
    LEARNINGS_FILE="$TESTS_ROOT/learnings.yaml"
    CHECKS_PASS=0
    CHECKS_FAIL=0

    if [ ! -f "$LEARNINGS_FILE" ]; then
      log_fail "Learnings file not found: $LEARNINGS_FILE"
      add_assertion "Learnings file exists" false "exists" "not found"
    else
      # Check 1: POSIX path format works
      RESULT=$(bash -c 'echo "/c/Users/fangkun" | grep -q "^/[a-z]/" && echo "PASS" || echo "FAIL"' 2>/dev/null)
      if [ "$RESULT" = "PASS" ]; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "path-format-git-bash: POSIX path format valid"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "path-format-git-bash: POSIX path format broken"
      fi

      # Check 2: All agents have name field
      RESULT=$(bash -c '
        MISSING=0
        for f in "'"$PROJECT_ROOT"'"/.claude/agents/*.md; do
          [ -f "$f" ] || continue
          head -20 "$f" | grep -q "^name:" || MISSING=$((MISSING+1))
        done
        [ "$MISSING" -eq 0 ] && echo "PASS" || echo "FAIL"
      ' 2>/dev/null)
      if [ "$RESULT" = "PASS" ]; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "agent-name-required: all agents have name"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "agent-name-required: some agents missing name"
      fi

      # Check 3: Playwright uses msedge
      MCP_FILE="$PROJECT_ROOT/.mcp.json"
      if [ -f "$MCP_FILE" ] && grep -q "msedge" "$MCP_FILE" 2>/dev/null; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "playwright-msedge-only: msedge configured"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "playwright-msedge-only: msedge not configured"
      fi

      # Check 4: browser_snapshot in blocked list
      if grep -q "browser_snapshot" "$TESTS_ROOT/safety.yaml" 2>/dev/null; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "browser-snapshot-ban: still in safety.yaml"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "browser-snapshot-ban: missing from safety.yaml"
      fi

      # Check 5: No taskkill node.exe in safe list
      SAFE_SECTION=$(sed -n '/^  safe:/,/^  blocked:/p' "$TESTS_ROOT/safety.yaml" 2>/dev/null)
      if echo "$SAFE_SECTION" | grep -q "taskkill.*node" 2>/dev/null; then
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "node-kill-safety: taskkill node found in safe list"
      else
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "node-kill-safety: taskkill node not in safe list"
      fi

      # Check 6: playwright-profile-path — no relative --profile in mcp.json
      MCP_FILE="$PROJECT_ROOT/.mcp.json"
      if grep -q '"--profile"' "$MCP_FILE" 2>/dev/null && grep -q '"--profile", "\.' "$MCP_FILE" 2>/dev/null; then
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "playwright-profile-path: relative --profile path found in .mcp.json"
      else
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "playwright-profile-path: no relative --profile path in .mcp.json"
      fi

      # Check 7: d365-tab-guard — _init.ps1 exists (contains tab guard logic)
      if [ -f "$PROJECT_ROOT/skills/d365-case-ops/scripts/_init.ps1" ]; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "d365-tab-guard: _init.ps1 exists"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "d365-tab-guard: _init.ps1 missing"
      fi

      # Check 8: d365-param-name — no -CaseNumber in D365 scripts
      BAD_PARAM=$(grep -r "\-CaseNumber" "$PROJECT_ROOT/skills/d365-case-ops/scripts/"*.ps1 2>/dev/null | wc -l)
      if [ "$BAD_PARAM" -eq 0 ]; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "d365-param-name: no -CaseNumber usage found"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "d365-param-name: $BAD_PARAM scripts still using -CaseNumber"
      fi

      # Check 9: teams-filter-unsupported — teams-search SKILL uses SearchTeam (not filter/orderby)
      if grep -q "SearchTeam" "$PROJECT_ROOT/.claude/skills/teams-search/SKILL.md" 2>/dev/null; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "teams-filter-unsupported: SearchTeamMessages found in teams-search SKILL"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "teams-filter-unsupported: SearchTeamMessages not found in teams-search SKILL"
      fi

      # Check 10: fetch-emails-false-positive — e2e-runner uses tail for output detection
      if grep -q "tail" "$TESTS_ROOT/executors/e2e-runner.sh" 2>/dev/null; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "fetch-emails-false-positive: e2e-runner uses tail for output detection"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "fetch-emails-false-positive: e2e-runner may use full output for PASS/FAIL detection"
      fi

      # Check 11: casework-fresh-cache-slow — no active fresh-cache setup in workflow-e2e tests
      # Exclude comment lines (lines starting with #) that merely mention "fresh_cache removed"
      FRESH_CACHE=$(grep -l "rm -rf.*context\|rm -rf.*emails\|setup.*fresh.*cache\|delete_case_data" "$TESTS_ROOT/registry/workflow-e2e/"*.yaml 2>/dev/null | wc -l)
      if [ "$FRESH_CACHE" -eq 0 ]; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "casework-fresh-cache-slow: no active fresh-cache setup in e2e tests"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "casework-fresh-cache-slow: $FRESH_CACHE e2e tests use fresh-cache setup"
      fi

      # Check 12: fix-incremental — incremental.yaml has updated timeouts
      if grep -q "1200\|1800" "$TESTS_ROOT/registry/workflow-e2e/incremental.yaml" 2>/dev/null; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "fix-incremental: incremental.yaml has correct timeouts (1200/1800s)"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "fix-incremental: incremental.yaml timeout not updated"
      fi

      # Check 13: fix-state-routing — state-routing.yaml has updated timeouts
      if grep -q "900\|1200" "$TESTS_ROOT/registry/workflow-e2e/state-routing.yaml" 2>/dev/null; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "fix-state-routing: state-routing.yaml has correct timeouts (900/1200s)"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "fix-state-routing: state-routing.yaml timeout not updated"
      fi

      # Check 14: fix-error-recovery — error-recovery.yaml has updated timeouts
      if grep -q "900\|1200" "$TESTS_ROOT/registry/workflow-e2e/error-recovery.yaml" 2>/dev/null; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "fix-error-recovery: error-recovery.yaml has correct timeouts (900/1200s)"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "fix-error-recovery: error-recovery.yaml timeout not updated"
      fi

      # Check 15: judge-field-paths — no judge. prefix in workflow-e2e test assertions
      BAD_JUDGE=$(grep -r "json_field.*judge\." "$TESTS_ROOT/registry/workflow-e2e/"*.yaml 2>/dev/null | wc -l)
      if [ "$BAD_JUDGE" -eq 0 ]; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "judge-field-paths: no judge. prefix in test assertions"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "judge-field-paths: $BAD_JUDGE assertions still using judge. prefix"
      fi

      # Check 16: auto-heal-20260328-1538 — no stale progress files
      STALE_PROGRESS=$(find "$TESTS_ROOT/results" -name ".progress-*.json" -mmin +30 2>/dev/null | wc -l)
      if [ "$STALE_PROGRESS" -eq 0 ]; then
        CHECKS_PASS=$((CHECKS_PASS + 1))
        log_pass "auto-heal-20260328-1538: no stale progress files (>30min)"
      else
        CHECKS_FAIL=$((CHECKS_FAIL + 1))
        log_fail "auto-heal-20260328-1538: $STALE_PROGRESS stale progress files detected"
      fi

      TOTAL=$((CHECKS_PASS + CHECKS_FAIL))
      add_assertion "All learnings still valid ($TOTAL checks)" \
        "$([ "$CHECKS_FAIL" -eq 0 ] && echo true || echo false)" \
        "${TOTAL}/${TOTAL} pass" "${CHECKS_PASS}/${TOTAL} pass"

      if [ "$CHECKS_FAIL" -gt 0 ]; then
        add_assertion "No regressions detected" false \
          "0 regressions" "$CHECKS_FAIL regressions"
      else
        add_assertion "No regressions detected" true \
          "0 regressions" "0 regressions"
      fi
    fi

    log_info "Learnings check: $CHECKS_PASS pass, $CHECKS_FAIL fail"
    ;;

  learnings-regression-infra)
    log_info "Running learnings regression — infrastructure fixes..."
    CHECKS_PASS=0
    CHECKS_FAIL=0

    # Check 1: timing-json-stale-fallback — poll_start logic in common.sh
    if grep -q "poll_start" "$TESTS_ROOT/executors/common.sh" 2>/dev/null; then
      CHECKS_PASS=$((CHECKS_PASS + 1))
      log_pass "timing-json-stale-fallback: poll_start logic found in common.sh"
    else
      CHECKS_FAIL=$((CHECKS_FAIL + 1))
      log_fail "timing-json-stale-fallback: poll_start logic missing in common.sh"
    fi

    # Check 2: local-outside-function — no bare 'local' at top-level in e2e-runner.sh
    COUNT=$(grep -n "^local " "$TESTS_ROOT/executors/e2e-runner.sh" 2>/dev/null | grep -v "^[0-9]*:.*function\|^[0-9]*:[[:space:]]*local " | wc -l)
    if [ "$COUNT" -eq 0 ]; then
      CHECKS_PASS=$((CHECKS_PASS + 1))
      log_pass "local-outside-function: no bare local at top-level"
    else
      CHECKS_FAIL=$((CHECKS_FAIL + 1))
      log_fail "local-outside-function: $COUNT bare 'local' at top-level"
    fi

    # Check 3: node-posix-path — cygpath in e2e-runner.sh
    if grep -q "cygpath" "$TESTS_ROOT/executors/e2e-runner.sh" 2>/dev/null; then
      CHECKS_PASS=$((CHECKS_PASS + 1))
      log_pass "node-posix-path: cygpath found in e2e-runner.sh"
    else
      CHECKS_FAIL=$((CHECKS_FAIL + 1))
      log_fail "node-posix-path: cygpath not found in e2e-runner.sh"
    fi

    # Check 4: state-json-atomic-write — state-writer.sh exists
    if [ -f "$TESTS_ROOT/executors/state-writer.sh" ]; then
      CHECKS_PASS=$((CHECKS_PASS + 1))
      log_pass "state-json-atomic-write: state-writer.sh exists"
    else
      CHECKS_FAIL=$((CHECKS_FAIL + 1))
      log_fail "state-json-atomic-write: state-writer.sh not found"
    fi

    # Check 5: judge-field-paths — no deprecated judge.xxx paths in regression test defs
    FAIL=0
    for f in "$TESTS_ROOT/registry/workflow-e2e/regression-judge-cache.yaml" "$TESTS_ROOT/registry/workflow-e2e/regression-days-contact.yaml"; do
      if grep -q "judge\." "$f" 2>/dev/null; then
        FAIL=1
        log_fail "judge-field-paths: $f still uses deprecated judge.xxx path"
      fi
    done
    if [ "$FAIL" -eq 0 ]; then
      CHECKS_PASS=$((CHECKS_PASS + 1))
      log_pass "judge-field-paths: no deprecated judge.xxx paths"
    else
      CHECKS_FAIL=$((CHECKS_FAIL + 1))
    fi

    # Check 6: auto-heal infrastructure — pattern-detector + self-heal-recorder exist
    if [ -f "$TESTS_ROOT/executors/pattern-detector.sh" ] && [ -f "$TESTS_ROOT/executors/self-heal-recorder.sh" ]; then
      CHECKS_PASS=$((CHECKS_PASS + 1))
      log_pass "auto-heal-infra: pattern-detector.sh and self-heal-recorder.sh exist"
    else
      CHECKS_FAIL=$((CHECKS_FAIL + 1))
      log_fail "auto-heal-infra: pattern-detector.sh or self-heal-recorder.sh missing"
    fi

    # Check 7: variable-pipe-gotcha — no var assignment + pipe anti-pattern
    FOUND=$(grep -rn "; [A-Z_]*=" "$TESTS_ROOT/executors/"*.sh 2>/dev/null | grep "|" | grep -v "^Binary\|#\|observability-" | head -3)
    if [ -z "$FOUND" ]; then
      CHECKS_PASS=$((CHECKS_PASS + 1))
      log_pass "variable-pipe-gotcha: no anti-pattern found"
    else
      CHECKS_FAIL=$((CHECKS_FAIL + 1))
      log_fail "variable-pipe-gotcha: potential anti-pattern found: $FOUND"
    fi

    TOTAL=$((CHECKS_PASS + CHECKS_FAIL))
    add_assertion "All infra learnings still valid ($TOTAL checks)" \
      "$([ "$CHECKS_FAIL" -eq 0 ] && echo true || echo false)" \
      "${TOTAL}/${TOTAL} pass" "${CHECKS_PASS}/${TOTAL} pass"

    if [ "$CHECKS_FAIL" -gt 0 ]; then
      add_assertion "No infra regressions detected" false \
        "0 regressions" "$CHECKS_FAIL regressions"
    else
      add_assertion "No infra regressions detected" true \
        "0 regressions" "0 regressions"
    fi

    log_info "Infra learnings check: $CHECKS_PASS pass, $CHECKS_FAIL fail"
    ;;

  *)
    log_fail "Unknown stability probe: $PROBE_ID"
    add_assertion "Known probe ID" false "$PROBE_ID" "unknown"
    ;;
  esac
  ;;

# ============================================================
# METRIC Probe — Collect metrics, compare against baselines
# ============================================================
metric)
  case "$PROBE_ID" in

  casework-timing-baseline)
    log_info "Checking casework timing baselines..."

    # Read cases root from config.json
    CONFIG_FILE="$PROJECT_ROOT/config.json"
    CASES_ROOT=""
    if [ -f "$CONFIG_FILE" ]; then
      CASES_ROOT=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
        const c = JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8'));
        // Convert Windows path to POSIX
        let p = c.casesRoot || '';
        p = p.replace(/\\\\/g, '/').replace(/^([A-Z]):/, (m,d) => '/' + d.toLowerCase());
        console.log(p);
      " 2>/dev/null)
    fi

    if [ -z "$CASES_ROOT" ]; then
      CASES_ROOT="$PROJECT_ROOT/cases"
    fi

    # Find timing.json files
    TIMING_FILES=$(find "$CASES_ROOT/active" -name "timing.json" -type f 2>/dev/null | head -10)
    TIMING_COUNT=0
    TOTAL_VIOLATIONS=0
    STEP_WARNINGS=0

    if [ -z "$TIMING_FILES" ]; then
      log_warn "No timing.json files found in $CASES_ROOT/active"
      add_assertion "Timing data available" false ">=1 files" "0 files" "No timing.json found — run casework first"
    else
      # Read baselines
      BL_TOTAL=$(read_baseline "casework_timing.total_seconds.baseline")
      BL_TOTAL="${BL_TOTAL:-500}"
      BL_TOTAL_CRIT=$(read_baseline "casework_timing.total_seconds.critical_ratio")
      BL_TOTAL_CRIT="${BL_TOTAL_CRIT:-1.8}"
      BL_TOTAL_WARN=$(read_baseline "casework_timing.total_seconds.warn_ratio")
      BL_TOTAL_WARN="${BL_TOTAL_WARN:-1.3}"

      for timing_file in $TIMING_FILES; do
        [ -f "$timing_file" ] || continue
        TIMING_COUNT=$((TIMING_COUNT + 1))
        CASE_DIR=$(dirname "$timing_file")
        CASE_ID=$(basename "$CASE_DIR")

        # Read totalSeconds
        TOTAL_SEC=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
          const t = JSON.parse(require('fs').readFileSync('$timing_file','utf8'));
          console.log(t.totalSeconds || t.total_seconds || 0);
        " 2>/dev/null || echo "0")

        # Check total
        RESULT=$(check_ratio "$TOTAL_SEC" "$BL_TOTAL" "$BL_TOTAL_WARN" "$BL_TOTAL_CRIT")
        if [ "$RESULT" = "fail" ]; then
          TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + 1))
          log_fail "Case $CASE_ID: totalSeconds=$TOTAL_SEC exceeds critical (baseline=$BL_TOTAL × $BL_TOTAL_CRIT)"
        elif [ "$RESULT" = "warn" ]; then
          STEP_WARNINGS=$((STEP_WARNINGS + 1))
          log_warn "Case $CASE_ID: totalSeconds=$TOTAL_SEC exceeds warn (baseline=$BL_TOTAL × $BL_TOTAL_WARN)"
        fi

        # Check individual steps
        STEPS_JSON=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
          const t = JSON.parse(require('fs').readFileSync('$timing_file','utf8'));
          const steps = t.steps || {};
          Object.entries(steps).forEach(([k,v]) => {
            const sec = typeof v === 'object' ? (v.seconds || v.duration || 0) : v;
            console.log(k + ':' + sec);
          });
        " 2>/dev/null)

        while IFS=: read -r step_name step_sec; do
          [ -z "$step_name" ] && continue
          # Try to read baseline for this step
          BL_STEP=$(read_baseline "casework_timing.steps.${step_name}.baseline")
          BL_STEP_WARN=$(read_baseline "casework_timing.steps.${step_name}.warn_ratio")
          if [ -n "$BL_STEP" ] && [ "$BL_STEP" != "0" ]; then
            BL_STEP_WARN="${BL_STEP_WARN:-1.5}"
            STEP_RESULT=$(check_ratio "$step_sec" "$BL_STEP" "$BL_STEP_WARN")
            if [ "$STEP_RESULT" = "fail" ] || [ "$STEP_RESULT" = "warn" ]; then
              STEP_WARNINGS=$((STEP_WARNINGS + 1))
              log_warn "Case $CASE_ID step $step_name: ${step_sec}s (baseline: ${BL_STEP}s)"
            fi
          fi
        done <<< "$STEPS_JSON"
      done

      add_assertion "Total timing under critical threshold" \
        "$([ "$TOTAL_VIOLATIONS" -eq 0 ] && echo true || echo false)" \
        "0 violations" "$TOTAL_VIOLATIONS violations across $TIMING_COUNT cases"

      add_assertion "No step-level regressions" \
        "$([ "$STEP_WARNINGS" -eq 0 ] && echo true || echo false)" \
        "0 warnings" "$STEP_WARNINGS step warnings"

      log_info "Checked $TIMING_COUNT timing files: $TOTAL_VIOLATIONS critical, $STEP_WARNINGS warnings"
    fi
    ;;

  obs-uncovered-learnings-r28)
    log_info "Checking uncovered learnings ratio..."
    SCAN_OUTPUT=$(bash "$PROJECT_ROOT/tests/executors/observability-scanner.sh" 2>&1)
    # Extract "X of Y learnings not covered" from scanner output
    UNCOVERED=$(echo "$SCAN_OUTPUT" | grep -oP '^\d+(?= of \d+ learnings not covered)' || echo "")
    TOTAL_LEARNINGS=$(echo "$SCAN_OUTPUT" | grep -oP '(?<=of )\d+(?= learnings not covered)' || echo "")
    if [ -z "$UNCOVERED" ] || [ -z "$TOTAL_LEARNINGS" ] || [ "$TOTAL_LEARNINGS" -eq 0 ]; then
      add_assertion "Uncovered learnings ratio < 50%" true "<50%" "could not parse (assume ok)"
    else
      RATIO=$(( UNCOVERED * 100 / TOTAL_LEARNINGS ))
      add_assertion "Uncovered learnings ratio < 50%" \
        "$([ "$RATIO" -lt 50 ] && echo true || echo false)" \
        "<50%" "${RATIO}% (${UNCOVERED}/${TOTAL_LEARNINGS})"
      log_info "Uncovered learnings: $UNCOVERED / $TOTAL_LEARNINGS = ${RATIO}%"
    fi
    ;;

  *)
    log_fail "Unknown metric probe: $PROBE_ID"
    add_assertion "Known probe ID" false "$PROBE_ID" "unknown"
    ;;
  esac
  ;;

*)
  log_fail "Unknown probe type: $PROBE_TYPE"
  add_assertion "Valid probe type" false "metric|stability|audit" "$PROBE_TYPE"
  ;;
esac

# ============================================================
# Write Result
# ============================================================
finalize_assertions

ELAPSED=$(get_elapsed_ms)

# Determine overall status
if [ "$ASSERTIONS_FAILED" -gt 0 ]; then
  OVERALL_STATUS="fail"
else
  OVERALL_STATUS="pass"
fi

write_result "$ROUND" "$PROBE_ID" "$OVERALL_STATUS" "$ASSERTIONS_JSON" "null" "$ELAPSED"

log_info "=== Probe Complete ==="
log_info "Status: $OVERALL_STATUS ($ASSERTIONS_PASSED passed, $ASSERTIONS_FAILED failed)"
log_info "Duration: ${ELAPSED}ms"

# Output for test-loop
echo "PROBE_RESULT|$PROBE_ID|$OVERALL_STATUS|$ASSERTIONS_PASSED/$ASSERTION_COUNT|${ELAPSED}ms"
