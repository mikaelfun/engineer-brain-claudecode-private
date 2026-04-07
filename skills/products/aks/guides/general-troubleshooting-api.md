# AKS 通用排查 — api -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Delete Machines API returns NotFound with resultSubCode GetAgentPool_NotFound: C... | Agentpool is not registered in DB yet, or the target URI doe... | Verify the agentpool exists by checking List AgentPools API ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Delete%20Specific%20Node%20Machine) |
| 2 | AKS API returns BadRequest: If-Match header is not empty and If-None-Match heade... | Client sends both If-Match and If-None-Match headers in the ... | Client error. Customer must use only one of If-Match or If-N... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support) |
| 3 | AKS API returns PreConditionFailed: If-None-Match precondition failed. The given... | If-None-Match: * means only succeed if resource does not exi... | Client error. Customer needs to use GET to check if resource... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support) |
| 4 | AKS API returns PreConditionFailed: The value of If-Match header does not match ... | The resource was updated by another request between when the... | Client error. Customer must do a fresh GET to obtain the lat... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FEntity%20Tag%20(ETag)%20Support) |

## Quick Troubleshooting Path

1. Check: Verify the agentpool exists by checking List AgentPools API response or GET Agentpool `[source: ado-wiki]`
2. Check: Client error `[source: ado-wiki]`
3. Check: Client error `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/general-troubleshooting-api.md)
