# AKS ACR 认证与 RBAC — kusto -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-acr-caching-kusto-logging.md, ado-wiki-acr-kusto-access.md, ado-wiki-acr-kusto-login-issues.md, ado-wiki-acr-kusto-queries.md
**Generated**: 2026-04-07

---

## Phase 1: Various causes - need to check BuildHostTrace Kust

### aks-352: ACR tasks are not being triggered or failing to complete with no actionable outp...

**Root Cause**: Various causes - need to check BuildHostTrace Kusto logs to identify specific failure reason from RunnerLogs and RunResult tags

**Solution**:
Query cluster("ACR").database("acrprod").BuildHostTrace with Tag containing the ACR FQDN. Check RunnerLogs for build errors and RunResult dataJson for trigger type and status. Use RunId to locate task run in Azure portal for detailed logs.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FCheck%20ACR%20tasks%20and%20outputs)]`

## Phase 2: Customer exceeds 10 concurrent pull limit for thei

### aks-354: ACR throttling errors: 'too many requests' when pulling or pushing images

**Root Cause**: Customer exceeds 10 concurrent pull limit for their ACR tier

**Solution**:
Upgrade ACR to a higher tier to support more concurrent pulls. Use Kusto query on cluster('ACR').database('acrprod').RegistryActivity to verify throttling (err_code == 'toomanyrequests').

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20Handle%20Throttling%20errors)]`

## Phase 3: Internal bandwidth throttling from the Azure Stora

### aks-356: ACR pull fails intermittently with "503 Egress is over the account limit" error ...

**Root Cause**: Internal bandwidth throttling from the Azure Storage account used by ACR. The storage account is an internal Azure subscription not accessible to the customer. The problem occurs in Azure Storage infrastructure, not in ACR infrastructure.

**Solution**:
Use Kusto query on RegistryActivity table filtering http_response_status=307 to identify the affected blob account. Implement retries with exponential backoff for intermittent 503s. If the issue persists for a prolonged period, raise an ICM for investigation with Azure Storage support team.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2F503%20Egress%20is%20over%20the%20account%20limit)]`

## Phase 4: ARM maintenance during an ACR update request cause

### aks-369: ACR is reported as disabled - cannot login or pull images. Re-enabling admin use...

**Root Cause**: ARM maintenance during an ACR update request caused inconsistency between ARM state and ACR resource provider state, leading the resource provider to set the registry as disabled, blocking docker login and credential retrieval

**Solution**:
Open ICM with ACR PG Triage and request review of the Master Entity. Use Kusto query on armprodgbl cluster ARMProd database to check if the ACR subscription has 404 responses for Microsoft.ContainerRegistry/registries during the incident timeframe

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20disabled%20issue)]`

## Phase 5: External automation (CI/CD pipeline, script, sched

### aks-614: ACR image tags/repositories disappearing unexpectedly — pulls fail with 'manifes...

**Root Cause**: External automation (CI/CD pipeline, script, scheduled job) is performing tag deletions. ACR retention policy only deletes untagged manifests after configured days. Delete events with Tag populated (WithTag > 0) indicate external tag untagging, not retention. Once tags are removed, manifests become untagged and retention may later purge them.

**Solution**:
Investigate via Kusto RegistryManifestEvent queries: 1) Confirm delete activity volume (summarize by Action). 2) Check cadence — bursty spikes suggest automation. 3) Determine if Delete is tag-deletion vs manifest-delete: summarize WithTag=countif(isnotempty(Tag)), WithoutTag=countif(isempty(Tag)). 4) Check patterns across repos — similar counts suggest rule-based cleanup. 5) Check timing distribution (bin by 5m). 6) List top deleted tags to identify CI/CD patterns. Key: WithTag>0 = external automation; mostly PurgeManifest = retention.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20image%20deletion%20investigation)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACR tasks are not being triggered or failing to complete with no actionable outp... | Various causes - need to check BuildHostTrace Kusto logs to ... | Query cluster("ACR").database("acrprod").BuildHostTrace with... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FCheck%20ACR%20tasks%20and%20outputs) |
| 2 | ACR throttling errors: 'too many requests' when pulling or pushing images | Customer exceeds 10 concurrent pull limit for their ACR tier | Upgrade ACR to a higher tier to support more concurrent pull... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20Handle%20Throttling%20errors) |
| 3 | ACR pull fails intermittently with "503 Egress is over the account limit" error ... | Internal bandwidth throttling from the Azure Storage account... | Use Kusto query on RegistryActivity table filtering http_res... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2F503%20Egress%20is%20over%20the%20account%20limit) |
| 4 | ACR is reported as disabled - cannot login or pull images. Re-enabling admin use... | ARM maintenance during an ACR update request caused inconsis... | Open ICM with ACR PG Triage and request review of the Master... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20disabled%20issue) |
| 5 | ACR image tags/repositories disappearing unexpectedly — pulls fail with 'manifes... | External automation (CI/CD pipeline, script, scheduled job) ... | Investigate via Kusto RegistryManifestEvent queries: 1) Conf... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20image%20deletion%20investigation) |
