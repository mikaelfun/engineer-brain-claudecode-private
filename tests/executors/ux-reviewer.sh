#!/usr/bin/env bash
# tests/executors/ux-reviewer.sh — SCAN Phase: UX Review Scanner
#
# Statically analyzes dashboard TSX components and API endpoints
# for common UX anti-patterns:
# - Missing loading states
# - Missing empty states
# - Missing error boundaries/handling
# - Navigation inconsistencies (sidebar vs routes)
# - Missing accessibility attributes
#
# Usage: bash tests/executors/ux-reviewer.sh
# Output: GAP|ux-review|ux-scan|{category}|{description}|{priority}
#         UX_REVIEW_SCAN|{gap_count}|{details}
#
# Schedule: every_5_rounds (from scan-strategies.yaml)
# Note: Static code analysis only. No Playwright. UI tests generated in TEST phase.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

WEB_SRC="$PROJECT_ROOT/dashboard/web/src"
COMPONENTS_DIR="$WEB_SRC/components"
PAGES_DIR="$WEB_SRC/pages"
HOOKS_DIR="$WEB_SRC/hooks"
ROUTES_DIR="$PROJECT_ROOT/dashboard/src/routes"

log_info "=== UX Review Scanner ==="

GAP_COUNT=0
DETAILS=""

# Helper: safe grep -c that always returns a clean integer
grep_count() {
  grep -cE "$@" 2>/dev/null | tr -d '\r' || echo "0"
}

# ============================================================
# 1. Check pages for loading states
# ============================================================
log_info "Checking pages for loading states..."

PAGES_MISSING_LOADING=0
for page_file in "$PAGES_DIR"/*.tsx; do
  [ -f "$page_file" ] || continue
  BASENAME=$(basename "$page_file" .tsx)

  case "$BASENAME" in
    index|App|Router|Layout) continue ;;
  esac

  HAS_QUERY=$(grep_count "useQuery\|useSuspenseQuery\|useMutation" "$page_file")

  if [ "$HAS_QUERY" -gt 0 ]; then
    HAS_LOADING=$(grep_count "isLoading|isPending|isFetching|Loading|Spinner|skeleton" "$page_file")
    if [ "$HAS_LOADING" -eq 0 ]; then
      echo "GAP|ux-review|ux-scan|ui-interaction|Page $BASENAME uses query but has no loading state|P2"
      GAP_COUNT=$((GAP_COUNT + 1))
      PAGES_MISSING_LOADING=$((PAGES_MISSING_LOADING + 1))
    fi
  fi
done

if [ "$PAGES_MISSING_LOADING" -gt 0 ]; then
  DETAILS="${DETAILS}pages_no_loading($PAGES_MISSING_LOADING) "
fi

# ============================================================
# 2. Check pages/components for error handling
# ============================================================
log_info "Checking for error handling..."

MISSING_ERROR=0
for page_file in "$PAGES_DIR"/*.tsx; do
  [ -f "$page_file" ] || continue
  BASENAME=$(basename "$page_file" .tsx)

  case "$BASENAME" in
    index|App|Router|Layout) continue ;;
  esac

  HAS_QUERY=$(grep_count "useQuery\|useFetch\|fetch\(" "$page_file")

  if [ "$HAS_QUERY" -gt 0 ]; then
    HAS_ERROR=$(grep_count "isError|error|Error|catch|onError|ErrorBoundary" "$page_file")
    if [ "$HAS_ERROR" -eq 0 ]; then
      echo "GAP|ux-review|ux-scan|ui-interaction|Page $BASENAME fetches data but has no error handling|P2"
      GAP_COUNT=$((GAP_COUNT + 1))
      MISSING_ERROR=$((MISSING_ERROR + 1))
    fi
  fi
done

if [ "$MISSING_ERROR" -gt 0 ]; then
  DETAILS="${DETAILS}pages_no_error($MISSING_ERROR) "
fi

# ============================================================
# 3. Check for empty states
# ============================================================
log_info "Checking for empty states..."

MISSING_EMPTY=0
for page_file in "$PAGES_DIR"/*.tsx "$COMPONENTS_DIR"/*.tsx; do
  [ -f "$page_file" ] || continue
  BASENAME=$(basename "$page_file" .tsx)

  HAS_MAP=$(grep_count '\.map\(' "$page_file")

  if [ "$HAS_MAP" -gt 0 ]; then
    HAS_EMPTY=$(grep_count 'length\s*===?\s*0|\.length\s*<\s*1|empty|no\s+\w+\s+found|EmptyState|NoData|no results' "$page_file")
    if [ "$HAS_EMPTY" -eq 0 ]; then
      echo "GAP|ux-review|ux-scan|ui-interaction|$BASENAME renders list but has no empty state|P3"
      GAP_COUNT=$((GAP_COUNT + 1))
      MISSING_EMPTY=$((MISSING_EMPTY + 1))
    fi
  fi
done

if [ "$MISSING_EMPTY" -gt 0 ]; then
  DETAILS="${DETAILS}no_empty_state($MISSING_EMPTY) "
fi

# ============================================================
# 4. Check navigation consistency (sidebar links vs routes)
# ============================================================
log_info "Checking navigation consistency..."

SIDEBAR_FILE=""
for f in "$COMPONENTS_DIR"/Sidebar.tsx "$COMPONENTS_DIR"/Navigation.tsx "$COMPONENTS_DIR"/Layout.tsx "$COMPONENTS_DIR"/AppLayout.tsx; do
  if [ -f "$f" ]; then
    SIDEBAR_FILE="$f"
    break
  fi
done

if [ -n "$SIDEBAR_FILE" ]; then
  SIDEBAR_LINKS=$(grep -oE '(to|href)="(/[^"]*)"' "$SIDEBAR_FILE" 2>/dev/null | sed 's/.*"\(\/[^"]*\)".*/\1/' | sort -u)

  ROUTER_FILE=""
  for f in "$WEB_SRC"/App.tsx "$WEB_SRC"/Router.tsx "$WEB_SRC"/router.tsx "$WEB_SRC"/routes.tsx; do
    if [ -f "$f" ]; then
      ROUTER_FILE="$f"
      break
    fi
  done

  if [ -n "$ROUTER_FILE" ]; then
    ROUTE_PATHS=$(grep -oE 'path="(/[^"]*)"' "$ROUTER_FILE" 2>/dev/null | sed 's/path="\(.*\)"/\1/' | sort -u)

    NAV_MISMATCH=0
    for link in $SIDEBAR_LINKS; do
      LINK_BASE=$(echo "$link" | sed 's|/:[^/]*||g')
      FOUND=false
      for route in $ROUTE_PATHS; do
        ROUTE_BASE=$(echo "$route" | sed 's|/:[^/]*||g')
        if [ "$LINK_BASE" = "$ROUTE_BASE" ]; then
          FOUND=true
          break
        fi
      done
      if [ "$FOUND" = false ]; then
        echo "GAP|ux-review|ux-scan|ui-interaction|Sidebar link '$link' has no matching route|P2"
        GAP_COUNT=$((GAP_COUNT + 1))
        NAV_MISMATCH=$((NAV_MISMATCH + 1))
      fi
    done

    if [ "$NAV_MISMATCH" -gt 0 ]; then
      DETAILS="${DETAILS}nav_mismatch($NAV_MISMATCH) "
    fi
  fi
fi

# ============================================================
# 5. Check for keyboard accessibility basics
# ============================================================
log_info "Checking accessibility basics..."

ACCESSIBILITY_ISSUES=0
for comp_file in "$COMPONENTS_DIR"/*.tsx; do
  [ -f "$comp_file" ] || continue
  BASENAME=$(basename "$comp_file" .tsx)

  HAS_ONCLICK_DIV=$(grep_count 'onClick=\{' "$comp_file")
  HAS_BUTTON=$(grep_count '<button|<Button|role="button"|<a |<Link ' "$comp_file")

  if [ "$HAS_ONCLICK_DIV" -gt "$HAS_BUTTON" ]; then
    HAS_ROLE=$(grep_count 'role="|tabIndex|aria-' "$comp_file")
    if [ "$HAS_ROLE" -eq 0 ]; then
      echo "GAP|ux-review|ux-scan|ui-interaction|$BASENAME has onClick on non-semantic elements without ARIA roles|P3"
      GAP_COUNT=$((GAP_COUNT + 1))
      ACCESSIBILITY_ISSUES=$((ACCESSIBILITY_ISSUES + 1))
    fi
  fi
done

if [ "$ACCESSIBILITY_ISSUES" -gt 0 ]; then
  DETAILS="${DETAILS}a11y_issues($ACCESSIBILITY_ISSUES) "
fi

# ============================================================
# Summary
# ============================================================
log_info "=== UX Review Scanner Complete ==="
log_info "Gaps found: $GAP_COUNT"
log_info "Details: ${DETAILS:-none}"

echo "UX_REVIEW_SCAN|$GAP_COUNT|${DETAILS:-none}"

if [ "$GAP_COUNT" -gt 0 ]; then
  log_warn "$GAP_COUNT UX issues found"
else
  log_pass "No UX anti-patterns detected"
fi
