#!/usr/bin/env python3
"""
AVD Workflow Extractor - Agent-C
Reads topic-plan.json, draft files, and KQL query files.
Extracts troubleshooting workflows and writes to guides/workflows/{topic-slug}.md
"""

import json
import os
import re
import sys
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
AVD_DIR = os.path.join(BASE_DIR, 'skills', 'products', 'avd')
DRAFT_DIR = os.path.join(AVD_DIR, 'guides', 'drafts')
KQL_DIR = os.path.join(BASE_DIR, 'skills', 'kusto', 'avd', 'references', 'queries')
WORKFLOW_DIR = os.path.join(AVD_DIR, 'guides', 'workflows')
TOPIC_PLAN = os.path.join(AVD_DIR, '.enrich', 'topic-plan.json')

os.makedirs(WORKFLOW_DIR, exist_ok=True)


def read_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return None


def strip_frontmatter(content):
    if content.startswith('---'):
        end = content.find('---', 3)
        if end != -1:
            return content[end + 3:].strip()
    return content.strip()


def extract_kql_blocks(content):
    blocks = []
    for m in re.finditer(r'```(?:kql|kusto|KQL|Kusto)\s*\n(.*?)```', content, re.DOTALL):
        kql = m.group(1).strip()
        if len(kql) > 20:
            blocks.append(kql)
    return blocks


def extract_scenarios(content, source_file):
    scenarios = []
    clean = strip_frontmatter(content)
    sections = re.split(r'\n(?=#{1,3}\s)', clean)

    for section in sections:
        lines = section.strip().split('\n')
        if not lines:
            continue
        heading = lines[0].strip().lstrip('#').strip()
        body = '\n'.join(lines[1:]).strip()

        scenario_keywords = [
            'troubleshoot', 'scenario', 'step', 'decision', 'workflow',
            'action plan', 'root cause', 'common error', 'common reason',
            'identify', 'diagnose', 'mitigation', 'resolution',
            'option', 'verify', 'confirm', 'check', 'collect',
            'failure', 'failed', 'error', 'issue',
            'kusto', 'kql', 'query', 'log',
            'setup', 'install', 'configure', 'enable',
            'overview', 'flow', 'process', 'state',
            'escalation', 'contact', 'collaborate',
        ]
        heading_lower = heading.lower()
        is_scenario = any(kw in heading_lower for kw in scenario_keywords)
        has_steps = bool(re.search(r'^\s*\d+\.', body, re.MULTILINE))
        has_kql = bool(re.search(r'```(?:kql|kusto)', body, re.IGNORECASE))
        has_decision = bool(re.search(r'[→\->]|decision tree', body, re.IGNORECASE))
        has_table = bool(re.search(r'^\|.*\|.*\|', body, re.MULTILINE))

        if is_scenario or has_kql or has_decision or (has_steps and len(body) > 80):
            scenarios.append({
                'title': heading,
                'body': body,
                'source': source_file,
                'has_kql': has_kql,
                'has_steps': has_steps,
                'has_decision': has_decision,
            })

    return scenarios


def detect_21v_relevance(content):
    content_lower = content.lower()
    mooncake_indicators = ['mooncake', '21vianet', '21v', 'chinaeast', 'chinanorth',
                           'chinacloudapi', '.cn/', 'azure china']
    global_only_indicators = ['global only', 'not supported in mooncake', 'not available in china',
                              'gcc', 'gcch', 'government']

    has_mooncake = any(ind in content_lower for ind in mooncake_indicators)
    has_global_only = any(ind in content_lower for ind in global_only_indicators)

    if has_global_only:
        return "Global-only \\u274c"
    elif has_mooncake:
        return "Mooncake \\u2705"
    else:
        return "\\u901a\\u7528 \\u2705"


def build_workflow_for_topic(topic, draft_cache, kql_cache):
    slug = topic['slug']
    title = topic['title']
    draft_paths = topic.get('draftPaths', [])
    kql_files = topic.get('kustoQueryFiles', [])

    all_scenarios = []
    draft_names_used = []

    for dp in draft_paths:
        content = draft_cache.get(dp)
        if not content:
            continue
        filename = os.path.basename(dp)
        draft_names_used.append(filename)
        scenarios = extract_scenarios(content, filename)
        all_scenarios.extend(scenarios)

    kql_refs = []
    kql_names_used = []
    for kf in kql_files:
        content = kql_cache.get(kf)
        if not content:
            continue
        kql_names_used.append(kf)
        clean = strip_frontmatter(content)
        blocks = extract_kql_blocks(clean)
        for block in blocks:
            kql_refs.append({'query': block, 'source': kf})

    # Filter scenarios
    meaningful = []
    seen_titles = set()
    for s in all_scenarios:
        title_key = s['title'].lower().strip()
        if title_key in seen_titles:
            continue
        seen_titles.add(title_key)
        if len(s['body']) < 50:
            continue
        if s['body'].count('http') > 3 and len(s['body']) < 200:
            continue
        meaningful.append(s)

    if not meaningful and not kql_refs:
        return None

    lines = []
    # Avoid "AVD AVD ..." duplication in title
    display_title = title if not title.startswith('AVD ') else title
    if title.startswith('AVD '):
        lines.append(f"# {title} \u2014 \u6392\u67e5\u5de5\u4f5c\u6d41\n")
    else:
        lines.append(f"# AVD {title} \u2014 \u6392\u67e5\u5de5\u4f5c\u6d41\n")
    lines.append(f"**\u6765\u6e90\u8349\u7a3f**: {', '.join(draft_names_used)}")
    if kql_names_used:
        lines.append(f"**Kusto \u5f15\u7528**: {', '.join(kql_names_used)}")
    else:
        lines.append(f"**Kusto \u5f15\u7528**: (\u65e0)")
    lines.append(f"**\u573a\u666f\u6570**: {len(meaningful)}")
    lines.append(f"**\u751f\u6210\u65e5\u671f**: 2026-04-07")
    lines.append(f"\n---\n")

    for i, s in enumerate(meaningful, 1):
        mooncake = detect_21v_relevance(s['body'])
        lines.append(f"## Scenario {i}: {s['title']}")
        lines.append(f"> \u6765\u6e90: {s['source']} | \u9002\u7528: {mooncake}\n")
        lines.append("### \u6392\u67e5\u6b65\u9aa4")

        body_lines = s['body'].split('\n')
        in_code_block = False
        code_lang = ''
        code_content = []

        for bl in body_lines:
            stripped = bl.strip()

            if stripped.startswith('```'):
                if in_code_block:
                    in_code_block = False
                    code_text = '\n'.join(code_content)
                    if code_lang.lower() in ('kql', 'kusto') and len(code_text) > 20:
                        lines.append(f"```kql\n{code_text}\n```")
                        lines.append(f"`[\u6765\u6e90: {s['source']}]`")
                    elif code_lang.lower() in ('powershell', 'ps1') and len(code_text) > 15:
                        lines.append(f"```powershell\n{code_text}\n```")
                    elif len(code_text) > 10:
                        lang = code_lang if code_lang else ''
                        lines.append(f"```{lang}\n{code_text}\n```")
                    code_content = []
                    code_lang = ''
                else:
                    in_code_block = True
                    code_lang = stripped[3:].strip()
                    code_content = []
                continue

            if in_code_block:
                code_content.append(bl)
                continue

            step_match = re.match(r'^(\d+)\.\s+(.*)', stripped)
            if step_match:
                lines.append(f"{step_match.group(1)}. {step_match.group(2)}")
                continue

            if stripped.startswith('- ') or stripped.startswith('* '):
                lines.append(f"   {stripped}")
                continue

            if stripped.startswith('#'):
                level = len(stripped) - len(stripped.lstrip('#'))
                text = stripped.lstrip('#').strip()
                lines.append(f"\n{'#' * min(level + 2, 5)} {text}")
                continue

            if '|' in stripped and stripped.startswith('|'):
                lines.append(stripped)
                continue

            if stripped:
                lines.append(stripped)

        lines.append("")

    if kql_refs:
        lines.append("---\n")
        lines.append("## \u5173\u8054 Kusto \u67e5\u8be2\u53c2\u8003\n")
        seen_kql = set()
        for ref in kql_refs:
            # Deduplicate
            qkey = ref['query'][:100]
            if qkey in seen_kql:
                continue
            seen_kql.add(qkey)
            query_lines = ref['query'].split('\n')
            if len(query_lines) > 30:
                query_text = '\n'.join(query_lines[:30]) + '\n// ... (see full query in source)'
            else:
                query_text = ref['query']
            lines.append(f"```kql\n{query_text}\n```")
            lines.append(f"`[\u6765\u6e90: {ref['source']}]`\n")

    return '\n'.join(lines)


# ---- Main ----
with open(TOPIC_PLAN, 'r', encoding='utf-8') as f:
    plan = json.load(f)
fusion_topics = [t for t in plan['topics'] if t.get('hasFusionGuide')]

# Cache files
all_draft_paths = set()
all_kql_paths = set()
for t in fusion_topics:
    for d in t.get('draftPaths', []):
        all_draft_paths.add(d)
    for k in t.get('kustoQueryFiles', []):
        all_kql_paths.add(k)

draft_cache = {}
for dp in all_draft_paths:
    content = read_file(os.path.join(AVD_DIR, dp))
    if content:
        draft_cache[dp] = content

kql_cache = {}
for kp in all_kql_paths:
    content = read_file(os.path.join(KQL_DIR, kp))
    if content:
        kql_cache[kp] = content

print(f"Loaded {len(draft_cache)} drafts, {len(kql_cache)} KQL files", file=sys.stderr)

results = {
    'total': len(fusion_topics),
    'with_workflow': 0,
    'skipped': 0,
    'topics': []
}

for topic in fusion_topics:
    slug = topic['slug']
    title = topic['title']

    workflow_md = build_workflow_for_topic(topic, draft_cache, kql_cache)

    if workflow_md:
        output_path = os.path.join(WORKFLOW_DIR, f"{slug}.md")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(workflow_md)

        scenario_count = workflow_md.count('\n## Scenario ')
        results['with_workflow'] += 1
        results['topics'].append({
            'slug': slug,
            'title': title,
            'scenarios': scenario_count,
            'status': 'written'
        })
        print(f"  OK {slug}: {scenario_count} scenarios", file=sys.stderr)
    else:
        results['skipped'] += 1
        results['topics'].append({
            'slug': slug,
            'title': title,
            'scenarios': 0,
            'status': 'skipped'
        })
        print(f"  SKIP {slug}: no extractable workflow", file=sys.stderr)

print("\n" + "=" * 60, file=sys.stderr)
print(f"SUMMARY", file=sys.stderr)
print(f"  Total topics (hasFusionGuide): {results['total']}", file=sys.stderr)
print(f"  With workflows written:        {results['with_workflow']}", file=sys.stderr)
print(f"  Skipped (no workflow):          {results['skipped']}", file=sys.stderr)
print("=" * 60, file=sys.stderr)

print(json.dumps(results, ensure_ascii=False, indent=2))
