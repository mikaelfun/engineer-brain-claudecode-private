#!/usr/bin/env bash
# tests/executors/fix-analyzer.sh — FIX Phase: Analyze failure and prepare fix context
#
# Usage: bash tests/executors/fix-analyzer.sh <test-id> <round>
# Example: bash tests/executors/fix-analyzer.sh auth-endpoints 0
#
# Reads: tests/results/<round>-<test-id>.json (failure details)
#        tests/registry/<category>/<test-id>.yaml (test definition)
# Writes: tests/results/fixes/<test-id>-analysis.md (root cause analysis)
#
# This script prepares the context for a FIX agent to analyze and fix.
# It doesn't fix the code itself — that's the agent's job.
# It extracts: actual vs expected, related source files, and suggested fix approach.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TEST_ID="${1:?Usage: fix-analyzer.sh <test-id> <round>}"
ROUND="${2:-0}"

RESULT_FILE="$RESULTS_DIR/${ROUND}-${TEST_ID}.json"
FIXES_DIR="$RESULTS_DIR/fixes"
mkdir -p "$FIXES_DIR"

if [ ! -f "$RESULT_FILE" ]; then
  log_fail "Result file not found: $RESULT_FILE"
  exit 1
fi

# Initialize progress tracking for supervisor visibility
init_progress
write_progress "$TEST_ID" "fix_analysis" "Analyzing failure for $TEST_ID (round $ROUND)" "fix"

log_info "=== FIX Analyzer ==="
log_info "Test: $TEST_ID (Round $ROUND)"

# ============================================================
# Read result file
# ============================================================
RESULT_JSON=$(cat "$RESULT_FILE")

STATUS=$(echo "$RESULT_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));const s=d.status||d.result||'unknown';console.log(s.toLowerCase())" 2>/dev/null || echo "unknown")

if [ "$STATUS" != "fail" ]; then
  log_info "Test status is '$STATUS' — no fix needed"
  exit 0
fi

# Extract failed assertions (handles both schemas: d.assertions[] and d.failureReason)
FAILED_ASSERTIONS=$(echo "$RESULT_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
if (d.failureReason && (!d.assertions || d.assertions.length === 0)) {
  console.log('- failure: ' + d.failureReason);
} else if (Array.isArray(d.assertions)) {
  const failed = d.assertions.filter(a => a.pass === false);
  failed.forEach(a => {
    console.log('- ' + a.name + ': expected=' + a.expected + ', actual=' + a.actual + (a.note ? ' (' + a.note + ')' : ''));
  });
}
" 2>/dev/null || echo "Could not parse assertions")

log_info "Failed assertions:"
echo "$FAILED_ASSERTIONS"

# ============================================================
# Find test definition to determine category and source
# ============================================================
CATEGORY=""
for cat_dir in backend-api ui-interaction ui-visual workflow-e2e frontend observability; do
  if [ -f "$REGISTRY_DIR/$cat_dir/${TEST_ID}.yaml" ]; then
    CATEGORY="$cat_dir"
    break
  fi
done

if [ -z "$CATEGORY" ]; then
  log_warn "Could not find test definition for $TEST_ID"
  CATEGORY="unknown"
fi

# Extract source from test definition
SOURCE=""
if [ -f "$REGISTRY_DIR/$CATEGORY/${TEST_ID}.yaml" ]; then
  SOURCE=$(grep "^source:" "$REGISTRY_DIR/$CATEGORY/${TEST_ID}.yaml" | sed 's/source: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | tr -d '\r"')
fi

# ============================================================
# Classify failure type
# ============================================================
FAILURE_TYPE="unknown"

# Check for common patterns
if echo "$FAILED_ASSERTIONS" | grep -qi "field mismatch\|schema\|shape"; then
  FAILURE_TYPE="schema_mismatch"
elif echo "$FAILED_ASSERTIONS" | grep -qi "401\|403\|unauthorized\|forbidden"; then
  FAILURE_TYPE="auth_issue"
elif echo "$FAILED_ASSERTIONS" | grep -qi "404\|not found"; then
  FAILURE_TYPE="endpoint_missing"
elif echo "$FAILED_ASSERTIONS" | grep -qi "500\|internal server error"; then
  FAILURE_TYPE="server_error"
elif echo "$FAILED_ASSERTIONS" | grep -qi "timeout\|ETIMEDOUT"; then
  FAILURE_TYPE="timeout"
elif echo "$FAILED_ASSERTIONS" | grep -qi "missing\|not exist"; then
  FAILURE_TYPE="missing_file"
elif echo "$FAILED_ASSERTIONS" | grep -qi "connection refused\|ECONNREFUSED"; then
  FAILURE_TYPE="service_down"
elif echo "$FAILED_ASSERTIONS" | grep -qi "baseline\|exceeds critical\|violations"; then
  FAILURE_TYPE="performance_regression"
elif echo "$FAILED_ASSERTIONS" | grep -qi "missing name\|missing desc\|bad format\|comma.separated\|frontmatter\|delegation"; then
  FAILURE_TYPE="config_drift"
elif echo "$FAILED_ASSERTIONS" | grep -qi "stability\|success.rate\|regression.*check"; then
  FAILURE_TYPE="platform_instability"
else
  FAILURE_TYPE="logic_error"
fi

log_info "Failure type: $FAILURE_TYPE"

# ============================================================
# Determine if this is env_issue or code_bug (initial pass)
# ============================================================
IS_ENV_ISSUE=false
case "$FAILURE_TYPE" in
  auth_issue|service_down|timeout|platform_instability)
    IS_ENV_ISSUE=true
    ;;
esac

# Override: check envIssue field in result JSON (takes precedence over keyword matching)
# Fixes: fix-analyzer.sh misclassified envIssue:true results as logic_error (round 28)
ENV_ISSUE_FROM_JSON=$(echo "$RESULT_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
console.log(d.envIssue===true ? 'true' : 'false');
" 2>/dev/null || echo "false")
if [ "$ENV_ISSUE_FROM_JSON" = "true" ]; then
  IS_ENV_ISSUE=true
  FAILURE_TYPE="service_down"
  log_info "envIssue=true from result JSON — overriding classification to service_down/env_issue"
fi

# ============================================================
# Root Cause Trace — upgrade env_issue to code_bug if config issue
# ============================================================
TRACE_RESULT=""
TRACE_PATH=""

if [ "$IS_ENV_ISSUE" = true ]; then
  log_info "Running Root Cause Trace for $FAILURE_TYPE..."
  write_progress "$TEST_ID" "fix_trace" "Root Cause Trace: checking if env_issue is actually config_missing" "fix"

  # Step 1: Extract API endpoint from test result or definition
  API_ENDPOINT=""
  if [ -f "$REGISTRY_DIR/$CATEGORY/${TEST_ID}.yaml" ]; then
    API_ENDPOINT=$(grep -E "^\s*(endpoint|url|path):" "$REGISTRY_DIR/$CATEGORY/${TEST_ID}.yaml" 2>/dev/null | head -1 | sed 's/^[^:]*: *"\{0,1\}\(.*\)"\{0,1\}$/\1/' | tr -d '\r"')
  fi
  # Also try to extract from failed assertion text
  if [ -z "$API_ENDPOINT" ]; then
    API_ENDPOINT=$(echo "$FAILED_ASSERTIONS" | grep -oE '/api/[a-zA-Z0-9/_-]+' | head -1)
  fi
  TRACE_PATH="test:$TEST_ID"

  if [ -n "$API_ENDPOINT" ]; then
    TRACE_PATH="$TRACE_PATH → endpoint:$API_ENDPOINT"

    # Step 2: Find handler file for this endpoint
    HANDLER_FILE=""
    ROUTE_PATTERN=$(echo "$API_ENDPOINT" | sed 's|/api/||; s|/[0-9][0-9]*||g; s|/|.*|g' | head -c 50)
    if [ -n "$ROUTE_PATTERN" ]; then
      HANDLER_FILE=$(grep -rl "$ROUTE_PATTERN" "$PROJECT_ROOT/dashboard/src/routes/" 2>/dev/null | head -1)
    fi

    if [ -n "$HANDLER_FILE" ]; then
      TRACE_PATH="$TRACE_PATH → handler:$(basename "$HANDLER_FILE")"

      # Step 3: Check if handler involves session/agent spawn
      HAS_SESSION_SPAWN=false
      if grep -qE "createSession|spawnSession|SessionManager|claude.*session|agent.*sdk" "$HANDLER_FILE" 2>/dev/null; then
        HAS_SESSION_SPAWN=true
        TRACE_PATH="$TRACE_PATH → session_spawn:yes"

        # Step 4: Check if session spawn has mcpServers config
        SESSION_MGR="$PROJECT_ROOT/dashboard/src/agent/case-session-manager.ts"
        if [ -f "$SESSION_MGR" ]; then
          HAS_MCP_CONFIG=$(grep -c "mcpServers" "$SESSION_MGR" 2>/dev/null || echo "0")
          if [ "$HAS_MCP_CONFIG" -eq 0 ]; then
            TRACE_RESULT="config_missing: session spawn lacks mcpServers configuration"
            TRACE_PATH="$TRACE_PATH → mcpServers:MISSING"
            IS_ENV_ISSUE=false
            FAILURE_TYPE="config_missing"
            log_warn "Root Cause Trace: DOWNGRADED env_issue → config_missing (mcpServers not configured)"
          else
            # Check if specific MCP might be missing
            MISSING_MCPS=""
            for mcp_name in teams icm mail kusto; do
              if echo "$FAILED_ASSERTIONS" | grep -qi "$mcp_name" && ! grep -q "\"$mcp_name\"" "$SESSION_MGR" 2>/dev/null; then
                MISSING_MCPS="$MISSING_MCPS $mcp_name"
              fi
            done
            if [ -n "$MISSING_MCPS" ]; then
              TRACE_RESULT="config_missing: session spawn may lack MCP:$MISSING_MCPS"
              TRACE_PATH="$TRACE_PATH → missing_mcp:$MISSING_MCPS"
              IS_ENV_ISSUE=false
              FAILURE_TYPE="config_missing"
              log_warn "Root Cause Trace: DOWNGRADED env_issue → config_missing (missing MCP:$MISSING_MCPS)"
            else
              TRACE_RESULT="env_confirmed: session spawn has mcpServers, likely transient"
              TRACE_PATH="$TRACE_PATH → mcpServers:present → env_confirmed"
            fi
          fi
        else
          TRACE_RESULT="trace_incomplete: case-session-manager.ts not found"
          TRACE_PATH="$TRACE_PATH → session_mgr:NOT_FOUND"
        fi
      else
        # Handler doesn't involve session spawn — check for other config issues
        # Check if handler reads config files that might be missing
        HAS_CONFIG_READ=$(grep -cE "readFileSync|config\.json|\.env|env\.yaml" "$HANDLER_FILE" 2>/dev/null || echo "0")
        if [ "$HAS_CONFIG_READ" -gt 0 ]; then
          TRACE_RESULT="possible_config: handler reads config files, may be misconfigured"
          TRACE_PATH="$TRACE_PATH → config_reads:$HAS_CONFIG_READ → needs_investigation"
        else
          TRACE_RESULT="env_likely: handler has no config/session dependencies, likely transient"
          TRACE_PATH="$TRACE_PATH → no_config_deps → env_likely"
        fi
      fi
    else
      TRACE_RESULT="trace_incomplete: no handler found for $API_ENDPOINT"
      TRACE_PATH="$TRACE_PATH → handler:NOT_FOUND"
    fi
  else
    TRACE_RESULT="trace_incomplete: no API endpoint found in test definition or assertions"
    TRACE_PATH="$TRACE_PATH → endpoint:NOT_FOUND"
  fi

  log_info "Root Cause Trace: $TRACE_RESULT"
fi

write_progress "$TEST_ID" "fix_classify" "Classified as $FAILURE_TYPE (env=$IS_ENV_ISSUE), writing analysis" "fix"

# ============================================================
# Write analysis report
# ============================================================
ANALYSIS_FILE="$FIXES_DIR/${TEST_ID}-analysis.md"

cat > "$ANALYSIS_FILE" << ANALYSIS_EOF
# Fix Analysis: $TEST_ID

**Round:** $ROUND
**Category:** $CATEGORY
**Source:** $SOURCE
**Failure Type:** $FAILURE_TYPE
**Is Env Issue:** $IS_ENV_ISSUE
**Analyzed At:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Failed Assertions

$FAILED_ASSERTIONS

## Full Result

\`\`\`json
$RESULT_JSON
\`\`\`

## Suggested Fix Approach

$(case "$FAILURE_TYPE" in
  schema_mismatch)
    echo "1. Read the source file ($SOURCE) and check the API response shape"
    echo "2. Update the test definition OR fix the API response to match expected schema"
    echo "3. If API changed intentionally, update the test assertion"
    ;;
  auth_issue)
    echo "1. Check JWT_SECRET matches between env.yaml and dashboard/.env"
    echo "2. Verify token generation in common.sh"
    echo "3. If password-based auth: check expected password"
    echo "→ This is likely an ENV_ISSUE — write to learnings.yaml"
    ;;
  endpoint_missing)
    echo "1. Check if the endpoint exists in dashboard/src/routes/"
    echo "2. Verify route registration in server.ts"
    echo "3. If endpoint was removed, update test definition"
    ;;
  server_error)
    echo "1. Check dashboard server logs for error details"
    echo "2. Read the route handler source code"
    echo "3. Look for unhandled exceptions or missing data"
    ;;
  service_down)
    echo "1. Check if dashboard is running: curl localhost:3010/api/health"
    echo "2. Restart if needed: cd dashboard && npm run dev"
    echo "→ This is an ENV_ISSUE — write to learnings.yaml"
    ;;
  timeout)
    echo "1. Check if the operation is expected to be slow"
    echo "2. Increase timeout in test definition"
    echo "→ This may be an ENV_ISSUE — write to learnings.yaml"
    ;;
  missing_file)
    echo "1. Check if the expected file path exists"
    echo "2. Verify the workflow that creates this file ran successfully"
    echo "3. For casework tests: ensure case data was properly initialized"
    ;;
  performance_regression)
    echo "1. Read tests/baselines.yaml for current thresholds"
    echo "2. Check recent timing.json files for the regression"
    echo "3. If baseline is outdated, update baselines.yaml with new realistic values"
    echo "4. If actual regression: review recent code changes affecting performance"
    echo "→ May require profiling the slow step"
    ;;
  config_drift)
    echo "1. Read .claude/agents/*.md — ensure all have name + description"
    echo "2. Check tools format: must be comma-separated string, not JSON array"
    echo "3. Check .claude/skills/*/SKILL.md prompt patterns"
    echo "4. Fix the config file to match expected format"
    echo "→ This is a CONFIG_ISSUE — fix the file directly"
    ;;
  platform_instability)
    echo "1. Re-run the stability probe to confirm it's not transient"
    echo "2. Check bash environment: Git Bash version, path handling"
    echo "3. Review learnings.yaml for known platform issues"
    echo "4. If persistent: investigate root cause in shell behavior"
    echo "→ Write to learnings.yaml if new pattern discovered"
    ;;
  config_missing)
    echo "1. Root Cause Trace identified a CONFIG issue (not transient env)"
    echo "2. Check the trace path below for exact location"
    echo "3. If mcpServers missing: update case-session-manager.ts to pass mcpServers config"
    echo "4. If specific MCP missing: add the MCP server definition to session spawn"
    echo "5. If config file missing: create or fix the config file"
    echo "→ This is a CODE_BUG — fix the source code, not env"
    ;;
  *)
    echo "1. Read failed assertion details carefully"
    echo "2. Compare actual vs expected values"
    echo "3. Trace through the relevant source code"
    ;;
esac)

## Root Cause Trace

$(if [ -n "$TRACE_PATH" ]; then
  echo "**Trace Path:** \`$TRACE_PATH\`"
  echo ""
  echo "**Trace Result:** $TRACE_RESULT"
elif [ "$IS_ENV_ISSUE" = true ]; then
  echo "_Trace skipped — initial classification was env_issue but no API endpoint found to trace._"
else
  echo "_Not applicable — failure type ($FAILURE_TYPE) did not trigger root cause trace._"
fi)

## Files to Examine

- Test definition: \`tests/registry/$CATEGORY/${TEST_ID}.yaml\`
- Source: \`$SOURCE\`
- Result: \`tests/results/${ROUND}-${TEST_ID}.json\`
$(if [ -n "$TRACE_PATH" ]; then
  # Add traced files
  HANDLER_IN_TRACE=$(echo "$TRACE_PATH" | grep -oE 'handler:[^ ]+' | sed 's/handler://')
  if [ -n "$HANDLER_IN_TRACE" ]; then
    echo "- Traced handler: \`$HANDLER_IN_TRACE\`"
  fi
fi)
ANALYSIS_EOF

log_info "Analysis written to: $ANALYSIS_FILE"
log_info "Failure type: $FAILURE_TYPE (env_issue=$IS_ENV_ISSUE)"

# Clear progress — analysis done, next step is agent spawn (tracked by main session)
clear_progress "$TEST_ID"

# Output for the test-loop to use
echo "FIX_ANALYSIS|$TEST_ID|$FAILURE_TYPE|$IS_ENV_ISSUE|$ANALYSIS_FILE"
