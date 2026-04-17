# AKS ACR 认证与 RBAC — aks -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Service Principal fails to create role assignment for ACR during AKS create with... | Service Principal lacks Azure AD Graph API permissions to re... | Method 1: Grant Azure AD Graph API read permissions to the S... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FRole%20Assignment%20Error%20For%20Service%20Principal) |
| 2 | AKS Artifact Streaming: Conversion operation failed due to an unknown error when... | Artifact Streaming image conversion failed in ACR backend. R... | Query ACR Kusto (cluster ACR, database acrprod, table Kubern... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Artifact%20Streaming) |
| 3 | Azure portal cannot list ACR container images when deploying AKS 'Starter Applic... | OAuth2 bearer tokens for users with many Azure AD group memb... | 1) Permanent fix deployed by PG: Azure portal updated to rem... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FACR%20CORS%20Policy%20Blocked%20Portal%20Issue) |

## Quick Troubleshooting Path

1. Check: Method 1: Grant Azure AD Graph API read permissions to the Service Principal so it can read director `[source: ado-wiki]`
2. Check: Query ACR Kusto (cluster ACR, database acrprod, table KubernetesContainers) filtering by operationId `[source: ado-wiki]`
3. Check: 1) Permanent fix deployed by PG: Azure portal updated to remove Authorization header from browser HT `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/acr-authentication-rbac-aks.md)
