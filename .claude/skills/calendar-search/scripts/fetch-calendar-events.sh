#!/usr/bin/env bash
# fetch-calendar-events.sh — 通过 agency HTTP proxy 查询 Calendar 日历事件
#
# 用法: bash fetch-calendar-events.sh \
#   [--start "2026-04-01"] [--end "2026-04-20"] [--days 14] \
#   [--keyword "customer"] [--external-only] \
#   [--output /path/to/output.md] [--json /path/to/output.json] \
#   [--port 9850]
#
# 输出 (stdout 最后一行):
#   CAL_OK|total=N|external=M|elapsed=Xs
#   CAL_FAIL|reason=...
set -uo pipefail

START="" END="" DAYS=14 KEYWORD="" EXTERNAL_ONLY="" OUTPUT="" JSON_OUT="" PORT=9850

while [[ $# -gt 0 ]]; do
  case "$1" in
    --start)         START="$2"; shift 2 ;;
    --end)           END="$2"; shift 2 ;;
    --days)          DAYS="$2"; shift 2 ;;
    --keyword)       KEYWORD="$2"; shift 2 ;;
    --external-only) EXTERNAL_ONLY="true"; shift ;;
    --output)        OUTPUT="$2"; shift 2 ;;
    --json)          JSON_OUT="$2"; shift 2 ;;
    --port)          PORT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

AGENCY_EXE="$APPDATA/agency/CurrentVersion/agency.exe"
[ ! -f "$AGENCY_EXE" ] && { echo "CAL_FAIL|reason=agency.exe not found"; exit 1; }

T0=$(date +%s)

# ═══════════════════════════════════════════
# Compute date range
# ═══════════════════════════════════════════
if [ -z "$START" ]; then
  # Default: DAYS days ago
  START=$(python3 -c "from datetime import datetime,timedelta; print((datetime.now()-timedelta(days=$DAYS)).strftime('%Y-%m-%dT00:00:00'))")
fi
if [ -z "$END" ]; then
  END=$(python3 -c "from datetime import datetime; print(datetime.now().strftime('%Y-%m-%dT23:59:59'))")
fi

echo "  Calendar search: $START → $END" >&2

# ═══════════════════════════════════════════
# Start agency HTTP proxy
# ═══════════════════════════════════════════

# Kill stale proxy on our port
STALE_PID=$(netstat -ano 2>/dev/null | grep -E "127\.0\.0\.1:$PORT\s.*LISTENING" | awk '{print $NF}' | head -1)
if [ -n "$STALE_PID" ] && [ "$STALE_PID" != "0" ]; then
  taskkill //PID "$STALE_PID" //F >/dev/null 2>&1 || true
  sleep 0.5
fi

"$AGENCY_EXE" mcp calendar --transport http --port "$PORT" > /dev/null 2>&1 &
APID=$!
trap 'kill $APID 2>/dev/null' EXIT

# Wait for proxy ready
WAITED=0
while [ $WAITED -lt 20 ]; do
  INIT_RAW=$(curl -s -w "\n%{http_code}" --max-time 5 -X POST "http://localhost:$PORT/" \
    -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"cal-search","version":"1.0"}}}' 2>/dev/null || true)
  STATUS=$(echo "$INIT_RAW" | tail -1)
  if [ "$STATUS" = "200" ]; then
    echo "  ✓ calendar proxy ready" >&2
    break
  fi
  sleep 0.5; WAITED=$((WAITED + 1))
done
[ $WAITED -ge 20 ] && { echo "CAL_FAIL|reason=proxy start timeout"; exit 1; }

# ═══════════════════════════════════════════
# Query ListCalendarView → Python parse + format
# ═══════════════════════════════════════════

RESP=$(curl -s --max-time 30 -X POST "http://localhost:$PORT/" \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":10,\"method\":\"tools/call\",\"params\":{\"name\":\"ListCalendarView\",\"arguments\":{\"startDateTime\":\"$START\",\"endDateTime\":\"$END\"}}}" 2>/dev/null)

# Extract SSE data line
DATA=$(echo "$RESP" | grep -o 'data: {.*}' | sed 's/^data: //' | head -1)

if [ -z "$DATA" ]; then
  echo "CAL_FAIL|reason=empty response from calendar API"
  exit 1
fi

# Save raw for Python
echo "$DATA" > "$TEMP/cal-raw-response.json"

# ═══════════════════════════════════════════
# Python: parse events → markdown + json
# ═══════════════════════════════════════════

CAL_START="$START" CAL_END="$END" CAL_KEYWORD="$KEYWORD" CAL_EXTERNAL_ONLY="$EXTERNAL_ONLY" \
  CAL_OUTPUT="$OUTPUT" CAL_JSON_OUT="$JSON_OUT" CAL_T0="$T0" \
  python3 << 'PYEOF'
import json, os, re, sys
from datetime import datetime

raw_path = os.path.join(os.environ['TEMP'], 'cal-raw-response.json')
with open(raw_path, encoding='utf-8') as f:
    data = json.loads(f.read())

# Extract events from response
content = data.get('result', {}).get('content', [])
events = []
for c in content:
    text = c.get('text', '')
    match = re.search(r'\{"value":\[.*\]\}', text, re.DOTALL)
    if match:
        parsed = json.loads(match.group(0))
        events = parsed.get('value', [])
        break

if not events:
    # Try alternate format
    for c in content:
        text = c.get('text', '')
        if '"value"' in text:
            try:
                parsed = json.loads(text)
                events = parsed.get('value', [])
            except:
                pass

keyword = os.environ.get('CAL_KEYWORD', '').strip().lower()
external_only = os.environ.get('CAL_EXTERNAL_ONLY', '') == 'true'
cal_start = os.environ.get('CAL_START', '')[:10]
cal_end = os.environ.get('CAL_END', '')[:10]
t0 = int(os.environ.get('CAL_T0', '0'))

# Parse each event
parsed_events = []
for e in events:
    subj = e.get('subject', '') or ''

    # Keyword filter
    if keyword and keyword not in subj.lower():
        continue

    start_obj = e.get('start', {})
    end_obj = e.get('end', {})
    start_dt = start_obj.get('dateTime', '')
    end_dt = end_obj.get('dateTime', '')

    # Parse datetime for display
    try:
        start_parsed = datetime.fromisoformat(start_dt.replace('Z', '+00:00'))
        end_parsed = datetime.fromisoformat(end_dt.replace('Z', '+00:00'))
        duration_min = int((end_parsed - start_parsed).total_seconds() / 60)
    except:
        duration_min = 0

    organizer = e.get('organizer', {}).get('emailAddress', {})
    org_name = organizer.get('name', '')
    org_email = organizer.get('address', '')

    attendees = e.get('attendees', [])
    all_attendees = []
    external_attendees = []

    for a in attendees:
        ea = a.get('emailAddress', {})
        addr = ea.get('address', '')
        name = ea.get('name', '')
        resp = a.get('status', {}).get('response', '')
        atype = a.get('type', '')

        if not addr:
            continue

        entry = {'name': name, 'email': addr, 'response': resp, 'type': atype}
        all_attendees.append(entry)

        if not addr.endswith('microsoft.com'):
            external_attendees.append(entry)

    # External-only filter
    if external_only and not external_attendees:
        continue

    is_cancelled = e.get('isCancelled', False)
    location = e.get('location', {}).get('displayName', '') or ''
    is_online = e.get('isOnlineMeeting', False)
    online_url = (e.get('onlineMeeting') or {}).get('joinUrl', '')

    parsed_events.append({
        'subject': subj,
        'startDateTime': start_dt,
        'endDateTime': end_dt,
        'startDate': start_dt[:10],
        'startTime': start_dt[11:16],
        'durationMin': duration_min,
        'organizer': {'name': org_name, 'email': org_email},
        'attendees': all_attendees,
        'externalAttendees': external_attendees,
        'hasExternal': bool(external_attendees),
        'isCancelled': is_cancelled,
        'isOnlineMeeting': is_online,
        'onlineUrl': online_url,
        'location': location,
    })

# Sort by start time
parsed_events.sort(key=lambda x: x['startDateTime'])

# Count stats
total = len(parsed_events)
ext_count = sum(1 for e in parsed_events if e['hasExternal'])
elapsed = int(__import__('time').time()) - t0

# ── Generate Markdown ──
lines = []
lines.append(f'# Calendar Events — {cal_start} ~ {cal_end}')
lines.append(f'')
lines.append(f'> Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")} | Total: {total} events | External: {ext_count} | Source: Agency Calendar HTTP')
lines.append('')

# External meetings section
ext_events = [e for e in parsed_events if e['hasExternal'] and not e['isCancelled']]
if ext_events:
    lines.append('## External Meetings')
    lines.append('')
    lines.append('| # | Date | Time | Duration | Subject | External Attendees |')
    lines.append('|---|------|------|----------|---------|-------------------|')
    for i, e in enumerate(ext_events, 1):
        ext_names = ', '.join(f"{a['name']} <{a['email']}>" if a['name'] else a['email']
                             for a in e['externalAttendees'][:3])
        if len(e['externalAttendees']) > 3:
            ext_names += f' (+{len(e["externalAttendees"])-3} more)'
        dur = f"{e['durationMin']}min" if e['durationMin'] else '?'
        cancelled = ' ~~CANCELLED~~' if e['isCancelled'] else ''
        lines.append(f"| {i} | {e['startDate'][5:]} | {e['startTime']} | {dur} | {e['subject'][:50]}{cancelled} | {ext_names} |")
    lines.append('')

# All meetings section (chronological)
if not external_only:
    lines.append('## All Meetings (chronological)')
    lines.append('')
    lines.append('| # | Date | Time | Duration | Subject | Attendees |')
    lines.append('|---|------|------|----------|---------|-----------|')
    for i, e in enumerate(parsed_events, 1):
        att_count = len(e['attendees'])
        ext_mark = f" ★{len(e['externalAttendees'])}ext" if e['hasExternal'] else ''
        dur = f"{e['durationMin']}min" if e['durationMin'] else '?'
        cancelled = ' ~~CANCELLED~~' if e['isCancelled'] else ''
        lines.append(f"| {i} | {e['startDate'][5:]} | {e['startTime']} | {dur} | {e['subject'][:50]}{cancelled} | {att_count} ppl{ext_mark} |")
    lines.append('')

md = '\n'.join(lines)

# ── Output ──
output_path = os.environ.get('CAL_OUTPUT', '').strip()
if output_path:
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md)
    print(f'  → {output_path}', file=sys.stderr)
else:
    print(md)

# JSON output
json_path = os.environ.get('CAL_JSON_OUT', '').strip()
if json_path:
    os.makedirs(os.path.dirname(json_path) or '.', exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump({
            'range': {'start': cal_start, 'end': cal_end},
            'total': total,
            'externalCount': ext_count,
            'events': parsed_events,
            'generatedAt': datetime.now().isoformat(),
        }, f, indent=2, ensure_ascii=False)
    print(f'  → {json_path}', file=sys.stderr)

print(f'CAL_OK|total={total}|external={ext_count}|elapsed={elapsed}s')
PYEOF
