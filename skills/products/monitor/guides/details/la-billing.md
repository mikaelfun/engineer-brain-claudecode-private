# Monitor Log Analytics 计费与承诺层级 - Comprehensive Troubleshooting Guide

**Entries**: 13 | **Drafts fused**: 7 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-Troubleshoot-Log-Analytics-billing.md, ado-wiki-b-Billing-and-cost-management.md, ado-wiki-b-billing-and-refund-issues.md, ado-wiki-c-check-billing-costs.md, ado-wiki-c-Cluster-Ingestion-Volume-BillingStatistics-Detector.md, mslearn-daily-cap-exceeded-investigation.md, mslearn-daily-cap-setup.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Customer still charged for retention after deleting a custom log table

**Solution**: Before deleting the custom table, set table retention to minimum (4 days), then immediately delete the table. Data will be removed after 4 days and no further retention charges apply. Do NOT use data purge for cost purposes — it's meant for GDPR, can take 30 days, and does not affect retention co...

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Customer expects using the Log Analytics purge API to reduce retention billing costs, but billing is not reduced after purge

**Solution**: Explain to customer that purge API is not a billing optimization tool. For retention cost management, configure data retention at workspace or table level properly. Refer to TSG: Troubleshoot Log Analytics billing. Docs: https://learn.microsoft.com/en-gb/azure/azure-monitor/logs/cost-logs

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: Customer raises billing case about Defender for Cloud or Sentinel costs visible in Log Analytics workspace billed costs view

**Solution**: Transfer the case or create a collaboration task with the Security POD for Defender for Cloud and/or Sentinel billed costs issues. Do not attempt to troubleshoot Security product billing within Monitor scope.

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Cannot create new Log Analytics workspaces in the 'Free' tier or move existing workspaces to the 'Free' tier since July 1st 2022. Existing workspaces already in Free Trial tier are unaffected.

**Solution**: Inform customer that the Free tier is deprecated. Workspaces already on Free tier can remain. For new workspaces, use Pay-As-You-Go or other available tiers. Refer to: https://learn.microsoft.com/azure/azure-monitor/logs/cost-logs#free-trial-pricing-tier

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Starting July 1 2022, customers cannot create new Log Analytics workspaces in the legacy Free Trial pricing tier, nor move existing workspaces into this tier.

**Solution**: Inform the customer this is by design. Point them to the public documentation: https://learn.microsoft.com/azure/azure-monitor/logs/cost-logs#free-trial-pricing-tier. Existing Free Trial workspaces are unaffected.

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer still charged for retention after deleting a custom log table | Upon custom log deletion: (1) table definition removed immediately, (2) data ... | Before deleting the custom table, set table retention to minimum (4 days), th... | 8.5 | ADO Wiki |
| 2 | Customer expects using the Log Analytics purge API to reduce retention billin... | The Log Analytics purge API does not affect retention billing. It is intended... | Explain to customer that purge API is not a billing optimization tool. For re... | 8.5 | ADO Wiki |
| 3 | Customer raises billing case about Defender for Cloud or Sentinel costs visib... | Defender for Cloud and Sentinel billing are managed by the Security POD, not ... | Transfer the case or create a collaboration task with the Security POD for De... | 8.5 | ADO Wiki |
| 4 | Cannot create new Log Analytics workspaces in the 'Free' tier or move existin... | By design: the legacy Free Trial pricing tier has been deprecated and disable... | Inform customer that the Free tier is deprecated. Workspaces already on Free ... | 8.5 | ADO Wiki |
| 5 | Starting July 1 2022, customers cannot create new Log Analytics workspaces in... | By design: the Free pricing tier has been deprecated and disabled by Microsof... | Inform the customer this is by design. Point them to the public documentation... | 8.5 | ADO Wiki |
| 6 | Cannot create new Log Analytics workspaces or move existing ones to the 'Free... | By design: the legacy Free Trial pricing tier has been deprecated and disable... | Inform customer this is by design. Point to public documentation: https://lea... | 8.5 | ADO Wiki |
| 7 | Customer reports unexpectedly high billing charges for Azure Monitor Metrics ... | Third-party monitoring tools (e.g., Datadog) making large volumes of Metrics ... | 1) Check Metrics REST API (ARM) calls: query ARMProd Kusto filtering operatio... | 8.5 | ADO Wiki |
| 8 | Customer cannot create new Log Analytics workspaces in the Free Trial pricing... | By design - starting July 1, 2022, the legacy Free Trial pricing tier has bee... | Inform customer this is by design. Existing workspaces already in Free Trial ... | 6.0 | ADO Wiki |
| 9 | Data in the Usage table in Log Analytics has significant latency, up to 3 hou... | By design. The Usage table records are an hourly aggregation and not populate... | Explain to the customer that Usage table latency up to 3 hours is by design (... | 6.0 | ADO Wiki |
| 10 | Customer tries to change Log Analytics cluster capacity reservation to 500 GB... | Known bug in AMS/Control plane pipeline that prevents lowering capacity reser... | Workaround: Use REST API with api-version=2021-06-01 to set capacity reservat... | 6.0 | ADO Wiki |
| 11 | Customer cannot change the retention period for the AzureDiagnostics table. E... | AzureDiagnostics is a custom log table without the mandatory _CL suffix, so t... | RESOLVED (fix deployed 3/1/2022). Customers should now be able to update the ... | 6.0 | ADO Wiki |
| 12 | Cannot create new Log Analytics workspaces in the 'Free' (Free Trial) pricing... | By design: the Free Trial pricing tier has been deprecated and disabled for n... | Inform the customer that the Free tier is deprecated. Point to the public doc... | 6.0 | ADO Wiki |
| 13 | Starting July 1, 2022, customers cannot create new Log Analytics workspaces i... | By design - the Free Trial pricing tier has been deprecated and disabled. Wor... | Inform customer this is by-design. Point to public documentation: https://lea... | 6.0 | ADO Wiki |
