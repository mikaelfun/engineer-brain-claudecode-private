# Azure Product Troubleshooting Skill

> Each product skill contains: diagnostic layer architecture, decision trees, toolchain, and a **synthesized knowledge base** (13,591 entries across 14 products).
> Kusto query templates live in `skills/kusto/{product}/`; product skills reference but don't duplicate them.

## Product Index

| Product | Skill Path | Entries | Topics | Guides | Core Scenarios |
|---------|-----------|---------|--------|--------|----------------|
| [VM/Compute](vm/SKILL.md) | `vm/` | 1,585 | 66 | 116 | Boot failure, unexpected restart, performance, Extension |
| [AKS](aks/SKILL.md) | `aks/` | 1,326 | 187 | 322 | Cluster ops, node NotReady, Autoscaler, upgrade |
| [Entra ID](entra-id/SKILL.md) | `entra-id/` | 3,688 | 37 | 73 | Sign-in failure, Conditional Access, MFA, sync |
| [Intune](intune/SKILL.md) | `intune/` | 1,522 | 49 | 98 | Enrollment, policy deployment, app management |
| [Monitor](monitor/SKILL.md) | `monitor/` | 1,209 | 50 | 85 | Alert not fired, notification delay, SQR |
| [Defender](defender/SKILL.md) | `defender/` | 1,109 | 41 | 82 | MDC, Sentinel, security alerts, CSPM |
| [AVD](avd/SKILL.md) | `avd/` | 694 | 71 | 142 | Connection failed, Session Host, FSLogix |
| [Purview](purview/SKILL.md) | `purview/` | 643 | 42 | 84 | RMS encrypt/decrypt, sensitivity labels, DLP |
| [ARM](arm/SKILL.md) | `arm/` | 508 | 60 | 99 | 429 throttling, deployment failure, Arc |
| [Disk](disk/SKILL.md) | `disk/` | 463 | 41 | 82 | IO throttling, disk ops, performance |
| [Networking](networking/SKILL.md) | `networking/` | 386 | 22 | 44 | VPN, ExpressRoute, AppGw, NSG |
| [EOP](eop/SKILL.md) | `eop/` | 288 | 37 | 74 | Spam, phishing, NDR, mail flow |
| [ACR](acr/SKILL.md) | `acr/` | 109 | 20 | 40 | Image push/pull, auth, rate limit |
| [Automation](automation/SKILL.md) | `automation/` | 61 | 11 | 22 | Runbook, Hybrid Worker, Update Manager |

**Totals**: 13,591 entries | 734 speed-reference tables | 629 fusion guides

## Architecture

```
                    troubleshooter agent
                          |
                    identify product domain
                          |
            +-------------+-------------+
            v                           v
    skills/products/              skills/kusto/
    {product}/                    {product}/
    +------------------------+    +-------------------+
    | SKILL.md               |    | kusto_clusters.csv|
    |   diagnostic layers    |    | tables/{db}/*.md  |
    |   decision trees       |    | queries/*.md      |
    |   toolchain            |    +-------------------+
    +------------------------+
            |
            v (Step 1.5: guides-first lookup)
    +------------------------+
    | guides/                |
    |   _index.md            | <-- topic index (symptom keywords)
    |   {topic}.md           | <-- speed-reference (symptom/cause/solution + scores)
    |   details/{topic}.md   | <-- fusion guide (full KQL + decision trees)
    |   drafts/*.md          | <-- raw extraction drafts (source material)
    |   conflict-report.md   | <-- cross-source contradictions
    +------------------------+
            |
            v (fallback)
    +------------------------+
    | known-issues.jsonl     | <-- 13,591 structured triples (keyword search)
    +------------------------+
            |
            v (final fallback)
    +------------------------+
    | External Sources       |
    |   OneNote KB (RAG)     |
    |   ADO Wiki Search      |
    |   msft-learn MCP       |
    |   ICM MCP              |
    |   D365 Case Data       |
    +------------------------+
```

## Troubleshooter Usage (Step 1.5)

When troubleshooting a case, the agent should follow this lookup chain:

1. **Read SKILL.md** -- get diagnostic layers + decision tree for the product
2. **Read `guides/_index.md`** -- find matching topic by symptom keywords
3. **Read `guides/{topic}.md`** -- speed-reference table with scored symptom/cause/solution
4. **Read `guides/details/{topic}.md`** -- fusion guide with full KQL queries, decision trees, and source annotations (if exists)
5. **Keyword search `known-issues.jsonl`** -- fallback if no topic matches
6. **External search** -- RAG / MS Learn / ADO Wiki

### Score Legend (in speed-reference tables)

| Score | Meaning |
|-------|---------|
| 8-10  | Directly trustworthy (multi-source verified) |
| 5-7.9 | Reference, verify key steps |
| 3-4.9 | Directional only |
| 0-2.9 | Possibly outdated |

### Source Priority (for conflict resolution)

| Priority | Source | Weight |
|----------|--------|--------|
| 1 | OneNote team KB | 5 |
| 2 | ADO Wiki TSG | 4 |
| 3 | ContentIdea KB | 3 |
| 4 | MS Learn docs | 2 |
| 5 | Case review | 1 |

## Directory Structure

```
skills/products/
  SKILL.md                          <-- this file (product index + architecture)
  enrich-state.json                 <-- global enrichment state
  page-classification.jsonl         <-- OneNote page-to-product mapping (4,002 pages)
  {product}/
    SKILL.md                        <-- product-specific skill (layers + decision trees + KB section)
    known-issues.jsonl              <-- structured break/fix triples (append-only)
    21v-gaps.json                   <-- 21Vianet unsupported features cache
    guides/
      _index.md                     <-- topic index with keywords
      {topic-slug}.md               <-- speed-reference table
      details/{topic-slug}.md       <-- fusion troubleshooting guide (KQL + decision logic)
      drafts/*.md                   <-- raw extraction drafts (source material, do NOT delete)
      conflict-report.md            <-- cross-source contradiction report
    .enrich/
      progress.json                 <-- per-product enrichment state
      topic-plan.json               <-- LLM topic clustering plan
      conflict-report.json          <-- structured conflict data
      known-issues-{source}.jsonl   <-- per-source extraction (pre-merge)
      scanned-{source}.json         <-- scan progress tracking
      evolution-log.md              <-- audit trail
      synthesize-log.md             <-- synthesis audit
```

## known-issues.jsonl Format

Each line is a JSON object:

```json
{"id":"vm-001","date":"2026-03-31","symptom":"AllocationFailed with Pinning","rootCause":"VM pinned to specific hardware","solution":"Stop-Deallocate then Start","source":"ado-wiki","sourceRef":"wiki/path","sourceUrl":"https://...","product":"vm","confidence":"high","quality":"raw","tags":["allocation","pinning"],"21vApplicable":true,"promoted":false}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | `{product}-{seq:03d}` format |
| `date` | Yes | Discovery date |
| `symptom` | Yes | Problem description |
| `rootCause` | Yes | Root cause analysis |
| `solution` | Yes | Resolution steps |
| `source` | Yes | `onenote` / `ado-wiki` / `mslearn` / `contentidea-kb` / `case` / `manual` |
| `sourceRef` | No | Relative path or wiki path |
| `sourceUrl` | No | Full URL (mslearn/ado-wiki) |
| `product` | Yes | Product domain |
| `confidence` | Yes | `high` / `medium` / `low` |
| `quality` | No | `raw` / `guide-draft` |
| `tags` | No | Keyword array |
| `21vApplicable` | No | Mooncake compatibility flag |
| `promoted` | Yes | Whether promoted to SKILL.md |

## Data Source Distribution

| Source | Entries | Percentage |
|--------|---------|------------|
| ADO Wiki | 9,197 | 67.7% |
| MS Learn | 1,621 | 11.9% |
| OneNote | 1,472 | 10.8% |
| ContentIdea KB | 1,269 | 9.3% |
| 21V Gap | 32 | 0.2% |

## Evolution Protocol

### Six Trigger Sources

| # | Trigger | Command | Auto/Manual |
|---|---------|---------|-------------|
| 1 | Post-troubleshoot writeback | (automatic after troubleshooter) | Auto |
| 2 | OneNote team KB scan | `/product-learn onenote {product}` | Manual |
| 3 | ADO Wiki TSG scan | `/product-learn ado-wiki {product}` | Manual |
| 4 | MS Learn doc scan | (via auto-enrich) | Auto |
| 5 | ContentIdea KB scan | (via auto-enrich) | Auto |
| 6 | Manual input | `/product-learn add {product}` | Manual |

### Full Auto-Enrich Pipeline

```
/product-learn auto-enrich
  Phase 0: page-classify (OneNote pages -> product mapping)
  Phase 1: 21v-gap-scan (unsupported features cache)
  Phase 2: onenote-extract (team KB -> triples)
  Phase 3: ado-wiki-scan (TSG -> triples)
  Phase 4: mslearn-scan (docs -> triples)
  Phase 5: contentidea-kb-scan (KB articles -> triples)
  MERGE: cross-source dedup + 21V marking + ID renumbering
  SYNTHESIZE: topic clustering -> conflict detection -> guide generation
```

### Knowledge Promotion

When `known-issues.jsonl` entries meet these criteria, promote to SKILL.md:

- **High frequency**: same symptom appears 3+ times (confidence = high)
- **High impact**: causes data loss or service outage
- **New path**: uncovered diagnostic path not in SKILL.md decision tree

Command: `/product-learn promote {product}`

### Knowledge Deprecation

- Entry not matched in 6+ months -> lower to `confidence: "low"`
- Troubleshooter finds entry no longer applicable -> mark `deprecated: true`
