# OneNote Integration into Casework & Troubleshooter

> ISS-121 | 2026-03-31

## Problem

OneNote notebooks contain high-value knowledge that the current casework and troubleshooter flows don't leverage:

- **Personal notebook** ("Kun Fang OneNote"): Per-case notes from remote sessions, screenshots, customer confirmations — short but contextually rich, needs LLM to extract meaning.
- **Team notebooks** (multiple, incrementally onboarded):
  - **MCVKB**: Team-curated knowledge base — troubleshooting guides, case reviews, best practices, ICM templates.
  - **Mooncake POD Support Notebook**: Core team notebook — larger and more comprehensive, content varies widely. Being incrementally imported.
  - Additional team notebooks may be added over time. Each notebook's content profile (what topics it covers, what it's best at) can be analyzed by LLM after import for auto-categorization.
  - All team notebooks are the highest-quality knowledge source for case resolution, but require freshness and 21v-applicability assessment.

Neither is currently integrated into the automated case processing pipeline.

## Design

### Two-Stage OneNote Search

The integration adds two independent search stages at different points in the pipeline, serving different purposes.

#### Stage 1: Personal Notes Search (casework B2, parallel agent)

**Purpose**: Retrieve the engineer's own notes about this specific case — remote session findings, customer confirmations, screenshots, action items.

**New agent**: `.claude/agents/onenote-case-search.md`

```yaml
---
name: onenote-case-search
description: "Search personal OneNote for case-specific notes"
tools: Bash, Read, Write, Glob, Grep
model: sonnet
maxTurns: 15
---
```

**Execution flow**:
1. Read `case-info.md` to extract search identifiers: case number, customer name, subscription ID, contact name
2. Read onenote-export `config.json` to get `outputDir`
3. Determine personal notebook path: `{outputDir}/Kun Fang OneNote/` (configurable via `config.json` if needed later)
4. Search using ripgrep (Glob for filenames, Grep for content) with identifiers as keywords
5. Read matched files (typically 1-3 short pages)
6. LLM extracts key information: remote session conclusions, customer-confirmed facts, screenshot descriptions, pending action items
7. Write structured summary to `{caseDir}/onenote/personal-notes.md`

**Output format** (`personal-notes.md`):
```markdown
# Personal OneNote Notes — Case {caseNumber}

> Searched: {timestamp} | Source: Kun Fang OneNote
> Matched pages: {count}

## {Page Title 1}
- **Modified**: {date from frontmatter}
- **Section**: {notebook path}
- **Key findings**:
  - {extracted insight 1}
  - {extracted insight 2}

## {Page Title 2}
...

## Summary
{1-2 sentence synthesis of what the personal notes tell us about this case}
```

**Timing**: Spawned in casework B2 alongside teams-search, runs in background. Result read by troubleshooter/email-drafter from disk.

**No-match behavior**: If no pages match, write a minimal file noting "No personal OneNote notes found for this case" so downstream agents don't re-search.

#### Stage 2: Team Knowledge Base Search (troubleshooter Step 3, inline)

**Purpose**: Find relevant troubleshooting knowledge, case reviews, and best practices from the team's accumulated expertise.

**Modified file**: `.claude/agents/troubleshooter.md` — enhance Step 3 "Knowledge Base Search"

**New search priority order**:
1. **OneNote team notebooks** (all imported notebooks) — highest quality, real engineer experience
2. **ADO Wiki** — good but global-cloud-focused, may have feature/tool gaps for 21v
3. **Microsoft Learn** — official but shallow
4. **WebSearch** — broadest but lowest signal

**OneNote search within troubleshooter**:
1. Based on problem understanding from Step 1, generate 3-5 keyword groups (reuse onenote-search skill's LLM keyword rewriting logic):
   - Product/service name + variants (e.g., "AKS" / "Kubernetes" / "容器服务")
   - Problem type (e.g., "image pull failure" / "镜像拉取失败")
   - Error codes or specific identifiers
2. Search all team notebook directories listed in `config.json` `onenote.teamNotebooks[]`:
   - `{outputDir}/MCVKB/`
   - `{outputDir}/Mooncake POD Support Notebook/` (when imported)
   - Any future notebooks added to the array
3. Read matched files and assess:
   - **Freshness**: Check frontmatter `modified` timestamp. Content older than 12 months gets `[Possibly outdated - last modified {date}]` warning.
   - **21v applicability**: Judge whether content applies to 21v China Cloud using:
     1. **Feature gap tables in OneNote**: Team notebooks contain per-product feature gap tables (e.g., in MCVKB). Use these as primary reference.
     2. **msft-learn official docs**: Azure China docs (`docs.azure.cn`) describe per-service feature differences. Query via msft-learn MCP with `"{product} Azure China feature differences"`.
     3. Flag content referencing global-only features, tools, or endpoints. Tag as `21v: Partial` or `Global-only` with specific gaps noted.
   - **Relevance**: Rate match quality (direct match vs tangential)
4. Write results to `{caseDir}/research/research.md` under new section `## OneNote Team Knowledge Base`

**Research output format** (appended to `research.md`):
```markdown
## OneNote Team Knowledge Base
- [{Page Title}]({relative path}) — {relevance summary} | Modified: {date} | 21v: {Compatible|Partial|Global-only}
  - Key insight: {1-2 sentences}
  - [Possibly outdated - last modified 2024-01-15] (if applicable)
```

### Knowledge Preservation

During troubleshooting, the troubleshooter agent often discovers useful knowledge that isn't directly applicable to the current case. This should not be lost.

**Mechanism**:
- All search results (used or not) are written to `{caseDir}/research/research.md` with usage status tags: `[Applied]`, `[Relevant-unused]`, `[Background]`
- If the troubleshooter identifies systemic improvement opportunities (e.g., "MCVKB is missing a page for this common scenario"), it adds a `## Improvement Suggestions` section at the end of the analysis report
- The inspection-writer can later scan this section and generate issues via the issue tracker

### Configuration

Add to `config.json`:
```json
{
  "onenote": {
    "personalNotebook": "Kun Fang OneNote",
    "teamNotebooks": ["MCVKB"],
    "freshnessThresholdMonths": 12
  }
}
```

`teamNotebooks` is an array — add `"Mooncake POD Support Notebook"` after import. The troubleshooter searches all listed notebooks. Each notebook's content profile can be analyzed by LLM post-import to auto-categorize its strengths (e.g., "MCVKB is strong on VM/AKS troubleshooting, Mooncake POD covers escalation workflows and cross-team coordination").

### File Changes Summary

| File | Change |
|------|--------|
| `.claude/agents/onenote-case-search.md` | **New** — Personal notes search agent |
| `.claude/agents/troubleshooter.md` | **Modify** — Add OneNote team notebooks search to Step 3, reorder knowledge source priority |
| `.claude/skills/casework/SKILL.md` | **Modify** — Add onenote-case-search spawn in B2 |
| `.claude/skills/troubleshoot/SKILL.md` | **No change** — troubleshooter agent definition handles it |
| `config.json` | **Modify** — Add `onenote` config block |
| `CLAUDE.md` | **Modify** — Register new agent in agent table |

### What This Does NOT Change

- `onenote-search` skill remains standalone — users can still invoke `/onenote-search` directly
- `onenote-export` is unchanged — it already exports with timestamps
- `local-rag` integration is deferred — when `rag-sync` auto-embed is solved, Stage 2 can switch to vector search first, ripgrep second
- No new MCP servers needed — all search uses existing Glob/Grep tools

### Future: local-rag Integration

When the `onenote-export → rag-sync` auto-embed pipeline is working:
- Stage 2 switches to: `local-rag vector search → ripgrep supplement → merge & deduplicate`
- Stage 1 stays ripgrep-based (personal notes are short, keyword matching is sufficient)
- This is a configuration change, not an architectural change
