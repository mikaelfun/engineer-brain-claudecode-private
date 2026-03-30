# Fix Report: framework-fix-26-pattern-detector

**Test ID:** framework-fix-26-pattern-detector
**Fix Type:** framework_fix
**Description:** Already applied in R26: /dev/stdin→readFileSync(0) and POSIX path fix in pattern-detector.sh. Confirmed applied. Moving to verifyQueue.
**Modified Files:** tests/executors/pattern-detector.sh
**Fixed At:** 2026-03-29T20:42:46Z
**Recipe Used:** none

## What Was Fixed

Already applied in R26: /dev/stdin→readFileSync(0) and POSIX path fix in pattern-detector.sh. Confirmed applied. Moving to verifyQueue.

## Modified Files

- `tests/executors/pattern-detector.sh`

## Diff

### tests/executors/pattern-detector.sh
```diff
diff --git a/tests/executors/pattern-detector.sh b/tests/executors/pattern-detector.sh
index ab05d5a..b11fd8a 100644
--- a/tests/executors/pattern-detector.sh
+++ b/tests/executors/pattern-detector.sh
@@ -39,13 +39,13 @@ log_info "Round: $ROUND"
 # ============================================================
 # Read fixQueue from state.json
 # ============================================================
-FIX_QUEUE_JSON=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
-  const s = JSON.parse(require('fs').readFileSync('$STATE_FILE','utf8'));
+FIX_QUEUE_JSON=$(STATE_PATH="$STATE_FILE" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
+  const s = JSON.parse(require('fs').readFileSync(process.env.STATE_PATH,'utf8'));
   console.log(JSON.stringify(s.fixQueue || []));
 " 2>/dev/null)
 
 FIX_QUEUE_COUNT=$(echo "$FIX_QUEUE_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
-  const q = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
+  const q = JSON.parse(require('fs').readFileSync(0,'utf8'));
   console.log(q.length);
 " 2>/dev/null)
 
@@ -119,7 +119,7 @@ SIGNATURES_JSON=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
 " 2>/dev/null)
 
 log_info "Extracted signatures: $(echo "$SIGNATURES_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
-  const sigs = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
+  const sigs = JSON.parse(require('fs').readFileSync(0,'utf8'));
   sigs.forEach(s => console.log('  ' + s.testId + ': ' + s.signature + ' (retry=' + s.retryCount + ')'));
 " 2>/dev/null)"
 
@@ -127,7 +127,7 @@ log_info "Extracted signatures: $(echo "$SIGNATURES_JSON" | NODE_PATH="$DASHBOAR
 # Cluster into patterns: systemic and stuck
 # ============================================================
 PATTERNS_JSON=$(echo "$SIGNATURES_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
-  const signatures = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
+  const signatures = JSON.parse(require('fs').readFileSync(0,'utf8'));
   const patterns = [];
   let patternNum = 0;
 
@@ -189,7 +189,7 @@ PATTERNS_JSON=$(echo "$SIGNATURES_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules
 # Output detected patterns
 # ============================================================
 PATTERN_COUNT=$(echo "$PATTERNS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
-  const p = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
+  const p = JSON.parse(require('fs').readFileSync(0,'utf8'));
   console.log(p.length);
 " 2>/dev/null)
 
@@ -202,7 +202,7 @@ log_info "Detected $PATTERN_COUNT pattern(s)"
 
 # Output each pattern in pipe-delimited format
 echo "$PATTERNS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
-  const patterns = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
+  const patterns = JSON.parse(require('fs').readFileSync(0,'utf8'));
   for (const p of patterns) {
     const testIds = p.affectedTestIds.join(',');
     console.log('PATTERN_DETECT|' + p.id + '|' + p.type + '|' + p.signature + '|' + testIds + '|' + p.suggestedAction);
```
