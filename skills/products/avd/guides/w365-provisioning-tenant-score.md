# AVD W365 Provisioning 配置 - tenant-score - Quick Reference

**Entries**: 4 | **21V**: all applicable
**Keywords**: abuse, anti-fraud, fraud, kusto, provisioning, slow-lane, tenant-score, trust-level
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | W365 Cloud PC provisioning is limited to 2 per week; customer cannot provision m... | Tenant score is below 0.03, placing the tenant in the 'slow lane' due to anti-fr... | Check tenant trust level via CPCD (https://aka.ms/cpcd) or Kusto query on DailyT... | 🔵 7.5 | ADO Wiki |
| 2 | Windows 365 Cloud PC provisioning throttled to 2 per week (slow lane) or tenant ... | Tenant trust score below 0.03 places it in slow lane; highly suspicious tenants ... | Check tenant trust level via Kusto: CloudPCEvent where Col1 startswith "Evaluati... | 🔵 7.5 | ADO Wiki |
| 3 | Windows 365 Cloud PC provisioning is extremely slow or limited to only 2 per wee... | Tenant score below 0.03, placing tenant in anti-fraud slow lane which limits pro... | Check tenant trust level via Kusto (CloudPCEvent or DailyTenantEvaluation_Snapsh... | 🔵 7.5 | ADO Wiki |
| 4 | Cloud PC provisioning limited to 2 per week, new provisioning requests fail or a... | Tenant trust score is below 0.03, placing it in slow lane of anti-fraud system | Check tenant score via CPCD (aka.ms/cpcd) or Kusto query on DailyTenantEvaluatio... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: Tenant score is below 0.03, placing the tenant in `[Source: ADO Wiki]`
2. Check: Tenant trust score below 0.03 places it in slow la `[Source: ADO Wiki]`
3. Check: Tenant score below 0.03, placing tenant in anti-fr `[Source: ADO Wiki]`
4. Check: Tenant trust score is below 0.03, placing it in sl `[Source: ADO Wiki]`
