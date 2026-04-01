#!/usr/bin/env bash
# morning-report-generator.sh — Generate morning report from overnight test events
# Usage: bash tests/executors/morning-report-generator.sh [--date YYYY-MM-DD]
#
# Reads:  tests/results/events.jsonl, tests/pipeline.json, tests/stats.json
# Writes: tests/results/morning-report-YYYY-MM-DD.md
#         tests/results/dashboard-data-YYYY-MM-DD.json
# Output: REPORT|success|<report_path>  or  REPORT|error|<message>

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/../results"
TESTS_DIR="$SCRIPT_DIR/.."

# ── Argument parsing ──────────────────────────────────────────────────────────
DATE_ARG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --date) DATE_ARG="$2"; shift 2 ;;
    *) echo "REPORT|error|unknown argument: $1" >&2; exit 1 ;;
  esac
done

# Default to today (YYYY-MM-DD in UTC)
if [[ -z "$DATE_ARG" ]]; then
  DATE_ARG=$(date -u +"%Y-%m-%d")
fi

# Validate date format
if [[ ! "$DATE_ARG" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "REPORT|error|invalid date format: $DATE_ARG (expected YYYY-MM-DD)" >&2
  exit 1
fi

mkdir -p "$RESULTS_DIR"

# ── Detect Python binary (python3 or python) ─────────────────────────────────
PYTHON=""
if command -v python3 &>/dev/null; then
  PYTHON="python3"
elif command -v python &>/dev/null; then
  PYTHON="python"
else
  echo "REPORT|error|python3/python not found in PATH" >&2
  exit 1
fi

# ── Pass paths to Python via environment variables (avoids heredoc escaping) ──
export MRG_DATE="$DATE_ARG"
export MRG_EVENTS="$RESULTS_DIR/events.jsonl"
export MRG_PIPELINE="$TESTS_DIR/pipeline.json"
export MRG_STATS="$TESTS_DIR/stats.json"
export MRG_REPORT="$RESULTS_DIR/morning-report-${DATE_ARG}.md"
export MRG_DASHBOARD="$RESULTS_DIR/dashboard-data-${DATE_ARG}.json"

# ── Python3 report generator ──────────────────────────────────────────────────
PY_OUT=$($PYTHON <<'PYEOF'
import json, os
from datetime import datetime, timezone

date_arg      = os.environ["MRG_DATE"]
events_file   = os.environ["MRG_EVENTS"]
pipeline_file = os.environ["MRG_PIPELINE"]
stats_file    = os.environ["MRG_STATS"]
report_file   = os.environ["MRG_REPORT"]
dash_file     = os.environ["MRG_DASHBOARD"]

# ── Helpers ───────────────────────────────────────────────────────────────────
def load_jsonl(path):
    """Load a .jsonl file; return [] if missing or unparseable."""
    if not os.path.exists(path):
        return []
    rows = []
    with open(path, encoding="utf-8") as f:
        for raw in f:
            raw = raw.strip()
            if not raw:
                continue
            try:
                rows.append(json.loads(raw))
            except json.JSONDecodeError:
                pass
    return rows

def load_json(path):
    """Load a JSON file; return {} if missing or unparseable."""
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def md_escape(s):
    """Escape pipe characters so they don't break Markdown table cells."""
    return str(s).replace("|", "\\|")

def duration_str(ts_start, ts_end):
    """Return 'Xh Ym' computed from two ISO-8601 UTC timestamps."""
    try:
        fmt = "%Y-%m-%dT%H:%M:%SZ"
        t0 = datetime.strptime(ts_start, fmt)
        t1 = datetime.strptime(ts_end, fmt)
        secs = max(0, int((t1 - t0).total_seconds()))
        h, rem = divmod(secs, 3600)
        m = rem // 60
        return f"{h}h {m}m"
    except Exception:
        return "N/A"

# ── Load data ─────────────────────────────────────────────────────────────────
events   = load_jsonl(events_file)
pipeline = load_json(pipeline_file)

# ── Compute duration from first → last event timestamp ───────────────────────
duration = "N/A"
if events:
    ts_list = [e.get("ts", "") for e in events if e.get("ts")]
    if ts_list:
        duration = duration_str(min(ts_list), max(ts_list))

cycles = pipeline.get("cycle", 0)

# ── Categorise events by type ─────────────────────────────────────────────────
verified    = [e for e in events if e.get("type") == "feature_verified"]
bugs        = [e for e in events if e.get("type") == "bug_discovered"]
fixed       = [e for e in events if e.get("type") == "bug_fixed"]
fix_failed  = [e for e in events if e.get("type") == "fix_failed"]
needs_human = [e for e in events if e.get("type") == "needs_human"]
perf_reg    = [e for e in events if e.get("type") == "perf_regression"]
perf_imp    = [e for e in events if e.get("type") == "perf_improved"]
ui_issues   = [e for e in events if e.get("type") == "ui_issue"]
flow_broken = [e for e in events if e.get("type") == "flow_broken"]

verified_pass = sum(1 for e in verified if e.get("result") == "pass")
verified_fail = sum(1 for e in verified if e.get("result") != "pass")
competitive   = [e for e in fixed if e.get("method") == "competitive"]

# P0/P1 unfixed attention items (bug_discovered / flow_broken / needs_human /
# fix_failed that have NOT been subsequently fixed)
fixed_details = {e.get("detail", "") for e in fixed}
attention = [
    e for e in bugs + flow_broken + needs_human + fix_failed
    if e.get("impact") in ("P0", "P1")
    and e.get("detail", "") not in fixed_details
]

# Group by area and impact for dashboard
by_area = {}
for e in events:
    by_area.setdefault(e.get("area", "unknown"), []).append(e)

by_impact = {}
for e in events:
    by_impact.setdefault(e.get("impact", "unknown"), []).append(e)

# ═════════════════════════════════════════════════════════════════════════════
# BUILD MARKDOWN REPORT
# ═════════════════════════════════════════════════════════════════════════════
now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
L = []  # lines

L += [
    f"# Test Supervisor Morning Report - {date_arg}",
    "",
    f"_Generated: {now_str}_",
    "",
    "## Executive Summary",
    "",
    "| Metric | Value |",
    "|--------|-------|",
    f"| Duration | {md_escape(duration)} |",
    f"| Cycles | {cycles} |",
    f"| Total Events | {len(events)} |",
    f"| Features Verified (pass) | {verified_pass} |",
    f"| Features Verified (fail) | {verified_fail} |",
    f"| Bugs Discovered | {len(bugs)} |",
    f"| Auto-Fixed | {len(fixed)} (competitive: {len(competitive)}) |",
    f"| Fix Failed | {len(fix_failed)} |",
    f"| Needs Human | {len(needs_human)} |",
    f"| Performance Regressions | {len(perf_reg)} |",
    f"| Performance Improvements | {len(perf_imp)} |",
    f"| UI Issues | {len(ui_issues)} |",
    "",
]

# ── Needs Your Attention ──────────────────────────────────────────────────────
L.append("## Needs Your Attention (P0-P1)")
L.append("")
if not attention:
    L.append("_No unresolved P0/P1 items. 🎉_")
else:
    L += [
        "| Type | Impact | Area | Detail |",
        "|------|--------|------|--------|",
    ]
    for e in attention:
        L.append(
            f"| {md_escape(e.get('type',''))} "
            f"| {md_escape(e.get('impact',''))} "
            f"| {md_escape(e.get('area',''))} "
            f"| {md_escape(e.get('detail',''))} |"
        )
L.append("")

# ── Auto-Fixed ────────────────────────────────────────────────────────────────
L.append("## Auto-Fixed")
L.append("")
if not fixed:
    L.append("_No auto-fixes this cycle._")
else:
    for e in fixed:
        method = e.get("method", "direct")
        chosen = e.get("chosen", "")
        conf   = e.get("confidence", "")
        impact = e.get("impact", "")
        area   = e.get("area", "")
        detail = e.get("detail", "")
        chosen_str = f", chosen: **{chosen}**" if chosen else ""
        conf_str   = f", confidence: {conf}" if conf != "" else ""
        L.append(f"- **[{impact}] {area}** — {detail}")
        L.append(f"  - Method: `{method}`{chosen_str}{conf_str}")
L.append("")

# ── Feature Verification ──────────────────────────────────────────────────────
L.append("## Feature Verification")
L.append("")
if not verified:
    L.append("_No feature verification events._")
else:
    L += [
        "| Feature | Impact | Result | Area |",
        "|---------|--------|--------|------|",
    ]
    for e in verified:
        result_icon = "✅ pass" if e.get("result") == "pass" else "❌ fail"
        L.append(
            f"| {md_escape(e.get('detail',''))} "
            f"| {md_escape(e.get('impact',''))} "
            f"| {result_icon} "
            f"| {md_escape(e.get('area',''))} |"
        )
L.append("")

# ── Performance ───────────────────────────────────────────────────────────────
L.append("## Performance")
L.append("")
if not perf_reg and not perf_imp:
    L.append("_No performance events._")
else:
    if perf_reg:
        L += ["### Regressions", "",
              "| Impact | Area | Detail | Delta |",
              "|--------|------|--------|-------|"]
        for e in perf_reg:
            L.append(
                f"| {md_escape(e.get('impact',''))} "
                f"| {md_escape(e.get('area',''))} "
                f"| {md_escape(e.get('detail',''))} "
                f"| {md_escape(e.get('delta','N/A'))} |"
            )
        L.append("")
    if perf_imp:
        L += ["### Improvements", "",
              "| Impact | Area | Detail | Delta |",
              "|--------|------|--------|-------|"]
        for e in perf_imp:
            L.append(
                f"| {md_escape(e.get('impact',''))} "
                f"| {md_escape(e.get('area',''))} "
                f"| {md_escape(e.get('detail',''))} "
                f"| {md_escape(e.get('delta','N/A'))} |"
            )
        L.append("")

# ── UI/Design Issues ──────────────────────────────────────────────────────────
L.append("## UI/Design Issues")
L.append("")
if not ui_issues:
    L.append("_No UI/design issues._")
else:
    for e in ui_issues:
        L.append(f"- **[{e.get('impact','')}] {e.get('area','')}** — {e.get('detail','')}")
L.append("")

# ── Competitive Fix Decisions ─────────────────────────────────────────────────
L.append("## Competitive Fix Decisions")
L.append("")
if not competitive:
    L.append("_No competitive fix decisions._")
else:
    L += [
        "| Impact | Area | Detail | Chosen Agent | Confidence |",
        "|--------|------|--------|--------------|------------|",
    ]
    for e in competitive:
        L.append(
            f"| {md_escape(e.get('impact',''))} "
            f"| {md_escape(e.get('area',''))} "
            f"| {md_escape(e.get('detail',''))} "
            f"| {md_escape(e.get('chosen',''))} "
            f"| {md_escape(e.get('confidence',''))} |"
        )
L.append("")

# ── Write Markdown ────────────────────────────────────────────────────────────
with open(report_file, "w", encoding="utf-8") as f:
    f.write("\n".join(L))

# ═════════════════════════════════════════════════════════════════════════════
# BUILD DASHBOARD JSON
# ═════════════════════════════════════════════════════════════════════════════
dashboard = {
    "runDate":  date_arg,
    "duration": duration,
    "cycles":   cycles,
    "summary": {
        "verified_pass":    verified_pass,
        "verified_fail":    verified_fail,
        "bugs":             len(bugs),
        "fixed":            len(fixed),
        "fix_failed":       len(fix_failed),
        "needs_human":      len(needs_human),
        "perf_regressions": len(perf_reg),
        "perf_improved":    len(perf_imp),
        "ui_issues":        len(ui_issues),
    },
    "events":          events,
    "byArea":          by_area,
    "byImpact":        by_impact,
    "competitiveFixes": competitive,
}

with open(dash_file, "w", encoding="utf-8") as f:
    json.dump(dashboard, f, ensure_ascii=False, indent=2)

# Signal success: print the two output paths
print(f"OK|{report_file}|{dash_file}")
PYEOF
)

# ── Parse Python result and emit final status ─────────────────────────────────
if [[ "$PY_OUT" == OK\|* ]]; then
  REPORT_PATH=$(echo "$PY_OUT" | cut -d'|' -f2)
  echo "REPORT|success|$REPORT_PATH"
else
  echo "REPORT|error|python3 failed: $PY_OUT" >&2
  exit 1
fi
