# Monitor Log Analytics 自定义日志 - Comprehensive Troubleshooting Guide

**Entries**: 3 | **Drafts fused**: 6 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-Send-data-using-DCR-based-custom-logs-API.md, ado-wiki-b-HTTP-Data-Collector-API-Custom-Logs-TSG.md, ado-wiki-c-check-agent-custom-logs-reaching-ods.md, ado-wiki-c-dcr-timestamp-delimitation-custom-logs.md, ado-wiki-d-AMA-HT-Add-Computer-FilePath-Custom-Log.md, ado-wiki-e-custom-logs-management.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Custom log table query returns 400 Bad Request when run in resource context (e.g., from a specific Azure resource's Logs blade)

**Solution**: Inform customer this is not supported. They should run the query in workspace context instead (navigate to Log Analytics workspace → Logs). For AzureNetworkAnalytics_CL specifically, Traffic Analytics does not emit _ResourceId values, making resource scope impossible.

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Custom log table query returns 400 Bad Request in resource context (from Azure resource Logs blade)

**Solution**: Not supported. Run query in workspace context instead. AzureNetworkAnalytics_CL specifically never emits _ResourceId.

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: AMA Linux JSON log collection stops working after upgrading to AMA Linux 1.31.0+ (Windows 1.25.0+); RawData column empty, data not parsed into custom columns

**Solution**: Use ARM template with table schema matching JSON tags instead of portal-created DCR. Ref: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=arm#incoming-stream

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Custom log table query returns 400 Bad Request when run in resource context (... | Resource context queries are only supported for specific resource types: subs... | Inform customer this is not supported. They should run the query in workspace... | 8.5 | ADO Wiki |
| 2 | Custom log table query returns 400 Bad Request in resource context (from Azur... | Resource context queries only supported for: subscription, resourceGroup, mic... | Not supported. Run query in workspace context instead. AzureNetworkAnalytics_... | 8.5 | ADO Wiki |
| 3 | AMA Linux JSON log collection stops working after upgrading to AMA Linux 1.31... | Breaking change from preview to GA: JSON logs now auto-parsed into columns ma... | Use ARM template with table schema matching JSON tags instead of portal-creat... | 8.5 | ADO Wiki |
