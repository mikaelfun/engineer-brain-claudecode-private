#!/usr/bin/env bash
# casework-fast-path.sh — changegate=NO_CHANGE 后的单次缓存全检
# 用法: bash casework-fast-path.sh "{caseDir}" "{changegateDetail}"
# 输出: FAST_PATH_OK|... 或 FAST_PATH_BREAK|...
set -euo pipefail

CD="$1"
CG_DETAIL="${2:-}"
LOG="$CD/logs/casework.log"
META="$CD/casehealth-meta.json"
NOW=$(date +%s)

# --- DR skip timestamps ---
echo "$NOW" > "$CD/logs/.t_dataRefresh_start"
echo "$NOW" > "$CD/logs/.t_dataRefresh_end"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2a SKIP | changegate NO_CHANGE ($CG_DETAIL)" >> "$LOG"

# --- Teams cache check ---
TEAMS_OK="false"; TEAMS_DETAIL=""
if [ -f "$CD/teams/_cache-epoch" ]; then
  CACHE_EPOCH=$(cat "$CD/teams/_cache-epoch")
  AGE_SECS=$((NOW - CACHE_EPOCH)); AGE_H=$((AGE_SECS / 3600)); AGE_M=$(( (AGE_SECS % 3600) / 60 ))
  if [ $AGE_SECS -lt $((4 * 3600)) ]; then
    TEAMS_OK="true"; TEAMS_DETAIL="cached(${AGE_H}h${AGE_M}m)"
    echo "$NOW" > "$CD/logs/.t_teamsSearch_start"; echo "$NOW" > "$CD/logs/.t_teamsSearch_end"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 2b SKIP | teams-search cache valid (${AGE_H}h${AGE_M}m)" >> "$LOG"
  else
    TEAMS_DETAIL="EXPIRED(${AGE_H}h${AGE_M}m)"
  fi
else
  TEAMS_DETAIL="NO_CACHE"
fi

# --- Compliance cache check ---
COMP_OK="false"
ENTITLEMENT_OK=$(sed -n 's/.*"entitlementOk":[[:space:]]*\(true\|false\).*/\1/p' "$META" 2>/dev/null | head -1)
if [ "$ENTITLEMENT_OK" = "true" ]; then
  COMP_OK="true"
  echo "$NOW" > "$CD/logs/.t_compliance_start"; echo "$NOW" > "$CD/logs/.t_compliance_end"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 3a SKIP | compliance cached (entitlementOk=true)" >> "$LOG"
fi

# --- Status-judge cache check ---
JUDGE_OK="false"; JUDGE_DETAIL=""
echo "$NOW" > "$CD/logs/.t_agentWait_start"; echo "$NOW" > "$CD/logs/.t_agentWait_end"
echo "$NOW" > "$CD/logs/.t_statusJudge_start"
EMAIL_COUNT=$(sed -n 's/.*Emails (\([0-9]*\)).*/\1/p' "$CD/case-info.md" 2>/dev/null | head -1)
EMAIL_COUNT=${EMAIL_COUNT:-0}
LAST_EMAIL_COUNT=$(sed -n 's/.*"emailCountAtJudge":[[:space:]]*\([0-9]*\).*/\1/p' "$META" 2>/dev/null | head -1)
LAST_EMAIL_COUNT=${LAST_EMAIL_COUNT:--1}
NOTE_COUNT=$(sed -n 's/.*Notes (\([0-9]*\)).*/\1/p' "$CD/case-info.md" 2>/dev/null | head -1)
NOTE_COUNT=${NOTE_COUNT:-0}
LAST_NOTE_COUNT=$(sed -n 's/.*"noteCountAtJudge":[[:space:]]*\([0-9]*\).*/\1/p' "$META" 2>/dev/null | head -1)
LAST_NOTE_COUNT=${LAST_NOTE_COUNT:--1}
ICM_ID=$(sed -n 's/.*ICM Number |[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$CD/case-info.md" 2>/dev/null | head -1)
ICM_ID=${ICM_ID:-}
LAST_ICM=$(sed -n 's/.*"icmIdAtJudge":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" 2>/dev/null | head -1)
LAST_ICM=${LAST_ICM:-}
TEAMS_CHANGED="false"
if [ -f "$CD/teams/_cache-epoch" ]; then
  JUDGE_AT=$(sed -n 's/.*"statusJudgedAt":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" 2>/dev/null | head -1)
  JUDGE_AT=${JUDGE_AT:-1970-01-01}
  TEAMS_EPOCH=$(cat "$CD/teams/_cache-epoch")
  JUDGE_EPOCH=$(date -d "$JUDGE_AT" +%s 2>/dev/null || echo "0")
  [ "$TEAMS_EPOCH" -gt "$JUDGE_EPOCH" ] 2>/dev/null && TEAMS_CHANGED="true"
fi
if [ "$EMAIL_COUNT" = "$LAST_EMAIL_COUNT" ] && [ "$NOTE_COUNT" = "$LAST_NOTE_COUNT" ] && [ "$TEAMS_CHANGED" = "false" ] && [ "$ICM_ID" = "$LAST_ICM" ]; then
  JUDGE_OK="true"; JUDGE_DETAIL="cached(emails=$EMAIL_COUNT,notes=$NOTE_COUNT)"
  echo "$NOW" > "$CD/logs/.t_statusJudge_end"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 3b SKIP | status-judge cache valid" >> "$LOG"
else
  JUDGE_DETAIL="MISS|emails=$EMAIL_COUNT/$LAST_EMAIL_COUNT,notes=$NOTE_COUNT/$LAST_NOTE_COUNT,icm=$ICM_ID/$LAST_ICM,teamsChanged=$TEAMS_CHANGED"
fi

# --- Routing decision (only if judge cached) ---
ROUTE_OK="false"; ACTUAL_STATUS=""; DAYS=""
if [ "$JUDGE_OK" = "true" ]; then
  ACTUAL_STATUS=$(sed -n 's/.*"actualStatus":[[:space:]]*"\([^"]*\)".*/\1/p' "$META" 2>/dev/null | head -1)
  DAYS=$(sed -n 's/.*"daysSinceLastContact":[[:space:]]*\([0-9]*\).*/\1/p' "$META" 2>/dev/null | head -1)
  DAYS=${DAYS:-0}
  NEED_AGENT="false"
  case "$ACTUAL_STATUS" in
    new|pending-engineer) NEED_AGENT="true" ;;
    researching) NEED_AGENT="true" ;;
    ready-to-close) NEED_AGENT="true" ;;
    pending-customer) [ "$DAYS" -ge 3 ] 2>/dev/null && NEED_AGENT="true" ;;
    pending-pg) ;;
  esac
  if [ "$NEED_AGENT" = "false" ]; then
    ROUTE_OK="true"
    echo "$NOW" > "$CD/logs/.t_routing_start"; echo "$NOW" > "$CD/logs/.t_routing_end"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP 4 OK | $ACTUAL_STATUS days=$DAYS, no agent needed" >> "$LOG"
  fi
fi

# --- Final output ---
if [ "$TEAMS_OK" = "true" ] && [ "$COMP_OK" = "true" ] && [ "$JUDGE_OK" = "true" ] && [ "$ROUTE_OK" = "true" ]; then
  echo "FAST_PATH_OK|status=$ACTUAL_STATUS,days=$DAYS,teams=$TEAMS_DETAIL,judge=$JUDGE_DETAIL"
else
  BREAKS=""
  [ "$TEAMS_OK" != "true" ] && BREAKS="${BREAKS}teams=$TEAMS_DETAIL,"
  [ "$COMP_OK" != "true" ] && BREAKS="${BREAKS}compliance=NEED_CHECK,"
  [ "$JUDGE_OK" != "true" ] && BREAKS="${BREAKS}judge=$JUDGE_DETAIL,"
  [ "$ROUTE_OK" != "true" ] && BREAKS="${BREAKS}routing=NEED_AGENT(${ACTUAL_STATUS}/days=${DAYS}),"
  echo "FAST_PATH_BREAK|${BREAKS%,}"
fi
