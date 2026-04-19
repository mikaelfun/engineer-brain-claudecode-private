# MERGE — Cross-Source Deduplication and ID Unification

> Triggered per-product when all 4 sources are idle.
> Also manually via `/product-learn synthesize {product}` (MERGE runs as pre-step).
> Rules reference: `../shared-rules.md`

## Trigger Conditions

- **Automatic**: All 4 source states (onenote, ado-wiki, mslearn, contentidea) are `idle`
- **Manual**: `/product-learn synthesize {product}` always runs MERGE first

## Input

Per-source JSONL files (under `.claude/skills/products/{product}/.enrich/`):
- `known-issues-onenote.jsonl`
- `known-issues-ado-wiki.jsonl`
- `known-issues-mslearn.jsonl`
- `known-issues-contentidea-kb.jsonl`

## Process

1. **Read all per-source JSONL files**

2. **Cross-source dedup** (compare `symptom[:100]` + `rootCause[:100]` keywords):
   | Overlap | Action |
   |---------|--------|
   | ≥ 80% | Keep entry with higher `confidence`, discard other |
   | 50-80% | Keep both, add mutual `relatedTo` |
   | < 50% | Keep both |

3. **21V backfill**: Read `21v-gaps.json` (if exists)
   - Entries with `21vApplicable === null` → check solution against `unsupportedFeatures`
   - Matches → set `21vApplicable: false`, add tag `"21v-unsupported"`
   - No match → set `21vApplicable: true`

4. **Unified ID rewrite**: Sort all retained entries by source priority, then original order within source. Rewrite IDs as `{product}-{seq:03d}`.

   Source priority: `onenote` → `ado-wiki` → `contentidea-kb` → `mslearn` → `case-delta` → `manual`

5. **Write merged `known-issues.jsonl`** (the file SYNTHESIZE reads)

6. **Update `progress.json → lastMerged`** to current timestamp

## Output

`.claude/skills/products/{product}/known-issues.jsonl` — unified, deduplicated, with final IDs.

## Notes

- Per-source JSONL files are NOT deleted after merge (kept for incremental re-merge)
- The merged `known-issues.jsonl` is the SYNTHESIZE input — it gets overwritten on each merge
- MERGE is idempotent — running it twice produces the same result
