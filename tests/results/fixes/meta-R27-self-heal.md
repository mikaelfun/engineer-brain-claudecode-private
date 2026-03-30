# Self-Heal Record: meta-R27

- **Pattern Type:** meta_analysis
- **Signature:** fix-analyzer schema mismatch: d.status vs d.result
- **Affected Tests:** N/A
- **Diagnosis:** fix-analyzer reads d.status but all result JSONs use d.result field; caused analyzer to skip analysis for all failed tests
- **Actions Taken:** Injected framework fix from meta-analysis R27
- **Timestamp:** 2026-03-29T22:50:31Z

## Details

The test loop detected a meta_analysis failure pattern (`fix-analyzer schema mismatch: d.status vs d.result`) affecting tests: N/A.

### Actions
Injected framework fix from meta-analysis R27

### Resolution
This pattern was automatically handled by the self-heal system. Affected tests were skipped and the issue was recorded for future analysis.
