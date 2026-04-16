#!/usr/bin/env bash
# email-search-inline.sh — 内联邮件搜索（直接调 agency HTTP proxy）
#
# 替代 MCP 直连 + LLM agent 机制。
# 每个 case 独立启动 agency proxy，搜索完毕后关闭。完全并行安全。
#
# 用法: bash email-search-inline.sh \
#   --case-number 2601290030000748 \
#   --case-dir ./cases/active/2601290030000748 \
#   --project-root . \
#   [--port 9860] \
#   [--top 20] \
#   [--incremental]
#
# 输出 (stdout 最后一行):
#   EMAIL_OK|emails=N|fetched=M|elapsed=Xs
#   EMAIL_SKIP|reason=...
#   EMAIL_FAIL|reason=...
set -uo pipefail

CASE_NUMBER="" CASE_DIR="" PROJECT_ROOT="." PORT="" TOP=20 INCREMENTAL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --case-number)    CASE_NUMBER="$2"; shift 2 ;;
    --case-dir)       CASE_DIR="$2"; shift 2 ;;
    --project-root)   PROJECT_ROOT="$2"; shift 2 ;;
    --port)           PORT="$2"; shift 2 ;;
    --top)            TOP="$2"; shift 2 ;;
    --incremental)    INCREMENTAL="true"; shift ;;
    *) shift ;;
  esac
done

[ -z "$CASE_NUMBER" ] || [ -z "$CASE_DIR" ] && { echo "EMAIL_FAIL|reason=missing args" >&2; exit 1; }

AGENCY_EXE="$APPDATA/agency/CurrentVersion/agency.exe"
[ ! -f "$AGENCY_EXE" ] && { echo "EMAIL_FAIL|reason=agency.exe not found"; exit 1; }

# Auto-assign port from case number hash
if [ -z "$PORT" ]; then
  PORT=$(python3 -c "print(9860 + hash('email$CASE_NUMBER') % 30)" 2>/dev/null || echo 9860)
fi

mkdir -p "$CASE_DIR/logs"
LOG="$CASE_DIR/logs/email-search.log"
T0=$(date +%s)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] INLINE START | case=$CASE_NUMBER port=$PORT" >> "$LOG"

# ═══════════════════════════════════════════
# Start agency HTTP proxy
# ═══════════════════════════════════════════

"$AGENCY_EXE" mcp mail --transport http --port "$PORT" > /dev/null 2>&1 &
APID=$!
trap 'kill $APID 2>/dev/null' EXIT

WAITED=0
while [ $WAITED -lt 15 ]; do
  curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:$PORT/" \
    -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"email-inline","version":"1.0"}}}' 2>/dev/null | grep -q "200" && break
  sleep 1; WAITED=$((WAITED + 1))
done
[ $WAITED -ge 15 ] && { echo "[$(date '+%Y-%m-%d %H:%M:%S')] INLINE FAIL | proxy start timeout" >> "$LOG"; echo "EMAIL_FAIL|reason=proxy start timeout"; exit 1; }

# ═══════════════════════════════════════════
# Python: search → dedup → fetch bodies → generate md
# ═══════════════════════════════════════════

MCP_PORT="$PORT" MCP_CASE_NUMBER="$CASE_NUMBER" MCP_CASE_DIR="$CASE_DIR" \
  MCP_PROJECT_ROOT="$PROJECT_ROOT" MCP_TOP="$TOP" MCP_INCREMENTAL="$INCREMENTAL" MCP_T0="$T0" \
  python3 << 'PYEOF'
import json, subprocess, time, os, re, html, sys

port = os.environ['MCP_PORT']
case_number = os.environ['MCP_CASE_NUMBER']
case_dir = os.environ['MCP_CASE_DIR']
project_root = os.environ['MCP_PROJECT_ROOT']
top = int(os.environ.get('MCP_TOP', '20'))
incremental = os.environ.get('MCP_INCREMENTAL', '') == 'true'
t0 = int(os.environ['MCP_T0'])

log_path = os.path.join(case_dir, 'logs', 'email-search.log')
tmp_dir = os.path.join(case_dir, '.tmp-email-search')
os.makedirs(tmp_dir, exist_ok=True)

def log(msg):
    ts = time.strftime('%Y-%m-%d %H:%M:%S')
    line = f'[{ts}] {msg}'
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(line + '\n')

def mcp_call(call_id, tool, args):
    body = json.dumps({
        "jsonrpc": "2.0", "id": call_id,
        "method": "tools/call",
        "params": {"name": tool, "arguments": args}
    })
    try:
        r = subprocess.run(
            ['curl', '-s', '--max-time', '90', '-X', 'POST', f'http://localhost:{port}/',
             '-H', 'Content-Type: application/json',
             '-H', 'Accept: application/json, text/event-stream',
             '-d', body],
            capture_output=True, text=True, timeout=95
        )
        for line in r.stdout.split('\n'):
            if line.startswith('data: {'):
                return json.loads(line[6:])
        if r.stdout.strip():
            try:
                return json.loads(r.stdout)
            except:
                pass
    except Exception as e:
        log(f'MCP call error: {e}')
    return None

def extract_messages(resp):
    """Deep parse the nested rawResponse structure from mail MCP"""
    if not resp:
        return []
    content = resp.get('result', {}).get('content', [])
    all_msgs = []
    for c in content:
        text = c.get('text', '')
        try:
            parsed = json.loads(text)
            raw_resp = parsed.get('rawResponse', '')
            if raw_resp:
                inner = json.loads(raw_resp)
                all_msgs.extend(inner.get('value', []))
            all_msgs.extend(parsed.get('messages', []))
        except:
            pass
    return all_msgs

def extract_single_message(resp):
    """Parse GetMessage response — handles {message, data} wrapper"""
    if not resp:
        return None
    content = resp.get('result', {}).get('content', [])
    for c in content:
        text = c.get('text', '')
        try:
            parsed = json.loads(text)
            # Mail MCP returns {message: "...", data: {actual message}}
            if 'data' in parsed and isinstance(parsed['data'], dict):
                return parsed['data']
            # Check rawResponse wrapping
            raw_resp = parsed.get('rawResponse', '')
            if raw_resp:
                inner = json.loads(raw_resp)
                if 'data' in inner and isinstance(inner['data'], dict):
                    return inner['data']
                return inner
            # Direct message object (has 'body' key)
            if 'body' in parsed or 'subject' in parsed:
                return parsed
        except:
            pass
    return None

def clean_html(html_text):
    """Strip HTML to plain text"""
    if not html_text:
        return ''
    text = re.sub(r'<style[^>]*>.*?</style>', '', html_text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<br\s*/?>|</p>|</div>|</tr>|</li>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</td>', '\t', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = html.unescape(text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    lines = [line.rstrip() for line in text.splitlines()]
    return '\n'.join(lines).strip()

# ═══════════════════════════════════════════
# Step 1: Search emails
# ═══════════════════════════════════════════

# Determine incremental timestamp
last_fetch_time = None
office_md = os.path.join(case_dir, 'emails-office.md')
if incremental and os.path.exists(office_md):
    with open(office_md, encoding='utf-8') as f:
        for line in f:
            m = re.search(r'Generated:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})', line)
            if m:
                last_fetch_time = m.group(1).replace(' ', 'T') + 'Z'
                break

# Strategy: $search first (full-text, finds TrackingID# in subject/body),
# then $filter fallback (structured, supports $orderby but unreliable for long numbers).
# $search does NOT support $orderby or $filter combo, so we sort client-side.
if last_fetch_time:
    # Incremental: use $filter with date (can't combine $search + $filter)
    qp = f"?$filter=receivedDateTime ge {last_fetch_time} and contains(subject,'{case_number}')&$orderby=receivedDateTime desc&$top={top}&$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,bodyPreview"
    log(f'STEP 1 START | Incremental search since {last_fetch_time}')
    resp = mcp_call(10, "SearchMessagesQueryParameters", {"queryParameters": qp})
    msgs = extract_messages(resp)
else:
    # Full: use $search (more reliable for case numbers in TrackingID# format)
    qp_search = f'?$search="{case_number}"&$top={top}'
    log(f'STEP 1 START | Full $search for case {case_number}')
    resp = mcp_call(10, "SearchMessagesQueryParameters", {"queryParameters": qp_search})
    msgs = extract_messages(resp)
    if not msgs:
        # Fallback to $filter
        log('STEP 1 FALLBACK | $search returned 0, trying $filter')
        qp_filter = f"?$filter=contains(subject,'{case_number}')&$orderby=receivedDateTime desc&$top={top}&$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,bodyPreview"
        resp = mcp_call(11, "SearchMessagesQueryParameters", {"queryParameters": qp_filter})
        msgs = extract_messages(resp)

if not msgs:
    # Final retry
    log('STEP 1 RETRY | Still no results, retrying $search...')
    time.sleep(1)
    resp = mcp_call(12, "SearchMessagesQueryParameters", {"queryParameters": f'?$search="{case_number}"&$top={top}'})
    msgs = extract_messages(resp)

total_before = len(msgs)

# Dedup by subject + sentDateTime
seen = set()
unique = []
for msg in msgs:
    key = f"{msg.get('subject','')}|{msg.get('sentDateTime','')}"
    if key not in seen:
        seen.add(key)
        unique.append(msg)

# Filter auto-replies
auto_patterns = ['自动回复', '自动答复', 'Automatic reply', 'Out of Office', 'AutoReply']
filtered = []
auto_count = 0
for msg in unique:
    subj = msg.get('subject', '') or ''
    is_auto = any(p in subj for p in auto_patterns)
    if not is_auto:
        preview = msg.get('bodyPreview', '') or ''
        if len(preview) < 200 and not re.match(r'^(Re:|RE:|回复|答复|FW:|Fw:|\[外部\])', subj):
            is_auto = True
    if is_auto:
        auto_count += 1
    else:
        filtered.append(msg)

log(f'STEP 1 OK    | Found {total_before} emails, dedup to {len(unique)}, filtered to {len(filtered)} (skipped {auto_count} auto-replies)')

if not filtered:
    # Generate empty emails-office.md
    ts = time.strftime('%Y-%m-%d %H:%M:%S')
    content = f'# Emails (Outlook) — Case {case_number}\n\n> Generated: {ts} | Total: 0 emails | Source: Agency Mail HTTP\n\n---\n\n_No emails found._\n'
    with open(office_md, 'w', encoding='utf-8') as f:
        f.write(content)
    elapsed = int(time.time()) - t0
    log(f'STEP 3 OK    | Empty emails-office.md (0 emails)')
    print(f'EMAIL_OK|emails=0|fetched=0|elapsed={elapsed}s')
    sys.exit(0)

# ═══════════════════════════════════════════
# Step 2: Extract body from latest email(s) only
# ═══════════════════════════════════════════

log(f'STEP 2 START | Extracting body from latest email')

# Sort by receivedDateTime asc
sorted_msgs = sorted(filtered, key=lambda m: m.get('receivedDateTime', ''))

# Email replies nest the full conversation history.
# The latest email's body contains ALL previous exchanges.
# Only expand the single latest email — it has the complete thread.
latest = sorted_msgs[-1] if sorted_msgs else None
latest_id = latest.get('id', '') if latest else ''

expand_ids = {latest_id} if latest_id else set()

# Extract bodies for expanded emails
fetched_bodies = {}
for msg in sorted_msgs:
    msg_id = msg.get('id', '')
    if msg_id not in expand_ids:
        continue
    body_obj = msg.get('body', {})
    body_content = body_obj.get('content', '') if isinstance(body_obj, dict) else ''
    if body_content and len(body_content) > 300:
        suffix = msg_id[-10:] if len(msg_id) >= 10 else msg_id
        body_file = os.path.join(tmp_dir, f'body-{suffix}.html')
        with open(body_file, 'w', encoding='utf-8') as f:
            f.write(body_content)
        fetched_bodies[msg_id] = body_file

# Fallback: if body not in search results, try GetMessage
for msg_id in expand_ids:
    if msg_id and msg_id not in fetched_bodies:
        resp = mcp_call(20, "GetMessage", {"id": msg_id, "preferHtml": True})
        parsed = extract_single_message(resp)
        if parsed and parsed.get('body', {}).get('content'):
            suffix = msg_id[-10:] if len(msg_id) >= 10 else msg_id
            body_file = os.path.join(tmp_dir, f'body-{suffix}.html')
            with open(body_file, 'w', encoding='utf-8') as f:
                f.write(parsed['body']['content'])
            fetched_bodies[msg_id] = body_file

log(f'STEP 2 OK    | {len(fetched_bodies)} bodies extracted (expanding {len(expand_ids)} of {len(sorted_msgs)} emails)')

# ═══════════════════════════════════════════
# Step 3: Generate emails-office.md
# ═══════════════════════════════════════════

log(f'STEP 3 START | Generating emails-office.md')

def format_msg_meta(msg):
    """Extract metadata fields from a message"""
    from_addr = ''
    from_name = ''
    if isinstance(msg.get('from'), dict):
        ea = msg['from'].get('emailAddress', {})
        from_addr = ea.get('address', '')
        from_name = ea.get('name', '')
    to_list = []
    for r in (msg.get('toRecipients') or []):
        ea = r.get('emailAddress', {})
        to_list.append(f"{ea.get('name','')} <{ea.get('address','')}>")
    cc_list = []
    for r in (msg.get('ccRecipients') or []):
        ea = r.get('emailAddress', {})
        cc_list.append(f"{ea.get('name','')} <{ea.get('address','')}>")
    dt_str = msg.get('receivedDateTime', '')[:19].replace('T', ' ')
    direction = 'Sent' if '@microsoft.com' in from_addr else 'Received'
    icon = '\U0001f4e4' if direction == 'Sent' else '\U0001f4e5'
    return from_addr, from_name, to_list, cc_list, dt_str, direction, icon

ts = time.strftime('%Y-%m-%d %H:%M:%S')
lines = [
    f'# Emails (Outlook) \u2014 Case {case_number}',
    '',
    f'> Generated: {ts} | Total: {len(sorted_msgs)} emails | Source: Agency Mail HTTP',
    '',
    '## Timeline',
    '',
    '| # | Time | Direction | From | Subject |',
    '|---|------|-----------|------|---------|',
]

# Timeline index (all emails, one line each)
for i, msg in enumerate(sorted_msgs):
    from_addr, from_name, _, _, dt_str, direction, icon = format_msg_meta(msg)
    subj = (msg.get('subject', '') or '')[:60]
    expanded = ' **\u2190 full body below**' if msg.get('id', '') in expand_ids else ''
    display_name = from_name.split()[0] if from_name else from_addr.split('@')[0]
    lines.append(f'| {i+1} | {dt_str} | {icon} {direction} | {display_name} | {subj}{expanded} |')

lines.append('')
lines.append('---')

# Full body for expanded emails only
for msg in sorted_msgs:
    msg_id = msg.get('id', '')
    if msg_id not in expand_ids:
        continue

    from_addr, from_name, to_list, cc_list, dt_str, direction, icon = format_msg_meta(msg)
    subj = msg.get('subject', '') or '(no subject)'

    lines.append('')
    lines.append(f'## {icon} {direction} | {dt_str}')
    lines.append(f'**Subject:** {subj}')
    lines.append(f'**From:** {from_name} <{from_addr}>')
    lines.append(f'**To:** {"; ".join(to_list)}')
    if cc_list:
        lines.append(f'**Cc:** {"; ".join(cc_list)}')
    lines.append('')

    body_file = fetched_bodies.get(msg_id)
    if body_file and os.path.exists(body_file):
        with open(body_file, encoding='utf-8') as f:
            html_body = f.read()
        cleaned = clean_html(html_body)
        lines.append(cleaned if cleaned else (msg.get('bodyPreview', '') or ''))
    else:
        lines.append(msg.get('bodyPreview', '') or '')

    lines.append('')
    lines.append('---')

# Write .md output
with open(office_md, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

# Write .json output (structured, machine-readable)
office_json = os.path.join(case_dir, 'emails-office.json')

def build_email_record(msg, is_expanded=False):
    """Build structured record for one email"""
    from_addr = ''
    from_name = ''
    if isinstance(msg.get('from'), dict):
        ea = msg['from'].get('emailAddress', {})
        from_addr = ea.get('address', '')
        from_name = ea.get('name', '')
    to_addrs = []
    for r in (msg.get('toRecipients') or []):
        ea = r.get('emailAddress', {})
        to_addrs.append({'name': ea.get('name',''), 'address': ea.get('address','')})
    cc_addrs = []
    for r in (msg.get('ccRecipients') or []):
        ea = r.get('emailAddress', {})
        cc_addrs.append({'name': ea.get('name',''), 'address': ea.get('address','')})
    direction = 'sent' if '@microsoft.com' in from_addr else 'received'

    record = {
        'id': msg.get('id', ''),
        'conversationId': msg.get('conversationId', ''),
        'subject': msg.get('subject', ''),
        'from': {'name': from_name, 'address': from_addr},
        'to': to_addrs,
        'cc': cc_addrs,
        'direction': direction,
        'receivedDateTime': msg.get('receivedDateTime', ''),
        'sentDateTime': msg.get('sentDateTime', ''),
        'importance': msg.get('importance', 'normal'),
        'hasAttachments': msg.get('hasAttachments', False),
        'isRead': msg.get('isRead', True),
        'bodyPreview': msg.get('bodyPreview', '')[:255],
    }

    if is_expanded:
        msg_id = msg.get('id', '')
        body_file = fetched_bodies.get(msg_id)
        if body_file and os.path.exists(body_file):
            with open(body_file, encoding='utf-8') as bf:
                record['bodyHtml'] = bf.read()
            record['bodyText'] = clean_html(record['bodyHtml'])
        else:
            record['bodyHtml'] = ''
            record['bodyText'] = msg.get('bodyPreview', '')

    return record

json_output = {
    '_version': 1,
    '_generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    '_source': 'agency-mail-http',
    'caseNumber': case_number,
    'totalEmails': len(sorted_msgs),
    'expandedCount': len(expand_ids),
    'emails': [
        build_email_record(msg, is_expanded=(msg.get('id','') in expand_ids))
        for msg in sorted_msgs
    ]
}

with open(office_json, 'w', encoding='utf-8') as f:
    json.dump(json_output, f, indent=2, ensure_ascii=False)

# Cleanup temp dir
import shutil
shutil.rmtree(tmp_dir, ignore_errors=True)

md_size = os.path.getsize(office_md) / 1024
json_size = os.path.getsize(office_json) / 1024
elapsed = int(time.time()) - t0
log(f'STEP 3 OK    | emails-office.md ({md_size:.1f}KB) + .json ({json_size:.1f}KB) | {len(sorted_msgs)} emails, {len(expand_ids)} expanded')

print(f'EMAIL_OK|emails={len(sorted_msgs)}|expanded={len(expand_ids)}|elapsed={elapsed}s')
PYEOF
