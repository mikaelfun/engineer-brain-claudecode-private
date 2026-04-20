# Product-Learn v4 Architecture Refactor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor product-learn from a Phase pipeline model to a Source Adapter + Router model, eliminating rule duplication, removing the Phase 0 global blocking step, and unifying initial scan with incremental maintenance.

**Architecture:** Two-tier source model: Shared Pool sources (OneNote) need a Router layer for cross-product page classification; Product-Partitioned sources (ADO Wiki, MS Learn, ContentIdea) query directly per-product. 21v-gap becomes reference data, not a source. All rules defined in one file (shared-rules.md). Orchestrator only manages state and agent spawning.

**Tech Stack:** Markdown skill files (agent instructions), JSON state files, Bash/Python for file operations.

**Key Design Decisions (from architecture review):**
1. Phase numbering abolished → Source Adapter model (sources are parallel, not sequential)
2. Phase 0 (classify) → OneNote Router (non-blocking, runs alongside extraction)
3. OneNote extraction uses dual-channel discovery: section mapping (immediate) + Router results (progressive)
4. 21v-gap is reference data consumed by extractors, not a source producing JSONL
5. Self-chaining agent continuation removed → orchestrator-only lifecycle
6. blast mode merged into ado-wiki adapter as concurrency parameter
7. Initial scan and incremental maintenance use the same pipeline (detect→route→extract→merge→synth)
8. `idle` replaces `exhausted` — sources have pending work or don't

---

## File Structure

### Files to CREATE

```
.claude/skills/product-learn/
  shared-rules.md                    ← Single authority for JSONL format, dedup, ID, write rules
  orchestrator.md                    ← State machine, detect, spawn, refill (replaces auto-enrich.md)
  router/
    onenote-router.md                ← 3-layer routing: path→keyword→LLM
  sources/
    onenote.md                       ← Dual-channel discover + extract + track
    ado-wiki.md                      ← Wiki tree discover + extract + parallel mode (absorbs blast)
    mslearn.md                       ← toc.yml discover + extract + GitHub incremental
    contentidea.md                   ← WIQL discover + extract
  reference/
    21v-gap.md                       ← Feature Gap cache, lazy-load interface
  synthesis/
    merge.md                         ← Cross-source dedup + ID unification
    synthesize.md                    ← Cluster + conflict scan + Agent A/B/C generation
```

### Files to MODIFY

```
.claude/skills/product-learn/SKILL.md           ← New routing table, remove duplicate rules
.claude/agents/knowledge-enricher.md             ← Update to reference sources/ not phases/
```

### Files to DELETE (after migration verified)

```
.claude/skills/product-learn/modes/auto-enrich.md      ← Replaced by orchestrator.md
.claude/skills/product-learn/modes/ado-wiki-blast.md    ← Absorbed into sources/ado-wiki.md
.claude/skills/product-learn/phases/global-constraints.md ← Absorbed into shared-rules.md
.claude/skills/product-learn/phases/phase2-onenote.md    ← Replaced by sources/onenote.md
.claude/skills/product-learn/phases/phase3-ado-wiki.md   ← Replaced by sources/ado-wiki.md
.claude/skills/product-learn/phases/phase4-mslearn.md    ← Replaced by sources/mslearn.md
.claude/skills/product-learn/phases/phase5-contentidea.md ← Replaced by sources/contentidea.md
.claude/skills/product-learn/modes/synthesize.md         ← Replaced by synthesis/synthesize.md
```

### Files to KEEP (no changes needed)

```
.claude/skills/product-learn/modes/case-review.md
.claude/skills/product-learn/modes/promote.md
.claude/skills/product-learn/modes/promote-case.md
playbooks/product-registry.json
```

---

## Task 1: Create shared-rules.md — Single Rule Authority

**Files:**
- Create: `.claude/skills/product-learn/shared-rules.md`
- Reference: `.claude/skills/product-learn/phases/global-constraints.md` (source material)
- Reference: `.claude/skills/product-learn/modes/auto-enrich.md` lines with JSONL format, dedup, ID rules

This file is the **only** place where data format rules are defined. All other files reference it.

- [ ] **Step 1: Read current rule definitions from all 3 sources**

Read these files and extract the rule sections:
- `phases/global-constraints.md` — full file (JSONL format, dedup, ID, write rules, scanned tracking)
- `modes/auto-enrich.md` — "JSONL 条目格式", "去重规则", "文件隔离架构" sections
- `SKILL.md` — "通用规则" section (ID generation, dedup, evolution log)

Identify conflicts between the three sources (documented in architecture review):
- ID format: SKILL.md says `{product}-{seq:03d}`, global-constraints says `{product}-{source}-{seq:03d}`
- Dedup scope: SKILL.md says against `known-issues.jsonl`, global-constraints says per-source only
- Track B JSONL: SKILL.md ambiguous, global-constraints says no JSONL for Track B

- [ ] **Step 2: Write shared-rules.md**

```bash
cat > .claude/skills/product-learn/shared-rules.md << 'CONTENT'
```

Content structure:

```markdown
# Shared Rules — Product Knowledge Extraction

> **This file is the single authority for all data format, dedup, ID, and write rules.**
> All source adapters and the orchestrator reference this file. Do not duplicate these rules elsewhere.

## JSONL Entry Format

{Canonical format — use the v3 per-source format from global-constraints.md}
{ID format: `{product}-{source}-{seq:03d}` during extraction, `{product}-{seq:03d}` after MERGE}
{Fields: id, date, symptom, rootCause, solution, source, sourceRef, sourceUrl, product, confidence, quality, tags, 21vApplicable, promoted}

## Dual-Track Extraction

{Track A: Break/Fix → JSONL entry}
{Track B: Guide/Decision-tree → guides/drafts/{source}-{title}.md only, NO JSONL entry}
{Classification prompt for LLM}

## Dedup Rules

{Per-source dedup during extraction (80%/50% thresholds)}
{Cross-source dedup during MERGE phase}

## ID Generation

{Per-source: read max seq from `.enrich/known-issues-{source}.jsonl`, +1}
{Post-MERGE: unified as `{product}-{seq:03d}`}

## File Write Rules

{Must use Bash + python3 -c, not Write tool (bug #42383)}
{Example command}
{Large file (>5KB) rule: always python3, never output token}

## Per-Source File Isolation (v3)

{Write targets: `.enrich/known-issues-{source}.jsonl`}
{Scan records: `.enrich/scanned-{source}.json`}
{Draft prefix: `guides/drafts/{source}-{title}.md`}
{Blast temp: `.enrich/blast-temp/` for parallel ado-wiki batches}

## Scanned Key Formats

| Source | Key format | Example |
|--------|-----------|---------|
| onenote | Markdown file path | `MCVKB/VM+SCIM/.../page.md` |
| ado-wiki | `{org}/{project}/{wiki}:{path}` | `Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/...` |
| mslearn | Full URL | `https://learn.microsoft.com/en-us/troubleshoot/...` |
| contentidea | Work item ID string | `"18275"` |

## Evolution Log

{Append format for `.enrich/evolution-log.md`}

## Temporary File Rules

{Allowed write targets}
{Forbidden patterns}
```

- [ ] **Step 3: Verify no rules are missing**

```bash
# Check that all rule topics from global-constraints.md are covered
grep -c "^##" .claude/skills/product-learn/shared-rules.md
# Expected: 8-10 sections

# Check that global-constraints topics are all represented
grep "^###\|^##" .claude/skills/product-learn/phases/global-constraints.md
# Cross-reference each heading has a counterpart in shared-rules.md
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/product-learn/shared-rules.md
git commit -m "feat(product-learn): create shared-rules.md as single rule authority

Consolidates JSONL format, dedup, ID generation, write rules, and file
isolation rules from three sources (SKILL.md, global-constraints.md,
auto-enrich.md) into one canonical file. Resolves conflicts where the
three sources disagreed on ID format, dedup scope, and Track B behavior."
```

---

## Task 2: Create router/onenote-router.md — Non-Blocking Page Routing

**Files:**
- Create: `.claude/skills/product-learn/router/onenote-router.md`
- Reference: `modes/auto-enrich.md` Phase 0 section (~80 lines)
- Reference: `playbooks/product-registry.json` for section mappings and matchKeywords

The Router is a global service that classifies OneNote pages to products. It runs **in parallel** with per-product extraction, not as a blocking prerequisite.

- [ ] **Step 1: Create router directory**

```bash
mkdir -p .claude/skills/product-learn/router
```

- [ ] **Step 2: Write onenote-router.md**

Content structure:

```markdown
# OneNote Router — Page-to-Product Classification

> Global service. Classifies OneNote pages to product domains.
> Runs in parallel with per-product extraction — does NOT block anything.
> Rules reference: `../shared-rules.md`

## Purpose

OneNote notebooks are NOT organized by product. A Triage meeting page may cover 5 products.
The Router determines which products each page belongs to, enabling per-product extraction.

## Output

`products/page-routing.jsonl` — one line per classified page:
```json
{"path": "MCVKB/VM+SCIM/.../page.md", "products": ["vm"], "confidence": "high", "layer": 1, "routedAt": "2026-04-19"}
```

## Three-Layer Classification (in order, each layer handles what the previous didn't)

### Layer 1: Path Matching (zero cost, ~60% of pages)

Match page path against `product-registry.json → onenoteSection/mcvkbSection/extraSections`:
- `MCVKB/Intune/*.md` → products: ["intune"], layer: 1
- `VM+SCIM/=======2. VM*/**` → products: ["vm"], layer: 1
- Glob matching, case-insensitive

These pages are ALSO available via Channel 1 (section mapping) in the OneNote extractor,
so Router classification here is for completeness of the routing index, not for discovery.

### Layer 2: Keyword Matching (very low cost, ~20% of pages)

For pages NOT matched by Layer 1:
- Read page title + first 500 characters
- Match against `product-registry.json → matchKeywords`
- Multiple products possible (e.g., title "AKS with ACR integration" → ["aks", "acr"])
- confidence: "medium"

### Layer 3: LLM Classification (high cost, ~20% of pages)

For pages NOT matched by Layer 1 or 2:
- Read page content (truncate at 3000 chars)
- LLM determines product domains from content
- Products list from `product-registry.json → podProducts[*].id`
- One page can belong to 0-N products
- Non-technical pages (team outing, admin) → products: [], layer: 3

## Orchestrator Integration

- Router status tracked in `enrich-state.json → router`
- Each tick: process 30 pages (Layer 1+2: 20 fast pages, Layer 3: 10 LLM pages)
- Router can be spawned as a background agent alongside source extraction agents
- When Router classifies a page for product X → product X's OneNote extractor
  picks it up on next tick (via Channel 2)

## State

```json
// enrich-state.json → router
{
  "status": "idle | routing",
  "totalPages": 4241,
  "routedPages": 4241,
  "pendingPages": 0
}
```

## Incremental Behavior

- `onenote-changes.json → newFiles`: new files need routing
- `onenote-changes.json → changedFiles`: re-classify (product assignment may change)
- `onenote-changes.json → deletedFiles`: remove from page-routing.jsonl

## Agent Spawn Template

{Prompt template for Router agent — include Layer 1/2/3 logic, file paths, return format}
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/product-learn/router/onenote-router.md
git commit -m "feat(product-learn): create OneNote Router for non-blocking page classification

Three-layer classification (path→keyword→LLM) replaces the old Phase 0
global blocking step. Runs in parallel with per-product extraction."
```

---

## Task 3: Create sources/onenote.md — Dual-Channel Discovery

**Files:**
- Create: `.claude/skills/product-learn/sources/onenote.md`
- Reference: `phases/phase2-onenote.md` (extraction logic)
- Reference: `modes/auto-enrich.md` Phase 2 section

Key change: OneNote extractor now has TWO discovery channels running in parallel.

- [ ] **Step 1: Create sources directory**

```bash
mkdir -p .claude/skills/product-learn/sources
```

- [ ] **Step 2: Write sources/onenote.md**

Content structure:

```markdown
# OneNote Source Adapter

> Per-product adapter. Discovers and extracts knowledge from OneNote team notebooks.
> Rules reference: `../shared-rules.md`

## Dual-Channel Discovery

### Channel 1: Section Mapping (immediate, high precision)

Uses `product-registry.json → onenoteSection/mcvkbSection/extraSections` to glob-match pages.
Available immediately — no Router dependency.

```python
# Example for vm:
# onenoteSection = "VM+SCIM/=======2. VM*"
# mcvkbSection = "VM+SCIM/=======2. VM*"
# extraSections = ["VM+SCIM/=======3. Linux*", "VM+SCIM/=======5. Image*"]
# → glob all .md files under these section paths
```

### Channel 2: Router Results (progressive, high recall)

Reads `products/page-routing.jsonl`, filters for entries where `products` contains this product.
New entries appear as the OneNote Router classifies more pages.

### Dedup Between Channels

Both channels may feed the same page (e.g., a page in the VM section is also Router-classified as VM).
`scanned-onenote.json` is the single dedup gate — already-scanned pages are skipped regardless of channel.

## Extract Logic

{From phase2-onenote.md: read page → LLM dual-track extraction → write per-source JSONL}
{Track A → `.enrich/known-issues-onenote.jsonl`}
{Track B → `guides/drafts/onenote-{title}.md`}
{21V marking: read `21v-gaps.json` if exists}
{Per tick: process 10 pages}

## State: scanned-onenote.json

```json
{"scanned": ["MCVKB/VM+SCIM/.../page1.md", ...]}
```

## Idle Condition

Channel 1 pages all scanned AND Router status is idle AND no unscanned Router results for this product.

## Change Detection (incremental)

- `onenote-changes.json → changedFiles` matching this product:
  remove from scanned → force re-extract
  mark existing JSONL entries from that sourceRef as stale
- `onenote-changes.json → newFiles` routed to this product:
  add to extraction queue

## Agent Spawn Template

{Prompt template — include channel selection, file paths, extraction rules ref}
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/product-learn/sources/onenote.md
git commit -m "feat(product-learn): create OneNote source adapter with dual-channel discovery

Channel 1 (section mapping) provides immediate pages without Router dependency.
Channel 2 (Router results) progressively adds cross-section pages."
```

---

## Task 4: Create sources/ado-wiki.md — Absorb Blast Mode

**Files:**
- Create: `.claude/skills/product-learn/sources/ado-wiki.md`
- Reference: `phases/phase3-ado-wiki.md` (extraction logic)
- Reference: `modes/ado-wiki-blast.md` (parallel scanning, claimed set, blast-temp)

Key change: blast is NOT a separate mode — it's a `concurrency: parallel` parameter of the adapter.

- [ ] **Step 1: Write sources/ado-wiki.md**

Content structure:

```markdown
# ADO Wiki Source Adapter

> Per-product adapter. Discovers and extracts knowledge from ADO Wiki TSG pages.
> Rules reference: `../shared-rules.md`

## Discovery

Wiki page tree enumeration via `az devops invoke --area wiki --resource pages --recursionLevel full`.
Product-to-wiki mapping from `product-registry.json → podProducts[product].adoWikis`.

{Index building logic from phase3 Step 3a}
{pathScope/excludeScope filtering from wiki-scope.json}
{Key format: `{org}/{project}/{wikiName}:{path}`}

## Content Reading

{Must use REST API + includeContent=true for codeWiki}
{Forbidden: az devops wiki page show --include-content}
{Code block with REST API command}

## Extract Logic

{Dual-track extraction from phase3}
{Track A → `.enrich/known-issues-ado-wiki.jsonl`}
{Track B → `guides/drafts/ado-wiki-{title}.md` with sourceRef dedup}

## Concurrency Modes

### Standard Mode (default)

Single agent processes pages sequentially from index.
Suitable for small wikis (<100 unscanned pages) or initial index building.

### Parallel Mode (for large wikis)

Sliding window with claimed set — multiple batch agents process non-overlapping page sets.

{Core mechanism from ado-wiki-blast.md:}
{- claimed-pages.json for preventing duplicate assignment}
{- blast-temp/ for per-batch isolation}
{- merge-on-notification workflow}
{- batch size configuration per product}

The orchestrator decides which mode to use based on unscanned count:
- unscanned < 50 → standard
- unscanned >= 50 → parallel

### Parallel Mode State Files

| File | Location | Purpose |
|------|----------|---------|
| claimed-pages.json | .enrich/ | Pages assigned to running agents |
| blast-temp/scanned-ado-wiki-{bid}.json | .enrich/blast-temp/ | Per-batch scanned (temp) |
| blast-temp/known-issues-ado-wiki-{bid}.jsonl | .enrich/blast-temp/ | Per-batch JSONL (temp) |

{Write-Early strategy: scanned → JSONL → drafts}
{Merge only on task-notification, never on temp file existence}

## Index Rebuild

`/product-learn ado-wiki rebuild-index {product}`
{From ado-wiki-blast.md rebuild-index section}
{Safety gates: empty result protection, >50% shrink warning}

## Change Detection (incremental)

- Check `lastRefreshed` in `scanned-ado-wiki.json`
- If >7 days → re-enumerate wiki page tree → diff with index
- New pages added to index, sourceStates set to scanning

## Idle Condition

index - scanned - skipped = empty set

## Agent Spawn Templates

{Standard mode template}
{Parallel mode / blast-batch template}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/product-learn/sources/ado-wiki.md
git commit -m "feat(product-learn): create ADO Wiki source adapter, absorb blast mode

Blast is now a concurrency parameter (parallel mode) of the adapter,
not a separate mode file. Includes claimed-set, sliding window, and
Write-Early strategies from ado-wiki-blast.md."
```

---

## Task 5: Create sources/mslearn.md

**Files:**
- Create: `.claude/skills/product-learn/sources/mslearn.md`
- Reference: `phases/phase4-mslearn.md`

Minimal changes — the existing phase4 is already well-structured. Main changes:
- Remove self-chaining (orchestrator manages lifecycle)
- Reference shared-rules.md instead of global-constraints.md
- Add change detection section

- [ ] **Step 1: Write sources/mslearn.md**

Adapt content from `phases/phase4-mslearn.md` with these modifications:

```markdown
# MS Learn Source Adapter

> Per-product adapter. Discovers and extracts from Microsoft Learn troubleshoot articles.
> Rules reference: `../shared-rules.md`
> Scope: Only `support/` path troubleshoot docs, not product concept/architecture docs.

## Discovery: toc.yml Index

{From phase4 Step 4a — download toc.yml from GitHub, parse href, build URL list}

## Extract Logic

{From phase4 Step 4b — fetch via msft-learn MCP, dual-track extraction}
{8 URLs per tick}

## Change Detection: GitHub Commits API

{From phase4 Step 4d — query MicrosoftDocs/SupportArticles-docs commits}
{Changed articles: remove from scanned (force re-fetch)}
{New articles: add to index}
{7-day refresh cycle based on lastRefreshed}

## Fallback: Search Mode

{From phase4 Step 4c — for products with empty mslearnTocPaths}

## Lifecycle

Orchestrator manages continuation. This adapter does NOT self-chain.
Returns: {discovered, deduplicated, exhausted: true/false, summary}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/product-learn/sources/mslearn.md
git commit -m "feat(product-learn): create MS Learn source adapter

Adapted from phase4-mslearn.md. Removed self-chaining (orchestrator-managed).
Includes GitHub Commits API incremental detection."
```

---

## Task 6: Create sources/contentidea.md

**Files:**
- Create: `.claude/skills/product-learn/sources/contentidea.md`
- Reference: `phases/phase5-contentidea.md`

Minimal changes — remove self-chaining, reference shared-rules.md.

- [ ] **Step 1: Write sources/contentidea.md**

Adapt content from `phases/phase5-contentidea.md`:

```markdown
# ContentIdea KB Source Adapter

> Per-product adapter. Extracts structured KB articles from ContentIdea ADO work items.
> Rules reference: `../shared-rules.md`
> Key difference: NO LLM extraction needed — fields are already structured.

## Discovery: WIQL Query

{From phase5 Steps 1-3 — WIQL with AppliesToProducts CONTAINS, az rest POST}
{Must use az rest, not az boards query (1000-row limit)}

## Extract Logic

{From phase5 Steps 4-6 — strip HTML from structured fields, build JSONL entry}
{No LLM needed}

## Change Detection

{7-day refresh: re-run WIQL, diff with scanned IDs}
{New IDs = new KB articles, added since last scan}

## Lifecycle

Orchestrator manages continuation. This adapter does NOT self-chain.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/product-learn/sources/contentidea.md
git commit -m "feat(product-learn): create ContentIdea KB source adapter

Adapted from phase5-contentidea.md. Removed self-chaining."
```

---

## Task 7: Create reference/21v-gap.md — Reference Data Service

**Files:**
- Create: `.claude/skills/product-learn/reference/21v-gap.md`
- Reference: `modes/auto-enrich.md` Phase 1 section

Key change: 21v-gap is NOT a source (doesn't produce JSONL). It's reference data consumed by extractors.

- [ ] **Step 1: Create reference directory**

```bash
mkdir -p .claude/skills/product-learn/reference
```

- [ ] **Step 2: Write reference/21v-gap.md**

```markdown
# 21V Feature Gap — Reference Data Service

> NOT a source adapter. Does not produce known-issues JSONL.
> Provides 21v-gaps.json cache consumed by source extractors for 21vApplicable marking.

## Purpose

Source extractors read 21v-gaps.json when marking entries with `21vApplicable`.
If a solution involves an unsupported Mooncake feature → 21vApplicable: false.

## Cache Location

`.claude/skills/products/{product}/21v-gaps.json`

## Cache Schema

```json
{
  "lastUpdated": "2026-04-19",
  "product": "{product}",
  "unsupportedFeatures": [{"name": "...", "description": "..."}],
  "partialFeatures": [{"name": "...", "description": "..."}],
  "noGapDataFound": false
}
```

## Refresh Logic

{From auto-enrich Phase 1: glob POD Services dir, read Feature Gap files, extract}
{30-day TTL}
{Triggered by: orchestrator detect phase, or manual `/product-learn auto-enrich`}

## Consumer Interface

Source extractors call this pattern during extraction:
1. Read `21v-gaps.json` (if exists)
2. Check if entry's solution involves any `unsupportedFeatures`
3. If yes → set `21vApplicable: false`, add tag `"21v-unsupported"`
4. If no → set `21vApplicable: true`
5. If cache doesn't exist → set `21vApplicable: null` (MERGE will backfill)
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/product-learn/reference/21v-gap.md
git commit -m "feat(product-learn): create 21v-gap reference data service

Reclassified from Phase 1 source to reference data. Does not produce
JSONL entries. Provides cache consumed by extractors for 21V marking."
```

---

## Task 8: Create orchestrator.md — State Machine and Spawning

**Files:**
- Create: `.claude/skills/product-learn/orchestrator.md`
- Reference: `modes/auto-enrich.md` (state machine, spawn, refill logic)

This is the largest task. The orchestrator owns the cron-driven lifecycle.

- [ ] **Step 1: Write orchestrator.md**

Content structure:

```markdown
# Orchestrator — Cron-Driven Knowledge Enrichment

> Manages the detect→route→extract→merge→synthesize pipeline.
> Does NOT contain extraction logic (that's in sources/).
> Does NOT contain data format rules (that's in shared-rules.md).
> Does NOT contain synthesis logic (that's in synthesis/).

## Cron Entry Point

`/product-learn auto-enrich` — idempotent, safe to run on any schedule.

## Pipeline Phases

```
detect → route → invalidate → extract → merge → synthesize
```

If detect finds zero changes → exit immediately (< 30 seconds).
Initial full scan = detect finds "everything is new" → same pipeline, larger scope.

## Phase 1: Detect Changes

For each source type, check for new/changed content:

### OneNote
- Read `products/onenote-changes.json` (written by onenote-export sync)
- Present → parse changedFiles/newFiles/deletedFiles
- Absent → no OneNote changes

### ADO Wiki
- For each product: read `.enrich/scanned-ado-wiki.json → lastRefreshed`
- If >7 days → re-enumerate wiki page tree, diff with index
- New pages found → mark source as scanning

### MS Learn
- For each product: read `.enrich/scanned-mslearn.json → lastRefreshed`
- If >7 days → GitHub Commits API check
- Changed/new articles → invalidate scanned, add to index

### ContentIdea KB
- For each product: read `.enrich/scanned-contentidea-kb.json → lastRefreshed`
- If >7 days → WIQL re-query, diff with scanned IDs

### 21v-gap
- Check 21v-gaps.json lastUpdated (30-day TTL)
- Or: onenote-changes.json contains Feature Gap files

### Output: changeset

```json
{
  "onenote": {"newFiles": [...], "changedFiles": [...], "deletedFiles": [...]},
  "ado-wiki": {"productsToRefresh": ["vm", "aks"]},
  "mslearn": {"productsToRefresh": ["intune"]},
  "contentidea": {"productsToRefresh": []},
  "21v_gap": {"productsToRefresh": ["vm"]}
}
```

All empty → log "✅ No changes detected" → exit.

## Phase 2: Route + Invalidate

### OneNote Routing
- newFiles: send to OneNote Router (Layer 1 path match first, then Layer 2/3 if needed)
- changedFiles: lookup in page-routing.jsonl → find affected products
  → remove from each product's scanned-onenote.json
  → mark JSONL entries with matching sourceRef as stale
- deletedFiles: remove from page-routing.jsonl and scanned

### ADO Wiki / MS Learn / ContentIdea
- Already product-partitioned, no routing needed
- Just invalidate scanned records for changed content + add new to index

### Output: per-product pending work list

## Phase 3: Refresh 21v-gap Cache

For products with expired 21v-gaps.json:
- Read reference/21v-gap.md for refresh logic
- Spawn agent or inline refresh (simple glob + extract)

## Phase 4: Extract

Collect all (product, source) pairs with pending pages.
Apply priority: product order from enrichPriority, source order within product.

Spawn agents (all background):
- Each agent reads its source adapter file (sources/{source}.md) for instructions
- Each agent reads shared-rules.md for write format
- maxAgentsPerTick controls total concurrent agents

### OneNote Router Agent
If Router has pending pages (new unclassified pages) → spawn Router agent alongside extractors.

### Refill on Notification
When agent completes (task-notification):
- Update per-product progress.json
- If idle slots available + pending work → spawn replacement agent

## Phase 5: Merge (per-product, when all sources idle)

When a product's all 4 sources are idle:
- Read synthesis/merge.md for merge logic
- Execute MERGE: per-source JSONLs → cross-source dedup → unified known-issues.jsonl

## Phase 6: Incremental Synthesize

After merge, if product has new/changed entries:
- Read synthesis/synthesize.md for synthesis logic
- Topic-level change detection: only regenerate affected topics
- Unchanged topics → skip entirely

## State Files

### enrich-state.json (global)

```json
{
  "mode": "idle | detecting | extracting | merging | synthesizing",
  "lastTickAt": "2026-04-19T08:00:00Z",
  "lastChangesDetected": "2026-04-18T15:30:00Z",
  "router": {
    "status": "idle | routing",
    "totalPages": 4241,
    "routedPages": 4241,
    "pendingPages": 0
  },
  "products": ["vm", "aks", "intune", ...],
  "maxAgentsPerTick": 20
}
```

### progress.json (per-product)

```json
{
  "product": "vm",
  "sourceStates": {
    "onenote":     {"status": "idle | scanning", "lastExtracted": "...", "pendingPages": 0},
    "ado-wiki":    {"status": "idle | scanning", "lastRefreshed": "...", "pendingPages": 0},
    "mslearn":     {"status": "idle | scanning", "lastRefreshed": "...", "pendingPages": 0},
    "contentidea": {"status": "idle | scanning", "lastRefreshed": "...", "pendingPages": 0}
  },
  "21vGapLastUpdated": "2026-04-10",
  "lastMerged": "2026-04-18",
  "lastSynthesized": "2026-04-18",
  "synthesizeState": { ... }
}
```

Note: `exhausted` is replaced by `idle`. Sources are either idle (no pending work) or scanning.

## Sub-commands

| User input | Action |
|-----------|--------|
| `auto-enrich` | Run full pipeline (detect→route→extract→merge→synth) |
| `auto-enrich status` | Show current state of all products and sources |
| `auto-enrich reset` | Reset all state (force full re-scan) |
| `auto-enrich reset --source {source}` | Reset specific source for all products |

## Error Handling

{Table from auto-enrich.md — OneNote dir missing, ADO API failure, etc.}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/product-learn/orchestrator.md
git commit -m "feat(product-learn): create orchestrator with cron-driven detect→extract→merge→synth pipeline

Replaces auto-enrich.md. Focused on state management and agent spawning only.
Extraction logic lives in sources/, rules in shared-rules.md, synthesis in synthesis/.
Initial scan and incremental maintenance use the same pipeline."
```

---

## Task 9: Create synthesis/merge.md

**Files:**
- Create: `.claude/skills/product-learn/synthesis/merge.md`
- Reference: `modes/auto-enrich.md` MERGE section

- [ ] **Step 1: Create synthesis directory**

```bash
mkdir -p .claude/skills/product-learn/synthesis
```

- [ ] **Step 2: Write synthesis/merge.md**

```markdown
# MERGE — Cross-Source Deduplication and ID Unification

> Triggered per-product when all 4 sources are idle.
> Rules reference: `../shared-rules.md`

## Input

Per-source JSONL files:
- `.enrich/known-issues-onenote.jsonl`
- `.enrich/known-issues-ado-wiki.jsonl`
- `.enrich/known-issues-mslearn.jsonl`
- `.enrich/known-issues-contentidea-kb.jsonl`

## Process

{From auto-enrich.md MERGE section:}
1. Read all per-source JSONL files
2. Cross-source dedup (80%/50% thresholds on symptom+rootCause)
3. 21V backfill: entries with 21vApplicable=null get checked against 21v-gaps.json
4. Unified ID rewrite: `{product}-{seq:03d}` (sorted by source priority, then original order)
5. Write merged `known-issues.jsonl`
6. Update progress.json → lastMerged

## Source Priority for ID Ordering

21v-gap refs → onenote → ado-wiki → contentidea → mslearn → case-delta
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/product-learn/synthesis/merge.md
git commit -m "feat(product-learn): create synthesis/merge.md for cross-source dedup"
```

---

## Task 10: Create synthesis/synthesize.md

**Files:**
- Create: `.claude/skills/product-learn/synthesis/synthesize.md`
- Reference: `modes/synthesize.md`

Move the existing synthesize.md content with minimal changes — it's already well-structured.
Main change: update file path references from `phases/` to `sources/`, reference `shared-rules.md`.

- [ ] **Step 1: Write synthesis/synthesize.md**

Copy content from `modes/synthesize.md` with these modifications:
- Replace `phases/global-constraints.md` references → `../shared-rules.md`
- Replace `modes/auto-enrich.md` references → `../orchestrator.md`
- Update any path references to old phase files → new source adapter files
- Remove the "Kusto Skill 轻量化" section (keep separate or move to reference/)

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/product-learn/synthesis/synthesize.md
git commit -m "feat(product-learn): move synthesize.md to synthesis/ directory

Updated internal references to use new file structure (sources/, shared-rules.md)."
```

---

## Task 11: Update SKILL.md — New Routing Table

**Files:**
- Modify: `.claude/skills/product-learn/SKILL.md`

Key changes:
- New routing table pointing to new file locations
- REMOVE the "通用规则" section (now in shared-rules.md)
- REMOVE the "JSONL 条目格式" and "去重规则" inline definitions
- ADD one-line reference: `> 数据写入规范见 shared-rules.md`

- [ ] **Step 1: Read current SKILL.md**

```bash
cat .claude/skills/product-learn/SKILL.md
```

- [ ] **Step 2: Rewrite SKILL.md**

```markdown
---
name: product-learn
displayName: 产品学习
category: inline
stability: dev
description: "从案例、OneNote、ADO Wiki、MS Learn、ContentIdea KB 学习新知识，生成综合排查指南，演进产品排查 Skill。触发词：product-learn、学习、知识积累、复盘。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
  - mcp__local-rag__query_documents
---

# /product-learn — 产品 Skill 知识学习

从多种来源学习新知识，追加到产品 skill 的 `known-issues.jsonl`；
并通过综合管线生成 Markdown 排查指南。

> 数据格式规范（JSONL、去重、ID、写入规则）见 `shared-rules.md`

## 路由表

| 子命令 | 路由到 | 简述 |
|--------|--------|------|
| `auto-enrich` | `orchestrator.md` | Cron 驱动的增量知识富化 |
| `case-review` | `modes/case-review.md` | 归档案例复盘 |
| `promote-case` | `modes/promote-case.md` | Case 增量知识写回 |
| `synthesize` | `synthesis/synthesize.md` | 手动触发综合指南生成 |
| `promote` | `modes/promote.md` | 知识提升到 SKILL.md |
| `ado-wiki rebuild-index` | `sources/ado-wiki.md` | 重建 wiki 页面索引 |
| `add` | 内联（见下方） | 手动添加 known-issue |
| `stats` | 内联（见下方） | 各产品统计概览 |

## 架构概览

```
Orchestrator (orchestrator.md)
  │
  ├── Shared Pool Layer
  │   └── OneNote Router (router/onenote-router.md)
  │
  ├── Per-Product Source Adapters (sources/)
  │   ├── onenote.md    — dual-channel: section mapping + Router
  │   ├── ado-wiki.md   — wiki tree enum, standard + parallel mode
  │   ├── mslearn.md    — toc.yml + GitHub Commits API
  │   └── contentidea.md — WIQL query
  │
  ├── Reference Data (reference/)
  │   └── 21v-gap.md    — Feature Gap cache (not a source)
  │
  └── Synthesis (synthesis/)
      ├── merge.md       — cross-source dedup + ID unification
      └── synthesize.md  — cluster + conflict scan + guide generation
```

## 内联子命令

### add — 手动添加

{Keep existing content}

### stats — 统计概览

{Keep existing content}

## 搜索词参考

{Keep existing content}

## 与 Troubleshooter 集成

{Keep existing content}
```

- [ ] **Step 3: Verify no duplicate rules remain**

```bash
# Should NOT find JSONL format, dedup rules, or ID generation in SKILL.md
grep -c "known-issues.jsonl 路径\|ID 生成\|去重\|append 前必须" .claude/skills/product-learn/SKILL.md
# Expected: 0
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/product-learn/SKILL.md
git commit -m "refactor(product-learn): update SKILL.md routing table for v4 architecture

Removed duplicate rule definitions (now in shared-rules.md).
Updated routing to point to new file structure (sources/, synthesis/, router/)."
```

---

## Task 12: Update knowledge-enricher.md Agent Spec

**Files:**
- Modify: `.claude/agents/knowledge-enricher.md`

Update to reference new file paths and clarify lifecycle.

- [ ] **Step 1: Read current agent spec**

```bash
cat .claude/agents/knowledge-enricher.md
```

- [ ] **Step 2: Update references**

Changes:
- `modes/auto-enrich.md` → `orchestrator.md` (for understanding context)
- `phases/phase{N}-*.md` → `sources/{source}.md`
- `modes/synthesize.md` → `synthesis/synthesize.md`
- Remove any mention of self-chaining
- Clarify: agent reads `sources/{source}.md` + `shared-rules.md` for instructions
- Update "执行" section to reference `sources/` files

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/knowledge-enricher.md
git commit -m "refactor(product-learn): update knowledge-enricher agent to reference new file paths"
```

---

## Task 13: Delete Deprecated Files

**Files:**
- Delete: `phases/global-constraints.md` (absorbed into `shared-rules.md`)
- Delete: `phases/phase2-onenote.md` (replaced by `sources/onenote.md`)
- Delete: `phases/phase3-ado-wiki.md` (replaced by `sources/ado-wiki.md`)
- Delete: `phases/phase4-mslearn.md` (replaced by `sources/mslearn.md`)
- Delete: `phases/phase5-contentidea.md` (replaced by `sources/contentidea.md`)
- Delete: `modes/auto-enrich.md` (replaced by `orchestrator.md`)
- Delete: `modes/ado-wiki-blast.md` (absorbed into `sources/ado-wiki.md`)
- Delete: `modes/synthesize.md` (replaced by `synthesis/synthesize.md`)

**WARNING:** Only delete AFTER verifying all content has been migrated.

- [ ] **Step 1: Verify migration completeness**

For each file to delete, verify its key sections exist in the new location:

```bash
# Check that shared-rules.md covers global-constraints.md topics
echo "=== global-constraints.md sections ==="
grep "^##" .claude/skills/product-learn/phases/global-constraints.md
echo "=== shared-rules.md sections ==="
grep "^##" .claude/skills/product-learn/shared-rules.md

# Check that sources/onenote.md covers phase2
echo "=== phase2 sections ==="
grep "^##\|^###" .claude/skills/product-learn/phases/phase2-onenote.md
echo "=== sources/onenote.md sections ==="
grep "^##\|^###" .claude/skills/product-learn/sources/onenote.md

# Repeat for each pair...
```

- [ ] **Step 2: Delete old files**

```bash
git rm .claude/skills/product-learn/phases/global-constraints.md
git rm .claude/skills/product-learn/phases/phase2-onenote.md
git rm .claude/skills/product-learn/phases/phase3-ado-wiki.md
git rm .claude/skills/product-learn/phases/phase4-mslearn.md
git rm .claude/skills/product-learn/phases/phase5-contentidea.md
git rm .claude/skills/product-learn/modes/auto-enrich.md
git rm .claude/skills/product-learn/modes/ado-wiki-blast.md
git rm .claude/skills/product-learn/modes/synthesize.md
```

- [ ] **Step 3: Remove empty directories if applicable**

```bash
rmdir .claude/skills/product-learn/phases/ 2>/dev/null || true
```

- [ ] **Step 4: Verify no dangling references**

```bash
# Search for references to old file paths across the project
grep -r "phases/global-constraints\|phases/phase2\|phases/phase3\|phases/phase4\|phases/phase5\|modes/auto-enrich\|modes/ado-wiki-blast\|modes/synthesize" \
  .claude/skills/product-learn/ .claude/agents/ --include="*.md" -l
# Expected: 0 files (no dangling references)
```

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor(product-learn): remove deprecated phase/mode files

All content migrated to new structure:
- phases/ → sources/ (self-contained adapters)
- global-constraints.md → shared-rules.md (single authority)
- auto-enrich.md → orchestrator.md (state + spawn only)
- ado-wiki-blast.md → absorbed into sources/ado-wiki.md
- synthesize.md → synthesis/synthesize.md"
```

---

## Task 14: Update products/SKILL.md Troubleshooter Integration

**Files:**
- Modify: `.claude/skills/products/SKILL.md`

Remove the duplicate "How to Use" troubleshooter integration description. Point to one canonical location.

- [ ] **Step 1: Read current file**

```bash
head -60 .claude/skills/products/SKILL.md
```

- [ ] **Step 2: Update Architecture section**

Ensure the troubleshooter consumption path references the source of truth:

```markdown
> Troubleshooter integration details: see `.claude/skills/product-learn/SKILL.md` → "与 Troubleshooter 集成"
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/products/SKILL.md
git commit -m "refactor(products): consolidate troubleshooter integration reference"
```

---

## Summary of Architecture Change

```
BEFORE (v3 Phase Pipeline):              AFTER (v4 Source Adapter):

phases/                                   sources/
  global-constraints.md ─────────→          (absorbed into shared-rules.md)
  phase2-onenote.md ─────────────→        onenote.md (dual-channel)
  phase3-ado-wiki.md ────────────→        ado-wiki.md (+ blast absorbed)
  phase4-mslearn.md ─────────────→        mslearn.md
  phase5-contentidea.md ─────────→        contentidea.md

modes/                                    router/
  auto-enrich.md (900 lines) ────→          onenote-router.md (new)
    Phase 0 (classify) ─────────→
    Phase 1 (21v-gap) ──────────→        reference/
    MERGE section ──────────────→          21v-gap.md (new)
    State machine ──────────────→
                                          orchestrator.md (state only)
  ado-wiki-blast.md ─────────────→        (absorbed into sources/ado-wiki.md)
  synthesize.md ─────────────────→        synthesis/
                                            merge.md (new)
                                            synthesize.md (moved)

SKILL.md (had duplicate rules) ──→        SKILL.md (routing only)
                                          shared-rules.md (single authority)
```
