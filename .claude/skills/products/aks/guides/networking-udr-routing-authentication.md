# AKS UDR 与路由 — authentication -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 6
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Agentic CLI error: litellm.AuthenticationError: AzureException AuthenticationErr... | Incorrect or conflicting Azure OpenAI configuration. The too... | Verify the Azure OpenAI configuration: 1) Check config file ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAgentic%20CLI%20for%20AKS) |
| 2 | AKS external identity provider authentication fails: username/groups not recogni... | JWT authenticator claim mappings missing aks:jwt: prefix (re... | Update JWT authenticator config: 1) Add aks:jwt: prefix to a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/External%20Identity%20Providers%20for%20AKS%20Control%20Plane) |
| 3 | Kubelogin/kubectl returns 401 Unauthorized with invalid bearer token error. kube... | Service Principal or User is assigned to >200 Entra ID group... | 1) Decode token at https://jwt.ms and check for groups:src1 ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Kube%20Token%20Analyze) |
| 4 | AKS cluster CRUD operations (upgrade/scale) fail with InternalServerError, GetSK... | The Service Principal linked to the AKS PG well-known App ID... | Re-register the AKS resource provider to recreate the SP: az... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20Fail%20with%20code%20GetSKUStoreError%20InvalidAuthenticationToken) |
| 5 | AKS cluster creation fails with ServicePrincipalValidationClientError: AADSTS700... | The service principal secret provided for AKS cluster authen... | Solution 1: Reset SP credential via 'az ad sp credential res... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/serviceprincipalvalidationclienterror-error) |
| 6 | Token validation failures - invalid CEL expressions in JWT authenticator claim m... | CEL expressions have syntax errors or return wrong types | Test CEL expressions; username must return string, groups st... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/security/troubleshoot-aks-control-plane-authentication-external-identity-providers) |

## Quick Troubleshooting Path

1. Check: Verify the Azure OpenAI configuration: 1) Check config file (aksAgent `[source: ado-wiki]`
2. Check: Update JWT authenticator config: 1) Add aks:jwt: prefix to all username/groups mappings (e `[source: ado-wiki]`
3. Check: 1) Decode token at https://jwt `[source: ado-wiki]`
