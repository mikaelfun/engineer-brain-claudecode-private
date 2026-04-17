# AVD W365 Provisioning 配置 - tenant-score - Issue Details

**Entries**: 4 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. W365 Cloud PC provisioning is limited to 2 per week; customer cannot provision more Cloud PCs
- **ID**: `avd-ado-wiki-370`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Tenant score is below 0.03, placing the tenant in the 'slow lane' due to anti-fraud tenant scoring
- **Solution**: Check tenant trust level via CPCD (https://aka.ms/cpcd) or Kusto query on DailyTenantEvaluation_Snapshot. If legitimate tenant, follow slow lane process flowchart to escalate for score adjustment.
- **Tags**: provisioning, fraud, slow-lane, tenant-score

### 2. Windows 365 Cloud PC provisioning throttled to 2 per week (slow lane) or tenant flagged as fraud/hig...
- **ID**: `avd-ado-wiki-374`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Tenant trust score below 0.03 places it in slow lane; highly suspicious tenants get Cloud PCs deallocated; confirmed fraud tenants get Cloud PCs deprovisioned
- **Solution**: Check tenant trust level via Kusto: CloudPCEvent where Col1 startswith "Evaluation: Called usage service" or DailyTenantEvaluation_Snapshot table. Use CPCD dashboard to view score history. Slow lane: [0, 0.03), Ordinary: [0.03, 0.9), Fast: [0.9, 1.0]. For fraud lifted: tenant re-enabled automatically. Customer email templates available in wiki.
- **Tags**: w365, fraud, abuse, tenant-score, trust-level, slow-lane, kusto, provisioning

### 3. Windows 365 Cloud PC provisioning is extremely slow or limited to only 2 per week
- **ID**: `avd-ado-wiki-376`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Tenant score below 0.03, placing tenant in anti-fraud slow lane which limits provisioning to 2 Cloud PCs per week
- **Solution**: Check tenant trust level via Kusto (CloudPCEvent or DailyTenantEvaluation_Snapshot) or CPCD dashboard. If tenant is legitimate, follow slow lane escalation process to get tenant moved to ordinary/fast lane.
- **Tags**: w365, anti-fraud, slow-lane, provisioning, tenant-score

### 4. Cloud PC provisioning limited to 2 per week, new provisioning requests fail or are throttled
- **ID**: `avd-ado-wiki-380`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Tenant trust score is below 0.03, placing it in slow lane of anti-fraud system
- **Solution**: Check tenant score via CPCD (aka.ms/cpcd) or Kusto query on DailyTenantEvaluation_Snapshot table. If legitimate tenant, follow slow lane process to request trust level review.
- **Tags**: provisioning, anti-fraud, tenant-score, slow-lane, windows-365
