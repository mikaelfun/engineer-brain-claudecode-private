# Self-Heal Record: retro-26-SCAN

- **Pattern Type:** logic_bug
- **Signature:** regex-strips-cjk-in-iscovered
- **Affected Tests:** N/A
- **Diagnosis:** isCovered() [^a-z0-9 ] strips all CJK from AC text before keyword match, causing 83% false positive rate in SCAN
- **Actions Taken:** Created framework fix retro-fix-26-SCAN from Phase Retrospective
- **Timestamp:** 2026-03-29T11:59:11Z

## Details

The test loop detected a logic_bug failure pattern (`regex-strips-cjk-in-iscovered`) affecting tests: N/A.

### Actions
Created framework fix retro-fix-26-SCAN from Phase Retrospective

### Resolution
This pattern was automatically handled by the self-heal system. Affected tests were skipped and the issue was recorded for future analysis.
