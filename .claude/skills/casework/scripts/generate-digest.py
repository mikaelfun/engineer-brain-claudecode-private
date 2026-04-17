#!/usr/bin/env python3
"""
generate-digest.py — 调 LLM API 生成 enrichment digest（不占 casework context）

Usage:
  python3 generate-digest.py --type teams --case-dir ./cases/active/123 --case-number 123
  python3 generate-digest.py --type onenote --case-dir ./cases/active/123 --case-number 123

读取 raw 文件 + digest 模板 → 调 LLM → 写 digest 文件。
casework assess 只需 Read 成品 digest，不需要把 raw 数据灌进自己的 context。

环境变量：
  NEWAPI_KEY — API key（从 config.json 或环境变量读取）
  NEWAPI_BASE — API base URL（默认 https://kunnewapi.net/v1）
"""

import argparse
import json
import os
import sys
import glob
from pathlib import Path
from datetime import datetime


def parse_args():
    p = argparse.ArgumentParser(description="Generate enrichment digest via LLM API")
    p.add_argument("--type", required=True, choices=["teams", "onenote"], help="Digest type")
    p.add_argument("--case-dir", required=True, help="Case directory")
    p.add_argument("--case-number", required=True, help="Case number")
    p.add_argument("--project-root", default=".", help="Project root (for reading templates)")
    p.add_argument("--model", default="claude-sonnet-4-20250514", help="LLM model")
    return p.parse_args()


def read_file(path, max_chars=15000):
    """Read file, truncate if too long."""
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        if len(content) > max_chars:
            content = content[:max_chars] + f"\n\n... (truncated at {max_chars} chars)"
        return content
    except Exception:
        return ""


def load_config(project_root):
    """Load API config from config.json or environment."""
    base = os.environ.get("NEWAPI_BASE", "https://kunnewapi.net/v1")
    key = os.environ.get("NEWAPI_KEY", "")
    model = os.environ.get("NEWAPI_MODEL", "")

    cfg_path = os.path.join(project_root, "config.json")
    try:
        cfg = json.load(open(cfg_path, encoding="utf-8"))
        newapi = cfg.get("newapi", {})
        if not key:
            key = newapi.get("key", "")
        if not model:
            model = newapi.get("model", "claude-sonnet-4-20250514")
        base = newapi.get("base", base)
    except Exception:
        pass

    if not model:
        model = "claude-sonnet-4-20250514"

    return base, key, model


def call_llm(base_url, api_key, model, system_prompt, user_prompt):
    """Call OpenAI-compatible chat completion API."""
    import urllib.request
    import urllib.error

    url = f"{base_url}/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 4000,
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"ERROR|LLM API {e.code}: {body[:200]}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"ERROR|LLM API: {e}", file=sys.stderr)
        return None


def generate_teams_digest(case_dir, case_number, project_root, base_url, api_key, model):
    """Generate teams-digest.md from raw chat files."""
    teams_dir = os.path.join(case_dir, "teams")
    if not os.path.isdir(teams_dir):
        print("SKIP|no teams/ dir")
        return

    # Read template
    template_path = os.path.join(project_root, ".claude/skills/casework/teams-search/teams-digest-template.md")
    template = read_file(template_path) if os.path.exists(template_path) else "Output a Teams digest with Key Facts, Timeline, and Low-Relevance sections."

    # Read raw chat files (exclude _* metadata files)
    chat_files = sorted(glob.glob(os.path.join(teams_dir, "*.md")))
    chat_files = [f for f in chat_files if not os.path.basename(f).startswith("_")]

    if not chat_files:
        # Write empty digest
        digest = f"# Teams Digest — Case {case_number}\n\n> Generated: {datetime.now().isoformat(timespec='seconds')}\n> High-relevance chats: 0 / 0\n\nNo Teams conversations found.\n"
        out_path = os.path.join(teams_dir, "teams-digest.md")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(digest)
        print(f"OK|empty|output={out_path}")
        return

    # Read case-info.md head for context
    case_info_head = read_file(os.path.join(case_dir, "case-info.md"), max_chars=3000)

    # Build user prompt with raw chat content
    chats_content = []
    for cf in chat_files[:10]:  # cap at 10 chats
        name = os.path.basename(cf)
        content = read_file(cf, max_chars=3000)
        chats_content.append(f"### Chat: {name}\n{content}")

    user_prompt = f"""Case Number: {case_number}
Total chats: {len(chat_files)}

## Case Info (head)
{case_info_head[:2000]}

## Raw Chat Files
{"".join(chats_content)}

## Output Format Template
{template}

Generate the teams-digest.md following the template format exactly. Output ONLY the markdown content, no code fences."""

    system_prompt = "You are a Teams conversation analyst. Read raw chat files, score relevance, extract key facts, and produce a structured digest. Be concise and factual."

    result = call_llm(base_url, api_key, model, system_prompt, user_prompt)
    if not result:
        print("FAIL|LLM call failed")
        return

    # Write digest
    out_path = os.path.join(teams_dir, "teams-digest.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(result)

    # Write relevance JSON (best-effort parse from digest)
    print(f"OK|chats={len(chat_files)}|output={out_path}")


def generate_onenote_digest(case_dir, case_number, project_root, base_url, api_key, model):
    """Generate onenote-digest.md from raw page files."""
    onenote_dir = os.path.join(case_dir, "onenote")
    if not os.path.isdir(onenote_dir):
        print("SKIP|no onenote/ dir")
        return

    # Read template
    template_path = os.path.join(project_root, ".claude/skills/onenote/onenote-digest-template.md")
    template = read_file(template_path) if os.path.exists(template_path) else "Output an OneNote digest with Facts, Analysis, Details, and Summary sections."

    # Read raw page files
    page_files = sorted(glob.glob(os.path.join(onenote_dir, "_page-*.md")))

    if not page_files:
        digest = f"# Personal OneNote Notes — Case {case_number}\n\n> Searched: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n> Matched pages: 0\n\nNo personal OneNote notes found for this case.\n"
        out_path = os.path.join(onenote_dir, "onenote-digest.md")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(digest)
        print(f"OK|empty|output={out_path}")
        return

    # Read case-info.md head for context
    case_info_head = read_file(os.path.join(case_dir, "case-info.md"), max_chars=3000)

    # Build user prompt
    pages_content = []
    for pf in page_files[:5]:  # cap at 5 pages
        name = os.path.basename(pf)
        content = read_file(pf, max_chars=5000)
        pages_content.append(f"### Page: {name}\n{content}")

    user_prompt = f"""Case Number: {case_number}
Total matched pages: {len(page_files)}

## Case Info (head)
{case_info_head[:2000]}

## Raw OneNote Pages
{"".join(pages_content)}

## Output Format Template
{template}

Generate the onenote-digest.md following the template format exactly.
- Classify each finding as [fact] or [analysis] per the template rules
- Aggregate all [fact] items into the top Facts section
- Aggregate all [analysis] items into the Analysis section
- Include per-page details with Key findings
- Write a 1-2 sentence Summary
Output ONLY the markdown content, no code fences."""

    system_prompt = "You are a OneNote analyst for Azure support cases. Read raw OneNote page content, classify findings as [fact] (traceable evidence) or [analysis] (inference/hypothesis), and produce a structured digest. Be concise and accurate."

    result = call_llm(base_url, api_key, model, system_prompt, user_prompt)
    if not result:
        print("FAIL|LLM call failed")
        return

    out_path = os.path.join(onenote_dir, "onenote-digest.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(result)

    print(f"OK|pages={len(page_files)}|output={out_path}")


def main():
    args = parse_args()
    base_url, api_key, model = load_config(args.project_root)

    if not api_key:
        print("ERROR|no API key (set config.json newapi.key)", file=sys.stderr)
        sys.exit(1)

    # CLI --model overrides config
    if args.model != "claude-sonnet-4-20250514":
        model = args.model

    if args.type == "teams":
        generate_teams_digest(args.case_dir, args.case_number, args.project_root, base_url, api_key, model)
    elif args.type == "onenote":
        generate_onenote_digest(args.case_dir, args.case_number, args.project_root, base_url, api_key, model)


if __name__ == "__main__":
    main()
