#!/usr/bin/env bash
# casework-gather.sh — casework-light Step 2: 并行数据收集
# 从 casework-light.md 的内联 Bash 提取，消除 LLM 推理开销
#
# 用法: bash casework-gather.sh \
#   --case-number 2601290030000748 \
#   --case-dir ./cases/active/2601290030000748 \
#   --project-root . \
#   --cases-root ./cases \
#   --is-ar false \
#   --main-case-id "" \
#   --teams-cache-hours 8
#
# 输出 (stdout 最后一行): GATHER_DONE|dr={0|1}|teams={true|false}|compliance={...}
set -uo pipefail

# --- Parse arguments ---
CASE_NUMBER="" CASE_DIR="" PROJECT_ROOT="" CASES_ROOT=""
IS_AR="false" MAIN_CASE_ID="" TEAMS_CACHE_HOURS="8"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --case-number)    CASE_NUMBER="$2"; shift 2 ;;
    --case-dir)       CASE_DIR="$2"; shift 2 ;;
    --project-root)   PROJECT_ROOT="$2"; shift 2 ;;
    --cases-root)     CASES_ROOT="$2"; shift 2 ;;
    --is-ar)          IS_AR="$2"; shift 2 ;;
    --main-case-id)   MAIN_CASE_ID="$2"; shift 2 ;;
    --teams-cache-hours) TEAMS_CACHE_HOURS="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; shift ;;
  esac
done

if [ -z "$CASE_NUMBER" ] || [ -z "$CASE_DIR" ] || [ -z "$PROJECT_ROOT" ] || [ -z "$CASES_ROOT" ]; then
  echo "ERROR|missing required args (--case-number, --case-dir, --project-root, --cases-root)" >&2
  exit 1
fi

CD="$PROJECT_ROOT"
LOG="$CASE_DIR/logs/casework-light.log"
date +%s > "$CASE_DIR/logs/.t_dataRefresh_start"

# --- Build AR flags ---
AR_FLAGS=""
if [ "$IS_AR" = "true" ] && [ -n "$MAIN_CASE_ID" ]; then
  AR_FLAGS="-MainCaseNumber $MAIN_CASE_ID"
else
  AR_FLAGS="-IncludeIrCheck"
fi

# ── 后台 1: data-refresh (fetch-all-data.ps1) ──
pwsh -NoProfile -File "$CD/.claude/skills/d365-case-ops/scripts/fetch-all-data.ps1" \
  -TicketNumber "$CASE_NUMBER" -OutputDir "$CASES_ROOT/active" \
  -CacheMinutes 10 -MetaDir "$CASES_ROOT/active" \
  $AR_FLAGS \
  > "$CASE_DIR/logs/data-refresh-stdout.log" 2>&1 &
PID_DR=$!

# ── 后台 2: labor 拉取 ──
pwsh -NoProfile -File "$CD/.claude/skills/d365-case-ops/scripts/view-labor.ps1" \
  -TicketNumber "$CASE_NUMBER" -OutputDir "$CASES_ROOT/active" \
  > /dev/null 2>&1 &
PID_LABOR=$!

# ── 后台 3: onenote search (本地 ripgrep + 文件操作) ──
ONENOTE_DIR=$(python3 -c "
import json, os
try:
    cfg = json.load(open('$CD/config.json'))
    dr = cfg.get('dataRoot', '../data')
    nb = cfg.get('onenote',{}).get('personalNotebook','Kun Fang OneNote')
    d = os.path.join(dr, 'OneNote Export', nb)
    print(d if os.path.isdir(d) else '')
except: print('')
" 2>/dev/null)

PID_ON=""
if [ -n "$ONENOTE_DIR" ]; then
  python3 "$CD/.claude/skills/onenote-search/search-inline.py" \
    --case-dir "$CASE_DIR" \
    --notebook-dir "$ONENOTE_DIR" \
    --case-number "$CASE_NUMBER" \
    > "$CASE_DIR/logs/onenote-search-stdout.log" 2>&1 &
  PID_ON=$!
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 SKIP | onenote: no notebook dir" >> "$LOG"
fi

# ── 前台: compliance-check (从 meta 缓存读取，LLM skill 无法在 bash 内调用) ──
COMPLIANCE_RESULT=""
if [ -f "$CASE_DIR/casework-meta.json" ]; then
  COMPLIANCE_RESULT=$(python3 -c "
import json, os
meta = json.load(open('$CASE_DIR/casework-meta.json'))
c = meta.get('compliance', {})
if c.get('entitlementOk') is not None and meta.get('ccAccount', 'MISSING') != 'MISSING' and c.get('sapOk') is not None:
    sl = c.get('serviceLevel', 'Unknown')
    ent = 'OK' if c.get('entitlementOk') else 'FAIL'
    sap = 'OK' if c.get('sapOk') else 'MISMATCH'
    print(f'CACHED|entitlement={ent}|serviceLevel={sl}|sap={sap}')
else:
    print('NEEDS_LLM_CHECK')
" 2>/dev/null || echo "NEEDS_LLM_CHECK")
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 OK | compliance: $COMPLIANCE_RESULT" >> "$LOG"
else
  COMPLIANCE_RESULT="NEEDS_LLM_CHECK"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 SKIP | compliance: no meta.json, needs LLM skill" >> "$LOG"
fi

# ── 提取 contact info（Teams 搜索需要） ──
CONTACT_INFO=$(python3 -c "
import re, json, os
ci = '$CASE_DIR/case-info.md'
meta = '$CASE_DIR/casework-meta.json'
name, email = '', ''
if os.path.exists(ci):
    txt = open(ci, encoding='utf-8').read()
    m = re.search(r'Contact Name.*?[|:]\s*(.+)', txt)
    if m: name = m.group(1).strip()
    m = re.search(r'Contact Email.*?[|:]\s*(.+)', txt)
    if m: email = m.group(1).strip()
if not name and os.path.exists(meta):
    mj = json.load(open(meta))
    name = mj.get('contactName','')
    email = mj.get('contactEmail','')
print(json.dumps({'n':name,'e':email}))
" 2>/dev/null || echo '{"n":"","e":""}')

# ── 后台 4: Teams 搜索（直接 agency HTTP proxy，不走 MCP agent queue） ──
TEAMS_NEEDED="false"
if [ -f "$CD/.claude/skills/casework/scripts/agent-cache-check.sh" ]; then
  CACHE_CHECK=$(bash "$CD/.claude/skills/casework/scripts/agent-cache-check.sh" "$CASE_DIR" "$TEAMS_CACHE_HOURS" "$CD" 2>/dev/null | head -1)
  TEAMS_NEEDED=$(python3 -c "
import json
try:
    r = json.loads('$CACHE_CHECK')
    print('true' if r.get('teams',{}).get('spawn',False) else 'false')
except: print('true')
" 2>/dev/null || echo "true")
fi

PID_TEAMS=""
if [ "$TEAMS_NEEDED" = "true" ]; then
  CN=$(python3 -c "import json; d=json.loads('$CONTACT_INFO'); print(d['n'])" 2>/dev/null || echo "")
  CE=$(python3 -c "import json; d=json.loads('$CONTACT_INFO'); print(d['e'])" 2>/dev/null || echo "")
  bash "$CD/.claude/skills/teams-search/scripts/teams-search-inline.sh" \
    --case-number "$CASE_NUMBER" \
    --case-dir "$CASE_DIR" \
    --contact-email "$CE" \
    > "$CASE_DIR/logs/teams-search-stdout.log" 2>&1 &
  PID_TEAMS=$!
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 OK | teams: inline search started (pid=$PID_TEAMS)" >> "$LOG"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 SKIP | teams: cache hit" >> "$LOG"
fi

# ── 等待 data-refresh 完成 ──
wait $PID_DR
DR_EXIT=$?
date +%s > "$CASE_DIR/logs/.t_dataRefresh_end"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 | data-refresh exit=$DR_EXIT" >> "$LOG"

# 等 labor（非关键）
wait $PID_LABOR 2>/dev/null

# 等 onenote（非关键）
if [ -n "$PID_ON" ]; then
  wait $PID_ON 2>/dev/null
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 OK | onenote-search done" >> "$LOG"
fi

# ── 等待 Teams 搜索完成 + 后处理 ──
TEAMS_RESULT="skip"
if [ -n "$PID_TEAMS" ]; then
  wait $PID_TEAMS 2>/dev/null
  TEAMS_EXIT=$?
  TEAMS_RESULT=$(tail -1 "$CASE_DIR/logs/teams-search-stdout.log" 2>/dev/null || echo "TEAMS_FAIL|unknown")
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 OK | teams: $TEAMS_RESULT" >> "$LOG"
  # 后处理: build-input + write-teams (如果 _mcp-raw.json 存在)
  if [ -f "$CASE_DIR/teams/_mcp-raw.json" ]; then
    python3 "$CD/.claude/skills/teams-search/scripts/build-input-from-raw.py" "$CASE_DIR" > /dev/null 2>&1
    pwsh -NoProfile -File "$CD/.claude/skills/teams-search/scripts/write-teams.ps1" \
      -OutputDir "$CASE_DIR/teams" -InputFile "$CASE_DIR/teams/_input.json" > /dev/null 2>&1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 OK | teams: write-teams done" >> "$LOG"
  fi
fi

# ── 运行 extract-delta.sh 提取增量内容 ──
DELTA_RESULT=""
DELTA_SCRIPT="$CD/.claude/skills/casework/scripts/extract-delta.sh"
if [ -f "$DELTA_SCRIPT" ]; then
  DELTA_RESULT=$(bash "$DELTA_SCRIPT" --case-dir "$CASE_DIR" 2>&1 | tail -1)
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2 OK | delta: $DELTA_RESULT" >> "$LOG"
fi

# ── 输出结果 ──
echo "GATHER_DONE|dr=$DR_EXIT|teams=$TEAMS_NEEDED|compliance=$COMPLIANCE_RESULT|delta=$DELTA_RESULT"
