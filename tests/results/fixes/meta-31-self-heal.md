# Self-Heal Record: meta-31

- **Pattern Type:** meta_analysis
- **Signature:** result schema inconsistency (result vs status field)
- **Affected Tests:** N/A
- **Diagnosis:** Some executors write result:PASS/FAIL, others write status:pass/fail. Stage-worker reads only status field, missing uppercase result entries. TEST summary miscounted (7 vs 8 passed).
- **Actions Taken:** Recorded to learnings. No code change — iss154 test definition path bug moved to FIX phase for repair.
- **Timestamp:** 2026-03-30T18:56:54Z

## Details

The test loop detected a meta_analysis failure pattern (`result schema inconsistency (result vs status field)`) affecting tests: N/A.

### Actions
Recorded to learnings. No code change — iss154 test definition path bug moved to FIX phase for repair.

### Resolution
This pattern was automatically handled by the self-heal system. Affected tests were skipped and the issue was recorded for future analysis.
