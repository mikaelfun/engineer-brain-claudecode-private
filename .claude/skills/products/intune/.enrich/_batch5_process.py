import json, subprocess, re, sys, os
from datetime import datetime

ENRICH = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(ENRICH, "../../../../.."))
with open(os.path.join(PROJECT_ROOT, "config.json")) as _f:
    _cfg = json.load(_f)

BATCH_FILE = os.path.join(ENRICH, '_batch_5.json')
OUT_JSONL = os.path.join(ENRICH, 'known-issues-contentidea-kb-batch5.jsonl')
OUT_SCANNED = os.path.join(ENRICH, 'scanned-contentidea-kb-batch5.json')
ORG = 'https://dev.azure.com/ContentIdea'
FIELDS = ','.join([
    'System.Id','System.Title',
    'ECO.CI.CI.HelpArticleSummarySymptom',
    'ECO.CI.CI.HelpArticleCause',
    'ECO.CI.CI.HelpArticleResolution',
    'ECO.CI.CI.HelpArticleMoreInfo',
    'ECO.CI.KBArticleNumbers',
])

def strip_html(h):
    if not h: return ''
    s = re.sub(r'<br\s*/?>', chr(10), str(h), flags=re.I)
    s = re.sub(r'</p>', chr(10), s, flags=re.I)
    s = re.sub(r'</div>', chr(10), s, flags=re.I)
    s = re.sub(r'</li>', chr(10), s, flags=re.I)
    s = re.sub(r'<[^>]+>', '', s)
    s = re.sub(r'&nbsp;', ' ', s)
    s = re.sub(r'&amp;', '&', s)
    s = re.sub(r'&lt;', '<', s)
    s = re.sub(r'&gt;', '>', s)
    s = re.sub(r'&quot;', chr(34), s)
    s = re.sub(r'&#\d+;', '', s)
    s = re.sub(chr(10)+'{3,}', chr(10)+chr(10), s)
    return s.strip()

def get_env():
    env = os.environ.copy()
    env['AZURE_CONFIG_DIR'] = os.path.join(_cfg['azProfilesRoot'], _cfg['azProfile']['global'])
    return env

def get_token(env):
    p = subprocess.run(['az.cmd','account','get-access-token','--resource','499b84ac-1321-427f-aa17-267ca6975798','--query','accessToken','-o','tsv'], capture_output=True, text=True, env=env, timeout=30)
    return p.stdout.strip()

def fetch_chunk(ids_list, token):
    ids_str = ','.join(ids_list)
    url = ORG + '/ContentIdea/_apis/wit/workitems?ids=' + ids_str + '&fields=' + FIELDS + '&api-version=7.0'
    p = subprocess.run(['curl','-s','-H','Authorization: Bearer '+token, url], capture_output=True, text=True)
    raw = p.stdout
    if not raw or 'Object moved' in raw or raw.startswith('<html'):
        return None
    try:
        data = json.loads(raw)
    except:
        return None
    return data.get('value', [])

def main():
    with open(BATCH_FILE) as f:
        all_ids = json.load(f)
    print('Total IDs: ' + str(len(all_ids)))

    env = get_env()
    token = get_token(env)
    if not token:
        print('ERROR: no token')
        sys.exit(1)

    all_items = []
    chunks = [all_ids[i:i+200] for i in range(0, len(all_ids), 200)]
    print('Chunks: ' + str(len(chunks)))

    for ci, chunk in enumerate(chunks):
        items = fetch_chunk(chunk, token)
        if items is None:
            print('  Chunk ' + str(ci+1) + ': FAILED')
            continue
        id_map = {}
        for it in items:
            fld = it.get('fields',{})
            wid = str(fld.get('System.Id',''))
            id_map[wid] = fld
        for wid in chunk:
            if wid in id_map:
                all_items.append((wid, id_map[wid]))
        print('  Chunk ' + str(ci+1) + ': ' + str(len(id_map)) + '/' + str(len(chunk)))

    discovered = 0
    skipped = 0
    scanned = []
    seq = 0

    with open(OUT_JSONL, 'w', encoding='utf-8') as fout:
        for wid, fld in all_items:
            scanned.append(wid)
            sym_raw = fld.get('ECO.CI.CI.HelpArticleSummarySymptom','') or ''
            title = fld.get('System.Title','') or ''
            sym = strip_html(sym_raw)
            if not sym.strip() and not title.strip():
                skipped += 1
                continue
            seq += 1
            wi_id = str(fld.get('System.Id',''))
            cause = strip_html(fld.get('ECO.CI.CI.HelpArticleCause','') or '')
            res = strip_html(fld.get('ECO.CI.CI.HelpArticleResolution','') or '')
            mi = fld.get('ECO.CI.CI.HelpArticleMoreInfo','') or ''
            kb = fld.get('ECO.CI.KBArticleNumbers','') or ''
            if not sym.strip(): sym = title
            if not res.strip() and mi: res = strip_html(mi)
            kb_url = ('https://support.microsoft.com/kb/' + kb.strip()) if kb else ''
            entry = {
                'id': 'intune-contentidea-kb-b5-' + str(seq).zfill(3),
                'date': '2026-04-17',
                'symptom': sym,
                'rootCause': cause,
                'solution': res,
                'source': 'contentidea-kb',
                'sourceRef': 'ContentIdea#' + wi_id,
                'sourceUrl': kb_url,
                'product': 'intune',
                'confidence': 'medium',
                'quality': 'raw',
                'tags': ['contentidea-kb'],
                '21vApplicable': True,
                'promoted': False
            }
            fout.write(json.dumps(entry, ensure_ascii=False) + chr(10))
            discovered += 1

    with open(OUT_SCANNED, 'w', encoding='utf-8') as f:
        json.dump({'scanned': scanned, 'lastRefreshed': datetime.now().astimezone().isoformat()}, f, ensure_ascii=False)

    print('')
    print('=== RESULTS ===')
    print('discovered: ' + str(discovered))
    print('skipped: ' + str(skipped))
    print('total_processed: ' + str(len(all_items)))
    print('total_in_batch: ' + str(len(all_ids)))

if __name__ == '__main__':
    main()
