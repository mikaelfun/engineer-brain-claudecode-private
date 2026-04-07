# AKS ACR 认证与 RBAC — unauthorized -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACR Connected Registry Arc extension creation stuck — pod logs show UNAUTHORIZED... | The connection string used for the Connected Registry extens... | 1) Check pod logs: kubectl logs -n connected-registry <pod-n... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |
| 2 | Docker push from Docker Desktop to ACR fails with "unauthorized: authentication ... | Docker Desktop on Windows uses Windows Credential Manager (w... | 1) Open Windows Credential Manager (search "Credential Manag... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Docker%20push%20from%20Docker%20desktop%20failing%20with%20unauthorized%20error) |
| 3 | Docker push from Docker Desktop to ACR fails with 'UNAUTHORIZED: authentication ... | Docker Desktop on Windows uses Windows Credential Manager (w... | Remove stale ACR credentials from Windows Credential Manager... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Docker%20push%20from%20Docker%20desktop%20failing%20with%20unauthorized%20error) |
| 4 | HTTP GET requests to ACR /v2/_catalog and /v2/.../tags/list return UNAUTHORIZED ... | Known ACR limitation: Anonymous Pull only supports Docker pu... | Inform customer this is a known ACR limitation. Anonymous Pu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FHTTP%20GET%20does%20not%20work%20though%20ACR%20Anonymous%20Pull%20is%20Enabled) |
| 5 | ACR Connected Registry Arc extension creation stuck in 'Running' state — logs sh... | Connection string used by the Connected Registry extension i... | 1) Check pod logs: kubectl logs -n connected-registry <pod-n... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |
| 6 | Docker pull fails with unauthorized: authentication required after about 3 hours... | az acr login writes an access token with 3-hour TTL to ~/.do... | Option 1: Use docker login directly with SP credentials (--u... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Check pod logs: kubectl logs -n connected-registry <pod-name> `[source: ado-wiki]`
2. Check: 1) Open Windows Credential Manager (search "Credential Manager" from Start) `[source: ado-wiki]`
3. Check: Remove stale ACR credentials from Windows Credential Manager: 1) Open Credential Manager (Windows ke `[source: ado-wiki]`
