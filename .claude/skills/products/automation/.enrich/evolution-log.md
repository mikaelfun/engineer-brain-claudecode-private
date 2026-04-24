| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-05 | 21v-gap-scan | 0 unsupported, 0 partial features (noGapDataFound=true, podServicesDir=null) | — |
| 2026-04-05 | onenote-extract | Batch 1: 10 pages processed → 9 break/fix entries (001-009) + 3 guide-drafts (010-012). Topics: scheduled jobs, sandbox limits, hybrid worker, storage firewall, subscription context, Update Mgmt Linux, Az module update, billing API 403, Python SDK guides. | MCVKB 16.1-16.9 + 24.1 |
| 2026-04-05 | contentidea-kb | Batch 1: 10 WIs scanned (7 extracted, 3 skipped). 3 Break/Fix (SMA DynamicActivities, HRW RunAsConnection, Restore Deleted Account) + 4 Informational (debug stream, diagnostics script, resource sync, TLS1.2). IDs: automation-contentidea-kb-001..007. | ContentIdea#60956,62594,64445,66012,69477,72543,76063 |
### 2026-04-05 Phase2 onenote tick3
- **Scanned**: 10 pages (MCVKB section header + 9 POD Notebook Automation pages)
- **Discovered**: 5 new entries (automation-onenote-013 ~ 017)
  - 013: ARI runbook fails in Mooncake (no Runtime Environment)
  - 014: Runbook sandbox crash + manual stop (Kusto trace methodology)
  - 015: UM Linux VM disappear - CROND disabled
  - 016: UM Linux VM disappear - proxy blocks IMDS
  - 017: guide-draft: definition updates install time check
- **Deduplicated**: 0 (015/016 related to 007 but different root causes)
- **Skipped**: 5 pages (section headers, video-only link)
- **Total scanned**: 20/67, remaining: 47

## 2026-04-05 contentidea-kb scan (batch 2)
- Scanned: 10 work items (76066,76106,76372,76704,80375,80394,83572,84382,84383,87430)
- Discovered: 5 new entries (008-012)
- Skipped: 5 (76066 dup, 76106 dup KB, 80375 SC/SM, 84383 dup KB, 87430 update req)
- Deduplicated: 0
- Topics: Log Analytics billing KQL, restore deleted runbook, OMS Agent Linux reinstall, Update Management PS version, Find-AzureRmResource deprecated
- Remaining: 7 items

## 2026-04-05 Phase 2 tick 3 (onenote-extract)
- **Pages scanned**: 10 (Common Code Samples ×3, Feature releasement ×4, Key Concepts, PG Info, Training)
- **Break/fix extracted**: 4 (018-021: debug interaction prompt, UM non-chinaeast2 onboard, Change Tracking FIM-only, Modules Gallery + feature gaps)
- **Guide drafts created**: 3 (022-024: SQL Azure runbook, Mooncake auth, Feature Gap matrix + AUMv2 regions)
- **Deduplicated**: 0
- **Total scanned**: 30/67 | **Remaining**: 37

### 2026-04-05 contentidea-kb (final batch)
- Scanned 7 remaining work items: 91999, 92925, 96678, 107905, 117786, 125410, 205650
- Extracted 3 entries (013-015): Connect-AzureRmAccount interactive auth error, MMA diagnostic script, WU 0x8024402F Azure Firewall
- Skipped 4 (empty/test/deprecated)
- **Source exhausted**: all 27 ContentIdea KB items for automation scanned
[2026-04-05] MERGE: 86 entries from 3 sources (onenote:54, mslearn:17, contentidea-kb:15), 0 deduped, 7 related pairs
[2026-04-05] SYNTHESIZE: 12 guides generated, 82 entries kept, 4 discarded (half-entries)

### 2026-04-17 10:15 UTC — contentidea-kb refresh (automation)
- WIQL returned 27 work items (keywords: Automation, Update Manager)
- All 27 already scanned; diff = 0
- lastRefreshed updated (was null)
- Result: exhausted=true, discovered=0, deduplicated=0
| 2026-04-24 | SYNTHESIZE | 11 topics (10 fusion, 1 compact), 57 entries, 0 Kusto queries fused |
