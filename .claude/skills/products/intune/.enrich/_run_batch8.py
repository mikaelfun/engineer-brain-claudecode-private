#!/usr/bin/env python3
"""Batch 8: Fetch 366 ContentIdea work items, strip HTML, write JSONL + scanned JSON."""
import json, os, re, subprocess, sys, time
from datetime import datetime

BASE = os.path.dirname(os.path.abspath(__file__))
BATCH_FILE = os.path.join(BASE, "_batch_8.json")
OUT_JSONL  = os.path.join(BASE, "known-issues-contentidea-kb-batch8.jsonl")
OUT_SCAN   = os.path.join(BASE, "scanned-contentidea-kb-batch8.json")

PROJECT_ROOT = os.path.abspath(os.path.join(BASE, "../../../../.."))
with open(os.path.join(PROJECT_ROOT, "config.json")) as _f:
    _cfg = json.load(_f)

ORG = "https://dev.azure.com/ContentIdea"
RESOURCE = "499b84ac-1321-427f-aa17-267ca6975798"
FIELDS = ",".join([
    "System.Title",
    "System.Tags",
    "System.Description",
    "ECO.CI.CI.HelpArticleSummarySymptom",
    "ECO.CI.CI.HelpArticleCause",
    "ECO.CI.CI.HelpArticleResolution",
    "ECO.CI.CI.HelpArticleMoreInfo",
    "ECO.CI.CI.HelpArticleType",
    "ECO.CI.CI.AppliesToProducts",
    "ECO.CI.KBArticleNumbers",
    "ECO.CI.CI.Keyword",
])
API_VER = "7.0"
CHUNK = 200
DATE = "2026-04-17"
AZURE_CONFIG_DIR = os.path.join(_cfg["azProfilesRoot"], _cfg["azProfile"]["global"])
ID_PREFIX = "intune-contentidea-kb-b8"


def strip_html(html_str):
    if not html_str:
        return ""
    s = re.sub(r"<img[^>]*>", "", html_str)
    s = re.sub(r"<br\s*/?>|</div>|</p>|</li>|</tr>", "\n", s, flags=re.I)
    s = re.sub(r"<li[^>]*>", "- ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    entities = [
        ("&nbsp;", " "), ("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
        ("&quot;", '"'), ("&#39;", "'"), ("&apos;", "'"),
        ("&#160;", " "), ("&rsquo;", "\u2019"), ("&lsquo;", "\u2018"),
        ("&rdquo;", "\u201d"), ("&ldquo;", "\u201c"), ("&ndash;", "\u2013"),
        ("&mdash;", "\u2014"), ("&bull;", "\u2022"), ("&hellip;", "\u2026"),
    ]
    for ent, ch in entities:
        s = s.replace(ent, ch)
    s = re.sub(r"&#(\d+);", lambda m: chr(int(m.group(1))), s)
    s = re.sub(r"&#x([0-9a-fA-F]+);", lambda m: chr(int(m.group(1), 16)), s)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n\s*\n+", "\n\n", s)
    return s.strip()


def fetch_chunk(ids_chunk):
    ids_str = ",".join(ids_chunk)
    url = f"{ORG}/_apis/wit/workitems?ids={ids_str}&fields={FIELDS}&api-version={API_VER}"
    env = os.environ.copy()
    env["AZURE_CONFIG_DIR"] = AZURE_CONFIG_DIR
    result = subprocess.run(
        ["az", "rest", "--method", "get", "--resource", RESOURCE, "--url", url],
        capture_output=True, text=True, env=env, timeout=120
    )
    if result.returncode != 0:
        print(f"  [ERROR] az rest failed: {result.stderr[:300]}", file=sys.stderr)
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as e:
        print(f"  [ERROR] JSON parse failed: {e}", file=sys.stderr)
        return None


def make_entry(seq, wi):
    f = wi.get("fields", {})
    wi_id = str(wi.get("id", ""))
    symptom_html = f.get("ECO.CI.CI.HelpArticleSummarySymptom", "") or ""
    cause_html = f.get("ECO.CI.CI.HelpArticleCause", "") or ""
    resol_html = f.get("ECO.CI.CI.HelpArticleResolution", "") or ""
    desc_html = f.get("System.Description", "") or ""

    symptom = strip_html(symptom_html)
    root_cause = strip_html(cause_html)
    solution = strip_html(resol_html)

    if not symptom:
        symptom = f.get("System.Title", "") or ""
        if not symptom:
            symptom = strip_html(desc_html)

    kb_numbers = f.get("ECO.CI.KBArticleNumbers", "") or ""
    source_url = f"https://support.microsoft.com/kb/{kb_numbers}" if kb_numbers else ""

    tags = []
    article_type = f.get("ECO.CI.CI.HelpArticleType", "") or ""
    if article_type:
        tags.append(article_type.lower().replace(" ", "-").replace("/", "-"))
    keyword = f.get("ECO.CI.CI.Keyword", "") or ""
    if keyword and len(keyword) < 80:
        tags.append(keyword)
    tags.append("contentidea-kb")

    return {
        "id": f"{ID_PREFIX}-{seq:03d}",
        "date": DATE,
        "symptom": symptom,
        "rootCause": root_cause,
        "solution": solution,
        "source": "contentidea-kb",
        "sourceRef": f"ContentIdea#{wi_id}",
        "sourceUrl": source_url,
        "product": "intune",
        "confidence": "medium",
        "quality": "raw",
        "tags": tags,
        "21vApplicable": True,
        "promoted": False,
    }


def main():
    with open(BATCH_FILE, "r") as fp:
        all_ids = json.load(fp)
    print(f"[batch8] Total IDs to process: {len(all_ids)}")
    discovered = 0
    skipped = 0
    scanned_ids = []
    entries = []
    seq = 0
    chunks = [all_ids[i:i + CHUNK] for i in range(0, len(all_ids), CHUNK)]
    print(f"[batch8] {len(chunks)} API chunks of up to {CHUNK} IDs each")
    for ci, chunk in enumerate(chunks):
        print(f"[batch8] Fetching chunk {ci + 1}/{len(chunks)} ({len(chunk)} IDs)...")
        data = fetch_chunk(chunk)
        if data is None:
            print(f"  [WARN] Chunk {ci + 1} failed, marking {len(chunk)} as skipped")
            skipped += len(chunk)
            scanned_ids.extend(chunk)
            continue
        wi_list = data.get("value", [])
        fetched_ids = {str(w["id"]) for w in wi_list}
        for rid in chunk:
            if rid not in fetched_ids:
                skipped += 1
                scanned_ids.append(rid)
        for wi in wi_list:
            wi_id = str(wi.get("id", ""))
            scanned_ids.append(wi_id)
            f = wi.get("fields", {})
            symptom_html = f.get("ECO.CI.CI.HelpArticleSummarySymptom", "") or ""
            cause_html = f.get("ECO.CI.CI.HelpArticleCause", "") or ""
            resol_html = f.get("ECO.CI.CI.HelpArticleResolution", "") or ""
            title = f.get("System.Title", "") or ""
            has_content = bool(
                strip_html(symptom_html) or strip_html(cause_html)
                or strip_html(resol_html) or title
            )
            if not has_content:
                skipped += 1
                continue
            seq += 1
            entry = make_entry(seq, wi)
            entries.append(entry)
            discovered += 1
        if ci < len(chunks) - 1:
            time.sleep(1)
    with open(OUT_JSONL, "w", encoding="utf-8") as fp:
        for e in entries:
            fp.write(json.dumps(e, ensure_ascii=False) + "\n")
    with open(OUT_SCAN, "w", encoding="utf-8") as fp:
        json.dump({
            "scanned": scanned_ids,
            "lastRefreshed": datetime.now().astimezone().isoformat(),
        }, fp, indent=2)
    print()
    print("=" * 50)
    print("[batch8] DONE")
    print(f"  discovered:      {discovered}")
    print(f"  skipped:         {skipped}")
    print(f"  total_processed: {discovered + skipped}")
    print(f"  JSONL written:   {OUT_JSONL}")
    print(f"  Scanned written: {OUT_SCAN}")


if __name__ == "__main__":
    main()
