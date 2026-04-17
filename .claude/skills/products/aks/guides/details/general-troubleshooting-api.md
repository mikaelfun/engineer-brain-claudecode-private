# AKS 通用排查 — api -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: api-throttling-analysis.md
**Generated**: 2026-04-07

---

## Phase 1: Agentpool is not registered in DB yet, or the targ

### aks-717: Delete Machines API returns NotFound with resultSubCode GetAgentPool_NotFound: C...

**Root Cause**: Agentpool is not registered in DB yet, or the target URI does not have the correct agentpool name as path parameter

**Solution**:
Verify the agentpool exists by checking List AgentPools API response or GET Agentpool. Ensure the correct agentpool name is used in the request URI

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Delete%20Specific%20Node%20Machine)]`

## Phase 2: Client sends both If-Match and If-None-Match heade

### aks-840: AKS API returns BadRequest: If-Match header is not empty and If-None-Match heade...

**Root Cause**: Client sends both If-Match and If-None-Match headers in the same request. AKS pre-validation rejects this as a conflict.

**Solution**:
Client error. Customer must use only one of If-Match or If-None-Match per request, not both.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support)]`

## Phase 3: If-None-Match: * means only succeed if resource do

### aks-841: AKS API returns PreConditionFailed: If-None-Match precondition failed. The given...

**Root Cause**: If-None-Match: * means only succeed if resource does not exist. Since the resource already exists, the precondition fails. This is by design for concurrency protection.

**Solution**:
Client error. Customer needs to use GET to check if resource exists first, or use If-Match with the current ETag value for update operations instead.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support)]`

## Phase 4: The resource was updated by another request betwee

### aks-842: AKS API returns PreConditionFailed: The value of If-Match header does not match ...

**Root Cause**: The resource was updated by another request between when the customer read the ETag and when they submitted their update. The If-Match ETag value is now stale.

**Solution**:
Client error. Customer must do a fresh GET to obtain the latest ETag, then retry the update with the new ETag value. Check FrontEndContextActivity Kusto query with pre-validating ETag headers message.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Delete Machines API returns NotFound with resultSubCode GetAgentPool_NotFound: C... | Agentpool is not registered in DB yet, or the target URI doe... | Verify the agentpool exists by checking List AgentPools API ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Delete%20Specific%20Node%20Machine) |
| 2 | AKS API returns BadRequest: If-Match header is not empty and If-None-Match heade... | Client sends both If-Match and If-None-Match headers in the ... | Client error. Customer must use only one of If-Match or If-N... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support) |
| 3 | AKS API returns PreConditionFailed: If-None-Match precondition failed. The given... | If-None-Match: * means only succeed if resource does not exi... | Client error. Customer needs to use GET to check if resource... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support) |
| 4 | AKS API returns PreConditionFailed: The value of If-Match header does not match ... | The resource was updated by another request between when the... | Client error. Customer must do a fresh GET to obtain the lat... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support) |
