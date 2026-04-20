#!/usr/bin/env python3
"""
OneNote Case Search — CLI version for casework-light inline execution.

Searches personal OneNote notebook for case-specific notes using ripgrep (subprocess).
No LLM reasoning — pure keyword matching + file reading + structured output.

Usage:
    python3 search-inline.py --case-dir /path/to/case --notebook-dir /path/to/notebook --case-number 2603260030005229

Output:
    {caseDir}/onenote/_search-log.md
"""

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="OneNote Case Search (inline CLI)")
    parser.add_argument("--case-dir", required=True, help="Case data directory")
    parser.add_argument("--notebook-dir", required=True, help="Personal OneNote notebook directory")
    parser.add_argument("--case-number", required=True, help="Case number to search for")
    parser.add_argument("--skip-assets", action="store_true", default=False,
                        help="Skip copying image assets (faster, no vision support)")
    return parser.parse_args()


def extract_identifiers(case_dir: str, case_number: str) -> dict:
    """Extract search identifiers from case-info.md."""
    identifiers = {
        "caseNumber": case_number,
        "customerName": "",
        "contactName": "",
        "contactEmail": "",
        "subscriptionIds": [],
        "resourceNames": [],
    }

    case_info_path = os.path.join(case_dir, "case-info.md")
    if not os.path.exists(case_info_path):
        return identifiers

    try:
        with open(case_info_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract customer/contact info
        patterns = {
            "customerName": [
                r"Customer Name\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
                r"Company\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
                r"Account Name\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
            ],
            "contactName": [
                r"Contact Name\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
                r"Primary Contact\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
            ],
            "contactEmail": [
                r"Contact Email\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
                r"Email\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
            ],
        }

        for field, pats in patterns.items():
            for pat in pats:
                m = re.search(pat, content, re.MULTILINE | re.IGNORECASE)
                if m:
                    val = m.group(1).strip().strip("|").strip()
                    if val and val.lower() not in ("n/a", "-", ""):
                        identifiers[field] = val
                        break

        # Extract subscription IDs (GUID format)
        sub_ids = re.findall(
            r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
            content,
            re.IGNORECASE,
        )
        identifiers["subscriptionIds"] = list(set(sub_ids))[:5]

        # Extract resource names (common patterns)
        resource_pats = [
            r"Resource Name\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
            r"Cluster Name\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
            r"VM Name\s*[|:]\s*(.+?)(?:\s*\||\s*$)",
        ]
        for pat in resource_pats:
            m = re.search(pat, content, re.MULTILINE | re.IGNORECASE)
            if m:
                val = m.group(1).strip().strip("|").strip()
                if val and val.lower() not in ("n/a", "-", ""):
                    identifiers["resourceNames"].append(val)

    except Exception as e:
        print(f"WARN: Failed to parse case-info.md: {e}", file=sys.stderr)

    return identifiers


def search_by_filename(notebook_dir: str, keywords: list) -> list:
    """Search for files whose names contain any keyword."""
    matches = []
    notebook_path = Path(notebook_dir)

    if not notebook_path.exists():
        return matches

    for md_file in notebook_path.rglob("*.md"):
        fname_lower = md_file.name.lower()
        for kw in keywords:
            if kw and kw.lower() in fname_lower:
                matches.append(
                    {"path": str(md_file), "matchType": "filename", "keyword": kw}
                )
                break  # One match per file is enough

    return matches


def search_by_content(notebook_dir: str, keywords: list) -> list:
    """Search file contents using ripgrep (rg) or fallback to grep."""
    matches = []

    for kw in keywords:
        if not kw or len(kw) < 2:
            continue

        try:
            # Try rg first
            result = subprocess.run(
                ["rg", "-l", "-i", "--glob", "*.md", kw, notebook_dir],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if result.returncode == 0:
                for line in result.stdout.strip().split("\n"):
                    if line.strip():
                        matches.append(
                            {
                                "path": line.strip(),
                                "matchType": "content",
                                "keyword": kw,
                            }
                        )
        except FileNotFoundError:
            # rg not available, try grep
            try:
                result = subprocess.run(
                    ["grep", "-rl", "-i", "--include=*.md", kw, notebook_dir],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                if result.returncode == 0:
                    for line in result.stdout.strip().split("\n"):
                        if line.strip():
                            matches.append(
                                {
                                    "path": line.strip(),
                                    "matchType": "content",
                                    "keyword": kw,
                                }
                            )
            except Exception:
                pass
        except subprocess.TimeoutExpired:
            print(f"WARN: Search timeout for keyword: {kw}", file=sys.stderr)
        except Exception as e:
            print(f"WARN: Search failed for keyword {kw}: {e}", file=sys.stderr)

    return matches


def deduplicate_and_rank(
    filename_matches: list, content_matches: list
) -> list:
    """Deduplicate and rank results. Filename matches rank higher."""
    file_scores = {}

    for m in filename_matches:
        p = os.path.normpath(m["path"])
        if p not in file_scores:
            file_scores[p] = {"path": p, "score": 0, "keywords": set(), "matchTypes": set()}
        file_scores[p]["score"] += 3  # Filename match bonus
        file_scores[p]["keywords"].add(m["keyword"])
        file_scores[p]["matchTypes"].add("filename")

    for m in content_matches:
        p = os.path.normpath(m["path"])
        if p not in file_scores:
            file_scores[p] = {"path": p, "score": 0, "keywords": set(), "matchTypes": set()}
        file_scores[p]["score"] += 1  # Content match
        file_scores[p]["keywords"].add(m["keyword"])
        file_scores[p]["matchTypes"].add("content")

    ranked = sorted(file_scores.values(), key=lambda x: x["score"], reverse=True)
    return ranked[:10]


def parse_frontmatter(content: str) -> dict:
    """Extract YAML frontmatter fields."""
    fm = {}
    match = re.match(r"^[\ufeff]?---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if match:
        for line in match.group(1).split("\n"):
            if ":" in line:
                key, _, val = line.partition(":")
                val = val.strip().strip('"').strip("'")
                fm[key.strip()] = val
    return fm


def extract_section_path(filepath: str, notebook_dir: str) -> str:
    """Extract notebook section path from file path."""
    rel = os.path.relpath(filepath, notebook_dir)
    parts = Path(rel).parts
    if len(parts) >= 2:
        section = "/".join(parts[:-1])
        # Clean up =====...===== decorators
        section = re.sub(r"={3,}\s*", "", section)
        section = re.sub(r"\s*={3,}", "", section)
        return section.strip()
    return ""


def extract_relevant_snippets(content: str, keywords: list, max_snippets: int = 5) -> list:
    """Extract lines containing keywords as relevant snippets."""
    snippets = []
    lines = content.split("\n")

    for i, line in enumerate(lines):
        line_lower = line.lower()
        for kw in keywords:
            if kw and kw.lower() in line_lower:
                # Get context: 1 line before, the line, 1 line after
                start = max(0, i - 1)
                end = min(len(lines), i + 2)
                snippet = "\n".join(lines[start:end]).strip()
                if snippet and snippet not in snippets:
                    snippets.append(snippet)
                    break

        if len(snippets) >= max_snippets:
            break

    return snippets


def read_and_analyze(
    ranked_files: list, notebook_dir: str, keywords: list
) -> list:
    """Read top files and extract findings."""
    results = []

    for entry in ranked_files[:5]:
        filepath = entry["path"]
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"WARN: Cannot read {filepath}: {e}", file=sys.stderr)
            continue

        fm = parse_frontmatter(content)
        section = extract_section_path(filepath, notebook_dir)
        title = fm.get("title", Path(filepath).stem)
        modified = fm.get("modified", fm.get("created", fm.get("date", "unknown")))

        # Remove frontmatter for snippet extraction
        body = re.sub(r"^---\s*\n.*?\n---\s*\n", "", content, flags=re.DOTALL)

        kw_list = list(entry.get("keywords", set()))
        snippets = extract_relevant_snippets(body, kw_list + keywords)

        results.append(
            {
                "path": filepath,
                "title": title,
                "modified": modified,
                "section": section,
                "matchTypes": list(entry.get("matchTypes", set())),
                "keywords": kw_list,
                "score": entry.get("score", 0),
                "snippets": snippets,
                "bodyPreview": body[:500] if not snippets else "",
                "body": body,  # ISS-221: preserve raw page content for downstream LLM analysis
            }
        )

    return results


def generate_output(
    case_number: str,
    notebook_name: str,
    results: list,
    output_path: str,
):
    """Generate structured markdown output."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    count = len(results)

    lines = [
        f"# Personal OneNote Notes — Case {case_number}",
        "",
        f"> Searched: {now} | Source: {notebook_name}",
        f"> Matched pages: {count}",
        f"> Method: search-inline.py (keyword match + raw page copy)",
        f"> Raw pages: onenote/_page-*.md ({count} file{'s' if count != 1 else ''})",
        "",
    ]

    if count == 0:
        lines.append("No personal OneNote notes found for this case.")
    else:
        lines.append("## Matched Pages")
        lines.append("")

        for i, r in enumerate(results, 1):
            match_icon = (
                "filename+content"
                if "filename" in r["matchTypes"] and "content" in r["matchTypes"]
                else (
                    "filename" if "filename" in r["matchTypes"] else "content"
                )
            )
            safe_name = re.sub(r'[<>:"/\\|?*]', '_', r["title"])[:80] + ".md"
            lines.append(f"### {i}. {r['title']}")
            lines.append(f"- **Modified**: {r['modified']}")
            lines.append(f"- **Section**: {r['section']}")
            lines.append(f"- **Match**: {match_icon} (score={r['score']})")
            lines.append(f"- **Keywords**: {', '.join(r['keywords'])}")
            lines.append(f"- **Raw page**: `onenote/_page-{safe_name}.md`")

            if r["snippets"]:
                lines.append("- **Relevant excerpts**:")
                for snippet in r["snippets"][:5]:
                    for sl in snippet.split("\n"):
                        truncated = sl[:200] + "..." if len(sl) > 200 else sl
                        lines.append(f"  > {truncated}")
            elif r["bodyPreview"]:
                lines.append("- **Preview**:")
                for sl in r["bodyPreview"].split("\n")[:5]:
                    truncated = sl[:200] + "..." if len(sl) > 200 else sl
                    lines.append(f"  > {truncated}")

            lines.append("")

        lines.append("## Note")
        lines.append(
            "Raw page files are copied to `onenote/_page-*.md` for downstream LLM analysis. "
            "Assess or onenote-classifier can read these files to produce [fact]/[analysis] classification."
        )

    output = "\n".join(lines) + "\n"

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"OK|pages={count}|output={output_path}")


def _copy_page_assets(copied_pages, onenote_dir):
    """ISS-224: Copy referenced image assets from OneNote Export source to case onenote/assets/.

    For each copied _page-*.md:
    1. Scan for ![...](assets/xxx.png) references
    2. Resolve source image path = dirname(original_source_path)/assets/filename
    3. Copy to {onenote_dir}/assets/{safe_name}_{filename} (de-duplicated by page name)
    4. Rewrite image paths in the copied markdown to match new filenames

    Args:
        copied_pages: list of (dest_path, source_path, safe_name)
        onenote_dir: target onenote directory in case dir

    Returns:
        int: total number of asset files copied
    """
    import shutil
    img_pattern = re.compile(r'!\[([^\]]*)\]\((?:\./)?assets/([^)]+)\)')
    assets_dir = os.path.join(onenote_dir, "assets")
    total_copied = 0

    for dest_path, source_path, safe_name in copied_pages:
        try:
            with open(dest_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
        except Exception:
            continue

        matches = img_pattern.findall(content)
        if not matches:
            continue

        # Ensure assets directory exists
        os.makedirs(assets_dir, exist_ok=True)

        # Source assets directory = sibling of the source .md file
        source_assets_dir = os.path.join(os.path.dirname(source_path), "assets")

        new_content = content
        for alt_text, img_filename in matches:
            src_img = os.path.join(source_assets_dir, img_filename)
            if not os.path.isfile(src_img):
                continue

            # De-duplicate: prefix with page safe_name to avoid collisions
            dest_filename = f"{safe_name}_{img_filename}"
            dest_img = os.path.join(assets_dir, dest_filename)

            try:
                # ISS-226: Cache check — skip if file exists with same size
                if os.path.isfile(dest_img):
                    src_size = os.path.getsize(src_img)
                    dst_size = os.path.getsize(dest_img)
                    if src_size == dst_size:
                        # Replace both ./assets/ and assets/ variants
                        for prefix in ["./assets/", "assets/"]:
                            old_ref = f"![{alt_text}]({prefix}{img_filename})"
                            new_ref = f"![{alt_text}](assets/{dest_filename})"
                            new_content = new_content.replace(old_ref, new_ref)
                        continue
                shutil.copy2(src_img, dest_img)
                total_copied += 1
            except Exception as e:
                print(f"WARN: Cannot copy asset {img_filename}: {e}", file=sys.stderr)
                continue

            # Rewrite path in markdown
            for prefix in ["./assets/", "assets/"]:
                old_ref = f"![{alt_text}]({prefix}{img_filename})"
                new_ref = f"![{alt_text}](assets/{dest_filename})"
                new_content = new_content.replace(old_ref, new_ref)

        # Write back updated markdown if any paths changed
        if new_content != content:
            try:
                with open(dest_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
            except Exception as e:
                print(f"WARN: Cannot update paths in {dest_path}: {e}", file=sys.stderr)

    return total_copied


def main():
    args = parse_args()

    case_dir = args.case_dir
    notebook_dir = args.notebook_dir
    case_number = args.case_number

    # Validate notebook dir
    if not os.path.isdir(notebook_dir):
        print(f"SKIP|notebook_dir_not_found={notebook_dir}")
        # Write no-match file
        output_path = os.path.join(case_dir, "onenote", "_search-log.md")
        generate_output(
            case_number,
            os.path.basename(notebook_dir),
            [],
            output_path,
        )
        return

    # Check for .md files
    md_files = list(Path(notebook_dir).rglob("*.md"))
    if not md_files:
        print(f"SKIP|no_md_files_in={notebook_dir}")
        output_path = os.path.join(case_dir, "onenote", "_search-log.md")
        generate_output(
            case_number,
            os.path.basename(notebook_dir),
            [],
            output_path,
        )
        return

    # Extract identifiers
    identifiers = extract_identifiers(case_dir, case_number)

    # Build keyword list (non-empty, unique)
    keywords = [case_number]
    if identifiers["customerName"]:
        keywords.append(identifiers["customerName"])
    if identifiers["contactName"]:
        keywords.append(identifiers["contactName"])
    for sub_id in identifiers["subscriptionIds"][:2]:
        keywords.append(sub_id)
    for rn in identifiers["resourceNames"][:2]:
        keywords.append(rn)

    # Deduplicate
    seen = set()
    unique_keywords = []
    for kw in keywords:
        kw_lower = kw.lower()
        if kw_lower not in seen and len(kw) >= 2:
            seen.add(kw_lower)
            unique_keywords.append(kw)

    print(f"SEARCH|keywords={unique_keywords}", file=sys.stderr)

    # Search
    filename_matches = search_by_filename(notebook_dir, unique_keywords)
    content_matches = search_by_content(notebook_dir, unique_keywords)

    # Rank
    ranked = deduplicate_and_rank(filename_matches, content_matches)

    # Read and analyze
    results = read_and_analyze(ranked, notebook_dir, unique_keywords)

    # ISS-221: Copy raw page .md files to {caseDir}/onenote/ for downstream LLM analysis.
    # Copies the matched page AND any subpages (same-name directory with child .md files).
    # OneNote Export structure: "PageName.md" + optional "PageName/" dir with child pages.
    onenote_dir = os.path.join(case_dir, "onenote")
    skip_assets = args.skip_assets
    if results:
        os.makedirs(onenote_dir, exist_ok=True)
        import shutil

        # ISS-224: Track all copied pages for asset processing
        copied_pages = []  # list of (dest_path, source_path, safe_name)

        for r in results:
            safe_name = re.sub(r'[<>:"/\\|?*]', '_', r["title"])[:80]

            # Copy main page
            page_dest = os.path.join(onenote_dir, f"_page-{safe_name}.md")
            try:
                shutil.copy2(r["path"], page_dest)
                copied_pages.append((page_dest, r["path"], safe_name))
            except Exception as e:
                print(f"WARN: Cannot copy page to {page_dest}: {e}", file=sys.stderr)

            # Check for subpage directory (same name as file without .md extension)
            page_dir = r["path"].rsplit(".", 1)[0]  # /path/to/PageName.md → /path/to/PageName
            if os.path.isdir(page_dir):
                subpages = [f for f in os.listdir(page_dir) if f.endswith(".md")]
                for sp in subpages:
                    sp_path = os.path.join(page_dir, sp)
                    sp_safe = re.sub(r'[<>:"/\\|?*]', '_', sp.rsplit(".", 1)[0])[:60]
                    sp_dest = os.path.join(onenote_dir, f"_page-{safe_name}--{sp_safe}.md")
                    try:
                        shutil.copy2(sp_path, sp_dest)
                        copied_pages.append((sp_dest, sp_path, f"{safe_name}--{sp_safe}"))
                    except Exception as e:
                        print(f"WARN: Cannot copy subpage to {sp_dest}: {e}", file=sys.stderr)
                print(f"OK|subpages={len(subpages)}|parent={safe_name}", file=sys.stderr)

        # ISS-224: Copy referenced image assets and rewrite paths in copied markdown
        if not skip_assets:
            total_assets = _copy_page_assets(copied_pages, onenote_dir)
            if total_assets > 0:
                print(f"OK|assets_copied={total_assets}", file=sys.stderr)

    # Generate output
    output_path = os.path.join(case_dir, "onenote", "_search-log.md")
    notebook_name = os.path.basename(notebook_dir)

    # (delta計算已下移，使用 onenote/_search-state.json 作為權威來源)

    generate_output(case_number, notebook_name, results, output_path)

    # Delta calculation — compare against onenote/_search-state.json (authoritative).
    # Root cause of the old bug: we diffed "Matched pages: N" header counts, which
    # hides content updates on existing pages (mtime bumps don't change the count).
    # New contract: state file stores {path: mtime_iso} per matched page. Deltas:
    #   newPages     = path not in prev state
    #   updatedPages = path in prev state AND mtime changed
    # Classifier trigger downstream uses (newPages + updatedPages) — modifying an
    # already-matched page must re-run classification.
    state_path = os.path.join(case_dir, "onenote", "_search-state.json")
    prev_state = {}
    try:
        if os.path.exists(state_path):
            with open(state_path, "r", encoding="utf-8") as sf:
                prev_state = json.load(sf) or {}
    except Exception:
        prev_state = {}

    current_state = {}
    new_pages = 0
    updated_pages = 0
    for r in results:
        p = os.path.normpath(r["path"])
        try:
            mtime_iso = datetime.fromtimestamp(os.path.getmtime(p)).isoformat(timespec="seconds")
        except OSError:
            mtime_iso = ""
        current_state[p] = mtime_iso
        prev_mtime = prev_state.get(p)
        if prev_mtime is None:
            new_pages += 1
        elif prev_mtime != mtime_iso:
            updated_pages += 1

    try:
        os.makedirs(os.path.dirname(state_path), exist_ok=True)
        with open(state_path, "w", encoding="utf-8") as sf:
            json.dump(current_state, sf, ensure_ascii=False, indent=2)
    except OSError:
        pass

    # EVENT_DELTA_FILE contract (casework v2 event-wrapper.sh): if running under
    # event-wrapper, write delta JSON to the env-provided path. Wrapper validates
    # + merges into completed event. Silent best-effort — unset env = legacy path.
    delta_file = os.environ.get("EVENT_DELTA_FILE")
    if delta_file:
        try:
            total_pages = len(results)
            with open(delta_file, "w", encoding="utf-8") as df:
                json.dump({
                    "newPages": new_pages,
                    "updatedPages": updated_pages,
                    "totalPages": total_pages,
                    "keywords": unique_keywords[:5],
                }, df)
        except OSError:
            pass


if __name__ == "__main__":
    main()
