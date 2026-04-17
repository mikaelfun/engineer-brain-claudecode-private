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
    p.add_argument("--max-images-per-page", type=int, default=3,
                    help="Max images per page for vision analysis (default: 3)")
    p.add_argument("--no-vision", action="store_true", default=False,
                    help="Disable vision (skip image analysis even if images exist)")
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
    """Call OpenAI-compatible chat completion API.

    user_prompt can be:
    - str: plain text content
    - list: array of content blocks (text + image_url) for vision API
    """
    import urllib.request
    import urllib.error

    url = f"{base_url}/chat/completions"

    # Support both string and array content formats
    user_content = user_prompt if isinstance(user_prompt, (str, list)) else str(user_prompt)

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
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


def extract_images_from_page(page_path, max_images=3):
    """ISS-224: Extract inline images from a page markdown, return as vision content blocks.

    Parses ![...](./assets/xxx.png) references, reads the image files,
    and returns base64-encoded image_url content blocks for OpenAI vision API.

    Args:
        page_path: path to the _page-*.md file
        max_images: max images to extract per page (controls token cost)

    Returns:
        list of {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
    """
    import re
    import base64

    img_pattern = re.compile(r'!\[[^\]]*\]\(\./assets/([^)]+)\)')
    page_dir = os.path.dirname(page_path)

    try:
        with open(page_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception:
        return []

    matches = img_pattern.findall(content)
    if not matches:
        return []

    image_blocks = []
    for img_filename in matches[:max_images]:
        img_path = os.path.join(page_dir, "assets", img_filename)
        if not os.path.isfile(img_path):
            continue

        # Skip very large images (>500KB) to control token cost
        try:
            size = os.path.getsize(img_path)
            if size > 500_000:
                print(f"SKIP|image_too_large|{img_filename}|{size}bytes", file=sys.stderr)
                continue
        except OSError:
            continue

        # Detect MIME type from extension
        ext = img_filename.rsplit(".", 1)[-1].lower() if "." in img_filename else "png"
        mime_map = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "gif": "image/gif", "webp": "image/webp"}
        mime_type = mime_map.get(ext, "image/png")

        try:
            with open(img_path, "rb") as f:
                img_data = base64.b64encode(f.read()).decode("ascii")
            image_blocks.append({
                "type": "image_url",
                "image_url": {"url": f"data:{mime_type};base64,{img_data}"}
            })
        except Exception as e:
            print(f"WARN|cannot_read_image|{img_filename}|{e}", file=sys.stderr)

    return image_blocks


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

    # Sort by lastMessageTime from _chat-index.json (oldest first = chronological input for LLM)
    chat_index_path_sort = os.path.join(teams_dir, "_chat-index.json")
    if os.path.exists(chat_index_path_sort):
        try:
            idx_sort = json.load(open(chat_index_path_sort, encoding="utf-8"))
            def _get_last_msg_time(fp):
                fn = os.path.basename(fp)
                for _cid, info in idx_sort.items():
                    if not _cid.startswith("_") and info.get("fileName") == fn:
                        return info.get("lastMessageTime", "")
                return ""
            chat_files.sort(key=_get_last_msg_time)
        except Exception:
            pass

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
    all_image_blocks = []
    assets_dir = os.path.join(teams_dir, "assets")
    has_images = os.path.isdir(assets_dir) and any(f.endswith(('.png', '.jpg', '.jpeg', '.gif')) for f in os.listdir(assets_dir)) if os.path.isdir(assets_dir) else False

    for cf in chat_files[:10]:  # cap at 10 chats
        name = os.path.basename(cf)
        content = read_file(cf, max_chars=3000)
        chats_content.append(f"### Chat: {name}\n{content}")
        # ISS-226: extract images from chat for vision analysis
        if has_images:
            img_blocks = extract_images_from_page(cf, max_images=3)
            all_image_blocks.extend(img_blocks)

    user_text = f"""Case Number: {case_number}
Total chats: {len(chat_files)}

## Case Info (head)
{case_info_head[:2000]}

## Raw Chat Files
{"".join(chats_content)}

## Output Format Template
{template}

Generate the teams-digest.md following the template format exactly.
CRITICAL: Key Facts MUST be sorted by date (oldest first). Each fact line must include a date.
Output ONLY the markdown content, no code fences."""

    # ISS-226: If images found, build vision content (list of blocks) instead of plain string
    if all_image_blocks:
        user_prompt = [{"type": "text", "text": user_text}] + all_image_blocks[:9]  # cap total images
    else:
        user_prompt = user_text

    system_prompt = """You are a Teams conversation analyst for Azure support cases.

Your task:
1. FIRST: Score each chat's relevance to the case by comparing chat content against the case problem description (from Case Info). Output a JSON block with per-chat relevance.
2. THEN: From high-relevance chats only, extract key facts and produce a structured digest.

Relevance criteria (based on chat CONTENT vs case PROBLEM):
- HIGH: Chat contains substantive discussion about the case — troubleshooting steps, customer feedback, PG guidance, technical findings, action items, or progress updates related to the case's problem.
- LOW: Chat only briefly mentions the case number/ID without substantive discussion, or is about a completely different topic, or is purely social/administrative.
- In other words: "详细讨论 case 进展或处理" = HIGH, "只是提到了 caseId" = LOW.

Output format — you MUST output EXACTLY this structure, with the ```json-relevance``` fence:

```json-relevance
{
  "chat_filename.md": {"score": "high", "reason": "详细讨论了 alert 问题的排查和处理"},
  "other_chat.md": {"score": "low", "reason": "只提到了 case 号，无实质讨论"}
}
```

Then output the digest markdown (Key Facts and Timeline MUST be in Chinese, keep names/commands/technical terms in English):

If inline images/screenshots are provided, extract key diagnostic information from them (error messages, Portal configurations, RBAC settings, command outputs, etc.) and include those findings in Key Facts."""

    result = call_llm(base_url, api_key, model, system_prompt, user_prompt)
    if not result:
        print("FAIL|LLM call failed")
        return

    # Write _relevance.json — parse structured JSON from LLM output
    # LLM outputs ```json-relevance { ... } ``` block BEFORE the digest markdown
    import re
    relevance_data = {
        "_scoredAt": datetime.now().isoformat(timespec="seconds"),
        "_source": "generate-digest.py",
        "chats": {},
    }

    # Load _chat-index.json for fileName→chatId mapping
    chat_index_path = os.path.join(teams_dir, "_chat-index.json")
    filename_to_chatids = {}  # {"bi-weiwei.md": ["19:xxx"]}
    if os.path.exists(chat_index_path):
        try:
            idx = json.load(open(chat_index_path, encoding="utf-8"))
            for cid, info in idx.items():
                if cid.startswith("_"):
                    continue
                fn = info.get("fileName", "")
                if fn:
                    filename_to_chatids.setdefault(fn, []).append(cid)
        except Exception:
            pass

    # Parse structured json-relevance block from LLM output
    json_rel_match = re.search(r"```json-relevance\s*\n([\s\S]*?)\n```", result)
    if json_rel_match:
        try:
            rel_json = json.loads(json_rel_match.group(1))
            for filename, info in rel_json.items():
                chat_id = filename.replace(".md", "")
                chat_ids = filename_to_chatids.get(filename, [])
                score = info.get("score", "unknown")
                reason = info.get("reason", "")
                relevance_data["chats"][chat_id] = {
                    "relevance": score,
                    "reason": reason,
                    "chatIds": chat_ids,
                }
        except (json.JSONDecodeError, AttributeError):
            pass  # fallback to heuristic below

    # Fallback: if no json-relevance block parsed, use Key Facts heuristic
    if not relevance_data["chats"]:
        # Parse Key Facts for display names → map back to chat filenames
        keyfacts_match = re.search(r"## Key Facts.*?\n([\s\S]*?)(?=\n## |$)", result)
        mentioned_chats = set()
        if keyfacts_match:
            for line in keyfacts_match.group(1).split("\n"):
                name_match = re.match(r"- \[.+?\] (.+?) @", line)
                if name_match:
                    display_name = name_match.group(1).strip()
                    for cf in chat_files:
                        cf_base = os.path.basename(cf).replace(".md", "").replace("-", " ").lower()
                        if display_name.lower().replace(" ", "") in cf_base.replace(" ", "") or \
                           cf_base.replace(" ", "") in display_name.lower().replace(" ", ""):
                            mentioned_chats.add(os.path.basename(cf))

        for cf in chat_files:
            chat_name = os.path.basename(cf)
            chat_id = chat_name.replace(".md", "")
            chat_ids = filename_to_chatids.get(chat_name, [])
            if chat_name in mentioned_chats:
                relevance_data["chats"][chat_id] = {"relevance": "high", "chatIds": chat_ids}
            else:
                relevance_data["chats"][chat_id] = {"relevance": "low", "chatIds": chat_ids}

    # Strip json-relevance block from digest output (keep only markdown)
    digest_content = re.sub(r"```json-relevance\s*\n[\s\S]*?\n```\s*\n?", "", result).strip()

    relevance_path = os.path.join(teams_dir, "_relevance.json")
    with open(relevance_path, "w", encoding="utf-8") as f:
        json.dump(relevance_data, f, indent=2, ensure_ascii=False)

    # Write cleaned digest (without json-relevance block) to file
    out_path = os.path.join(teams_dir, "teams-digest.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(digest_content if digest_content else result)

    print(f"OK|chats={len(chat_files)}|output={out_path}|relevance={relevance_path}")


def generate_onenote_digest(case_dir, case_number, project_root, base_url, api_key, model,
                            max_images_per_page=3, no_vision=False):
    """Generate onenote-digest.md from raw page files. ISS-224: supports vision analysis."""
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

    # ISS-224: Check for images and decide vision vs text-only mode
    has_images = False
    if not no_vision:
        # Check if any page has images in assets/
        assets_dir = os.path.join(onenote_dir, "assets")
        if os.path.isdir(assets_dir) and os.listdir(assets_dir):
            has_images = True

    if has_images:
        # Vision mode: build content array with text + images
        content_blocks = []

        # Add case info as text
        content_blocks.append({
            "type": "text",
            "text": f"Case Number: {case_number}\nTotal matched pages: {len(page_files)}\n\n## Case Info (head)\n{case_info_head[:2000]}\n\n## Raw OneNote Pages\n"
        })

        # Add each page with interleaved images
        total_images = 0
        for pf in page_files[:10]:
            name = os.path.basename(pf)
            page_text = read_file(pf, max_chars=5000)
            content_blocks.append({
                "type": "text",
                "text": f"### Page: {name}\n{page_text}\n"
            })

            # Extract and add images for this page
            image_blocks = extract_images_from_page(pf, max_images=max_images_per_page)
            if image_blocks:
                content_blocks.extend(image_blocks)
                total_images += len(image_blocks)

        # Add template instructions
        content_blocks.append({
            "type": "text",
            "text": f"\n## Output Format Template\n{template}\n\nGenerate the onenote-digest.md following the template format exactly.\n- Classify each finding as [fact] or [analysis] per the template rules\n- Aggregate all [fact] items into the top Facts section\n- Aggregate all [analysis] items into the Analysis section\n- Include per-page details with Key findings\n- For each screenshot/image provided, extract key information (RBAC configs, error codes, CLI output, portal settings) and include as [fact] items\n- Write a 1-2 sentence Summary\nOutput ONLY the markdown content, no code fences."
        })

        user_prompt = content_blocks
        print(f"VISION|pages={len(page_files)}|images={total_images}", file=sys.stderr)
    else:
        # Text-only mode (original behavior)
        pages_content = []
        for pf in page_files[:10]:
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

    system_prompt = "You are a OneNote analyst for Azure support cases. Read raw OneNote page content (and any attached screenshots/images), classify findings as [fact] (traceable evidence) or [analysis] (inference/hypothesis), and produce a structured digest. For images: extract RBAC configurations, error codes, CLI outputs, portal settings, and other diagnostic information visible in screenshots. Be concise and accurate."

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
        generate_onenote_digest(args.case_dir, args.case_number, args.project_root, base_url, api_key, model,
                               max_images_per_page=args.max_images_per_page, no_vision=args.no_vision)


if __name__ == "__main__":
    main()
