#!/usr/bin/env python3
"""
Agent-C: Workflow Extractor for Intune product guides.
Reads draft files and Kusto query files, extracts troubleshooting workflows.
Writes to guides/workflows/{topic-slug}.md
"""

import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime

BASE = Path(os.path.dirname(os.path.abspath(__file__))).parent  # .claude/skills/products/intune
DRAFTS_DIR = BASE / "guides" / "drafts"
KUSTO_DIR = Path(os.path.dirname(os.path.abspath(__file__))).parent.parent.parent / "kusto" / "intune" / "references" / "queries"
WORKFLOWS_DIR = BASE / "guides" / "workflows"
TOPIC_PLAN = Path(os.path.abspath(__file__)).parent / "topic-plan.json"

WORKFLOWS_DIR.mkdir(parents=True, exist_ok=True)

DATE_STR = "2026-04-07"

def read_file_safe(path):
    """Read file, return content or empty string."""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"  [WARN] Cannot read {path}: {e}", file=sys.stderr)
        return ""

def strip_frontmatter(content):
    """Remove YAML frontmatter if present."""
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            return parts[2].strip()
    return content

def extract_kql_blocks(content, source_file):
    """Extract all KQL code blocks with context (heading from nearest ## or ###)."""
    blocks = []
    lines = content.split('\n')

    # Build heading map: line_number -> heading text
    # Track both h2 and h3, preferring h2 when h3 is generic
    headings = {}
    last_h2 = ""
    last_h3 = ""
    last_heading = ""
    for i, line in enumerate(lines):
        hm2 = re.match(r'^##\s+(.+)', line)
        hm3 = re.match(r'^###\s+(.+)', line)
        hm4 = re.match(r'^####\s+(.+)', line)
        if hm2:
            last_h2 = hm2.group(1).strip()
            last_h3 = ""
            last_heading = last_h2
        elif hm3:
            last_h3 = hm3.group(1).strip()
            # If h3 is generic ("查询语句", "查询"), keep h2 as heading
            generic_h3 = ['查询语句', '查询', 'query', 'kql']
            if last_h3.lower().strip() in generic_h3:
                last_heading = last_h2 if last_h2 else last_h3
            else:
                last_heading = last_h3
        elif hm4:
            last_heading = hm4.group(1).strip()
        headings[i] = last_heading

    # Find kql blocks by position
    in_kql = False
    kql_start = -1
    kql_lines_buf = []
    for i, line in enumerate(lines):
        if line.strip() == '```kql':
            in_kql = True
            kql_start = i
            kql_lines_buf = []
        elif in_kql and line.strip() == '```':
            in_kql = False
            kql_text = '\n'.join(kql_lines_buf).strip()
            if kql_text:
                heading = headings.get(kql_start, "")
                blocks.append({
                    'heading': heading,
                    'kql': kql_text,
                    'source': source_file
                })
        elif in_kql:
            kql_lines_buf.append(line)

    # Also catch ```kusto blocks
    in_kusto = False
    for i, line in enumerate(lines):
        if line.strip() == '```kusto':
            in_kusto = True
            kql_start = i
            kql_lines_buf = []
        elif in_kusto and line.strip() == '```':
            in_kusto = False
            kql_text = '\n'.join(kql_lines_buf).strip()
            if kql_text:
                heading = headings.get(kql_start, "")
                blocks.append({
                    'heading': heading,
                    'kql': kql_text,
                    'source': source_file
                })
        elif in_kusto:
            kql_lines_buf.append(line)

    return blocks

def extract_portal_paths(content):
    """Extract portal navigation paths."""
    paths = []
    # Pattern: "Portal > X > Y > Z" or "Intune portal > X" or "Navigate to X > Y"
    for m in re.finditer(r'(?:Portal|Intune|MEM|Endpoint Manager|intune\.microsoftonline\.cn|endpoint\.microsoft\.com)\s*(?:portal\s*)?(?:>[\s]*[A-Za-z0-9 _\-/()]+){2,}', content):
        path = m.group(0).strip()
        if len(path) > 20 and '<' not in path and 'IntuneDeviceID' not in path:
            paths.append(path)
    # Also match numbered steps with portal navigation
    for m in re.finditer(r'\d+\.\s+(?:Go to|Navigate to|Open|In)\s+([^\n]*(?:>[\s]*[A-Za-z0-9 _\-/()]+){2,})', content, re.IGNORECASE):
        path = m.group(0).strip()
        if len(path) > 20 and '<' not in path:
            paths.append(path)
    return list(set(paths))

def extract_scenarios(content, source_file):
    """Extract troubleshooting scenarios from content."""
    scenarios = []
    lines = content.split('\n')

    current_scenario = None
    current_steps = []
    current_section_level = 0

    for i, line in enumerate(lines):
        # Detect scenario headings (## or ### with troubleshooting-related keywords)
        heading_match = re.match(r'^(#{2,4})\s+(.+)', line)
        if heading_match:
            level = len(heading_match.group(1))
            title = heading_match.group(2).strip()

            # Check if this is a scenario-like heading
            scenario_keywords = [
                'scenario', 'issue', 'problem', 'error', 'fail', 'troubleshoot',
                'workflow', 'common', 'known', 'fix', 'resolution', 'workaround',
                'setup', 'configure', 'deploy', 'install', 'enroll', 'step',
                '排查', '故障', '问题', '场景', '步骤', '配置', '部署', '解决',
                'limitation', 'requirement', 'prerequisite'
            ]

            is_scenario = any(kw in title.lower() for kw in scenario_keywords) or level >= 3

            if is_scenario and level <= 3:
                # Save previous scenario
                if current_scenario and current_steps:
                    scenarios.append({
                        'title': current_scenario,
                        'steps': '\n'.join(current_steps),
                        'source': source_file
                    })
                current_scenario = title
                current_steps = []
                current_section_level = level
            elif current_scenario:
                current_steps.append(line)
        elif current_scenario:
            current_steps.append(line)

    # Save last scenario
    if current_scenario and current_steps:
        scenarios.append({
            'title': current_scenario,
            'steps': '\n'.join(current_steps),
            'source': source_file
        })

    return scenarios

def extract_tables(content):
    """Extract markdown tables."""
    tables = []
    in_table = False
    current_table = []
    table_title = ""

    for line in content.split('\n'):
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                in_table = True
                current_table = []
            current_table.append(line)
        else:
            if in_table and current_table:
                tables.append({
                    'title': table_title,
                    'content': '\n'.join(current_table)
                })
                in_table = False
                current_table = []
            # Track heading before table
            heading_match = re.match(r'^#{2,4}\s+(.+)', line)
            if heading_match:
                table_title = heading_match.group(1).strip()

    if in_table and current_table:
        tables.append({
            'title': table_title,
            'content': '\n'.join(current_table)
        })

    return tables

def detect_21v_relevance(content):
    """Detect if content is 21V/Mooncake specific."""
    indicators = ['21v', '21vianet', 'mooncake', 'china', '中国', 'chinacloud',
                  'microsoftonline.cn', 'chinanorth', 'chinaeast', '世纪互联']
    content_lower = content.lower()
    for ind in indicators:
        if ind in content_lower:
            return True
    return False

def detect_global_only(content):
    """Detect if content is Global-only (not applicable to 21V)."""
    patterns = [
        r'❌\s*No.*21v',
        r'not.*(?:support|available).*(?:21v|mooncake|china)',
        r'Global[\s-]*only',
        r'不支持.*21v',
    ]
    for p in patterns:
        if re.search(p, content, re.IGNORECASE):
            return True
    return False

def build_workflow_md(topic, draft_contents, kusto_contents, draft_names, kusto_names):
    """Build the workflow markdown for a topic."""

    all_scenarios = []
    all_kql = []
    all_portal_paths = []
    all_tables = []
    has_21v = False

    # Process drafts
    for fname, content in zip(draft_names, draft_contents):
        if not content.strip():
            continue
        clean = strip_frontmatter(content)
        scenarios = extract_scenarios(clean, fname)
        kql_blocks = extract_kql_blocks(clean, fname)
        portal_paths = extract_portal_paths(clean)
        tables = extract_tables(clean)

        if detect_21v_relevance(clean):
            has_21v = True

        all_scenarios.extend(scenarios)
        all_kql.extend(kql_blocks)
        all_portal_paths.extend(portal_paths)
        all_tables.extend(tables)

    # Process kusto files
    for fname, content in zip(kusto_names, kusto_contents):
        if not content.strip():
            continue
        clean = strip_frontmatter(content)
        kql_blocks = extract_kql_blocks(clean, fname)
        all_kql.extend(kql_blocks)

    # Deduplicate portal paths
    all_portal_paths = list(set(all_portal_paths))

    # Filter out empty/trivial scenarios
    meaningful_scenarios = []
    seen_titles = set()
    for s in all_scenarios:
        title_key = s['title'].lower().strip()
        if title_key in seen_titles:
            continue
        # Must have some content (at least 50 chars of steps)
        if len(s['steps'].strip()) < 50:
            continue
        seen_titles.add(title_key)
        meaningful_scenarios.append(s)

    # If no meaningful scenarios found but we have KQL or tables, create generic scenarios from content
    if not meaningful_scenarios and (all_kql or all_tables):
        # Build a single "General Troubleshooting" scenario from the drafts
        for fname, content in zip(draft_names, draft_contents):
            if not content.strip():
                continue
            clean = strip_frontmatter(content)
            # Extract numbered steps
            numbered_steps = re.findall(r'^\d+\.\s+.+$', clean, re.MULTILINE)
            if numbered_steps:
                meaningful_scenarios.append({
                    'title': f'通用排查流程',
                    'steps': '\n'.join(numbered_steps),
                    'source': fname
                })
                break

    if not meaningful_scenarios and not all_kql:
        return None  # Nothing extractable

    # Build markdown
    lines = []
    lines.append(f"# Intune {topic['title']} — 排查工作流\n")
    lines.append(f"**来源草稿**: {', '.join(draft_names) if draft_names else '(无)'}")
    lines.append(f"**Kusto 引用**: {', '.join(kusto_names) if kusto_names else '(无)'}")
    lines.append(f"**场景数**: {len(meaningful_scenarios)}")
    lines.append(f"**生成日期**: {DATE_STR}\n")
    lines.append("---\n")

    # Portal paths section (if any)
    if all_portal_paths:
        lines.append("## Portal 路径\n")
        for pp in all_portal_paths[:10]:  # Cap at 10
            lines.append(f"- `{pp}`")
        lines.append("")

    # Scenarios
    for idx, scenario in enumerate(meaningful_scenarios, 1):
        is_21v = detect_21v_relevance(scenario['steps'])
        is_global_only = detect_global_only(scenario['steps'])

        if is_global_only:
            applicability = "Mooncake ❌ (Global-only)"
        elif is_21v:
            applicability = "Mooncake ✅"
        else:
            applicability = "Mooncake ✅ / Global ✅"

        lines.append(f"## Scenario {idx}: {scenario['title']}")
        lines.append(f"> 来源: {scenario['source']} | 适用: {applicability}\n")
        lines.append("### 排查步骤\n")

        # Process steps content
        steps_content = scenario['steps'].strip()

        # Check for KQL blocks within the steps
        if '```kql' in steps_content:
            # Annotate KQL blocks with source
            steps_content = re.sub(
                r'```kql\n(.*?)```',
                lambda m: f"```kql\n{m.group(1)}```\n`[来源: {scenario['source']}]`",
                steps_content,
                flags=re.DOTALL
            )

        lines.append(steps_content)
        lines.append("")

    # KQL Reference Section (from kusto files, deduplicated)
    kusto_only_kql = [k for k in all_kql if k['source'] in kusto_names]
    if kusto_only_kql:
        if meaningful_scenarios or all_portal_paths:
            lines.append("---\n")
        lines.append("## Kusto 查询参考\n")
        seen_kql = set()
        kql_idx = 0
        for kql_block in kusto_only_kql:
            kql_key = kql_block['kql'][:100]  # Dedup by first 100 chars
            if kql_key in seen_kql:
                continue
            seen_kql.add(kql_key)
            kql_idx += 1
            heading = kql_block['heading']
            if not heading or heading == "查询":
                heading = f"查询 {kql_idx} ({kql_block['source']})"
            lines.append(f"### {heading}\n")
            lines.append(f"```kql\n{kql_block['kql']}\n```")
            lines.append(f"`[来源: {kql_block['source']}]`\n")

    # Draft-only KQL blocks not already in scenarios
    draft_kql = [k for k in all_kql if k['source'] not in kusto_names]
    scenario_kql_set = set()
    for s in meaningful_scenarios:
        for m in re.finditer(r'```kql\n(.*?)```', s['steps'], re.DOTALL):
            scenario_kql_set.add(m.group(1).strip()[:100])

    extra_draft_kql = [k for k in draft_kql if k['kql'][:100] not in scenario_kql_set]
    if extra_draft_kql:
        if not kusto_only_kql:
            if meaningful_scenarios or all_portal_paths:
                lines.append("---\n")
            lines.append("## Kusto 查询参考\n")
        seen_kql2 = set()
        kql_idx2 = 0
        for kql_block in extra_draft_kql:
            kql_key = kql_block['kql'][:100]
            if kql_key in seen_kql2:
                continue
            seen_kql2.add(kql_key)
            kql_idx2 += 1
            heading = kql_block['heading']
            if not heading or heading == "补充查询":
                heading = f"补充查询 {kql_idx2} ({kql_block['source']})"
            lines.append(f"### {heading}\n")
            lines.append(f"```kql\n{kql_block['kql']}\n```")
            lines.append(f"`[来源: {kql_block['source']}]`\n")

    # Decision tables from drafts
    decision_tables = [t for t in all_tables if any(kw in t['title'].lower() for kw in
        ['workaround', 'result', 'error', 'status', 'feature', 'event', 'range',
         '结果', '判断', '状态', '错误', 'comparison', 'availability', 'action'])]

    if decision_tables:
        lines.append("---\n")
        lines.append("## 判断逻辑参考\n")
        for t in decision_tables[:5]:  # Cap at 5
            lines.append(f"### {t['title']}\n")
            lines.append(t['content'])
            lines.append("")

    # 21V annotation
    if has_21v:
        lines.append("---\n")
        lines.append("> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。\n")

    return '\n'.join(lines)


def main():
    with open(TOPIC_PLAN, 'r', encoding='utf-8') as f:
        data = json.load(f)

    fusion_topics = [t for t in data['topics'] if t.get('hasFusionGuide')]

    print(f"[Agent-C] Processing {len(fusion_topics)} fusion topics...")

    results = {
        'total': len(fusion_topics),
        'with_workflows': 0,
        'skipped': 0,
        'skipped_list': [],
        'written_files': []
    }

    for topic in fusion_topics:
        slug = topic['slug']
        title = topic['title']
        draft_paths = topic.get('draftPaths', [])
        kusto_files = topic.get('kustoQueryFiles', [])

        print(f"\n[Agent-C] === {slug} ({title}) ===")
        print(f"  Drafts: {len(draft_paths)}, Kusto: {len(kusto_files)}")

        # Read draft files
        draft_contents = []
        draft_names = []
        for dp in draft_paths:
            full_path = BASE / dp
            content = read_file_safe(full_path)
            if content:
                draft_contents.append(content)
                draft_names.append(os.path.basename(dp))

        # Read kusto files
        kusto_contents = []
        kusto_names = []
        for kf in kusto_files:
            full_path = KUSTO_DIR / kf
            content = read_file_safe(full_path)
            if content:
                kusto_contents.append(content)
                kusto_names.append(kf)

        print(f"  Read: {len(draft_contents)} drafts, {len(kusto_contents)} kusto files")

        if not draft_contents and not kusto_contents:
            reason = "no readable source files"
            print(f"[Agent-C] SKIP {slug} | reason: {reason}")
            results['skipped'] += 1
            results['skipped_list'].append({'slug': slug, 'reason': reason})
            continue

        # Build workflow
        workflow_md = build_workflow_md(topic, draft_contents, kusto_contents, draft_names, kusto_names)

        if workflow_md is None:
            reason = "no extractable workflow content (no scenarios or KQL)"
            print(f"[Agent-C] SKIP {slug} | reason: {reason}")
            results['skipped'] += 1
            results['skipped_list'].append({'slug': slug, 'reason': reason})
            continue

        # Write workflow file
        out_path = WORKFLOWS_DIR / f"{slug}.md"
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(workflow_md)

        print(f"  Written: {out_path.name} ({len(workflow_md)} bytes)")
        results['with_workflows'] += 1
        results['written_files'].append(slug)

    # Summary
    print(f"\n{'='*60}")
    print(f"[Agent-C] SUMMARY")
    print(f"  Total fusion topics: {results['total']}")
    print(f"  With workflows: {results['with_workflows']}")
    print(f"  Skipped: {results['skipped']}")
    if results['skipped_list']:
        print(f"\n  Skipped details:")
        for s in results['skipped_list']:
            print(f"    - {s['slug']}: {s['reason']}")
    print(f"\n  Written files:")
    for f in results['written_files']:
        print(f"    - {f}.md")

    return results

if __name__ == '__main__':
    main()
