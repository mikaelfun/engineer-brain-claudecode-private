#!/usr/bin/env bash
# tests/executors/architecture-scanner.sh — SCAN Phase: Architecture & Compliance Scanner
#
# Checks code health, CLAUDE.md compliance, and common anti-patterns:
# 1. CLAUDE.md compliance (POSIX paths, variable+pipe, agent frontmatter)
# 2. Code anti-patterns (set +u, hardcoded paths, browser_snapshot, direct state writes)
# 3. Dependency freshness (npm outdated summary)
# 4. Shell script quality (shellcheck-like heuristics)
#
# Usage: bash tests/executors/architecture-scanner.sh
# Output: GAP|architecture|arch-scan|{category}|{description}|{priority}
#         ARCHITECTURE_SCAN|{gap_count}|{details}
#
# Schedule: every_5_rounds (from scan-strategies.yaml)

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

log_info "=== Architecture & Compliance Scanner ==="

GAP_COUNT=0
DETAILS=""

# ============================================================
# 1. CLAUDE.md Compliance
# ============================================================
log_info "Checking CLAUDE.md compliance..."

# 1a. Windows-style paths in shell scripts (should use POSIX format)
WIN_PATH_HITS=0
for f in "$EXECUTORS_DIR"/*.sh "$PROJECT_ROOT/.claude/skills/"*/SKILL.md; do
  [ -f "$f" ] || continue
  # Skip comments and markdown code fences
  COUNT=$(grep -nE '[A-Z]:\\(Users|Windows|Program)' "$f" 2>/dev/null | grep -v '^\s*#' | grep -v '`.*\\\\.*`' | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    WIN_PATH_HITS=$((WIN_PATH_HITS + COUNT))
    FNAME=$(basename "$f")
    echo "GAP|architecture|arch-scan|workflow-e2e|$FNAME has $COUNT Windows-style path(s) (CLAUDE.md requires POSIX)|P2"
    GAP_COUNT=$((GAP_COUNT + 1))
  fi
done

if [ "$WIN_PATH_HITS" -gt 0 ]; then
  DETAILS="${DETAILS}win_paths($WIN_PATH_HITS) "
fi

# 1b. Variable assignment + pipe anti-pattern (; VAR=... | ...)
PIPE_HITS=0
for f in "$EXECUTORS_DIR"/*.sh "$PROJECT_ROOT/.claude/skills/"*/SKILL.md; do
  [ -f "$f" ] || continue
  # Pattern: semicolon followed by VAR= on same line that also has |
  COUNT=$(grep -nE ';\s*[A-Z_]+=' "$f" 2>/dev/null | grep '|' | grep -v '^\s*#' | grep -v '^\s*|' | grep -v '`.*; VAR=.*`' | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    PIPE_HITS=$((PIPE_HITS + COUNT))
    FNAME=$(basename "$f")
    echo "GAP|architecture|arch-scan|workflow-e2e|$FNAME has $COUNT semicolon+var+pipe anti-pattern(s)|P2"
    GAP_COUNT=$((GAP_COUNT + 1))
  fi
done

if [ "$PIPE_HITS" -gt 0 ]; then
  DETAILS="${DETAILS}var_pipe($PIPE_HITS) "
fi

# 1c. Agent frontmatter completeness
AGENT_ISSUES=0
for f in "$PROJECT_ROOT/.claude/agents/"*.md; do
  [ -f "$f" ] || continue
  FNAME=$(basename "$f")
  HAS_NAME=$(head -20 "$f" | grep -c "^name:" || true)
  HAS_DESC=$(head -20 "$f" | grep -c "^description:" || true)
  HAS_TOOLS=$(head -20 "$f" | grep -c "^tools:" || true)

  if [ "$HAS_NAME" -eq 0 ] || [ "$HAS_DESC" -eq 0 ]; then
    echo "GAP|architecture|arch-scan|workflow-e2e|Agent $FNAME missing required frontmatter (name/description)|P1"
    GAP_COUNT=$((GAP_COUNT + 1))
    AGENT_ISSUES=$((AGENT_ISSUES + 1))
  fi
done

if [ "$AGENT_ISSUES" -gt 0 ]; then
  DETAILS="${DETAILS}agent_fm($AGENT_ISSUES) "
fi

# ============================================================
# 2. Code Anti-patterns
# ============================================================
log_info "Checking code anti-patterns..."

# 2a. set +u in shell scripts (should be set -u for strict mode)
SET_PLUS_U=0
for f in "$EXECUTORS_DIR"/*.sh; do
  [ -f "$f" ] || continue
  # Check for 'set +u' that's not in a comment
  COUNT=$(grep -nE '^\s*set \+u' "$f" 2>/dev/null | grep -v '#' | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    SET_PLUS_U=$((SET_PLUS_U + COUNT))
    FNAME=$(basename "$f")
    echo "GAP|architecture|arch-scan|workflow-e2e|$FNAME uses 'set +u' ($COUNT times) — should use 'set -u'|P2"
    GAP_COUNT=$((GAP_COUNT + 1))
  fi
done

if [ "$SET_PLUS_U" -gt 0 ]; then
  DETAILS="${DETAILS}set_plus_u($SET_PLUS_U) "
fi

# 2b. Hardcoded absolute paths in scripts (should use $PROJECT_ROOT/$TESTS_ROOT)
HARDCODED=0
for f in "$EXECUTORS_DIR"/*.sh; do
  [ -f "$f" ] || continue
  FNAME=$(basename "$f")
  # Skip common.sh (it defines the root paths)
  [ "$FNAME" = "common.sh" ] && continue
  # Look for absolute POSIX paths that should be variables
  COUNT=$(grep -nE '"/c/Users/[^"]*' "$f" 2>/dev/null | grep -v 'PROJECT_ROOT\|TESTS_ROOT\|DASHBOARD_DIR\|CASES_ROOT' | grep -v '#' | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    HARDCODED=$((HARDCODED + COUNT))
    echo "GAP|architecture|arch-scan|workflow-e2e|$FNAME has $COUNT hardcoded absolute path(s) — use \$PROJECT_ROOT|P3"
    GAP_COUNT=$((GAP_COUNT + 1))
  fi
done

if [ "$HARDCODED" -gt 0 ]; then
  DETAILS="${DETAILS}hardcoded_paths($HARDCODED) "
fi

# 2c. browser_snapshot usage (banned per CLAUDE.md)
SNAPSHOT_HITS=$(grep -rl 'browser_snapshot' "$PROJECT_ROOT/.claude/skills" "$PROJECT_ROOT/.claude/agents" 2>/dev/null | wc -l)
if [ "$SNAPSHOT_HITS" -gt 0 ]; then
  echo "GAP|architecture|arch-scan|workflow-e2e|$SNAPSHOT_HITS file(s) reference banned 'browser_snapshot' (CLAUDE.md)|P1"
  GAP_COUNT=$((GAP_COUNT + 1))
  DETAILS="${DETAILS}snapshot_banned($SNAPSHOT_HITS) "
fi

# 2d. Direct state.json writes (should use state-writer.sh or the agent's write protocol)
# Check executors (excluding common.sh and state-writer.sh itself) for direct writes
STATE_WRITES=0
for f in "$EXECUTORS_DIR"/*.sh; do
  [ -f "$f" ] || continue
  FNAME=$(basename "$f")
  # Skip files that legitimately write state
  case "$FNAME" in
    common.sh|state-writer.sh|stats-reporter.sh|queue-recycler.sh) continue ;;
  esac
  COUNT=$(grep -nE 'state\.json' "$f" 2>/dev/null | grep -E '(cat >|echo.*>|write|>>)' | grep -v '#' | wc -l)
  if [ "$COUNT" -gt 0 ]; then
    STATE_WRITES=$((STATE_WRITES + COUNT))
    echo "GAP|architecture|arch-scan|workflow-e2e|$FNAME has $COUNT direct state.json write(s) — use state-writer.sh|P2"
    GAP_COUNT=$((GAP_COUNT + 1))
  fi
done

if [ "$STATE_WRITES" -gt 0 ]; then
  DETAILS="${DETAILS}direct_state_write($STATE_WRITES) "
fi

# ============================================================
# 3. Dependency Freshness (lightweight — skip if npm not available)
# ============================================================
log_info "Checking dependency freshness..."

if command -v npm &>/dev/null && [ -f "$DASHBOARD_DIR/package.json" ]; then
  # Quick check: count outdated packages (major versions only)
  OUTDATED_COUNT=$(cd "$DASHBOARD_DIR" && npm outdated --json 2>/dev/null | node -e "
    let data = '';
    process.stdin.on('data', d => data += d);
    process.stdin.on('end', () => {
      try {
        const pkgs = JSON.parse(data || '{}');
        let major = 0;
        for (const [name, info] of Object.entries(pkgs)) {
          const current = (info.current || '0').split('.')[0];
          const latest = (info.latest || '0').split('.')[0];
          if (current !== latest) major++;
        }
        console.log(major);
      } catch { console.log(0); }
    });
  " 2>/dev/null || echo "0")

  if [ "$OUTDATED_COUNT" -gt 5 ]; then
    echo "GAP|architecture|arch-scan|unit-test|$OUTDATED_COUNT major version updates available in dashboard/package.json|P3"
    GAP_COUNT=$((GAP_COUNT + 1))
    DETAILS="${DETAILS}outdated_deps($OUTDATED_COUNT) "
  else
    log_info "Dependency check: $OUTDATED_COUNT major updates (threshold: >5)"
  fi
else
  log_info "npm not available or package.json missing — dep check skipped"
fi

# ============================================================
# 4. Shell Script Quality Heuristics
# ============================================================
log_info "Checking shell script quality..."

# 4a. Scripts missing 'set -u' (unbound variable protection)
MISSING_SET_U=0
for f in "$EXECUTORS_DIR"/*.sh; do
  [ -f "$f" ] || continue
  FNAME=$(basename "$f")
  # Skip common.sh (it has set -u and is sourced by others)
  [ "$FNAME" = "common.sh" ] && continue
  # Check if script sources common.sh (which provides set -u) or sets it directly
  HAS_SET_U=$(grep -c 'set -u\|set -eu\|source.*common\.sh' "$f" 2>/dev/null || echo "0")
  if [ "$HAS_SET_U" -eq 0 ]; then
    echo "GAP|architecture|arch-scan|workflow-e2e|$FNAME missing 'set -u' or 'source common.sh'|P2"
    GAP_COUNT=$((GAP_COUNT + 1))
    MISSING_SET_U=$((MISSING_SET_U + 1))
  fi
done

if [ "$MISSING_SET_U" -gt 0 ]; then
  DETAILS="${DETAILS}no_set_u($MISSING_SET_U) "
fi

# ============================================================
# Summary
# ============================================================
log_info "=== Architecture Scanner Complete ==="
log_info "Gaps found: $GAP_COUNT"
log_info "Details: ${DETAILS:-none}"

echo "ARCHITECTURE_SCAN|$GAP_COUNT|${DETAILS:-none}"

if [ "$GAP_COUNT" -gt 0 ]; then
  log_warn "$GAP_COUNT architecture/compliance issues found"
else
  log_pass "No architecture violations detected"
fi
