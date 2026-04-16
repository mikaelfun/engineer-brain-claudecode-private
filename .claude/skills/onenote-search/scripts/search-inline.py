#!/usr/bin/env python3
"""
OneNote Case Search — CLI version for casework-light inline execution.

Searches personal OneNote notebook for case-specific notes using ripgrep (subprocess).
No LLM reasoning — pure keyword matching + file reading + structured output.

Usage:
    python3 search-inline.py --case-dir /path/to/case --notebook-dir /path/to/notebook --case-number 2603260030005229

Output:
    {caseDir}/onenote/personal-notes.md
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
        f"> Method: search-inline.py (keyword match, no LLM analysis)",
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
            lines.append(f"### {i}. {r['title']}")
            lines.append(f"- **Modified**: {r['modified']}")
            lines.append(f"- **Section**: {r['section']}")
            lines.append(f"- **Match**: {match_icon} (score={r['score']})")
            lines.append(f"- **Keywords**: {', '.join(r['keywords'])}")

            if r["snippets"]:
                lines.append("- **Relevant excerpts**:")
                for snippet in r["snippets"][:3]:
                    # Indent snippet, truncate long lines
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
            "This file was generated by `search-inline.py` (keyword matching only). "
            "For LLM-analyzed [fact]/[analysis] classification, use the onenote-case-search agent."
        )

    output = "\n".join(lines) + "\n"

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"OK|pages={count}|output={output_path}")


def main():
    args = parse_args()

    case_dir = args.case_dir
    notebook_dir = args.notebook_dir
    case_number = args.case_number

    # Validate notebook dir
    if not os.path.isdir(notebook_dir):
        print(f"SKIP|notebook_dir_not_found={notebook_dir}")
        # Write no-match file
        output_path = os.path.join(case_dir, "onenote", "personal-notes.md")
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
        output_path = os.path.join(case_dir, "onenote", "personal-notes.md")
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

    # Generate output
    output_path = os.path.join(case_dir, "onenote", "personal-notes.md")
    notebook_name = os.path.basename(notebook_dir)
    generate_output(case_number, notebook_name, results, output_path)


if __name__ == "__main__":
    main()
