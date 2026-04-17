# AKS ACR 认证与 RBAC — connected-registry -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACR Connected Registry extension created but Connected Registry not in Online st... | Previous Connected Registry extension was deleted but the Co... | 1) Check pod logs for ALREADY_ACTIVATED error. 2) Run: az ac... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/Connected Registry) |
| 2 | ACR Connected Registry extension created but registry not in Online state — pod ... | A previous Connected Registry extension was deleted and recr... | Run: az acr connected-registry deactivate -n <connected-regi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |
| 3 | ACR Connected Registry Arc extension creation stuck in 'Running' state due to PV... | Persistent Volume Claim cannot bind because the desired stor... | 1) Check PVC status: kubectl get pvc -n connected-registry -... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |
| 4 | ACR Connected Registry extension created but Connected Registry not reaching 'On... | A previous Connected Registry extension was deleted and a ne... | Run: az acr connected-registry deactivate -n <connected-regi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |

## Quick Troubleshooting Path

1. Check: 1) Check pod logs for ALREADY_ACTIVATED error `[source: ado-wiki]`
2. Check: Run: az acr connected-registry deactivate -n <connected-registry-name> -r <acr-name> `[source: ado-wiki]`
3. Check: 1) Check PVC status: kubectl get pvc -n connected-registry -o yaml connected-registry-pvc `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/acr-authentication-rbac-connected-registry.md)
