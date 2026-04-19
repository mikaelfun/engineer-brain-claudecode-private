# Orchestrator — Cron-Driven Knowledge Enrichment

> Manages the detect→route→extract→merge→synthesize pipeline.
> Does NOT contain extraction logic (that's in `sources/`).
> Does NOT contain data format rules (that's in `shared-rules.md`).
> Does NOT contain synthesis logic (that's in `synthesis/`).

---

## Cron Entry Point

`/product-learn auto-enrich` is **idempotent** — safe to run on any schedule. Recommended: **every 4 hours**.

If no changes detected → exits in < 30 seconds. No side effects.
If already running → reads state, skips detect, resumes from current phase.

Multiple sequential invocations are harmless; the state machine picks up where it left off.

---

## Pipeline Overview

```
detect → route → invalidate → extract → merge → synthesize
```

Six phases, always executed in order. Each phase is a gate: if it produces no work, subsequent phases skip gracefully.

| Phase | Purpose | Scope |
|-------|---------|-------|
| 1. Detect | Find what changed since last tick | All sources × all products |
| 2. Route + Invalidate | Classify new OneNote pages; invalidate stale records | Changed files only |
| 3. Refresh 21v-gap | Update feature gap cache for expired products | Products with expired cache |
| 4. Extract | Spawn agents to extract knowledge from pending pages | (product, source) pairs with pending work |
| 5. Merge | Cross-source dedup + unify per-source JSONL files | Products with all 4 sources idle |
| 6. Synthesize | Generate/update troubleshooting guides | Products with merged data |

### Design Principle

> **"一切皆增量，首次只是增量的特例"**

The orchestrator does NOT have separate code paths for "initial scan" vs "incremental update".

- **First run**: detect returns "all pages are new" → same extract→merge→synth pipeline, larger scope
- **Subsequent runs**: detect returns only changed/new pages → same pipeline, smaller scope

No `if (firstRun)` branches. No "full scan mode". The detect phase output determines scope; the rest of the pipeline is identical.

---

## Phase 1: Detect Changes

For each source type, check if anything changed since the last tick. Output: a changeset JSON structure.

**All empty → exit immediately.**

### OneNote

```python
changes_file = '.claude/skills/products/onenote-changes.json'
if os.path.exists(changes_file):
    onenote_changeset = json.load(open(changes_file))
    # Contains: newFiles, changedFiles, deletedFiles, detectedAt
else:
    onenote_changeset = None  # No changes from onenote-export sync
```

`onenote-changes.json` is produced by the `onenote-export` sync process. Present → parse. Absent → no changes.

### ADO Wiki

Per product, check `lastRefreshed` in `scanned-ado-wiki.json`:

```python
REFRESH_INTERVAL_DAYS = 7

for product in all_products:
    scanned_file = f'{product}/.enrich/scanned-ado-wiki.json'
    if not os.path.exists(scanned_file):
        # No scanned file → everything is new (first run)
        ado_changeset[product] = 'full-scan'
        continue
    data = json.load(open(scanned_file))
    last_refreshed = data.get('lastRefreshed')
    if not last_refreshed or days_since(last_refreshed) >= REFRESH_INTERVAL_DAYS:
        # Re-enumerate wiki page tree via az devops invoke, diff with index
        # Read product-registry.json → podProducts[product].adoWikis for org/project/wiki
        wiki_cfg = registry_product['adoWikis']
        for wiki in wiki_cfg:
            # az devops invoke --area wiki --resource pages
            #   --route-parameters project={wiki.project} wikiIdentifier={wiki.wiki}
            #   --org https://dev.azure.com/{wiki.org}
            #   --query-parameters recursionLevel=full
            current_tree = fetch_wiki_page_tree(wiki)
            index_paths = set(p['path'] for p in data.get('index', []))
            new_paths = current_tree - index_paths
            if new_paths:
                ado_changeset[product] = {'newPages': list(new_paths)}
        # Update lastRefreshed
```

### MS Learn

Per product, check `lastRefreshed` in `scanned-mslearn.json`:

```python
for product in all_products:
    scanned_file = f'{product}/.enrich/scanned-mslearn.json'
    if not os.path.exists(scanned_file):
        mslearn_changeset[product] = 'full-scan'
        continue
    data = json.load(open(scanned_file))
    last_refreshed = data.get('lastRefreshed')
    if not last_refreshed or days_since(last_refreshed) >= REFRESH_INTERVAL_DAYS:
        # GitHub Commits API incremental detection
        toc_paths = registry_product.get('mslearnTocPaths', [])
        changed_articles = set()
        for toc_path in toc_paths:
            # Step 1: Query commits since lastRefreshed
            # gh api "repos/MicrosoftDocs/SupportArticles-docs/commits
            #   ?path=support/{toc_path}&since={last_refreshed}&per_page=100"
            commits = gh_api_commits(toc_path, last_refreshed)

            # Step 2: For each commit (max 20), get changed files
            for sha in commits[:20]:
                # gh api "repos/MicrosoftDocs/SupportArticles-docs/commits/{sha}"
                #   --jq '.files[] | select(.filename | endswith(".md")) | .filename'
                files = gh_api_commit_files(sha)
                changed_articles.update(files)

            # Step 3: Map paths to URLs
            # support/x/y/z.md → https://learn.microsoft.com/en-us/troubleshoot/x/y/z
            for filepath in changed_articles:
                url = filepath_to_url(filepath)
                if url in scanned_urls:
                    # Already scanned and content changed → remove from scanned (re-fetch)
                    invalidate(product, 'mslearn', url)
                else:
                    # New article → add to index
                    add_to_index(product, 'mslearn', url)

            # Step 4: Also re-fetch toc.yml to catch new URLs
            # Update lastRefreshed
        if changed_articles:
            mslearn_changeset[product] = {'changed': list(changed_articles)}
```

### ContentIdea KB

Per product, check `lastRefreshed` in `scanned-contentidea-kb.json`:

```python
for product in all_products:
    scanned_file = f'{product}/.enrich/scanned-contentidea-kb.json'
    if not os.path.exists(scanned_file):
        ck_changeset[product] = 'full-scan'
        continue
    data = json.load(open(scanned_file))
    last_refreshed = data.get('lastRefreshed')
    if not last_refreshed or days_since(last_refreshed) >= REFRESH_INTERVAL_DAYS:
        # WIQL re-query, diff scanned IDs with current results
        current_ids = wiql_query(product)
        scanned_ids = set(str(s) for s in data.get('scanned', []))
        new_ids = current_ids - scanned_ids
        if new_ids:
            ck_changeset[product] = {'newIds': list(new_ids)}
```

### 21v-gap

```python
for product in all_products:
    gaps_file = f'{product}/21v-gaps.json'
    if not os.path.exists(gaps_file):
        gap_changeset[product] = 'full-scan'
        continue
    data = json.load(open(gaps_file))
    last_updated = data.get('lastUpdated')
    if not last_updated or days_since(last_updated) >= 30:
        gap_changeset[product] = 'cache-expired'
        continue
    # Also check if onenote-changes has Feature Gap files
    if onenote_changeset:
        for f in (onenote_changeset.get('changedFiles', []) + onenote_changeset.get('newFiles', [])):
            if 'feature' in f.lower() and 'gap' in f.lower():
                gap_changeset[product] = 'source-changed'
                break
```

### Changeset Output Structure

```json
{
  "detectedAt": "2026-04-19T08:00:00+08:00",
  "onenote": { "newFiles": [...], "changedFiles": [...], "deletedFiles": [...] },
  "adoWiki": { "vm": {"newPages": [...]}, "aks": "full-scan" },
  "mslearn": { "vm": {"changed": [...]}, "intune": "full-scan" },
  "contentidea": { "vm": {"newIds": [...]}, "aks": null },
  "21vGap": { "vm": "cache-expired", "aks": null }
}
```

All sources empty (no `onenote`, all products `null`) → log "No changes detected" → exit.

---

## Phase 2: Route + Invalidate

### OneNote: newFiles

1. Check each new file against Layer 1 path matching (from `product-registry.json`)
2. Files matched by Layer 1 → write to `page-routing.jsonl` immediately (layer=1)
3. Files NOT matched by Layer 1 → queue for Router agent (Layer 2/3 classification)

### OneNote: changedFiles

1. Lookup each path in `page-routing.jsonl` → find affected products
2. For each affected product:
   - Remove path from `.enrich/scanned-onenote.json → scanned` (allows re-scan)
   - In `.enrich/known-issues-onenote.jsonl`, mark entries with matching `sourceRef` as `"stale": true`
3. Remove the path from `page-routing.jsonl` (re-classify, content may have changed product affinity)
4. Add to Router pending queue

### OneNote: deletedFiles

1. Remove from `page-routing.jsonl`
2. Remove from `page-list.txt`
3. Update `router.totalPages` accordingly
4. Corresponding JSONL entries and scanned records become orphans — harmless, retained

### ADO Wiki / MS Learn / ContentIdea

For products with detected changes:

1. **New pages/articles/items**: Add to `scanned-{source}.json → index` (if index-based source)
2. **Changed pages**: Remove from `scanned-{source}.json → scanned` (forces re-extraction)
3. **Source state reset**: If source was `idle`, reset to `scanning` if pending pages > 0

### OneNote changes file cleanup

After processing → **delete** `onenote-changes.json` to prevent reprocessing.

### Output

Per-product pending work list:
```json
{
  "vm":      {"onenote": 3, "ado-wiki": 12, "mslearn": 0, "contentidea": 5},
  "aks":     {"onenote": 0, "ado-wiki": 0, "mslearn": 8, "contentidea": 0},
  "intune":  {"onenote": 7, "ado-wiki": 3, "mslearn": 2, "contentidea": 1}
}
```

---

## Phase 3: Refresh 21v-gap Cache

For products with expired 21v-gap cache (detected in Phase 1):

1. Read `reference/21v-gap.md` for cache schema and refresh logic
2. Locate Feature Gap files via product-registry.json → `podServicesDir`
3. Glob search for `*Feature*Gap*` / `*feature*parity*` files
4. Extract `unsupportedFeatures` + `partialFeatures`
5. Write updated `21v-gaps.json` with fresh `lastUpdated`

21v-gap is **not** a source adapter — it produces no JSONL. It only provides the cache consumed by other adapters for `21vApplicable` marking. Always completes in one pass (`exhausted: true`).

---

## Phase 4: Extract

The core spawning logic. This is where parallel agents do the actual work.

### 4a. Collect Pending Tasks

Scan all products for (product, source) pairs with pending pages:

```python
tasks = []
for product in all_products:
    progress = read_progress(product)
    for source in ['onenote', 'ado-wiki', 'mslearn', 'contentidea']:
        state = progress['sourceStates'].get(source, 'idle')
        if state == 'idle':
            # Check if there are actually pending pages
            pending = count_pending(product, source)
            if pending > 0:
                tasks.append((product, source, pending))
        elif state == 'scanning':
            tasks.append((product, source, count_pending(product, source)))
```

### 4b. Priority Ordering

Sort tasks by:
1. Product priority: order from `product-registry.json → enrichPriority`
2. Source priority within product: `onenote` > `ado-wiki` > `mslearn` > `contentidea`

### 4c. Spawn Agents

All agents use `run_in_background: true`. Total concurrent agents capped by `maxAgentsPerTick` (default: 20).

**ADO Wiki concurrency mode auto-selection**:
- Unscanned pages < 50 → standard mode (1 agent per product)
- Unscanned pages >= 50 → parallel mode (up to 3 batch agents per product, read `sources/ado-wiki.md` for details)

**Router agent**: If `router.status !== "idle"` and agent quota not full → spawn Router agent too (reads `router/onenote-router.md`).

### 4d. Agent Spawn Prompt Template

```
Agent(
  description: "enrich {product} from {source}",
  run_in_background: true,
  prompt: |
    任务: {Source} Source Adapter — 从 {source} 提取 {product} 产品知识
    项目根: {PROJECT_ROOT}
    产品: {product}
    
    读取 .claude/skills/product-learn/sources/{source}.md 获取完整流程。
    提取规则（JSONL 格式、双轨提取、去重、ID 生成、文件写入）
    见 .claude/skills/product-learn/shared-rules.md。
    
    ⚠️ 写文件必须用 Bash + python3 -c，禁止用 Write 工具（缓存 bug）。
    ⚠️ 文件写入规则详见 shared-rules.md § File Write Rules。
    ⚠️ 此 adapter 不自链——完成后返回结果，由 Orchestrator 决定是否继续。
    
    关键文件:
    - Registry: playbooks/product-registry.json
    - JSONL 写入: .claude/skills/products/{product}/.enrich/known-issues-{source}.jsonl
    - 扫描记录: .claude/skills/products/{product}/.enrich/scanned-{source}.json
    - 21V gaps: .claude/skills/products/{product}/21v-gaps.json（如存在则读取补标）
    - Evolution log: .claude/skills/products/{product}/.enrich/evolution-log.md（append）
    
    完成后返回:
    1. discovered: 新发现条目数
    2. guideDrafts: Track B 草稿数
    3. deduplicated: 去重跳过条目数
    4. exhausted: true/false
    5. pendingRemaining: 剩余未处理页面数
    6. 简要摘要 (<500 bytes)
)
```

### 4e. Refill on Notification

When an agent completes (via `<task-notification>`):

1. **Update state**: Read agent result → update `progress.json → sourceStates[source]`
   - `exhausted: true` → set source to `idle`
   - `exhausted: false` → keep as `scanning`
2. **Calculate slots**: `idle_slots = maxAgentsPerTick - active_agent_count`
3. **If idle_slots > 0 AND pending work exists**:
   - Collect pending tasks (same priority rules as 4b)
   - Spawn replacement agents immediately (`run_in_background: true`)
   - Log: `🔄 Refill: spawned {N} replacement agents`
4. **Batch notification handling**: If multiple agents complete simultaneously → batch-update state first, then one-shot spawn all replacement agents

> **Effect**: Slot utilization goes from ~60% (5-min cron cycle, agents average 3 min) to ~95%.
> Cron tick becomes a "backstop check" rather than the sole scheduling point.

### 4f. Tick Summary (output immediately after spawn)

```
📚 Enrichment Tick — {N} Agents Spawned
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Product | onenote | ado-wiki | mslearn | contentidea |
|---------|---------|----------|---------|-------------|
| intune  | 🔄(3)   | 🔄(12)   | idle    | 🔄(5)       |
| vm      | idle    | 🔄(8)    | idle    | idle        |
...

Router: scanning (3200/4241 pages)
Active agents: {N} / {maxAgentsPerTick}
```

---

## Phase 5: Merge

**Trigger**: When a product's all 4 sources are `idle` (no pending work).

### Execution

1. Read `synthesis/merge.md` for complete merge logic
2. Execute merge or spawn merge agent (depending on data size)

### Merge Logic Summary (authoritative definition in `synthesis/merge.md`)

1. Read all per-source JSONL files:
   ```
   .enrich/known-issues-onenote.jsonl
   .enrich/known-issues-ado-wiki.jsonl
   .enrich/known-issues-mslearn.jsonl
   .enrich/known-issues-contentidea-kb.jsonl
   ```

2. Cross-source dedup (see `shared-rules.md § Dedup Rules > MERGE`)

3. 21V label backfill: read `21v-gaps.json`, mark `21vApplicable` for entries with `null`

4. Unified re-numbering: sort by source priority (`onenote` > `ado-wiki` > `mslearn` > `contentidea`), re-assign IDs as `{product}-{seq:03d}`

5. Write `known-issues.jsonl` (final merged file)

6. Update `progress.json → lastMerged`

---

## Phase 6: Incremental Synthesize

**Trigger**: After merge completes for a product.

### Execution

1. Read `synthesis/synthesize.md` for complete synthesis logic
2. **Topic-level change detection**: compare current `known-issues.jsonl` with last synthesized version
   - New entries → identify affected topics
   - Modified entries → mark affected topics dirty
   - Unchanged topics → **skip entirely** (no regeneration)
3. Only regenerate affected topics' guides
4. Update `progress.json → lastSynthesized` and `synthesizeState`

### Incremental Behavior

The synthesizer maintains `synthesizeState.synthesizedEntryIds` — the set of entry IDs included in the last synthesis run. On re-synthesis:

- `currentIds - previousIds` = new entries → find their topic → regenerate
- `previousIds - currentIds` = removed entries → find their topic → regenerate
- Entries with same ID but changed content → regenerate affected topic
- Topics with no changes → skip (zero cost)

---

## State Files

All state files live under `.claude/skills/products/`.

### enrich-state.json (global)

```json
{
  "mode": "idle | detecting | extracting | merging | synthesizing",
  "lastTickAt": "2026-04-19T08:00:00Z",
  "lastChangesDetected": "2026-04-18T15:30:00Z",
  "router": {
    "status": "idle | scanning",
    "totalPages": 4241,
    "routedPages": 4241,
    "pendingPages": 0
  },
  "products": ["vm", "aks", "intune", "monitor", "entra-id", "disk", "acr", "arm", "avd", "purview", "eop", "defender", "automation", "networking"],
  "maxAgentsPerTick": 20,
  "registryWarnings": []
}
```

| Field | Description |
|-------|-------------|
| `mode` | Current pipeline phase. `idle` = no work in progress |
| `lastTickAt` | Timestamp of last `auto-enrich` invocation |
| `lastChangesDetected` | Timestamp of last tick that found actual changes |
| `router` | OneNote Router state (global, not per-product) |
| `products` | All registered products. Always present — no active/queue/completed split |
| `maxAgentsPerTick` | Max concurrent background agents per tick |
| `registryWarnings` | Warnings from registry health check (unmapped dirs, etc.) |

> **v4 simplification**: No `activeProducts`/`productQueue`/`completedProducts` arrays.
> All products always exist. Source-level `idle`/`scanning` status in per-product `progress.json` drives scheduling.
> `exhausted` renamed to `idle` (semantically clearer — the source has no pending work, not "used up").

### progress.json (per-product)

Path: `.claude/skills/products/{product}/.enrich/progress.json`

```json
{
  "product": "vm",
  "sourceStates": {
    "onenote":     {"status": "idle | scanning", "lastExtracted": "2026-04-19T08:00:00Z", "pendingPages": 0},
    "ado-wiki":    {"status": "idle | scanning", "lastRefreshed": "2026-04-15T10:00:00Z", "pendingPages": 0},
    "mslearn":     {"status": "idle | scanning", "lastRefreshed": "2026-04-12T06:00:00Z", "pendingPages": 0},
    "contentidea": {"status": "idle | scanning", "lastRefreshed": "2026-04-10T12:00:00Z", "pendingPages": 0}
  },
  "21vGapLastUpdated": "2026-04-10",
  "lastMerged": "2026-04-18",
  "lastSynthesized": "2026-04-18",
  "synthesizeState": {
    "lastSynthesizedAt": "2026-04-18T14:00:00Z",
    "synthesizedEntryIds": ["vm-001", "vm-002", "vm-003"],
    "topicPlanHash": "abc123",
    "draftHashes": {},
    "topicRegenLog": []
  }
}
```

| Field | Description |
|-------|-------------|
| `sourceStates.{source}.status` | `idle` = no pending work; `scanning` = extraction in progress |
| `sourceStates.{source}.lastExtracted` | Last successful extraction timestamp (onenote) |
| `sourceStates.{source}.lastRefreshed` | Last index refresh timestamp (ado-wiki, mslearn, contentidea) |
| `sourceStates.{source}.pendingPages` | Count of pages awaiting extraction |
| `21vGapLastUpdated` | Last 21v-gaps.json refresh date |
| `lastMerged` | Last successful merge date |
| `lastSynthesized` | Last successful synthesis date |
| `synthesizeState` | Detailed synthesis tracking for incremental regeneration |

---

## Sub-commands

| Input | Action |
|-------|--------|
| `auto-enrich` | Full pipeline: detect→route→invalidate→extract→merge→synthesize |
| `auto-enrich status` | Show current state (see Status Display below) |
| `auto-enrich reset` | Reset all products: clear all `progress.json` and `scanned-*.json`, retain extracted JSONL |
| `auto-enrich reset --source {source}` | Reset specific source across all products: clear `scanned-{source}.json` + `known-issues-{source}.jsonl`, reset `sourceStates[source]` to `scanning` |

### `reset` Details

**Full reset** (`auto-enrich reset`):
1. Rewrite `enrich-state.json` to initial values (mode=idle, products from registry)
2. Delete all `progress.json` and `scanned-*.json` files
3. **Retain** `.enrich/known-issues-*.jsonl` (don't destroy extracted knowledge)
4. Retain `page-routing.jsonl` (Router results are expensive to regenerate)

**Source reset** (`auto-enrich reset --source {source}`):
1. For all products: delete `.enrich/scanned-{source}.json` and `.enrich/known-issues-{source}.jsonl`
2. Reset `sourceStates[source].status` to `scanning` in each `progress.json`
3. Other sources unaffected

---

## Status Display

Format for `auto-enrich status`:

```
📚 Knowledge Enrichment Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mode:          idle
Last tick:     2026-04-19 08:00
Last changes:  2026-04-18 15:30
Router:        idle (4241/4241 pages routed)

Product Status:
  vm:       onenote=idle | ado-wiki=idle | mslearn=idle | contentidea=idle       merged: 2026-04-18 | synth: 2026-04-18
  aks:      onenote=idle | ado-wiki=scanning(12) | mslearn=idle | contentidea=idle  merged: - | synth: -
  intune:   onenote=scanning(7) | ado-wiki=idle | mslearn=idle | contentidea=idle  merged: 2026-04-17 | synth: 2026-04-17
  monitor:  onenote=idle | ado-wiki=scanning(3) | mslearn=scanning(8) | contentidea=idle  merged: - | synth: -
  ...

⚠️ Registry Warnings:
  - Unmapped POD directories: {'New Service XYZ'}
```

Legend: `idle` = no pending work, `scanning(N)` = N pages pending extraction.

---

## Error Handling

| Scenario | Action |
|----------|--------|
| OneNote Export directory missing | Skip onenote source for all products. Log warning. Other sources unaffected |
| ADO API failure (az devops invoke) | Log error. Set `sourceStates[product].ado-wiki.status = "error"`. Other sources continue |
| GitHub Commits API failure | Log error. Keep existing mslearn index. Retry on next tick |
| msft-learn MCP unavailable | Skip mslearn source. Set status to error. Other sources continue |
| LLM extracts 0 entries from page | Normal — log "no knowledge extracted". Still mark page as scanned |
| SYNTHESIZE clustering fails | Degrade: group by source instead of topic. Still generate guides |
| `.enrich/scanned-{source}.json` corrupted | Rebuild from `.enrich/known-issues-{source}.jsonl` → `sourceRef` field |
| `known-issues.jsonl` missing | Create empty file. Execute normally |
| Agent spawn fails | Log error. Don't update state. Next tick retries same (product, source) |
| `config.json` product has no mapped directory | Source directly marked `idle` (e.g., `defender` has no OneNote section) |
| `onenote-changes.json` references unknown product | Queue for Router classification (may be a new/unmapped product) |
| Concurrent tick conflict | Second tick reads state, finds mode=extracting, skips detect, only does refill check |

---

## Registry Health Check

Pre-flight validation: scan OneNote Export directories, compare with `product-registry.json` mappings, warn about gaps.

```python
import os, json

# Read config
config = json.load(open('config.json'))
onenote_dir = config['dataRoot'] + '/OneNote Export'
registry = json.load(open('playbooks/product-registry.json'))

# Scan POD Services directories
pod_services_dir = onenote_dir + '/Mooncake POD Support Notebook/POD/VMSCIM/4. Services'
if os.path.exists(pod_services_dir):
    pod_dirs = set(os.listdir(pod_services_dir))
else:
    pod_dirs = set()

# Collect mapped directories from registry
mapped_dirs = set()
for p in registry['podProducts']:
    if p.get('podServicesDir'):
        mapped_dirs.add(p['podServicesDir'])

# Known non-product directories to skip
KNOWN_SKIP_DIRS = {
    'New Service Checklist',
    'Security, Cost Efficiency and Sub management',
}

# Unmapped = exists on disk but not in registry
unmapped = pod_dirs - mapped_dirs - KNOWN_SKIP_DIRS

if unmapped:
    # Write warning to enrich-state.json → registryWarnings
    warnings.append(f'Unmapped POD directories: {sorted(unmapped)}')
    # Output to user
    print(f'⚠️ PRE-FLIGHT: 发现 {len(unmapped)} 个未映射的 OneNote 目录: {sorted(unmapped)}')
```

**Rules**:
- Warnings are stored in `enrich-state.json → registryWarnings` (array)
- Does NOT automatically modify `product-registry.json` — requires human confirmation
- Warnings are informational: unmapped directories may be intentionally excluded
- New warnings replace old ones (not accumulated)

---

## State Reconciliation

Before spawning any agents, the orchestrator reconciles `progress.json` with disk truth to fix stale state markers (e.g., from crashed sessions or lost agent completion signals).

### Index-Based Sources (ado-wiki, mslearn)

```python
for product in all_products:
    progress = read_progress(product)
    for source in ['ado-wiki', 'mslearn']:
        scanned_file = f'{product}/.enrich/scanned-{source}.json'
        if not os.path.exists(scanned_file):
            continue
        data = json.load(open(scanned_file))
        index_keys = set(to_key(i) for i in data.get('index', []))
        scanned_keys = set(to_key(s) for s in data.get('scanned', []))
        skipped_keys = set(to_key(s) for s in data.get('skipped', []))
        unscanned = index_keys - scanned_keys - skipped_keys

        current = progress['sourceStates'].get(source, {}).get('status', 'idle')
        if len(unscanned) == 0 and len(index_keys) > 0 and current == 'scanning':
            progress['sourceStates'][source]['status'] = 'idle'
            progress['sourceStates'][source]['pendingPages'] = 0
            log(f'RECONCILED: {product}/{source} scanning→idle (unscanned=0)')
```

### Non-Index Sources (onenote, contentidea)

Cannot reconcile from disk alone (no persistent index). Rely on agent return values.

### ContentIdea Periodic Refresh

```python
if source == 'contentidea':
    state = progress['sourceStates'].get('contentidea', {})
    if state.get('status') == 'idle':
        last_refreshed = state.get('lastRefreshed')
        if not last_refreshed or days_since(last_refreshed) >= 7:
            state['status'] = 'scanning'
            log(f'REFRESH: {product}/contentidea idle→scanning (lastRefreshed={last_refreshed})')
```

### Rules

- Only reconcile `scanning→idle`, never reverse (`idle→scanning` is only set by detect phase or refresh logic)
- `index` empty (len=0) → don't mark idle (index may not be built yet)
- Reconciliation runs single-threaded before any agent spawn — no concurrency risk
