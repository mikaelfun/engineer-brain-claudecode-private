# Monitor Log Analytics 工作区管理 - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Drafts fused**: 12 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-LA-workspace-Data-Export-Troubleshooting.md, ado-wiki-a-Locate-VM-Workspace-AMA.md, ado-wiki-b-How-to-deploy-log-forwarder-to-ingest-syslog-to-log-analytics-workspace.md, ado-wiki-c-AppLens-Workspace-Details-Detector.md, ado-wiki-c-Check-LA-Workspace-Agent-Heartbeat-Connectivity.md, ado-wiki-c-Create-Log-Analytics-workspace.md, ado-wiki-c-Delete-Log-Analytics-workspace.md, ado-wiki-c-find-workspace-info.md, ado-wiki-c-Investigate-Workspace-properties-Solutions-changes.md, ado-wiki-e-use-query-draft-telemetry-via-la-workspace.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Log Analytics workspace solution cannot be removed via Azure Portal, CLI (az monitor log-analytics solution delete), or PowerShell (Remove-AzMonitorLogAnalyticsSolution). Solution still appears lis...

**Solution**: 1) Check if Intelligence Pack is disabled: use Workspace Dashboard Tool or Get-AzOperationalInsightsIntelligencePack cmdlet. 2) If still enabled, disable via: a) REST API Intelligence Packs Disable, b) PowerShell Set-AzOperationalInsightsIntelligencePack -Enabled $false, c) CLI az monitor log-ana...

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Customer cannot recover a recently deleted Log Analytics workspace even within the 14-day soft-delete recovery period

**Solution**: Verify using Kusto query on armprodgbl.eastus cluster (ARMProd database): query Unionizer(Requests, EventServiceEntries) filtering by subscriptionId and operationName =~ Microsoft.OperationalInsights/workspaces/delete. Check the wasPermanentlyDeleted field (extracted from force parameter in httpR...

`[Source: ADO Wiki, Score: 6.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Log Analytics workspace solution cannot be removed via Azure Portal, CLI (az ... | The solution underlying Intelligence Pack may still be enabled in the workspa... | 1) Check if Intelligence Pack is disabled: use Workspace Dashboard Tool or Ge... | 8.5 | ADO Wiki |
| 2 | Customer cannot recover a recently deleted Log Analytics workspace even withi... | Workspace was deleted using the force parameter which permanently deletes the... | Verify using Kusto query on armprodgbl.eastus cluster (ARMProd database): que... | 6.0 | ADO Wiki |
