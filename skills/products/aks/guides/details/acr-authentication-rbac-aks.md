# AKS ACR 认证与 RBAC — aks -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 7 | **Kusto queries**: 0
**Source drafts**: ado-wiki-aks-acr-msi-bring-your-own-identities.md, ado-wiki-b-aad-integrated-aks-cluster-authorization-authentication.md, ado-wiki-b-aks-acr-cross-tenant-auth.md, ado-wiki-integrating-aks-and-acr-across-tenants.md, onenote-aks-aad-rbac-configuration.md, onenote-aks-acr-aad-multi-tenant.md, onenote-aks-rbac-authorization-modes.md
**Generated**: 2026-04-07

---

## Phase 1: Service Principal lacks Azure AD Graph API permiss

### aks-405: Service Principal fails to create role assignment for ACR during AKS create with...

**Root Cause**: Service Principal lacks Azure AD Graph API permissions to read directory objects (servicePrincipals). The role assignment operation requires querying Microsoft Graph API for the target service principal, which fails without proper AAD directory read permissions.

**Solution**:
Method 1: Grant Azure AD Graph API read permissions to the Service Principal so it can read directory objects and perform role assignments. Method 2: Assign the 'Directory Readers' built-in AAD role to the Service Principal. Reference: https://docs.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#directory-readers-permissions

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FRole%20Assignment%20Error%20For%20Service%20Principal)]`

## Phase 2: Artifact Streaming image conversion failed in ACR 

### aks-913: AKS Artifact Streaming: Conversion operation failed due to an unknown error when...

**Root Cause**: Artifact Streaming image conversion failed in ACR backend. Root cause needs investigation via ACR Kusto logs.

**Solution**:
Query ACR Kusto (cluster ACR, database acrprod, table KubernetesContainers) filtering by operationId shown in CLI output. Check if ACR Artifact Streaming is properly enabled on the repo.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Artifact%20Streaming)]`

## Phase 3: OAuth2 bearer tokens for users with many Azure AD 

### aks-985: Azure portal cannot list ACR container images when deploying AKS 'Starter Applic...

**Root Cause**: OAuth2 bearer tokens for users with many Azure AD group memberships exceed 8192 bytes (max HTTP header size accepted by ACR endpoints). The oversized token causes the registry to reject the request without returning CORS headers, so the browser blocks the response. Users below the 'overage' threshold but with many groups are specifically affected.

**Solution**:
1) Permanent fix deployed by PG: Azure portal updated to remove Authorization header from browser HTTP request, relying solely on auth token in request body for CORS authorization. 2) Temporary workaround: affected users can use Azure CLI or ARM templates for deployments (no CORS involved). 3) PG can provide temporary portal 'flight' link for affected users as interim workaround. 4) Verify by capturing HAR logs and browser console output to confirm CORS errors and HTTP 400.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FACR%20CORS%20Policy%20Blocked%20Portal%20Issue)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Service Principal fails to create role assignment for ACR during AKS create with... | Service Principal lacks Azure AD Graph API permissions to re... | Method 1: Grant Azure AD Graph API read permissions to the S... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FRole%20Assignment%20Error%20For%20Service%20Principal) |
| 2 | AKS Artifact Streaming: Conversion operation failed due to an unknown error when... | Artifact Streaming image conversion failed in ACR backend. R... | Query ACR Kusto (cluster ACR, database acrprod, table Kubern... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Artifact%20Streaming) |
| 3 | Azure portal cannot list ACR container images when deploying AKS 'Starter Applic... | OAuth2 bearer tokens for users with many Azure AD group memb... | 1) Permanent fix deployed by PG: Azure portal updated to rem... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FACR%20CORS%20Policy%20Blocked%20Portal%20Issue) |
