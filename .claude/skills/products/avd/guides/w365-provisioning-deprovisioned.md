# AVD W365 Provisioning 配置 - deprovisioned - Quick Reference

**Entries**: 5 | **21V**: all applicable
**Keywords**: abuse, anti-fraud, deallocated, deprovisioned, fraud, frog, hit, ice
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Windows 365 Cloud PCs suddenly deprovisioned or deallocated; existing Cloud PCs ... | Tenant flagged as abuse (IsAbuse=true) or HighlySuspicious by fraud/abuse detect... | Check CPCD for IsAbuse flag and TrustLevel. For abuse: raise DFM Collab with FRO... | 🔵 7.5 | ADO Wiki |
| 2 | All Cloud PCs under a W365 tenant are deprovisioned unexpectedly | Tenant confirmed as fraud by HIT (Human Investigation Team); all Cloud PCs are a... | Check tenant fraud status via CPCD or Reporting Kusto. If fraud decision was inc... | 🔵 7.5 | ADO Wiki |
| 3 | All Cloud PCs under tenant are deprovisioned due to fraud confirmation | Tenant confirmed as fraud by HIT (Human Investigation Team), triggering automati... | Check fraud status in CPCD. If fraud upheld: inform customer subscription remain... | 🔵 7.5 | ADO Wiki |
| 4 | All Cloud PCs under tenant are deallocated (stopped) and customer cannot start t... | Tenant marked as highly suspicious or confirmed fraud by Human Investigation Tea... | Check HIT status via CPCD or Kusto DailyTenantEvaluation_Snapshot. For suspiciou... | 🔵 7.5 | ADO Wiki |
| 5 | All Windows 365 Cloud PCs deallocated or deprovisioned; tenant marked as highly ... | Tenant flagged as highly suspicious (Cloud PCs deallocated) or confirmed fraud b... | Check tenant trust level via CPCD or Reporting Kusto (DailyTenantEvaluation_Snap... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: Tenant flagged as abuse (IsAbuse=true) or HighlySu `[Source: ADO Wiki]`
2. Check: Tenant confirmed as fraud by HIT (Human Investigat `[Source: ADO Wiki]`
3. Check: Tenant marked as highly suspicious or confirmed fr `[Source: ADO Wiki]`
4. Check: Tenant flagged as highly suspicious (Cloud PCs dea `[Source: ADO Wiki]`
