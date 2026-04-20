# VM Synthesize Log

## Run: 2026-04-18 (Incremental)

### Input
- JSONL entries: 1585 (1375 unique IDs)
- Previous synthesis: 2026-04-07 (66 topics, 1559 entries)
- Unsynthesized entries: 26

### Classification
| Category | Count | Action |
|----------|-------|--------|
| SCVMM (on-prem) | 11 | New topic: vm-scvmm |
| Internal process (no value) | 6 | Skipped |
| Windows OS | 3 | Merged into vm-windows-os |
| Linux OS | 1 | Merged into vm-linux-os |
| Extension | 2 | Merged into vm-extension-d |
| Provisioning | 1 | Merged into vm-provisioning-i |
| Encryption | 1 | Merged into vm-encryption |
| Debug tools | 1 | Merged into vm-general |

### Output
- Topics updated: 7 (6 existing + 1 new)
- New topic: vm-scvmm (11 entries, on-premises reference)
- Files generated/updated:
  - guides/vm-scvmm.md (new)
  - guides/details/vm-scvmm.md (new)
  - guides/vm-windows-os.md (+3 entries)
  - guides/details/vm-windows-os.md (+3 entries)
  - guides/vm-linux-os.md (+1 entry)
  - guides/details/vm-linux-os.md (+1 entry)
  - guides/vm-extension-d.md (+2 entries)
  - guides/details/vm-extension-d.md (new)
  - guides/vm-provisioning-i.md (+1 entry)
  - guides/details/vm-provisioning-i.md (+1 entry)
  - guides/vm-encryption.md (+1 entry)
  - guides/details/vm-encryption.md (new)
  - guides/vm-general.md (+1 entry)
  - guides/details/vm-general.md (+1 entry)
  - guides/conflict-report.md (updated)
  - guides/_index.md (updated)

### Conflict Report
- Cross-source conflicts: 0
- Reason: All 26 new entries from contentidea-kb with cause=? / resolution=?

### Scoring Summary
- New entries score range: 4.0 - 5.0
- SCVMM entries: 4.0 (on-prem, no 21V applicability)
- Azure entries: 5.0 (general, no verified resolution)
- All entries lack verified cause/resolution (verification=0)

### Notes
- 6 skipped entries are internal process docs (GetSub deprecation, Linux SME process, CRI/IcM creation, broken SharePoint links)
- SCVMM topic marked as on-premises reference only, not Azure IaaS
- No workflow files generated for incremental entries (all hasFusionGuide-eligible topics already have workflows)
