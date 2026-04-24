#!/usr/bin/env bash
# mimic-collect.sh — Batch collect engineer's case emails for style distillation
#
# Two-phase collection:
#   Phase 1: Search by case number (all active + archived cases)
#   Phase 2: Search by sender (engineer's sent emails, broader coverage)
#
# Output:
#   {output-dir}/{caseid}-email.md   — per-case email threads
#   {output-dir}/misc-sent-emails.md — additional sent emails not linked to cases
#   {output-dir}/analysis-input.md   — consolidated engineer-sent-only for LLM analysis
#
# Usage:
#   bash mimic-collect.sh \
#     --output-dir /path/to/output \
#     [--cases-root ../data-dev/cases] \
#     [--engineer-email fangkun@microsoft.com] \
#     [--top 100] \
#     [--port 9890]
#
# Exit status line (stdout):
#   MIMIC_OK|cases=N|sent=M|total=T|elapsed=Xs
#   MIMIC_FAIL|reason=...
set -uo pipefail

# Use 'python' on Windows (python3 points to Microsoft Store alias)
PYTHON=$(command -v python3 2>/dev/null || command -v python 2>/dev/null)
[ -z "$PYTHON" ] && { echo "MIMIC_FAIL|reason=python not found"; exit 1; }
# Validate it's a real Python (not the Windows Store alias)
if ! "$PYTHON" -c "import sys" 2>/dev/null; then
  PYTHON=$(command -v python 2>/dev/null)
  [ -z "$PYTHON" ] && { echo "MIMIC_FAIL|reason=python not found"; exit 1; }
fi

OUTPUT_DIR="" CASES_ROOT="" ENGINEER_EMAIL="fangkun@microsoft.com" TOP=100 PORT="" PROJECT_ROOT="." CASE_IDS_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output-dir)       OUTPUT_DIR="$2"; shift 2 ;;
    --cases-root)       CASES_ROOT="$2"; shift 2 ;;
    --engineer-email)   ENGINEER_EMAIL="$2"; shift 2 ;;
    --top)              TOP="$2"; shift 2 ;;
    --port)             PORT="$2"; shift 2 ;;
    --project-root)     PROJECT_ROOT="$2"; shift 2 ;;
    --case-ids-file)    CASE_IDS_FILE="$2"; shift 2 ;;
    *) shift ;;
  esac
done

[ -z "$OUTPUT_DIR" ] && { echo "MIMIC_FAIL|reason=--output-dir required"; exit 1; }

# Auto-detect cases-root from config.json
if [ -z "$CASES_ROOT" ]; then
  CASES_ROOT=$("$PYTHON" -c "import json,os; c=json.load(open(os.path.join(r'''$PROJECT_ROOT''','config.json'))); print(os.path.join(r'''$PROJECT_ROOT''', c['casesRoot']))" 2>/dev/null)
  [ -z "$CASES_ROOT" ] && { echo "MIMIC_FAIL|reason=cannot read casesRoot from config.json"; exit 1; }
fi

AGENCY_EXE="$APPDATA/agency/CurrentVersion/agency.exe"
[ ! -f "$AGENCY_EXE" ] && { echo "MIMIC_FAIL|reason=agency.exe not found"; exit 1; }

# Auto-assign port
if [ -z "$PORT" ]; then
  PORT=$("$PYTHON" -c "print(9890 + hash('mimic') % 10)" 2>/dev/null || echo 9890)
fi

mkdir -p "$OUTPUT_DIR"
T0=$(date +%s)
LOG="$OUTPUT_DIR/mimic-collect.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] MIMIC START | output=$OUTPUT_DIR port=$PORT" > "$LOG"

# ═══════════════════════════════════════════
# Start agency HTTP proxy
# ═══════════════════════════════════════════

"$AGENCY_EXE" mcp mail --transport http --port "$PORT" > /dev/null 2>&1 &
APID=$!
trap 'kill $APID 2>/dev/null' EXIT

WAITED=0
while [ $WAITED -lt 20 ]; do
  curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:$PORT/" \
    -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"mimic-collect","version":"1.0"}}}' 2>/dev/null | grep -q "200" && break
  sleep 1; WAITED=$((WAITED + 1))
done
[ $WAITED -ge 20 ] && { echo "[$(date '+%Y-%m-%d %H:%M:%S')] MIMIC FAIL | proxy start timeout" >> "$LOG"; echo "MIMIC_FAIL|reason=proxy start timeout"; exit 1; }

echo "[$(date '+%Y-%m-%d %H:%M:%S')] PROXY OK | port=$PORT pid=$APID" >> "$LOG"

# ═══════════════════════════════════════════
# Python: Phase 1 (per-case) + Phase 2 (by sender) + consolidate
# ═══════════════════════════════════════════

MCP_PORT="$PORT" MCP_OUTPUT_DIR="$OUTPUT_DIR" MCP_CASES_ROOT="$CASES_ROOT" \
  MCP_ENGINEER_EMAIL="$ENGINEER_EMAIL" MCP_TOP="$TOP" MCP_T0="$T0" MCP_LOG="$LOG" \
  MCP_CASE_IDS_FILE="$CASE_IDS_FILE" \
  "$PYTHON" << 'PYEOF'
import json, subprocess, time, os, re, html, sys, glob

port = os.environ['MCP_PORT']
output_dir = os.environ['MCP_OUTPUT_DIR']
cases_root = os.environ['MCP_CASES_ROOT']
engineer_email = os.environ['MCP_ENGINEER_EMAIL']
top = int(os.environ.get('MCP_TOP', '100'))
t0 = int(os.environ['MCP_T0'])
log_path = os.environ['MCP_LOG']

def log(msg):
    ts = time.strftime('%Y-%m-%d %H:%M:%S')
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(f'[{ts}] {msg}\n')

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
    if not resp:
        return None
    content = resp.get('result', {}).get('content', [])
    for c in content:
        text = c.get('text', '')
        try:
            parsed = json.loads(text)
            if 'data' in parsed and isinstance(parsed['data'], dict):
                return parsed['data']
            raw_resp = parsed.get('rawResponse', '')
            if raw_resp:
                inner = json.loads(raw_resp)
                if 'data' in inner and isinstance(inner['data'], dict):
                    return inner['data']
                return inner
            if 'body' in parsed or 'subject' in parsed:
                return parsed
        except:
            pass
    return None

def clean_html(html_text):
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

def get_from_addr(msg):
    if isinstance(msg.get('from'), dict):
        return msg['from'].get('emailAddress', {}).get('address', '')
    return ''

def get_from_name(msg):
    if isinstance(msg.get('from'), dict):
        return msg['from'].get('emailAddress', {}).get('name', '')
    return ''

def is_engineer_sent(msg):
    addr = get_from_addr(msg).lower()
    return engineer_email.lower() in addr or '@microsoft.com' in addr

def classify_email(msg, body_text=''):
    """Classify email type by body content (primary) and subject (fallback).
    Categories: IR (Initial Response), REPLY, MEETING, CLOSE, FOLLOWUP, INITIAL (other)
    """
    body_lower = body_text.lower() if body_text else ''
    subj = (msg.get('subject', '') or '').lower()

    # IR (Initial Response) — first-contact template email to customer
    ir_markers_zh = ['感谢您联系微软', '我是微软的技术支持工程师', '很高兴能有机会协助您', '您可随时通过以下联系方式']
    ir_markers_en = ['thank you for contacting microsoft', 'i am the support professional who will be working with you', 'you may reach me using the contact information']
    if any(m in body_lower for m in ir_markers_zh + ir_markers_en):
        return 'IR'

    # MEETING — meeting summary emails
    meeting_markers_zh = ['感谢您参加此次远程会议', '以下是一个会议总结', '感谢您的时间参加会议']
    meeting_markers_en = ['thank you for your time over the meeting', 'here is the current summary and status', 'thank you for taking the time to meet']
    if any(m in body_lower for m in meeting_markers_zh + meeting_markers_en):
        return 'MEETING'

    # CLOSE — case closure emails
    close_markers_zh = ['基于您的同意，我们将', '关闭此案例', '关闭支持工单', '关闭此case', '我们将归档此案例', '稍后您会收到一封服务质量反馈邮件']
    close_markers_en = ['we will be closing this case', 'close this case', 'closing this service request', 'you will receive a survey email']
    if any(m in body_lower for m in close_markers_zh + close_markers_en):
        return 'CLOSE'

    # FOLLOWUP — regular follow-up emails
    followup_markers_zh = ['来信想跟您简单跟进', '来信跟进一下', '再次来信跟进', '来信想和您简单跟进']
    followup_markers_en = ['just a regular follow up', 'just checking in', 'hope this email finds you well', 'consider this a regular follow up', 'just wanted to follow up']
    if any(m in body_lower for m in followup_markers_zh + followup_markers_en):
        return 'FOLLOWUP'

    # REPLY — subject starts with Re:/回复 (fallback for emails without body markers)
    if re.match(r'^(re:|回复|答复|fw:|fwd:)', subj):
        return 'REPLY'

    return 'INITIAL'

def fetch_body(msg_id, call_id_base):
    """Fetch full body for a message. Returns cleaned plaintext or empty string."""
    resp = mcp_call(call_id_base, "GetMessage", {"id": msg_id, "preferHtml": True})
    parsed = extract_single_message(resp)
    if parsed:
        body_obj = parsed.get('body', {})
        body_content = body_obj.get('content', '') if isinstance(body_obj, dict) else ''
        if body_content:
            return clean_html(body_content)
    return ''

# ═══════════════════════════════════════════
# Collect case IDs: from file (D365) or local directories
# ═══════════════════════════════════════════

case_ids = set()
case_ids_file = os.environ.get('MCP_CASE_IDS_FILE', '')

if case_ids_file and os.path.isfile(case_ids_file):
    # Priority: read from pre-generated file (e.g. D365 query output)
    with open(case_ids_file, 'r', encoding='utf-8') as f:
        for line in f:
            cid = line.strip()
            if cid and re.match(r'^\d{10,}$', cid):
                case_ids.add(cid)
    log(f'CASE IDS     | Loaded {len(case_ids)} from file: {case_ids_file}')
else:
    # Fallback: scan local directories
    for subdir in ['active', 'archived']:
        dirpath = os.path.join(cases_root, subdir)
        if os.path.isdir(dirpath):
            for name in os.listdir(dirpath):
                full = os.path.join(dirpath, name)
                if os.path.isdir(full) and re.match(r'^\d{10,}$', name):
                    case_ids.add(name)
    log(f'CASE IDS     | Scanned {len(case_ids)} from local dirs: {cases_root}')

log(f'PHASE 1 START | {len(case_ids)} cases found: {sorted(case_ids)}')

# ═══════════════════════════════════════════
# Phase 1: Per-case email collection
# ═══════════════════════════════════════════

all_msg_ids = set()  # Track globally for dedup in phase 2
case_sent_emails = []  # (case_id, msg_dict, body_text) for analysis-input
cases_processed = 0

for case_id in sorted(case_ids):
    log(f'PHASE 1 CASE | Searching {case_id}')

    # Search by case number
    resp = mcp_call(100 + cases_processed, "SearchMessagesQueryParameters", {
        "queryParameters": f'?$search="{case_id}"&$top=30'
    })
    msgs = extract_messages(resp)

    if not msgs:
        log(f'PHASE 1 CASE | {case_id}: 0 emails found')
        cases_processed += 1
        continue

    # Dedup
    seen = set()
    unique = []
    for msg in msgs:
        key = f"{msg.get('subject','')}|{msg.get('sentDateTime','')}"
        if key not in seen:
            seen.add(key)
            unique.append(msg)

    # Filter auto-replies
    auto_patterns = ['自动回复', '自动答复', 'Automatic reply', 'Out of Office', 'AutoReply']
    filtered = [m for m in unique if not any(p in (m.get('subject','') or '') for p in auto_patterns)]

    # Sort by receivedDateTime asc
    filtered.sort(key=lambda m: m.get('receivedDateTime', ''))

    # Track all message IDs
    for m in filtered:
        mid = m.get('id', '')
        if mid:
            all_msg_ids.add(mid)

    # Identify engineer's sent emails and fetch their bodies
    sent_in_case = []
    call_id = 200 + cases_processed * 50
    for msg in filtered:
        if is_engineer_sent(msg):
            # Check if body already in search results
            body_obj = msg.get('body', {})
            body_content = body_obj.get('content', '') if isinstance(body_obj, dict) else ''
            if body_content and len(body_content) > 200:
                body_text = clean_html(body_content)
            else:
                # Fetch full body
                msg_id = msg.get('id', '')
                if msg_id:
                    body_text = fetch_body(msg_id, call_id)
                    call_id += 1
                else:
                    body_text = msg.get('bodyPreview', '') or ''

            if body_text:
                sent_in_case.append((msg, body_text))
                case_sent_emails.append((case_id, msg, body_text))

    # Generate {caseid}-email.md
    ts = time.strftime('%Y-%m-%d %H:%M:%S')
    lines = [
        f'# Case {case_id} — Emails',
        f'> Generated: {ts} | Total: {len(filtered)} emails | Sent by engineer: {len(sent_in_case)}',
        '',
        '## Timeline',
        '',
        '| # | Time | Dir | From | Subject |',
        '|---|------|-----|------|---------|',
    ]

    for i, msg in enumerate(filtered):
        dt = msg.get('receivedDateTime', '')[:19].replace('T', ' ')
        direction = 'SENT' if is_engineer_sent(msg) else 'RECV'
        icon = '\U0001f4e4' if direction == 'SENT' else '\U0001f4e5'
        fname = get_from_name(msg).split()[0] if get_from_name(msg) else get_from_addr(msg).split('@')[0]
        subj = (msg.get('subject', '') or '')[:60]
        lines.append(f'| {i+1} | {dt} | {icon} {direction} | {fname} | {subj} |')

    lines.append('')
    lines.append('---')

    # Include bodies of engineer's sent emails
    for msg, body_text in sent_in_case:
        dt = msg.get('receivedDateTime', '')[:19].replace('T', ' ')
        subj = msg.get('subject', '') or '(no subject)'
        category = classify_email(msg, body_text)
        lines.extend([
            '',
            f'## [{category}] SENT | {dt}',
            f'**Subject:** {subj}',
            '',
            body_text,
            '',
            '---',
        ])

    md_path = os.path.join(output_dir, f'{case_id}-email.md')
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    log(f'PHASE 1 CASE | {case_id}: {len(filtered)} emails, {len(sent_in_case)} sent → {case_id}-email.md')
    cases_processed += 1

log(f'PHASE 1 OK   | {cases_processed} cases processed, {len(case_sent_emails)} sent emails collected')

# ═══════════════════════════════════════════
# Phase 2: Search by sender for broader coverage
# ═══════════════════════════════════════════

log(f'PHASE 2 START | Searching sent emails from {engineer_email}, top={top}')

# Use $search for sent emails
resp = mcp_call(500, "SearchMessagesQueryParameters", {
    "queryParameters": f'?$search="from:{engineer_email}"&$top={top}'
})
sent_msgs = extract_messages(resp)

# Filter to only truly sent by engineer
sent_msgs = [m for m in sent_msgs if is_engineer_sent(m)]

# Dedup against phase 1
new_msgs = []
seen_keys = set()
for msg in sent_msgs:
    mid = msg.get('id', '')
    key = f"{msg.get('subject','')}|{msg.get('sentDateTime','')}"
    if mid and mid in all_msg_ids:
        continue  # Already collected in phase 1
    if key in seen_keys:
        continue
    seen_keys.add(key)
    new_msgs.append(msg)

# Filter auto-replies
auto_patterns = ['自动回复', '自动答复', 'Automatic reply', 'Out of Office', 'AutoReply']
new_msgs = [m for m in new_msgs if not any(p in (m.get('subject','') or '') for p in auto_patterns)]

log(f'PHASE 2 SEARCH | Found {len(sent_msgs)} total, {len(new_msgs)} new (after dedup)')

# Fetch bodies for new sent emails (limit to avoid excessive API calls)
MAX_FETCH = 50
misc_emails = []
call_id = 600
for msg in new_msgs[:MAX_FETCH]:
    msg_id = msg.get('id', '')
    body_obj = msg.get('body', {})
    body_content = body_obj.get('content', '') if isinstance(body_obj, dict) else ''
    if body_content and len(body_content) > 200:
        body_text = clean_html(body_content)
    else:
        if msg_id:
            body_text = fetch_body(msg_id, call_id)
            call_id += 1
        else:
            body_text = msg.get('bodyPreview', '') or ''

    if body_text and len(body_text) > 50:
        misc_emails.append((msg, body_text))

# Generate misc-sent-emails.md
if misc_emails:
    ts = time.strftime('%Y-%m-%d %H:%M:%S')
    lines = [
        f'# Misc Sent Emails — {engineer_email}',
        f'> Generated: {ts} | Total: {len(misc_emails)} emails',
        '',
        '---',
    ]
    for msg, body_text in misc_emails:
        dt = msg.get('receivedDateTime', '')[:19].replace('T', ' ')
        subj = msg.get('subject', '') or '(no subject)'
        category = classify_email(msg, body_text)
        lines.extend([
            '',
            f'## [{category}] | {dt}',
            f'**Subject:** {subj}',
            '',
            body_text,
            '',
            '---',
        ])

    misc_path = os.path.join(output_dir, 'misc-sent-emails.md')
    with open(misc_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    log(f'PHASE 2 OK   | {len(misc_emails)} misc emails → misc-sent-emails.md')
else:
    log('PHASE 2 OK   | No additional misc emails')

# ═══════════════════════════════════════════
# Phase 3: Generate consolidated analysis-input.md
# ═══════════════════════════════════════════

log('PHASE 3 START | Generating analysis-input.md')

# Combine all sent emails: case-linked + misc
all_sent = []

for case_id, msg, body_text in case_sent_emails:
    category = classify_email(msg, body_text)
    dt = msg.get('receivedDateTime', '')[:19].replace('T', ' ')
    subj = msg.get('subject', '') or '(no subject)'
    all_sent.append({
        'source': f'case:{case_id}',
        'category': category,
        'datetime': dt,
        'subject': subj,
        'body': body_text,
        'lang': 'zh' if any('\u4e00' <= c <= '\u9fff' for c in body_text[:200]) else 'en'
    })

for msg, body_text in misc_emails:
    category = classify_email(msg, body_text)
    dt = msg.get('receivedDateTime', '')[:19].replace('T', ' ')
    subj = msg.get('subject', '') or '(no subject)'
    all_sent.append({
        'source': 'misc',
        'category': category,
        'datetime': dt,
        'subject': subj,
        'body': body_text,
        'lang': 'zh' if any('\u4e00' <= c <= '\u9fff' for c in body_text[:200]) else 'en'
    })

# Sort by datetime
all_sent.sort(key=lambda e: e['datetime'])

# Statistics
stats = {
    'total': len(all_sent),
    'en': sum(1 for e in all_sent if e['lang'] == 'en'),
    'zh': sum(1 for e in all_sent if e['lang'] == 'zh'),
    'categories': {}
}
for e in all_sent:
    cat = e['category']
    stats['categories'][cat] = stats['categories'].get(cat, 0) + 1

ts = time.strftime('%Y-%m-%d %H:%M:%S')
lines = [
    f'# Analysis Input — Engineer Email Style Distillation',
    f'> Generated: {ts}',
    f'> Engineer: {engineer_email}',
    f'> Total sent emails: {stats["total"]} (EN: {stats["en"]}, ZH: {stats["zh"]})',
    f'> Categories: {json.dumps(stats["categories"])}',
    f'> Cases analyzed: {cases_processed}',
    '',
    '---',
    '',
    '> **Instructions for LLM analysis**: Read ALL emails below. Extract patterns for:',
    '> greetings, sign-offs, reply structure, troubleshooting format, meeting summary,',
    '> IR format, case closure format, tone, vocabulary, sentence style.',
    '> Categorize patterns by language (EN vs ZH) and email type.',
    '',
    '---',
]

for i, email in enumerate(all_sent):
    lines.extend([
        '',
        f'## Email #{i+1} [{email["category"]}] [{email["lang"].upper()}]',
        f'**Source:** {email["source"]} | **Date:** {email["datetime"]}',
        f'**Subject:** {email["subject"]}',
        '',
        email['body'],
        '',
        '---',
    ])

analysis_path = os.path.join(output_dir, 'analysis-input.md')
with open(analysis_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

# Also write a stats JSON for quick reference
stats_path = os.path.join(output_dir, 'collection-stats.json')
with open(stats_path, 'w', encoding='utf-8') as f:
    json.dump({
        '_generatedAt': ts,
        'engineer': engineer_email,
        'casesProcessed': cases_processed,
        'totalSentEmails': stats['total'],
        'byLanguage': {'en': stats['en'], 'zh': stats['zh']},
        'byCategory': stats['categories'],
        'files': {
            'perCase': [f'{cid}-email.md' for cid in sorted(case_ids)],
            'misc': 'misc-sent-emails.md' if misc_emails else None,
            'analysisInput': 'analysis-input.md'
        }
    }, f, indent=2, ensure_ascii=False)

elapsed = int(time.time()) - t0
log(f'PHASE 3 OK   | analysis-input.md ({len(all_sent)} emails, {stats["en"]} EN / {stats["zh"]} ZH)')
log(f'MIMIC COLLECT DONE | elapsed={elapsed}s')

print(f'MIMIC_OK|cases={cases_processed}|sent={len(all_sent)}|en={stats["en"]}|zh={stats["zh"]}|elapsed={elapsed}s')
PYEOF
