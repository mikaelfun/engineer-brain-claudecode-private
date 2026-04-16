#!/usr/bin/env python3
"""Generate workflow files from draft contents for all defender topics."""

import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # skills/products/defender
OUT_DIR = os.path.join(BASE, 'guides/workflows')
os.makedirs(OUT_DIR, exist_ok=True)


def extract_scenarios(content, draft_name):
    """Extract workflow scenarios from draft content."""

    # Remove frontmatter
    content_clean = re.sub(r'^---\s*\n.*?\n---\s*\n', '', content, flags=re.DOTALL)
    # Remove wiki templates
    content_clean = re.sub(r':::template.*?:::', '', content_clean, flags=re.DOTALL)
    # Expand <details> tags
    content_clean = re.sub(r'<details[^>]*>', '', content_clean)
    content_clean = re.sub(r'</details>', '', content_clean)
    content_clean = re.sub(r'<summary[^>]*>(.*?)</summary>', lambda m: f'**{m.group(1)}**', content_clean)
    # Remove empty lines bloat
    content_clean = re.sub(r'\n{4,}', '\n\n', content_clean)

    # Extract title - prefer first H1, fallback to first H2, then draft name
    title_match = re.search(r'^#\s+(.+)$', content_clean, re.MULTILINE)
    if not title_match or title_match.group(1).strip() in ('', '[[_TOC_]]'):
        title_match = re.search(r'^##\s+(.+)$', content_clean, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else draft_name
    title = re.sub(r'\[([^\]]+)\]\([^)]+\)', lambda m: m.group(1), title)
    title = re.sub(r'\*\*', '', title)
    title = re.sub(r'^\[TSG\]\s*', '', title)
    title = re.sub(r'^\[\[_TOC_\]\]\s*', '', title)
    title = re.sub(r'^#:warning:\s*', '', title)
    title = re.sub(r'^Prerequisites:\s*', '', title)
    title = title.strip('#').strip()
    # If title is too short or generic, augment with draft name context
    if len(title) < 8 or title.lower() in ('emails', 'overview', 'background', 'known limitations'):
        # Convert draft filename to readable label
        label = draft_name.replace('.md', '').replace('ado-wiki-', '').replace('onenote-', '')
        label = re.sub(r'^[a-z]-', '', label).replace('-', ' ').title()
        title = f"{title} ({label})"

    # Detect content types
    has_steps = bool(re.search(
        r'(?:step\s*\d|### Step|## Step|Troubleshooting|Investigation|How to)',
        content_clean, re.IGNORECASE))
    has_kusto = bool(re.search(r'```(?:kusto|kql)', content_clean, re.IGNORECASE)) or \
                bool(re.search(r"cluster\('", content_clean))
    has_portal = bool(re.search(
        r'(?:Navigate to|Go to|Azure Portal|blade)',
        content_clean, re.IGNORECASE))
    has_decision = bool(re.search(
        r'(?:If the|if.*please|otherwise|fallback|decision tree)',
        content_clean, re.IGNORECASE))
    has_api = bool(re.search(r'(?:REST API|GET https|POST https|api-version)', content_clean, re.IGNORECASE))
    has_powershell = bool(re.search(r'```(?:powershell|bash)', content_clean, re.IGNORECASE))
    has_table = bool(re.search(r'\|.*\|.*\|', content_clean))
    has_numbered = bool(re.search(r'^\d+\.\s+', content_clean, re.MULTILINE))

    has_workflow = has_steps or has_kusto or has_decision or has_api or has_powershell or has_numbered

    if not has_workflow:
        return None, title

    # Check 21V / Mooncake
    is_mooncake = bool(re.search(r'(?:mooncake|21[Vv]|chinacloud|china|\.cn)', content_clean, re.IGNORECASE))
    is_global_only = bool(re.search(
        r'(?:not.+(?:supported|available).+(?:21V|mooncake|china)|global.only)',
        content_clean, re.IGNORECASE))
    if is_mooncake:
        mooncake_note = "Mooncake \u2705"
    elif is_global_only:
        mooncake_note = "Global-only \u274c"
    else:
        mooncake_note = "Mooncake \u26a0\ufe0f \u672a\u660e\u786e"

    # Extract numbered steps
    step_items = []
    numbered_steps = re.findall(r'^\d+\.\s+(.+?)$', content_clean, re.MULTILINE)
    for s in numbered_steps[:20]:
        clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', lambda m: m.group(1), s)
        clean = re.sub(r'!\[.*?\]\(.*?\)', '', clean)
        clean = clean.strip()
        if clean and len(clean) > 5:
            step_items.append(clean)

    # Extract kusto queries
    kusto_blocks = re.findall(r'```(?:kusto|kql)\s*\n(.*?)```', content_clean, re.DOTALL | re.IGNORECASE)
    if not kusto_blocks:
        # Try unlabeled blocks with cluster()
        kusto_blocks = []
        for m in re.finditer(r'```\s*\n(.*?)```', content_clean, re.DOTALL):
            block = m.group(1)
            if "cluster(" in block or "| where" in block or "| project" in block or "| extend" in block:
                kusto_blocks.append(block)

    # Extract portal paths
    portal_paths = re.findall(
        r'(?:Navigate to|Go to|Open)\s+(.+?)(?:\.|$)',
        content_clean, re.IGNORECASE | re.MULTILINE)
    portal_paths = [p.strip() for p in portal_paths if 10 < len(p.strip()) < 200][:5]

    # Extract API endpoints
    api_endpoints = re.findall(r'((?:GET|POST|PUT|DELETE)\s+https://\S+)', content_clean)

    # Extract PowerShell/bash commands
    ps_blocks = re.findall(r'```(?:powershell|bash)\s*\n(.*?)```', content_clean, re.DOTALL | re.IGNORECASE)

    scenario = {
        'title': title,
        'source': draft_name,
        'mooncake': mooncake_note,
        'steps': step_items,
        'kusto_queries': kusto_blocks[:5],
        'portal_paths': portal_paths,
        'api_endpoints': api_endpoints[:3],
        'ps_commands': ps_blocks[:3],
        'has_decision': has_decision,
    }

    return scenario, title


def generate_workflow_md(topic, scenarios):
    """Generate the workflow markdown for a topic."""
    draft_names = [os.path.basename(d) for d in topic['draftPaths']]

    lines = []
    lines.append(f"# Defender {topic['title']} \u2014 \u6392\u67e5\u5de5\u4f5c\u6d41\n")
    lines.append(f"**\u6765\u6e90\u8349\u7a3f**: {', '.join(draft_names)}")
    lines.append(f"**\u573a\u666f\u6570**: {len(scenarios)}")
    lines.append(f"**\u751f\u6210\u65e5\u671f**: 2026-04-07\n")
    lines.append("---\n")

    for i, sc in enumerate(scenarios, 1):
        lines.append(f"## Scenario {i}: {sc['title']}")
        lines.append(f"> \u6765\u6e90: {sc['source']} | \u9002\u7528: {sc['mooncake']}\n")

        if sc['steps']:
            lines.append("### \u6392\u67e5\u6b65\u9aa4")
            for j, step in enumerate(sc['steps'], 1):
                lines.append(f"{j}. {step}")
            lines.append("")

        if sc['portal_paths']:
            lines.append("### Portal \u5bfc\u822a\u8def\u5f84")
            for pp in sc['portal_paths']:
                lines.append(f"- {pp}")
            lines.append("")

        if sc['kusto_queries']:
            lines.append("### Kusto \u8bca\u65ad\u67e5\u8be2")
            for k, kq in enumerate(sc['kusto_queries'], 1):
                lines.append(f"**\u67e5\u8be2 {k}:**")
                lines.append("```kusto")
                lines.append(kq.strip())
                lines.append("```\n")

        if sc['api_endpoints']:
            lines.append("### API \u7aef\u70b9")
            for api in sc['api_endpoints']:
                lines.append(f"```")
                lines.append(api)
                lines.append("```")
            lines.append("")

        if sc['ps_commands']:
            lines.append("### \u811a\u672c\u547d\u4ee4")
            for ps in sc['ps_commands']:
                lines.append("```powershell")
                lines.append(ps.strip())
                lines.append("```\n")

        if sc['has_decision']:
            lines.append("### \u51b3\u7b56\u6811")
            lines.append("> \u26a0\ufe0f \u672c\u573a\u666f\u5305\u542b\u6761\u4ef6\u5206\u652f\u5224\u65ad\uff0c\u8bf7\u53c2\u8003\u6765\u6e90\u8349\u7a3f\u83b7\u53d6\u5b8c\u6574\u51b3\u7b56\u903b\u8f91\u3002\n")

        lines.append("---\n")

    return '\n'.join(lines)


def main():
    # Load topic plan
    plan_path = os.path.join(BASE, '.enrich/topic-plan.json')
    with open(plan_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    fusion = [t for t in data['topics'] if t.get('hasFusionGuide')]

    # Load all drafts
    with open('/tmp/defender_all_drafts.json', 'r', encoding='utf-8') as f:
        all_drafts = json.load(f)

    results = {'total': len(fusion), 'with_workflows': 0, 'skipped': 0, 'details': []}

    for topic in fusion:
        slug = topic['slug']
        title = topic['title']
        scenarios = []

        for dp in topic['draftPaths']:
            content = all_drafts.get(dp, '')
            if not content:
                continue

            scenario, sc_title = extract_scenarios(content, os.path.basename(dp))
            if scenario:
                scenarios.append(scenario)

        if not scenarios:
            results['skipped'] += 1
            results['details'].append({
                'slug': slug, 'title': title,
                'status': 'SKIPPED', 'reason': 'no extractable workflow',
                'scenarios': 0
            })
            continue

        # Generate and write workflow file
        md_content = generate_workflow_md(topic, scenarios)
        out_path = os.path.join(OUT_DIR, f'{slug}.md')
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(md_content)

        results['with_workflows'] += 1
        results['details'].append({
            'slug': slug, 'title': title,
            'status': 'GENERATED', 'scenarios': len(scenarios),
            'drafts': len(topic['draftPaths'])
        })

    # Print summary
    print(f"\n{'='*60}")
    print(f"WORKFLOW GENERATION COMPLETE")
    print(f"{'='*60}")
    print(f"Total topics processed: {results['total']}")
    print(f"Topics with workflows:  {results['with_workflows']}")
    print(f"Topics skipped:         {results['skipped']}")
    print(f"\nDetails:")
    for d in results['details']:
        icon = '\u2705' if d['status'] == 'GENERATED' else '\u23ed\ufe0f'
        sc = d.get('scenarios', 0)
        drafts = d.get('drafts', 0)
        print(f"  {icon} {d['slug']}: {d['status']} ({sc} scenarios from {drafts} drafts)")

    # Save results
    with open('/tmp/defender_workflow_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
