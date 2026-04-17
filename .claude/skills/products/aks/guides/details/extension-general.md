# AKS 扩展与插件通用 -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: extension-manager.md
**Generated**: 2026-04-07

---

## Phase 1: Cost Analysis addon requires standard or premium t

### aks-701: Cost Analysis data not appearing in Azure portal for AKS cluster. Cost Analysis ...

**Root Cause**: Cost Analysis addon requires standard or premium tier (not free) and managed identity. Scraper agent runs in cluster overlay, exports resource usage to AKS PAV2 EventHub -> CostManagement. Failures can be due to agent pod issues, HTTP 5xx errors, or EventHub export problems.

**Solution**:
1) Verify addon active in ASI (may take 24h to sync). 2) Check CCP Pod Events for cost-analysis-* CronJobs. 3) Query CostAnalysis Kusto table for exported data. 4) Check error logs (data.level == 'error'). 5) For agent pod issues: check KubeSystemEvents. 6) If data exported successfully but not showing in portal: escalate to C+E CGI Cost Management/AIP-ACISTORE.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FCost%20Analysis%20Addon)]`

## Phase 2: Subscription billing constraints, regional availab

### aks-1261: Kubernetes marketplace offer fails: payment instrument not supported; offer cann...

**Root Cause**: Subscription billing constraints, regional availability restrictions, or legal terms not accepted

**Solution**:
Verify subscription billing configuration; check offer regional availability; accept legal terms via Azure portal, CLI, or PowerShell

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-failed-kubernetes-deployment-offer)]`

## Phase 3: OSBA defaults to global Azure environment. Without

### aks-205: Open Service Broker for Azure (OSBA) helm install succeeds but broker fails to p...

**Root Cause**: OSBA defaults to global Azure environment. Without specifying azure.environment=AzureChinaCloud, the broker attempts to use global Azure endpoints which are not accessible from Mooncake.

**Solution**:
Add --set azure.environment=AzureChinaCloud to the helm install command for OSBA in Mooncake.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cost Analysis data not appearing in Azure portal for AKS cluster. Cost Analysis ... | Cost Analysis addon requires standard or premium tier (not f... | 1) Verify addon active in ASI (may take 24h to sync). 2) Che... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FCost%20Analysis%20Addon) |
| 2 | Kubernetes marketplace offer fails: payment instrument not supported; offer cann... | Subscription billing constraints, regional availability rest... | Verify subscription billing configuration; check offer regio... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-failed-kubernetes-deployment-offer) |
| 3 | Open Service Broker for Azure (OSBA) helm install succeeds but broker fails to p... | OSBA defaults to global Azure environment. Without specifyin... | Add --set azure.environment=AzureChinaCloud to the helm inst... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
