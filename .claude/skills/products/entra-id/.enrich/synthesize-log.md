# Synthesize Log - Entra ID

**Date**: 2026-04-18
**Mode**: Incremental
**Baseline**: 3640 entries (last synth: 2026-04-07)
**New entries**: 48 (all contentidea-kb)
**Total after update**: 3688

## Topics Updated

| Topic | New Entries | Actionable | Total |
|-------|------------|------------|-------|
| ad-onprem | +4 | 4 | 187 |
| adfs | +6 | 6 | 161 |
| app-consent-registration | +3 | 2 | 164 |
| conditional-access | +1 | 1 | 74 |
| device-registration | +6 | 1 | 118 |
| directory-sync | +4 | 4 | 227 |
| intune-integration | +3 | 1 | 52 |
| kerberos | +1 | 1 | 119 |
| mfa | +1 | 1 | 67 |
| misc | +10 | 1 | 386 |
| provisioning-scim | +1 | 0 | 30 |
| rbac-groups | +2 | 1 | 142 |
| saml-sso | +1 | 1 | 137 |
| sign-in-logs | +3 | 2 | 124 |
| sspr-pwd-writeback | +1 | 1 | 66 |
| wam-oneauth | +2 | 0 | 65 |

## Conflict Report
- 4 minor conflicts (all low severity, near-duplicate wording)
- 2 pure duplicates (dedup-merge)
- 0 severe contradictions

## Duplicate Pairs Detected
| IDs | Topic | Description |
|-----|-------|-------------|
| 3676, 3684 | adfs | ADFS service start failure |
| 3677, 3685 | intune-integration | MDM Terms of Use |
| 3680, 3686 | wam-oneauth | AAD Broker Plugin |
| 3681, 3687 | directory-sync | CloudSync error |
| 3683, 3688 | ad-onprem | AD attribute update |

## Scoring Summary
- Score >= 7.0 (actionable): 28 entries
- Score 5.0-6.9 (doc-only): 20 entries
- Score < 5.0: 0 entries

## Files Modified
- 16 quick-reference guides (guides/*.md)
- 16 detail guides (guides/details/*.md)
- 12 workflow guides (guides/workflows/*.md) - 4 topics had no actionable entries
- guides/_index.md
- guides/conflict-report.md
- .enrich/topic-plan.json
- .enrich/conflict-report.json
- .enrich/progress.json
# Synthesize Log — entra-id — 2026-04-24

## Mode
Incremental (Phase 2.5 + Section 5 only — index generation)

## Summary
- topicsToRegen: 0 (no topic content regeneration needed)
- Phase 2.5: Generated guides/_index.search.jsonl (37 topics)
- Section 5: Updated guides/_index.md to new 9-column format
- Score computation: 4-dim formula (Source Quality + Recency + Validation Strength + 21V Applicability)

## Score Distribution
| Badge | Count | Percentage |
|-------|-------|------------|
| 🟢 (8-10) | 219 | 5.9% |
| 🔵 (5-7.9) | 3246 | 88.0% |
| 🟡 (3-4.9) | 223 | 6.0% |
| ⚪ (<3) | 0 | 0% |

## Topic Statistics
| Metric | Value |
|--------|-------|
| Total topics | 37 |
| Fusion topics (✅) | 36 |
| Workflow topics | 35 |
| Quick-only topics | 1 |
| Total JSONL entries | 3688 |
| Draft files | 1361 |

## Files Generated
| File | Action |
|------|--------|
| guides/_index.search.jsonl | Created (37 records) |
| guides/_index.md | Updated to new format |
| .enrich/progress.json | synthesizeState updated |

---
