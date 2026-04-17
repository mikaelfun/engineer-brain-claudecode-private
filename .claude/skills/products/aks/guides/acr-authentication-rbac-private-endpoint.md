# AKS ACR 认证与 RBAC — private-endpoint -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACR login via private endpoint fails with 403 error and 'CONNECTIVITY_REFRESH_TO... | In Virtual WAN Hub architecture, Azure Firewall in the Virtu... | Create a new private endpoint for ACR in the same VNet as th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Unauthorized%20Access%20Errors%20with%20Virtual%20WAN%20Hub) |
| 2 | Azure Function App deployment fails to pull image from private ACR with err_code... | Known limitation: For premium and dedicated Linux Functions,... | Ensure the image being pulled uses media type application/vn... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20image%20pulls%20fail%20unknown%20blob) |
| 3 | Network isolated cluster: managed ACR, cache rules, private endpoints, or privat... | Managed ACR infrastructure resources deleted | Cache rule deleted: delete ACR then reconcile cluster. ACR/e... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-network-isolated-cluster) |
| 4 | GMSA enabled pods fail to start with error "The RPC server is unavailable" and c... | On-premises DNS server is unable to resolve the private endp... | Configure on-premises DNS servers with conditional forwarder... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FTSG%20GMSA%20Deployments%20Entered%20Failed%20State) |

## Quick Troubleshooting Path

1. Check: Create a new private endpoint for ACR in the same VNet as the source VM (avoid routing through Azure `[source: ado-wiki]`
2. Check: Ensure the image being pulled uses media type application/vnd `[source: ado-wiki]`
3. Check: Cache rule deleted: delete ACR then reconcile cluster `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/acr-authentication-rbac-private-endpoint.md)
