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

    Parses ![...](assets/xxx.png) references, reads the image files,
    and returns base64-encoded image_url content blocks for OpenAI vision API.

    Args:
        page_path: path to the _page-*.md file
        max_images: max images to extract per page (controls token cost)

    Returns:
        list of {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
    """
    import re
    import base64

    img_pattern = re.compile(r'!\[[^\]]*\]\((?:\./)?assets/([^)]+)\)')
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


def score_and_extract_single_chat(chat_path, case_info_head, case_number, base_url, api_key, model):
    """ISS-227: Score relevance + extract key facts for a single chat file.

    No truncation — reads the full chat file.

    Returns:
        dict: {"filename": str, "relevance": "high"|"low", "reason": str,
               "key_facts": [str], "timeline_entries": [str]}
        or None on LLM failure.
    """
    filename = os.path.basename(chat_path)

    # Read full content — no truncation
    try:
        with open(chat_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception:
        return {"filename": filename, "relevance": "low", "reason": "cannot read file",
                "key_facts": [], "timeline_entries": []}

    # Build vision content if images exist
    assets_dir = os.path.join(os.path.dirname(chat_path), "assets")
    has_images = os.path.isdir(assets_dir) and any(
        f.endswith(('.png', '.jpg', '.jpeg', '.gif')) for f in os.listdir(assets_dir)
    ) if os.path.isdir(assets_dir) else False

    image_blocks = extract_images_from_page(chat_path, max_images=3) if has_images else []

    system_prompt = """You are a Teams conversation analyst for Azure support cases.

Analyze ONE chat file and output a JSON object (no markdown fences, pure JSON only).

Relevance criteria:
- HIGH: Chat contains substantive discussion about the case — troubleshooting steps, customer feedback, PG guidance, technical findings, action items, progress updates, or closure/archival discussion.
- LOW: Chat only briefly mentions the case number/ID, or is purely social/administrative, or about a different topic.

CRITICAL ANTI-HALLUCINATION RULES:
1. You MUST base your relevance judgment ONLY on the actual chat content provided. Do NOT infer relevance from the case title or case info alone.
2. If the chat content does NOT mention the case number, AND does NOT discuss topics matching the case title/description, you MUST classify as LOW.
3. If the chat discusses a DIFFERENT technical topic (e.g., case is about MFA but chat is about file caching), classify as LOW regardless of who the participants are.
4. Your "reason" field MUST reference SPECIFIC messages or topics actually present in the chat. Never fabricate discussion topics that don't exist in the provided text.
5. When in doubt, classify as LOW. False negatives are much less harmful than false positives (hallucinated relevance).

Identity tags:
- [customer] = non-@microsoft.com sender
- [engineer] = fangkun@microsoft.com or case Assigned To
- [pg] = other @microsoft.com (product group)
- [internal] = other @microsoft.com (non-PG colleague)

Output EXACTLY this JSON (no markdown, no code fences):
{
  "relevance": "high" or "low",
  "reason": "one-line Chinese reason",
  "key_facts": [
    "YYYY-MM-DD: 当天所有关键事实合并成一句话总结（提及关键人物和结论）"
  ],
  "timeline_entries": [
    "- YYYY-MM-DD — DisplayName — 一句话中文摘要"
  ]
}

Rules:
- key_facts: ONE entry per DATE — merge all messages from the same day into a single concise summary
  Example: "2026-04-17: Kun Fang 提议临时关闭 case，客户 Sushanth 同意"（不要拆成两条）
- key_facts format: "YYYY-MM-DD: 中文总结"
- CRITICAL: key_facts and timeline_entries MUST ONLY contain messages directly related to THIS case (matching case number, case title topic, or case-specific troubleshooting). A single chat often contains discussions about MULTIPLE cases or topics — SKIP messages about other cases, other technical topics, or general chit-chat. Example: if the case is about MFA but the chat also discusses iOS Outlook offline grace period → only extract MFA-related messages, ignore Outlook grace period messages.
- Do NOT use [customer]/[engineer]/[internal] tags — just person names inline
- timeline_entries: can have multiple entries per day (more granular than key_facts)
- key_facts and timeline_entries: only if relevance=high, else empty arrays
- Keep names/commands/technical terms in English, rest in Chinese
- Sort by date (oldest first)
- Include all important CASE-RELEVANT messages — especially recent ones about case closure, status changes, deployment updates
- CRITICAL: Customer confirmations/agreements are KEY FACTS — but describe the MEANING, not the literal words. "Ok sure" in response to "shall we close the case?" should become "客户同意关闭 case", NOT "客户回复 Ok sure". Always interpret what the person agreed to or confirmed, don't quote their exact short reply.
- For images/screenshots: extract visible diagnostic info and add as facts. IMPORTANT: if a fact was derived from a screenshot, append the original markdown image reference from the chat text at the END of the fact string, e.g.: "2026-04-17: 截图显示 Portal 报错 'Resource not found' ![image](assets/msg123_0.png)". The image reference format is ![...](assets/xxx.png) — find it in the chat text near the message that sent the screenshot."""

    user_text = f"""Case Number: {case_number}

## Case Info (head)
{case_info_head[:2000]}

## Chat File: {filename}
{content}"""

    if image_blocks:
        user_prompt = [{"type": "text", "text": user_text}] + image_blocks
    else:
        user_prompt = user_text

    result = call_llm(base_url, api_key, model, system_prompt, user_prompt)
    if not result:
        return {"filename": filename, "relevance": "low", "reason": "LLM call failed",
                "key_facts": [], "timeline_entries": []}

    # Parse JSON from LLM output (strip any markdown fences if present)
    import re
    cleaned = re.sub(r"```json?\s*\n?", "", result).strip().rstrip("`")
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find JSON object in the output
        json_match = re.search(r'\{[\s\S]*\}', result)
        if json_match:
            try:
                parsed = json.loads(json_match.group())
            except json.JSONDecodeError:
                parsed = {"relevance": "low", "reason": "JSON parse failed", "key_facts": [], "timeline_entries": []}
        else:
            parsed = {"relevance": "low", "reason": "no JSON in output", "key_facts": [], "timeline_entries": []}

    return {
        "filename": filename,
        "relevance": parsed.get("relevance", "low"),
        "reason": parsed.get("reason", ""),
        "key_facts": parsed.get("key_facts", []),
        "timeline_entries": parsed.get("timeline_entries", []),
    }


def merge_digest_results(results, case_number, chat_files, filename_to_chatids):
    """ISS-227: Merge per-chat LLM results into teams-digest.md + _relevance.json.

    Pure code — no LLM call. Combines key_facts/timeline from all high-relevance chats.

    Args:
        results: list of dicts from score_and_extract_single_chat()
        case_number: str
        chat_files: list of file paths (for counting)
        filename_to_chatids: dict mapping filename → [chatId]

    Returns:
        (digest_md: str, relevance_data: dict)
    """
    high_count = sum(1 for r in results if r["relevance"] == "high")
    total_count = len(results)

    # Separate high and low relevance results
    high_results = []
    low_relevance_lines = []

    for r in results:
        if r["relevance"] == "high":
            high_results.append(r)
        else:
            display_name = r["filename"].replace(".md", "").replace("-", " ").title()
            reason = r.get("reason", "low relevance")
            low_relevance_lines.append(f"- {display_name}: {reason}")

    # Sort high-relevance results by earliest fact date (chronological chat order)
    import re

    def _extract_date(line):
        m = re.search(r'(\d{4}-\d{2}-\d{2})', line)
        return m.group(1) if m else "9999-99-99"

    def _earliest_date(r):
        facts = r.get("key_facts", [])
        if not facts:
            return "9999-99-99"
        return min(_extract_date(f) for f in facts)

    high_results.sort(key=_earliest_date)

    # Collect all timeline entries (flat, sorted by date)
    all_timeline = []
    for r in high_results:
        all_timeline.extend(r.get("timeline_entries", []))
    all_timeline.sort(key=_extract_date)

    # Build digest markdown — Key Facts grouped by chat name
    now_iso = datetime.now().isoformat(timespec="seconds")
    lines = [
        f"# Teams Digest — Case {case_number}",
        "",
        f"> Generated: {now_iso}",
        f"> High-relevance chats: {high_count} / {total_count}",
        "",
        "## Key Facts",
        "",
        "以下事实来自 Teams 对话，按聊天分组、时间顺序排列。每条标注来源身份。",
        "",
    ]

    if high_results:
        for r in high_results:
            facts = r.get("key_facts", [])
            if not facts:
                continue
            # Chat display name from filename
            display_name = r["filename"].replace(".md", "").replace("-", " ").title()
            lines.append(f"### {display_name}")
            lines.append("")
            # Sort facts within this chat by date
            facts_sorted = sorted(facts, key=_extract_date)
            for fact in facts_sorted:
                fact = fact.strip()
                if not fact.startswith("- "):
                    fact = f"- {fact}"
                lines.append(fact)
            lines.append("")
    else:
        lines.append("No high-relevance Teams conversations found.")
        lines.append("")

    lines.extend(["", "## Timeline (high-relevance only)", ""])
    if all_timeline:
        for entry in all_timeline:
            entry = entry.strip()
            if not entry.startswith("- "):
                entry = f"- {entry}"
            lines.append(entry)
    else:
        lines.append("(none)")

    lines.extend(["", "## Low-Relevance (skipped)", ""])
    if low_relevance_lines:
        lines.extend(low_relevance_lines)
    else:
        lines.append("(none)")

    digest_md = "\n".join(lines)

    # Build _relevance.json
    relevance_data = {
        "_scoredAt": now_iso,
        "_source": "generate-digest.py (per-chat parallel)",
        "chats": {},
    }
    for r in results:
        chat_id = r["filename"].replace(".md", "")
        chat_ids = filename_to_chatids.get(r["filename"], [])
        relevance_data["chats"][chat_id] = {
            "relevance": r["relevance"],
            "reason": r.get("reason", ""),
            "chatIds": chat_ids,
        }

    return digest_md, relevance_data


def generate_teams_digest(case_dir, case_number, project_root, base_url, api_key, model):
    """Generate teams-digest.md from raw chat files — ISS-227 per-chat parallel architecture."""
    from concurrent.futures import ThreadPoolExecutor, as_completed

    teams_dir = os.path.join(case_dir, "teams")
    if not os.path.isdir(teams_dir):
        print("SKIP|no teams/ dir")
        return

    # Read raw chat files (exclude _* metadata files)
    chat_files = sorted(glob.glob(os.path.join(teams_dir, "*.md")))
    chat_files = [f for f in chat_files if not os.path.basename(f).startswith("_")
                  and os.path.basename(f) not in ("teams-digest.md",)]

    if not chat_files:
        digest = f"# Teams Digest — Case {case_number}\n\n> Generated: {datetime.now().isoformat(timespec='seconds')}\n> High-relevance chats: 0 / 0\n\nNo Teams conversations found.\n"
        out_path = os.path.join(teams_dir, "teams-digest.md")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(digest)
        print(f"OK|empty|output={out_path}")
        return

    # Read case-info.md head for context (shared across all per-chat calls)
    case_info_head = read_file(os.path.join(case_dir, "case-info.md"), max_chars=3000)

    # Load _chat-index.json for fileName→chatId mapping
    chat_index_path = os.path.join(teams_dir, "_chat-index.json")
    filename_to_chatids = {}
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

    # Per-chat parallel LLM calls (no truncation)
    chat_files_capped = chat_files[:10]  # cap at 10 chats
    results = []
    max_workers = min(5, len(chat_files_capped))

    print(f"PARALLEL|chats={len(chat_files_capped)}|workers={max_workers}", file=sys.stderr)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(
                score_and_extract_single_chat,
                cf, case_info_head, case_number, base_url, api_key, model
            ): cf
            for cf in chat_files_capped
        }

        for future in as_completed(futures):
            cf = futures[future]
            try:
                result = future.result()
                if result:
                    results.append(result)
                    rel = result["relevance"]
                    fn = result["filename"]
                    print(f"  {fn}: {rel}", file=sys.stderr)
            except Exception as e:
                fn = os.path.basename(cf)
                print(f"  {fn}: ERROR {e}", file=sys.stderr)
                results.append({
                    "filename": fn, "relevance": "low",
                    "reason": f"exception: {e}", "key_facts": [], "timeline_entries": []
                })

    # Sort results by filename for deterministic output
    results.sort(key=lambda r: r["filename"])

    # Merge all per-chat results into digest + relevance
    digest_md, relevance_data = merge_digest_results(
        results, case_number, chat_files, filename_to_chatids
    )

    # Write outputs
    out_path = os.path.join(teams_dir, "teams-digest.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(digest_md)

    relevance_path = os.path.join(teams_dir, "_relevance.json")
    with open(relevance_path, "w", encoding="utf-8") as f:
        json.dump(relevance_data, f, indent=2, ensure_ascii=False)

    high_count = sum(1 for r in results if r["relevance"] == "high")
    print(f"OK|chats={len(chat_files_capped)}|high={high_count}|output={out_path}|relevance={relevance_path}")


def parse_page_hierarchy(filename, case_number):
    """Parse OneNote page filename into hierarchy info.

    Naming convention:
      _page-{caseNumber} {Section}.md          → root page of section
      _page-{caseNumber} {Section}--{Sub}.md   → subpage under section
      _page-{caseNumber}.md                    → case-level page (no section)

    Returns:
        str: Human-readable hierarchy string, e.g.
             'Section "VW" → Root Page'
             'Section "VW" → Subpage "iOS Teams MFA 历史分析"'
             'Case-level page (no section)'
    """
    name = filename.replace(".md", "")
    # Strip _page- prefix
    if name.startswith("_page-"):
        name = name[6:]
    # Strip case number prefix
    if name.startswith(case_number):
        name = name[len(case_number):].strip()

    if not name:
        return "Case-level page (no section)"

    if "--" in name:
        parts = name.split("--", 1)
        section = parts[0].strip()
        subpage = parts[1].strip()
        return f'Section "{section}" → Subpage "{subpage}"'
    else:
        return f'Section "{name}" → Root Page'


def classify_single_page(page_path, case_info_head, case_number, base_url, api_key, model,
                         max_images_per_page=3, no_vision=False):
    """ISS-228 v2: Classify a single OneNote page into structured four-section format.

    Per-page LLM call — Layer 1 of two-layer architecture.
    Reads full page content (no truncation), optional vision for images.

    Returns:
        dict: {"filename": str, "relevance": "high"|"low", "reason": str,
               "problem_description": str,
               "facts": [str],
               "screenshots": [{"description": str, "image_ref": str}],
               "analyses": [{"source": "engineer"|"llm-generated", "text": str}],
               "action_items": [{"step": str, "verified": bool}],
               "summary": str}
        or fallback on LLM failure.
    """
    filename = os.path.basename(page_path)

    # Build empty fallback result
    empty_result = {
        "filename": filename, "relevance": "low", "reason": "cannot read file",
        "problem_description": "", "facts": [], "screenshots": [],
        "analyses": [], "action_items": [], "summary": "",
    }

    try:
        with open(page_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception:
        return empty_result

    # Vision: extract images if available and not disabled
    image_blocks = []
    if not no_vision:
        image_blocks = extract_images_from_page(page_path, max_images=max_images_per_page)

    system_prompt = """You are a OneNote analyst for Azure support cases.

Analyze ONE OneNote page and output a JSON object (no markdown fences, pure JSON only).

Relevance criteria:
- HIGH: Page contains substantive case-related notes — troubleshooting steps, error analysis, customer findings, diagnostic commands
- LOW: Page only briefly mentions the case number, is empty, or is unrelated

Output EXACTLY this JSON structure (no markdown, no code fences):
{
  "relevance": "high" or "low",
  "reason": "one-line Chinese reason why this page is high/low relevance",
  "problem_description": "客户问题的简要描述（从本页内容提取，没有则空字符串）",
  "facts": [
    "具体事实1（命令输出/错误码/客户确认/配置值/时间戳/URL — 可追溯证据）",
    "具体事实2..."
  ],
  "code_blocks": [
    {"language": "powershell", "description": "一句话中文描述：脚本用途、关键参数、预期行为", "code": "完整代码内容（保留原始格式）"}
  ],
  "screenshots": [
    {"description": "截图内容描述（提取的诊断信息）", "image_ref": "原 markdown image 引用，如 ![alt](assets/xxx.png)"}
  ],
  "analyses": [
    {"source": "engineer", "text": "工程师在 OneNote 中写的推断/假设/TODO"},
    {"source": "llm-generated", "text": "LLM 从截图或上下文推断出的分析"}
  ],
  "action_items": [
    {"step": "建议的排查步骤描述", "verified": false}
  ],
  "summary": "1-2 句中文总结本页对 case 的诊断价值"
}

Classification rules for each field:
- facts: Command output, error codes, customer quotes, timestamps, URLs, config values — traceable evidence. Include ALL important findings.
  IMPORTANT: Do NOT put full code/scripts in facts — those go in code_blocks. Facts should only contain a brief one-line reference like "客户提供了 SMTP AUTH 测试脚本（见相关代码）" if a script exists.
- code_blocks: Scripts, code snippets, or multi-line commands (PowerShell, Python, Bash, curl, etc.) found in the page.
  - Each entry: {"language": "powershell|python|bash|...", "description": "中文描述：用途、关键参数、预期行为", "code": "完整代码"}
  - Preserve the ENTIRE script as-is — do NOT truncate or summarize the code itself
  - The description should explain: what the code does, key parameters (server, port, auth method), and the expected outcome
  - If no scripts/code in the page, return empty array []
- screenshots: For each image in the page, describe what diagnostic info is visible. Keep the original image markdown reference in image_ref.
- analyses: Split by source:
  - "engineer": Text that the engineer explicitly wrote as hypothesis/inference (看到"可能"/"应该"/"怀疑"/"TODO"等)
  - "llm-generated": Your own inferences from screenshots or context that the engineer didn't write
- action_items: Next steps mentioned or implied. verified=true only if the page shows the step was already done.
- When unsure if something is fact or analysis, classify as fact (conservative).

Rules:
- Keep names/commands/technical terms in English, rest in Chinese
- Empty page or irrelevant → relevance=low, all arrays empty, summary=""
"""

    # Parse page hierarchy from filename
    hierarchy = parse_page_hierarchy(filename, case_number)

    user_text = f"""Case Number: {case_number}

## Case Info (head)
{case_info_head[:2000]}

## OneNote Page: {filename}
Page hierarchy: {hierarchy}

{content}"""

    if image_blocks:
        user_prompt = [{"type": "text", "text": user_text}] + image_blocks
    else:
        user_prompt = user_text

    result = call_llm(base_url, api_key, model, system_prompt, user_prompt)
    if not result:
        empty_result["reason"] = "LLM call failed"
        return empty_result

    # Parse JSON from LLM output
    import re
    cleaned = re.sub(r"```json?\s*\n?", "", result).strip().rstrip("`")
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        json_match = re.search(r'\{[\s\S]*\}', result)
        if json_match:
            try:
                parsed = json.loads(json_match.group())
            except json.JSONDecodeError:
                empty_result["reason"] = "JSON parse failed"
                return empty_result
        else:
            empty_result["reason"] = "no JSON in output"
            return empty_result

    return {
        "filename": filename,
        "relevance": parsed.get("relevance", "low"),
        "reason": parsed.get("reason", ""),
        "problem_description": parsed.get("problem_description", ""),
        "facts": parsed.get("facts", []),
        "code_blocks": parsed.get("code_blocks", []),
        "screenshots": parsed.get("screenshots", []),
        "analyses": parsed.get("analyses", []),
        "action_items": parsed.get("action_items", []),
        "summary": parsed.get("summary", ""),
    }


def synthesize_onenote_digest(per_page_results, case_info_head, case_number, base_url, api_key, model):
    """ISS-228 v2 Layer 2: Cross-page semantic synthesis via LLM.

    Reads all per-page structured JSON results + case-info.md, produces a
    four-section markdown digest by deduplicating and organizing across pages.

    Args:
        per_page_results: list of dicts from classify_single_page() (v2 format)
        case_info_head: str, first N chars of case-info.md
        case_number: str
        base_url, api_key, model: LLM config

    Returns:
        str: Four-section markdown digest, or None on LLM failure.
    """
    # Only feed high-relevance pages to Layer 2
    high_results = [r for r in per_page_results if r.get("relevance") == "high"]
    low_results = [r for r in per_page_results if r.get("relevance") != "high"]

    if not high_results:
        # No high-relevance pages — return minimal digest (no LLM call needed)
        return None

    # Build per-page JSON summary for LLM input (compact, no raw content)
    pages_json = []
    for r in high_results:
        hierarchy = parse_page_hierarchy(r["filename"], case_number)
        pages_json.append({
            "page": r["filename"],
            "hierarchy": hierarchy,
            "problem_description": r.get("problem_description", ""),
            "facts": r.get("facts", []),
            "code_blocks": r.get("code_blocks", []),
            "screenshots": r.get("screenshots", []),
            "analyses": r.get("analyses", []),
            "action_items": r.get("action_items", []),
            "summary": r.get("summary", ""),
        })

    system_prompt = """You are a cross-page synthesizer for Azure support case OneNote notes.

You receive structured per-page analysis results (Layer 1 output) and must produce a
UNIFIED four-section digest by DEDUPLICATING and ORGANIZING across all pages.

This is NOT concatenation — you must:
1. Merge duplicate facts that appear in multiple pages
2. Combine problem descriptions into one coherent statement
3. Order facts chronologically or by importance
4. Merge action items, marking which are verified
5. Keep all screenshot references intact (they display inline in the UI)
6. Use the "hierarchy" field to understand page relationships (root page vs subpage under same section share context)

Output markdown with EXACTLY these sections (conditional sections only appear when content exists):

## 1. 关键信息（Key Information）

**问题描述**: {merged problem description from all pages}

**事实信息**:
- {deduplicated fact 1}
- {deduplicated fact 2}

## 2. 相关代码（Code）                    ← CONDITIONAL: only include if code_blocks exist in ANY page
> {description of what the code does}
```{language}
{full code}
```
(repeat for each code block)

## 3. 相关截图（Screenshots）              ← CONDITIONAL: only include if screenshots exist in ANY page
- {screenshot description} {keep the original image_ref as-is, e.g. ![alt](assets/xxx.png)}

## 4. 分析推断（Analysis & Reasoning）

- [engineer] {analysis from engineer's own notes}
- [llm-generated] {LLM-inferred analysis}

## 5. 行动计划（Action Plan）

- [verified] {step that has been confirmed done}
- [unverified] {suggested step not yet confirmed}

## 6. 低价值信息（Low-Relevance）

(This section will be added by the caller — output empty string for this section)

Rules:
- Keep names/commands/technical terms in English, rest in Chinese
- Do NOT repeat the same fact from different pages — merge into one entry
- Preserve ALL image references exactly as given (![...](assets/...))
- CRITICAL — Code blocks: Render each code_block entry as: description line + ```{language} code fence. Preserve complete code, never truncate.
- CRITICAL — Conditional sections: Do NOT output "## 2. 相关代码" if there are zero code_blocks across all pages. Do NOT output "## 3. 相关截图" if there are zero screenshots. Adjust numbering accordingly (e.g., if no code but has screenshots, screenshots becomes ## 2).
- If no items for a sub-section within an included section, write "(无)" instead of omitting
- Do NOT add markdown code fences around your output — output raw markdown directly"""

    user_text = f"""Case Number: {case_number}

## Case Info (head)
{case_info_head[:2000]}

## Per-Page Analysis Results (Layer 1)
{json.dumps(pages_json, ensure_ascii=False, indent=2)}"""

    result = call_llm(base_url, api_key, model, system_prompt, user_text)
    return result


def merge_onenote_results(results, case_number, page_files,
                          case_info_head="", base_url="", api_key="", model=""):
    """ISS-228 v2: Merge per-page LLM results into four-section onenote-digest.md.

    If Layer 2 LLM config is provided and there are high-relevance pages,
    calls synthesize_onenote_digest() for cross-page semantic integration.
    Otherwise falls back to code-based assembly.

    Output format (四段式):
    - ## 1. 关键信息（Key Information）
    - ## 2. 分析推断（Analysis & Reasoning）
    - ## 3. 行动计划（Action Plan）
    - ## 4. 低价值信息（Low-Relevance）

    Args:
        results: list of dicts from classify_single_page() (v2 format)
        case_number: str
        page_files: list of file paths
        case_info_head: str (for Layer 2 synthesis)
        base_url, api_key, model: LLM config (for Layer 2)

    Returns:
        (digest_md: str, relevance_data: dict)
    """
    now_iso = datetime.now().isoformat(timespec="seconds")
    high_count = sum(1 for r in results if r["relevance"] == "high")
    total_count = len(results)

    high_results = [r for r in results if r["relevance"] == "high"]
    low_results = [r for r in results if r["relevance"] != "high"]

    def _display_name(fn):
        name = fn.replace(".md", "")
        if name.startswith("_page-"):
            name = name[6:]
        return name

    # ── Try Layer 2 LLM synthesis first ──
    synthesized = None
    if high_results and api_key:
        try:
            synthesized = synthesize_onenote_digest(
                results, case_info_head, case_number, base_url, api_key, model
            )
        except Exception as e:
            print(f"WARN|Layer2 synthesis failed: {e}, falling back to code merge", file=sys.stderr)

    if synthesized:
        # Layer 2 LLM produced the four-section body — wrap with header + add low-relevance section
        lines = [
            f"# Personal OneNote Notes — Case {case_number}",
            "",
            f"> Generated: {now_iso}",
            f"> High-relevance pages: {high_count} / {total_count}",
            f"> Synthesis: Layer 2 (cross-page LLM integration)",
            "",
            synthesized.strip(),
        ]

        # Append ## 6 if not already in LLM output
        if "## 6." not in synthesized and "低价值信息" not in synthesized:
            lines.extend(["", "## 4. 低价值信息（Low-Relevance）", ""])
            if low_results:
                for r in low_results:
                    display_name = _display_name(r["filename"])
                    reason = r.get("reason", "low relevance")
                    lines.append(f"- {display_name}: {reason}")
            else:
                lines.append("(none)")
    else:
        # ── Code-based fallback: assemble four sections from per-page structured data ──
        lines = [
            f"# Personal OneNote Notes — Case {case_number}",
            "",
            f"> Generated: {now_iso}",
            f"> High-relevance pages: {high_count} / {total_count}",
            f"> Synthesis: Code merge (Layer 2 unavailable)",
            "",
        ]

        # Section 1: Key Information
        lines.append("## 1. 关键信息（Key Information）")
        lines.append("")

        # Problem description (merge from all pages)
        problem_descs = [r.get("problem_description", "") for r in high_results if r.get("problem_description")]
        if problem_descs:
            lines.append(f"**问题描述**: {problem_descs[0]}")
            lines.append("")

        # Facts
        lines.append("**事实信息**:")
        all_facts = []
        for r in high_results:
            for f in r.get("facts", []):
                if isinstance(f, str) and f not in all_facts:
                    all_facts.append(f)
        if all_facts:
            for f in all_facts:
                lines.append(f"- {f}")
        else:
            lines.append("- (无)")
        lines.append("")

        # Screenshots
        all_screenshots = []
        for r in high_results:
            for s in r.get("screenshots", []):
                if isinstance(s, dict):
                    all_screenshots.append(s)
        if all_screenshots:
            lines.append("**截图诊断**:")
            for s in all_screenshots:
                desc = s.get("description", "")
                ref = s.get("image_ref", "")
                lines.append(f"- {desc} {ref}")
            lines.append("")

        # Section 2: Analysis & Reasoning
        lines.extend(["", "## 2. 分析推断（Analysis & Reasoning）", ""])
        all_analyses = []
        for r in high_results:
            for a in r.get("analyses", []):
                if isinstance(a, dict):
                    all_analyses.append(a)
        if all_analyses:
            for a in all_analyses:
                source = a.get("source", "engineer")
                text = a.get("text", "")
                lines.append(f"- [{source}] {text}")
        else:
            lines.append("- (无)")

        # Section 3: Action Plan
        lines.extend(["", "## 3. 行动计划（Action Plan）", ""])
        all_actions = []
        for r in high_results:
            for ai in r.get("action_items", []):
                if isinstance(ai, dict):
                    all_actions.append(ai)
        if all_actions:
            for ai in all_actions:
                step = ai.get("step", "")
                verified = ai.get("verified", False)
                tag = "[verified]" if verified else "[unverified]"
                lines.append(f"- {tag} {step}")
        else:
            lines.append("- (无)")

        # Section 4: Low-Relevance
        lines.extend(["", "## 4. 低价值信息（Low-Relevance）", ""])
        if low_results:
            for r in low_results:
                display_name = _display_name(r["filename"])
                reason = r.get("reason", "low relevance")
                lines.append(f"- {display_name}: {reason}")
        else:
            lines.append("(none)")

    digest_md = "\n".join(lines)

    # Build _page-relevance.json (v2 format with all new fields)
    relevance_data = {
        "_scoredAt": now_iso,
        "_source": "generate-digest.py (per-page parallel, v2 four-section)",
        "_format": "v2",
        "pages": {},
    }
    for r in results:
        page_key = r["filename"].replace(".md", "")
        # Look up current mtime for this page
        matching_files = [pf for pf in page_files if os.path.basename(pf).replace(".md", "") == page_key]
        mtime = 0
        if matching_files:
            try:
                mtime = os.path.getmtime(matching_files[0])
            except OSError:
                pass
        relevance_data["pages"][page_key] = {
            "relevance": r["relevance"],
            "reason": r.get("reason", ""),
            "problem_description": r.get("problem_description", ""),
            "facts": r.get("facts", []),
            "code_blocks": r.get("code_blocks", []),
            "screenshots": r.get("screenshots", []),
            "analyses": r.get("analyses", []),
            "action_items": r.get("action_items", []),
            "summary": r.get("summary", ""),
            "mtime": mtime,
        }

    return digest_md, relevance_data


def generate_onenote_digest(case_dir, case_number, project_root, base_url, api_key, model,
                            max_images_per_page=3, no_vision=False):
    """Generate onenote-digest.md from raw page files.

    ISS-228: Refactored to per-page parallel LLM classify + code merge.
    Mirrors Teams' per-chat parallel architecture (ISS-227).
    """
    from concurrent.futures import ThreadPoolExecutor, as_completed

    onenote_dir = os.path.join(case_dir, "onenote")
    if not os.path.isdir(onenote_dir):
        print("SKIP|no onenote/ dir")
        return

    # Read raw page files
    page_files = sorted(glob.glob(os.path.join(onenote_dir, "_page-*.md")))

    if not page_files:
        digest = f"# Personal OneNote Notes — Case {case_number}\n\n> Searched: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n> Matched pages: 0\n\nNo personal OneNote notes found for this case.\n"
        out_path = os.path.join(onenote_dir, "onenote-digest.md")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(digest)
        print(f"OK|empty|output={out_path}")
        return

    # Read case-info.md head for context (shared across all per-page calls)
    case_info_head = read_file(os.path.join(case_dir, "case-info.md"), max_chars=3000)

    # ── Incremental cache: skip unchanged pages using mtime from _page-relevance.json ──
    # If a page's mtime matches the cached value AND was previously classified,
    # reuse the cached result (no LLM call). Changed/new pages get re-classified.
    # This means a previously-empty "low" page that gets content WILL be re-scored
    # because its mtime changes when content is written.
    relevance_path = os.path.join(onenote_dir, "_page-relevance.json")
    prev_relevance = {}
    if os.path.exists(relevance_path):
        try:
            prev_relevance = json.load(open(relevance_path, encoding="utf-8"))
        except Exception:
            pass
    prev_pages = prev_relevance.get("pages", {})

    page_files_capped = page_files[:10]  # cap at 10 pages
    pages_to_classify = []
    cached_results = []

    for pf in page_files_capped:
        fn = os.path.basename(pf)
        page_key = fn.replace(".md", "")
        try:
            current_mtime = os.path.getmtime(pf)
        except OSError:
            current_mtime = 0

        cached = prev_pages.get(page_key, {})
        cached_mtime = cached.get("mtime", 0)

        if cached_mtime and abs(current_mtime - cached_mtime) < 1.0 and "relevance" in cached:
            # Page unchanged — reuse cached result (v2 format)
            cached_results.append({
                "filename": fn,
                "relevance": cached["relevance"],
                "reason": cached.get("reason", ""),
                "problem_description": cached.get("problem_description", ""),
                "facts": cached.get("facts", []),
                "screenshots": cached.get("screenshots", []),
                "analyses": cached.get("analyses", []),
                "action_items": cached.get("action_items", []),
                "summary": cached.get("summary", ""),
            })
            print(f"  {fn}: cached ({cached['relevance']})", file=sys.stderr)
        else:
            pages_to_classify.append(pf)

    # Per-page parallel LLM calls (only for changed/new pages)
    results = list(cached_results)
    max_workers = min(3, len(pages_to_classify)) if pages_to_classify else 0

    print(f"PARALLEL|pages={len(page_files_capped)}|cached={len(cached_results)}|classify={len(pages_to_classify)}|workers={max_workers}", file=sys.stderr)

    if pages_to_classify:
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(
                    classify_single_page,
                    pf, case_info_head, case_number, base_url, api_key, model,
                    max_images_per_page=max_images_per_page, no_vision=no_vision
                ): pf
                for pf in pages_to_classify
            }

            for future in as_completed(futures):
                pf = futures[future]
                try:
                    result = future.result()
                    if result:
                        results.append(result)
                        rel = result["relevance"]
                        fn = result["filename"]
                        print(f"  {fn}: {rel}", file=sys.stderr)
                except Exception as e:
                    fn = os.path.basename(pf)
                    print(f"  {fn}: ERROR {e}", file=sys.stderr)
                    results.append({
                        "filename": fn, "relevance": "low",
                        "reason": f"exception: {e}", "key_facts": [], "summary": ""
                    })

    # Sort results by filename for deterministic output
    results.sort(key=lambda r: r["filename"])

    # Merge all per-page results into digest + relevance (with Layer 2 synthesis)
    digest_md, relevance_data = merge_onenote_results(
        results, case_number, page_files,
        case_info_head=case_info_head, base_url=base_url, api_key=api_key, model=model,
    )

    # Write outputs
    out_path = os.path.join(onenote_dir, "onenote-digest.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(digest_md)

    relevance_path = os.path.join(onenote_dir, "_page-relevance.json")
    with open(relevance_path, "w", encoding="utf-8") as f:
        json.dump(relevance_data, f, indent=2, ensure_ascii=False)

    high_count = sum(1 for r in results if r["relevance"] == "high")
    print(f"OK|pages={len(page_files_capped)}|high={high_count}|output={out_path}|relevance={relevance_path}")


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
