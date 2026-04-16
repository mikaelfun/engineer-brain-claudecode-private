#!/usr/bin/env bash
# extract-delta.sh — 从 emails.md / notes.md 提取上次 status-judge 之后的增量内容
#
# 用法: bash extract-delta.sh --case-dir ./cases/active/2601290030000748
# 输出文件: {caseDir}/context/delta-since-last-judge.md
# stdout 最后一行: DELTA_OK|emails=19→22(+3)|notes=10→10(+0)
#                   DELTA_EMPTY|emails=22→22|notes=10→10
#                   DELTA_FIRST_RUN|no previous judge data
set -uo pipefail

# --- Parse arguments ---
CASE_DIR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --case-dir) CASE_DIR="$2"; shift 2 ;;
    *) shift ;;
  esac
done

if [ -z "$CASE_DIR" ]; then
  echo "ERROR|missing --case-dir" >&2
  exit 1
fi

META="$CASE_DIR/casehealth-meta.json"
EMAILS_FILE="$CASE_DIR/emails.md"
NOTES_FILE="$CASE_DIR/notes.md"
OUTPUT="$CASE_DIR/logs/delta-since-last-judge.md"
mkdir -p "$CASE_DIR/logs"

# --- File-level count markers (independent of meta's D365 counts) ---
# meta.emailCountAtJudge tracks D365 total (includes system notifications)
# but emails.md only contains actual emails (fewer). We use our own marker files
# to track the <!-- id: count in the actual files.
EMAIL_MARKER="$CASE_DIR/logs/.delta-email-file-count"
NOTE_MARKER="$CASE_DIR/logs/.delta-note-file-count"

# --- Read previous file-level counts from markers ---
PREV_EMAIL_COUNT=-1
PREV_NOTE_COUNT=-1
[ -f "$EMAIL_MARKER" ] && PREV_EMAIL_COUNT=$(cat "$EMAIL_MARKER" 2>/dev/null || echo "-1")
[ -f "$NOTE_MARKER" ] && PREV_NOTE_COUNT=$(cat "$NOTE_MARKER" 2>/dev/null || echo "-1")

# --- Read previous status context from meta ---
PREV_STATUS=""
PREV_JUDGE_AT=""
PREV_REASONING=""

if [ -f "$META" ]; then
  read -r PREV_STATUS PREV_JUDGE_AT PREV_REASONING <<< $(python3 -c "
import json
try:
    m = json.load(open('$META'))
    s = m.get('actualStatus', '')
    j = m.get('statusJudgedAt', '')
    r = m.get('statusReasoning', '').replace('\n', ' ').strip()[:200]
    print(s, j, r, sep='\t')
except: print('\t\t')
" 2>/dev/null || echo -e "\t\t")
fi

# --- First run check ---
if [ "$PREV_EMAIL_COUNT" = "-1" ] && [ "$PREV_NOTE_COUNT" = "-1" ]; then
  # No previous marker → first run. Save current counts as baseline.
  CUR_E=0; [ -f "$EMAILS_FILE" ] && CUR_E=$(grep -c '<!-- id:' "$EMAILS_FILE" 2>/dev/null || echo "0")
  CUR_N=0; [ -f "$NOTES_FILE" ] && CUR_N=$(grep -c '<!-- id:' "$NOTES_FILE" 2>/dev/null || echo "0")
  echo "$CUR_E" > "$EMAIL_MARKER"
  echo "$CUR_N" > "$NOTE_MARKER"
  cat > "$OUTPUT" << EOF
# Delta Since Last Judge
> **FIRST RUN** — baseline set (emails=${CUR_E}, notes=${CUR_N}). Full analysis required.
> Previous status: **${PREV_STATUS:-unknown}** | Judged at: ${PREV_JUDGE_AT:-never}
EOF
  echo "DELTA_FIRST_RUN|baseline set emails=${CUR_E} notes=${CUR_N}"
  exit 0
fi

# --- Count current emails ---
CUR_EMAIL_COUNT=0
if [ -f "$EMAILS_FILE" ]; then
  CUR_EMAIL_COUNT=$(grep -c '<!-- id:' "$EMAILS_FILE" 2>/dev/null || echo "0")
fi

# --- Count current notes ---
CUR_NOTE_COUNT=0
if [ -f "$NOTES_FILE" ]; then
  CUR_NOTE_COUNT=$(grep -c '<!-- id:' "$NOTES_FILE" 2>/dev/null || echo "0")
fi

# --- Calculate deltas ---
NEW_EMAIL_COUNT=$((CUR_EMAIL_COUNT - PREV_EMAIL_COUNT))
NEW_NOTE_COUNT=$((CUR_NOTE_COUNT - PREV_NOTE_COUNT))

# Clamp to 0 (in case of data inconsistency)
[ "$NEW_EMAIL_COUNT" -lt 0 ] 2>/dev/null && NEW_EMAIL_COUNT=0
[ "$NEW_NOTE_COUNT" -lt 0 ] 2>/dev/null && NEW_NOTE_COUNT=0

# --- Extract new emails ---
NEW_EMAILS_CONTENT=""
if [ "$NEW_EMAIL_COUNT" -gt 0 ] && [ -f "$EMAILS_FILE" ]; then
  # Find line number of the Nth-from-last <!-- id: marker
  # We want the last $NEW_EMAIL_COUNT emails
  # Strategy: find all <!-- id: lines, take the one at position (total - new + 1)
  MARKER_LINE=$(grep -n '<!-- id:' "$EMAILS_FILE" | tail -"$NEW_EMAIL_COUNT" | head -1 | cut -d: -f1)
  if [ -n "$MARKER_LINE" ]; then
    NEW_EMAILS_CONTENT=$(tail -n +"$MARKER_LINE" "$EMAILS_FILE")
  fi
fi

# --- Extract new notes ---
NEW_NOTES_CONTENT=""
if [ "$NEW_NOTE_COUNT" -gt 0 ] && [ -f "$NOTES_FILE" ]; then
  MARKER_LINE=$(grep -n '<!-- id:' "$NOTES_FILE" | tail -"$NEW_NOTE_COUNT" | head -1 | cut -d: -f1)
  if [ -n "$MARKER_LINE" ]; then
    NEW_NOTES_CONTENT=$(tail -n +"$MARKER_LINE" "$NOTES_FILE")
  fi
fi

# --- Check if delta is empty ---
if [ "$NEW_EMAIL_COUNT" -eq 0 ] && [ "$NEW_NOTE_COUNT" -eq 0 ]; then
  cat > "$OUTPUT" << EOF
# Delta Since Last Judge
> Previous status: **${PREV_STATUS}** | Judged at: ${PREV_JUDGE_AT}
> Previous reasoning: ${PREV_REASONING}
> Emails: ${PREV_EMAIL_COUNT} → ${CUR_EMAIL_COUNT} (no change) | Notes: ${PREV_NOTE_COUNT} → ${CUR_NOTE_COUNT} (no change)

**No new emails or notes since last judge. Status unchanged.**
EOF
  # Update markers (no change but ensure they exist)
  echo "$CUR_EMAIL_COUNT" > "$EMAIL_MARKER"
  echo "$CUR_NOTE_COUNT" > "$NOTE_MARKER"
  echo "DELTA_EMPTY|emails=${PREV_EMAIL_COUNT}→${CUR_EMAIL_COUNT}|notes=${PREV_NOTE_COUNT}→${CUR_NOTE_COUNT}"
  exit 0
fi

# --- Build delta output ---
cat > "$OUTPUT" << EOF
# Delta Since Last Judge
> Previous status: **${PREV_STATUS}** | Judged at: ${PREV_JUDGE_AT}
> Previous reasoning: ${PREV_REASONING}
> Emails: ${PREV_EMAIL_COUNT} → ${CUR_EMAIL_COUNT} (+${NEW_EMAIL_COUNT} new) | Notes: ${PREV_NOTE_COUNT} → ${CUR_NOTE_COUNT} (+${NEW_NOTE_COUNT} new)

EOF

if [ "$NEW_EMAIL_COUNT" -gt 0 ]; then
  cat >> "$OUTPUT" << EOF
## New Emails (${NEW_EMAIL_COUNT})

${NEW_EMAILS_CONTENT}

EOF
fi

if [ "$NEW_NOTE_COUNT" -gt 0 ]; then
  cat >> "$OUTPUT" << EOF
## New Notes (${NEW_NOTE_COUNT})

${NEW_NOTES_CONTENT}

EOF
fi

if [ "$NEW_EMAIL_COUNT" -eq 0 ]; then
  echo "## New Emails (0)" >> "$OUTPUT"
  echo "(no new emails)" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
fi

if [ "$NEW_NOTE_COUNT" -eq 0 ]; then
  echo "## New Notes (0)" >> "$OUTPUT"
  echo "(no new notes)" >> "$OUTPUT"
fi

# --- Update markers for next run ---
echo "$CUR_EMAIL_COUNT" > "$EMAIL_MARKER"
echo "$CUR_NOTE_COUNT" > "$NOTE_MARKER"

echo "DELTA_OK|emails=${PREV_EMAIL_COUNT}→${CUR_EMAIL_COUNT}(+${NEW_EMAIL_COUNT})|notes=${PREV_NOTE_COUNT}→${CUR_NOTE_COUNT}(+${NEW_NOTE_COUNT})"
