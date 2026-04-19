# ADO Wiki Source Adapter

> Per-product adapter. Discovers and extracts knowledge from ADO Wiki TSG pages.
> Rules reference: `../shared-rules.md`
> Supports two concurrency modes: standard (sequential) and parallel (sliding window).

---

## Discovery

### Product-to-Wiki Mapping

Read `playbooks/product-registry.json → podProducts[product].adoWikis` for the wiki list.
Each entry contains `org`, `project`, optional `wiki` (wiki name; default = first wiki in the project).

Empty array → return `exhausted: true` immediately.

### Scope Filtering

Scope rules live in `.claude/skills/products/{product}/.enrich/wiki-scope.json` (NOT in config.json):

```json
{
  "scopes": [
    {"wikiKey": "Supportability/AzureAD", "pathScope": ["/Authentication"], "excludeScope": ["/Sandbox"]}
  ]
}
```

- `pathScope`: path prefix whitelist — only index leaf pages under these subtrees
- `excludeScope`: path prefix blacklist — exclude matching leaf pages
- Match by `wikiKey` (`{org}/{project}` or `{org}/{project}/{wiki}`) against each wiki entry
- File not found → no filtering, keep all leaf pages
- Order: include first, exclude second

### Page Tree Enumeration

For each adoWiki entry, recursively enumerate the full page tree:

```powershell
pwsh -NoProfile -Command '
  $org = "{org}"; $project = "{project}"; $wikiName = "{wikiName}"
  $pages = az devops invoke --area wiki --resource pages `
    --route-parameters project="$project" wikiIdentifier="$wikiName" `
    --org "https://dev.azure.com/$org" --api-version "7.0" `
    --query-parameters recursionLevel=full --http-method GET -o json 2>$null | ConvertFrom-Json
  function Get-Leaves($page) {
    if (-not $page.subPages -or $page.subPages.Count -eq 0) {
      if ($page.path -ne "/") { Write-Output "$($page.path)" }
    }
    foreach ($sub in $page.subPages) { Get-Leaves $sub }
  }
  $prefix = "$org/$project/${wikiName}:"
  Get-Leaves $pages | ForEach-Object { "$prefix$_" } | ConvertTo-Json
'
```

### Key Format

Every index entry is a string key: `{org}/{project}/{wikiName}:{path}`

Example: `Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Disk/TSG`

> **Key Validation**: every index entry **must** contain `:` separator.
> If a key lacks `:`, the prefix was missing — fix before writing.
> Common error: using `$page.path` (wiki-relative) without prepending `{org}/{project}/{wikiName}:`.

### pathScope Filtering (post-prefix)

Apply scope filtering **after** prefix concatenation, on the path portion (after `:`):

```python
scope_file = f'.claude/skills/products/{product}/.enrich/wiki-scope.json'
pathScope, excludeScope = None, None
if os.path.exists(scope_file):
    with open(scope_file) as f:
        scopes = json.load(f).get('scopes', [])
    wiki_key = f'{org}/{project}'  # or f'{org}/{project}/{wikiName}'
    for s in scopes:
        if s['wikiKey'] in wiki_key or wiki_key in s['wikiKey']:
            pathScope = s.get('pathScope')
            excludeScope = s.get('excludeScope')
            break

if pathScope:
    full_keys = [k for k in full_keys if any(k.split(":", 1)[1].startswith(scope) for scope in pathScope)]
if excludeScope:
    full_keys = [k for k in full_keys if not any(k.split(":", 1)[1].startswith(ex) for ex in excludeScope)]
```

### Index File Structure

Write to `.enrich/scanned-ado-wiki.json`:

```json
{
  "index": [
    "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/...",
    "Supportability/AzureIaaSVM/AzureIaaSVM:/Announcements/..."
  ],
  "scanned": [],
  "skipped": [],
  "lastRefreshed": "2026-04-19T00:00:00+00:00"
}
```

> Index entries are **string keys only**. Dict format (`{"org":"...","path":"..."}`) is forbidden.
> Exception: entries with cached `length` use `{"path": "full-string-key", "length": 1234}`.
> If entry is a plain string → length unknown.

First run only builds the index (no content extraction). Returns `{discovered: 0, exhausted: false, summary: "indexed N pages"}`.

### Wiki Name Resolution

- If adoWikis config has `wiki` field → use that value
- Otherwise → call `az devops wiki list` to get the project's wiki list, take the first one

### Multi-Wiki Handling

Some products have multiple wikis (e.g. entra-id has AzureAD + WindowsDirectoryServices).
Crawl each wiki separately, merge all leaf pages into the same index.

### Super-Large Wiki Handling

If `recursionLevel=full` returns oversized JSON (e.g. entra-id 4000+ pages),
crawl in segments: first `oneLevel` for top-level nodes, then `full` for each top-level node.

---

## Content Reading

### REST API Requirement

**MUST use REST API + `includeContent=true`** for all content reads.

**Reason**: `az devops wiki page show` returns empty `content: ""` for codeWiki type wikis (the majority).
Only projectWiki works with `az devops wiki page show`. REST API works for both types.

```bash
# Universal content read command (works for both codeWiki and projectWiki)
encoded_path=$(python3 -c "import urllib.parse; print(urllib.parse.quote('{pagePath}'))")
MSYS_NO_PATHCONV=1 az rest --method get \
  --url "https://dev.azure.com/{org}/{project}/_apis/wiki/wikis/{wikiName}/pages?path=${encoded_path}&includeContent=true&api-version=7.1" \
  --resource "499b84ac-1321-427f-aa17-267ca6975798" \
  --output json
```

The `content` field in the response JSON contains the full page text (Markdown).
`path` must be URL-encoded (spaces → `%20`, `&` → `%26`, etc.).
Wiki name can be used directly (no wiki ID needed).

> **Rule**: `az devops wiki page show` is ONLY used for page tree enumeration (`--recursion full`, no content read).
> Content reading always goes through REST API above.

### Wiki Types Reference

| Wiki type | `az devops wiki page show` | REST API |
|-----------|---------------------------|----------|
| projectWiki | content works | content works |
| codeWiki | **empty content** | content works |

---

## Extract Logic

Uses dual-track extraction (see `../shared-rules.md` for format, dedup, and file write rules).

### Track A — Break/Fix

- Extract `symptom/rootCause/solution` triples (0-5 per page)
- Dedup → append `.enrich/known-issues-ado-wiki.jsonl`
- Standard JSONL entry format per shared-rules.md
- ID format: `{product}-ado-wiki-{seq:03d}` (seq from max existing ado-wiki seq + 1)
- `sourceRef`: `{org}/{project}/{wikiName}:{pagePath}`
- `sourceUrl`: `https://dev.azure.com/{org}/{project}/_wiki/wikis/{wikiName}?pagePath={urlEncodedPath}`

### Track B — Troubleshooting Guide

- Save as `guides/drafts/ado-wiki-{sanitized-title}.md`
- **No JSONL entry** — draft files are self-contained via frontmatter
- SYNTHESIZE stage discovers drafts by scanning `guides/drafts/`

**Draft frontmatter**:
```yaml
---
source: ado-wiki
sourceRef: "{org}/{project}/{wikiName}:{pagePath}"
sourceUrl: "https://dev.azure.com/..."
importDate: "YYYY-MM-DD"
type: guide-draft
---
```

**Draft dedup (pre-write check)**:
```bash
existing=$(grep -rl 'sourceRef: "{sourceRef}"' .claude/skills/products/{product}/guides/drafts/ 2>/dev/null | head -1)
```
- Already exists and larger → skip this write
- Already exists but smaller → overwrite
- Does not exist → write new draft

### Skip Criteria (no JSONL, no draft)

- Internal team processes / management docs (case routing, on-call rotation, training plans, wiki editing guides, team RACI)
- Pure link / redirect pages (only external links or "see also" pointing elsewhere)
- Training recordings / video catalog pages (only video link lists, no text troubleshooting content)
- Empty placeholder pages / Sandbox / test pages
- Announcements / news / newsletter pages
- Pure HR / admin content (leave process, onboarding guide, strategic customer relationship management)

### LLM Classification Prompt

> **First check Skip** — if the page is internal team process (case routing, on-call, RACI, training plans,
> wiki formatting guides, strategic customer management processes, news/announcements), skip directly.
>
> If not Skip, determine Track A vs Track B:
> - Can extract at least one complete symptom + (rootCause or solution) → **Track A**
> - Entire page is a branching troubleshooting flow, operations manual, or **technical** reference table (customer-facing) → **Track B**
> - Internal management / admin / training / announcements → **Skip** (not Track B)

### 21V Marking

Read `21v-gaps.json`:
- Solution involves unsupported feature → add tag `"21v-unsupported"`, set `21vApplicable: false`

---

## Concurrency Modes

The orchestrator decides which mode to use. This adapter implements both.

**Mode selection guideline**:
- `unscanned < 50 pages` → Standard mode (sequential)
- `unscanned >= 50 pages` → Parallel mode (sliding window)

### Standard Mode (default)

Sequential page processing from the index. One agent processes pages in batches.

#### Dynamic Batch Allocation

**Step 2a — Pre-read page sizes (progressive caching)**:

Check `.enrich/scanned-ado-wiki.json → index` for existing `length` fields:
- Entry has length → use cached value, skip API call
- Entry lacks length → take up to 20 entries, batch-fetch content lengths via REST API:

```bash
for path in "${paths[@]}"; do
  encoded_path=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$path'))")
  content_len=$(MSYS_NO_PATHCONV=1 az rest --method get \
    --url "https://dev.azure.com/{org}/{project}/_apis/wiki/wikis/{wikiName}/pages?path=${encoded_path}&includeContent=true&api-version=7.1" \
    --resource "499b84ac-1321-427f-aa17-267ca6975798" \
    --output json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('content','')))" 2>/dev/null || echo "0")
  echo "$path|$content_len"
done
```

**Cache write-back**: Write pre-read lengths back to index entries.
Index entries upgrade from string `"org/project/wiki:path"` to object `{"path": "org/project/wiki:path", "length": 1234}`.
- `path` field must retain the **full key** (with prefix), not wiki-relative path
- Backward compatible: plain string entry = length unknown

**Step 2b — Batch by total character count**:
- Accumulate `length` values in order
- **Cumulative ≤ 15,000 chars** → keep adding pages
- **Cumulative > 15,000** → stop, batch ends here
- **Min 1 page, max 10 pages** per batch
- length=0 pages (empty/parent) don't count toward char limit but count toward batch

**Step 2c — Read full content**:

Only read pages selected in Step 2b. **No content truncation** — dynamic allocation ensures total chars fit agent token budget.

```bash
encoded_path=$(python3 -c "import urllib.parse; print(urllib.parse.quote('{pagePath}'))")
MSYS_NO_PATHCONV=1 az rest --method get \
  --url "https://dev.azure.com/{org}/{project}/_apis/wiki/wikis/{wikiName}/pages?path=${encoded_path}&includeContent=true&api-version=7.1" \
  --resource "499b84ac-1321-427f-aa17-267ca6975798" \
  --output json 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin).get('content',''))"
```

- Empty content → skip (parent page), still mark as scanned
- **Pre-read failure fallback**: if REST API fails, fall back to fixed 3 pages/batch (no truncation)

#### Standard Mode Post-Processing

1. Apply dual-track extraction (see Extract Logic above)
2. Update `.enrich/scanned-ado-wiki.json` — append processed paths to `scanned`
3. **Must update `lastRefreshed`** to current timestamp (ISO format) — without this, new wiki pages are never discovered
4. Scanned entries use the same full key format as index
5. Append `.enrich/evolution-log.md`
6. Check exhausted: `index - scanned - skipped = empty` → `exhausted: true`

### Parallel Mode (for large wikis)

Sliding window with claimed set. Multiple agents process batches concurrently.

#### Core Mechanism: Sliding Window + Claimed Set

```
[A]──done→merge→claim new→spawn[A']──done→merge→[A'']...
[B]──────done→merge→claim new→spawn[B']──────done→...
[C]────────done→merge→claim new→spawn[C']────...
```

**Core rule**: each agent merges + respawns immediately on completion. No waiting for other batches.

#### Claimed Set

**File**: `.enrich/claimed-pages.json`

```json
{
  "pages": [
    "Supportability/AzureAD/AzureAD:/path/to/page1",
    "Supportability/AzureAD/AzureAD:/path/to/page2"
  ],
  "lastUpdated": "2026-04-05T12:00:00Z"
}
```

**Lifecycle**:
1. **Pre-spawn**: append assigned pages to `claimed-pages.json`
2. **On merge**: agent done → merge scanned → remove merged pages from claimed
3. **Unscanned calc**: `unscanned = index - scanned - skipped - claimed`
4. **Session recovery**: if claimed has pages but no corresponding running agent → clear claimed (orphan from interrupted session)

#### Dynamic Batch Size

Per-product batch size based on historical success rates:

| Product | Default batch size | Reason |
|---------|-------------------|--------|
| aks, purview, eop | 10 | Short pages, 100% success |
| vm, arm | 8 | Some large pages (Azure Files TSGs, Stack Hub) |
| entra-id | 6 | Rich content (B2C/SAML multi-subissue) |
| avd | 5 | Emoji paths consume extra turns |
| defender | 5 | Zero-width-space paths + large pages |

Read from `playbooks/product-registry.json → podProducts[product].blastBatchSize` (if present), otherwise use table defaults.

#### Write-Early Strategy

> **Critical principle**: prevent context exhaustion from losing output.
> Execution order is strictly: **1 write scanned → 2 read pages → 3 write JSONL → 4 write drafts**.
> scanned + JSONL are core outputs; guide drafts are nice-to-have.

1. **Write scanned file immediately** (before reading any page content):
   ```bash
   PYTHONUTF8=1 python3 -c "
   import json
   scanned = [...]  # pagesToProcess as-is
   with open('.claude/skills/products/{product}/.enrich/blast-temp/scanned-ado-wiki-{batchId}.json', 'w') as f:
       f.write(json.dumps(scanned, ensure_ascii=True))
   print(f'Scanned file written: {len(scanned)} pages')
   "
   ```
   > This ensures pages are marked scanned even if context is exhausted later — no duplicate assignment.

2. **Read page contents** (REST API + `includeContent=true`, batch reads to reduce tool calls)
   - Classify in-memory immediately after reading

3. **Write JSONL immediately** (before any draft writes):
   ```bash
   PYTHONUTF8=1 python3 -c "
   import json
   entries = [...]  # All Track A entries
   with open('.claude/skills/products/{product}/.enrich/blast-temp/known-issues-ado-wiki-{batchId}.jsonl', 'w') as f:
       for e in entries:
           f.write(json.dumps(e, ensure_ascii=True) + '\n')
   print(f'JSONL written: {len(entries)} entries')
   "
   ```
   - ID format: `{product}-ado-wiki-{batchId}-{seq:03d}` (seq increments within per-batch JSONL)

4. **Write guide drafts last** (if context budget remains):
   - Draft prefix: `guides/drafts/ado-wiki-{batchId}-{title}.md`
   - Apply sourceRef dedup check before writing (same as standard mode)
   - If context insufficient → skip remaining drafts (JSONL entries remain valid)
   - **Never sacrifice JSONL writes for drafts**

> **Context budget hint**: 10-page batch ≈ 30-40 tool calls.
> If pages are large (>10KB/page), agent may exhaust context before Step 4.
> But Steps 1+3 already persisted scanned + JSONL — no data loss.

#### Parallel Mode Orchestration

**Step 0: Pre-flight checks**:

1. Read `.enrich/scanned-ado-wiki.json` — must exist (if not, prompt to run discovery first)
2. Read `index`, `scanned`, `skipped`
3. **sourceStates reconciliation**: calculate `unscanned = index - scanned - skipped`
   - If empty and `progress.json → sourceStates.ado-wiki` is not `"exhausted"`:
     - Fix: `sourceStates.ado-wiki = "exhausted"`
     - Report: "RECONCILED: {product}/ado-wiki → exhausted"
4. Read or initialize `claimed-pages.json`
5. **Session recovery**: if claimed non-empty, check for `blast-temp/scanned-ado-wiki-{bid}.json` temp files:
   - Temp files exist → merge them first (orphans from last session's completed agents)
   - No temp files → those agents crashed, clear claimed
6. Recompute `unscanned = index - scanned - skipped - claimed` (may have changed after merge)
7. If empty → report "ADO Wiki exhausted for {product}", exit

**Step 1: Agent registry + available slots**:

Registry file: `.claude/state/blast-registry.json`

```json
{
  "agents": [
    {"taskId": "abc123", "batchId": "a", "product": "vm", "pageCount": 10, "spawnedAt": "..."}
  ],
  "lastUpdated": "2026-04-06T15:30:00Z"
}
```

```python
# Clean dead agents (spawnedAt > 30 min ago and no temp output file)
alive = []
for agent in registry["agents"]:
    age_min = (now - parse(agent["spawnedAt"])).total_seconds() / 60
    temp_exists = exists(f'{agent["product"]}/.enrich/blast-temp/scanned-ado-wiki-{agent["batchId"]}.json')
    if age_min > 30 and not temp_exists:
        log(f'DEAD: {agent["product"]}/{agent["batchId"]}')
    else:
        alive.append(agent)
registry["agents"] = alive

# Calculate slots
max_agents = enrich_state["maxAgentsPerTick"]  # default 20
running = len(registry["agents"])
available_slots = max_agents - running
product_running = len([a for a in registry["agents"] if a["product"] == product])
product_slots = min(8 - product_running, available_slots)  # max 8 per product
```

> **Key rule**: slot count source of truth is the registry file, not context memory.

**Step 2: Assign pages + register + claim + spawn**:

```python
for slot_id in available_batch_ids[:product_slots]:
    pages = unscanned[:batch_size]
    if not pages: break
    
    # 1. Claim
    claimed["pages"].extend(pages)
    write(claimed_file)
    
    # 2. Register (before spawn!)
    registry["agents"].append({
        "taskId": None,
        "batchId": slot_id,
        "product": product,
        "pageCount": len(pages),
        "spawnedAt": now_iso()
    })
    write(registry_path, registry)
    
    # 3. Spawn agent (run_in_background: true)
    result = spawn_agent(product, slot_id, pages)
    
    # 4. Backfill taskId
    registry["agents"][-1]["taskId"] = result.taskId
    write(registry_path, registry)
    
    unscanned = unscanned[batch_size:]
```

> **Write order**: claim → registry → spawn → backfill taskId.
> If spawn fails, registry entry has no taskId → cleaned as dead in next Step 1.

**Step 3: On task-notification (agent completion)**:

> **Red line**: merge ONLY on receiving `<task-notification>`.
> **Never** merge based on temp file existence — agent writes files in Write-Early order
> (scanned → JSONL → drafts), so temp scanned file existing ≠ agent finished.
> Premature merge causes: (1) deleting files agent is still writing, (2) missing JSONL entries,
> (3) incorrect slot release → over-spawning.

```python
# 0. Must be triggered by task-notification
assert trigger == "task-notification"

# 1. Update registry FIRST (before merge)
registry["agents"] = [a for a in registry["agents"] if a.get("taskId") != completed_task_id]
write(registry_path, registry)

# 2. Merge temp files (with dedup)
# - scanned-ado-wiki-{batchId}.json → merge into scanned-ado-wiki.json
# - known-issues-ado-wiki-{batchId}.jsonl → dedup against .enrich/known-issues-ado-wiki.jsonl
#   (compare symptom[:100]+rootCause[:100] fingerprint, >80% overlap → skip)
# - append to per-source file (never directly to main known-issues.jsonl)
# - delete temp files after merge

# 3. Update claimed: remove merged pages
claimed["pages"] = [p for p in claimed["pages"] if p not in merged_pages]

# 4. Respawn: calculate slots from registry (re-read, not from memory!)
registry = read_json(registry_path)
running = len(registry["agents"])
available = max_agents - running
unscanned = index - scanned - skipped - claimed
if unscanned and available > 0:
    next_pages = unscanned[:batch_size]
    # Claim + Register + Spawn (same as Step 2)
else:
    mark_exhausted(product)
```

### Parallel Mode State Files

| File | Location | Purpose |
|------|----------|---------|
| `scanned-ado-wiki.json` | `.enrich/` | Main scan record (index + scanned + skipped) |
| `claimed-pages.json` | `.enrich/` | Assigned but incomplete pages (prevents duplicates) |
| `wiki-scope.json` | `.enrich/` | Wiki path scope rules (pathScope/excludeScope) |
| `progress.json` | `.enrich/` | sourceStates tracking |
| `blast-registry.json` | `.claude/state/` | Global agent registry across all products |
| `scanned-ado-wiki-{bid}.json` | `.enrich/blast-temp/` | Batch temp file (agent writes, orchestrator merges+deletes) |
| `known-issues-ado-wiki-{bid}.jsonl` | `.enrich/blast-temp/` | Batch temp JSONL (agent writes, orchestrator merges+deletes) |

### Write-Early Rules (Red Lines)

1. **Merge only on task-notification** — never on temp file existence
2. **No bulk sweep during runtime** — do not scan `blast-temp/` to mass-merge while agents run
3. **Session recovery exception** — Step 0 may merge based on temp files (no running agents at that point, files are stable)
4. **Merge completes → delete temp files immediately**
5. **Session end sweep** — merge all remaining temp files only after confirming all agents have exited
6. **No temp files in `.claude/skills/products/` root** — only in `.enrich/blast-temp/`

### Session Recovery Logic (Step 0)

On new session start:

1. Read `claimed-pages.json` — if empty, skip recovery
2. If claimed is non-empty:
   a. Check for `blast-temp/scanned-ado-wiki-{bid}.json` temp files
   b. **Temp files found** → merge them (last session's completed agents left orphan output)
   c. **No temp files** → agents were interrupted mid-work, clear claimed entirely
3. Recompute unscanned after recovery merge

---

## Index Rebuild

Triggered by orchestrator command with `rebuild-index` parameter for a product.

### Execution Steps

1. **Read adoWikis config** from `playbooks/product-registry.json`
2. **Recursively enumerate current wiki page tree** per wiki:
   ```bash
   MSYS_NO_PATHCONV=1 az devops wiki page show \
     --org https://dev.azure.com/{org} \
     --project {project} \
     --wiki {wiki_name} \
     --path "/" \
     --recursion-level full \
     --output json
   ```
   Extract all leaf pages (nodes with empty `subPages`), prepend full key prefix.

3. **Apply pathScope + excludeScope filtering** (same logic as Discovery)

4. **Merge to index with safety gates**:
   ```python
   old_index = scanned_ado_wiki["index"]
   new_pages = crawled_leaves
   
   # Safety Gate 1: empty result protection
   if len(new_pages) == 0:
       print(f"ABORT: crawl returned 0 leaves for {product}, keeping old index")
       continue
   
   # Safety Gate 2: >50% shrink warning
   if len(old_index) > 0 and len(new_pages) < len(old_index) * 0.5:
       print(f"WARNING: index shrunk by >50% ({len(old_index)} -> {len(new_pages)})")
       print(f"  This may indicate a crawl failure. Confirm before writing.")
   
   scanned_ado_wiki["index"] = new_pages
   scanned_ado_wiki["indexUpdatedAt"] = now_iso
   ```

5. **Compute deltas**:
   ```
   New pages     = new_index - old_index     (newly discovered after wiki restructure)
   Stale scanned = scanned - new_index       (old paths now 404, already processed)
   To scan       = new_index - scanned       (actual unscanned)
   ```

6. **Reset sourceStates**: if new pages > old_index * 10%, set `sourceStates.ado-wiki = "scanning"`

7. **Output report**:
   ```
   Wiki Index Rebuilt — {product}
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Old index:        {old_count} pages
   New index:        {new_count} pages
   New pages:        {added}
   Stale paths:      {stale}
   Already scanned:  {scanned_valid}
   To scan:          {to_scan} pages
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

### Design: Old scanned records don't block new paths

- Old scanned records use **old path** keys (e.g. `AAD Account Management/Conditional Access/TSG`)
- New index uses **new path** keys (e.g. `AAD Authentication/Azure AD Conditional Access Policy/TSG`)
- Different keys → new paths are naturally not in scanned → treated as unscanned → auto-assigned
- Old 404 paths remain in scanned harmlessly (not in new index, never assigned)

---

## Change Detection (incremental)

- Check `lastRefreshed` timestamp in `.enrich/scanned-ado-wiki.json`
- If older than **7 days** → re-enumerate page tree for all configured wikis
- Compare new tree against existing index → add new pages, mark removed pages
- This is a lightweight refresh (no content reading), only updates the index
- New pages enter the unscanned set and get processed in subsequent runs

> **Rule**: every scan run must update `lastRefreshed` to current UTC timestamp (ISO format).
> Failing to set this = new wiki pages are never discovered.

---

## Idle Condition

The adapter is idle (exhausted) when:

```
index - scanned - skipped - claimed = empty set
```

In standard mode, `claimed` is always empty, so: `index - scanned - skipped = empty`.

---

## Agent Spawn Templates

### Standard Mode Agent Prompt

```
Product: {product} | Source: ado-wiki
Project root: ./
Read .claude/skills/product-learn/sources/ado-wiki.md, execute Standard Mode.

Target files:
- JSONL: .claude/skills/products/{product}/.enrich/known-issues-ado-wiki.jsonl
- Scanned: .claude/skills/products/{product}/.enrich/scanned-ado-wiki.json
- ID format: {product}-ado-wiki-{seq:03d}
- Drafts: .claude/skills/products/{product}/guides/drafts/ado-wiki-{title}.md

Config: adoWikis={adoWikis config JSON}
Return: discovered, deduplicated, exhausted, summary (<500 bytes)
```

### Parallel Mode Agent Prompt (blast-batch)

```
Product: {product} | batchId: {batchId}
Project root: ./
Read .claude/skills/product-learn/sources/ado-wiki.md, execute Parallel Mode Write-Early strategy.

Isolation rules:
- JSONL: .claude/skills/products/{product}/.enrich/blast-temp/known-issues-ado-wiki-{batchId}.jsonl
- Scanned: .claude/skills/products/{product}/.enrich/blast-temp/scanned-ado-wiki-{batchId}.json
- ID format: {product}-ado-wiki-{batchId}-{seq:03d}
- Drafts: .claude/skills/products/{product}/guides/drafts/ado-wiki-{batchId}-{title}.md
- Temp files write to `.enrich/blast-temp/` subdirectory (NOT `.enrich/` root)
- Dedup scope: within per-batch file + compare against main known-issues-ado-wiki.jsonl (symptom[:100], >80% overlap → skip)
- Scanned entries use full key format (matching index path)
- Write-Early order: 1. scanned → 2. read pages → 3. JSONL → 4. drafts

pagesToProcess ({N} pages):
[{pages JSON array}]

Return: discovered, deduplicated, batchId, pagesProcessed, summary (<500 bytes)
```

> **Agent path rule**: prompts must use **relative paths** (`./cases`), never Windows absolute paths (`C:\Users\...`).
> Backslashes are interpreted as escape characters in Bash.

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Index does not exist | Prompt to run discovery first (build index), exit |
| adoWikis config is empty array | Return `exhausted: true` immediately |
| codeWiki returns empty content via CLI | Already handled — all reads use REST API |
| REST API rate limiting (429) | Agent-internal retry with backoff; orchestrator does not intervene |
| Write failure (bash/python) | **2 consecutive failures → stop retrying immediately**. Include extracted results as JSON in summary with `"writeStatus": "WRITE_FAILED"`. Orchestrator writes on merge. **Never** enter retry loop — exhausts token budget and causes agent to hang. |
| Session interrupted mid-blast | Next session Step 0 detects orphan claimed pages, clears + re-assigns |
| Batch agent fails entirely | Claimed pages cleared on next session recovery, auto-retried |
| Temp file exists but no running agent | **Only** merge during session recovery (Step 0). During runtime, do NOT scan temp dir for merge |
| Premature merge (Write-Early trap) | **Forbidden**. scanned file exists ≠ agent finished. Must wait for task-notification |
| Super-large wiki page tree (>4000 pages) | Segment crawl: `oneLevel` first, then `full` per top-level node |
| Key validation failure (missing `:`) | Abort index write, log error, fix prefix concatenation |

### Fallback — Search Mode

If `adoWikis` is empty but scanning is still needed (e.g. msazure org has scattered relevant wikis):

```bash
pwsh -NoProfile -File scripts/ado-search.ps1 -Type wiki -Query "{product} troubleshooting" -Org msazure -Top 20
```

Search results go through the same `.enrich/scanned-ado-wiki.json` dedup and extraction pipeline.

---

## Removed in v4 Refactor

The following mechanisms from the legacy phase3/blast files are **removed** in this unified adapter:

- **Self-chaining** ("自我链式续跑"): orchestrator manages the lifecycle, agents do not spawn successors
- **`adoWikiBlast` mutual exclusion flag**: no longer needed — one adapter, orchestrator coordinates mode
- **`/product-learn ado-wiki-blast` as separate command**: now a concurrency parameter on the adapter, not a standalone entry point
