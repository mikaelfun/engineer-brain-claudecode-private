# AKS ACR 认证与 RBAC — private-endpoint -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-acr-private-link-troubleshooting-questions.md, ado-wiki-acr-private-link.md
**Generated**: 2026-04-07

---

## Phase 1: In Virtual WAN Hub architecture, Azure Firewall in

### aks-365: ACR login via private endpoint fails with 403 error and 'CONNECTIVITY_REFRESH_TO...

**Root Cause**: In Virtual WAN Hub architecture, Azure Firewall in the Virtual Hub acts as HTTPS proxy and performs its own DNS resolution. Since Private DNS Zones cannot be linked to a Virtual Hub, Azure Firewall resolves ACR FQDN to a public IP instead of the private endpoint IP. ACR then rejects the request because it originates from a public IP.

**Solution**:
Create a new private endpoint for ACR in the same VNet as the source VM (avoid routing through Azure Firewall). Update the Private DNS Zone to point to this new dedicated private endpoint, ensuring traffic stays entirely within the private network.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Unauthorized%20Access%20Errors%20with%20Virtual%20WAN%20Hub)]`

## Phase 2: Known limitation: For premium and dedicated Linux 

### aks-372: Azure Function App deployment fails to pull image from private ACR with err_code...

**Root Cause**: Known limitation: For premium and dedicated Linux Functions, pulling over VNET only supports media type application/vnd.docker.distribution.manifest.v2+json. OCI image index (application/vnd.oci.image.index.v1+json) is not supported.

**Solution**:
Ensure the image being pulled uses media type application/vnd.docker.distribution.manifest.v2+json. If using OCI format images, rebuild/push with Docker manifest v2 format. PG is working on adding OCI support.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20image%20pulls%20fail%20unknown%20blob)]`

## Phase 3: Managed ACR infrastructure resources deleted

### aks-1275: Network isolated cluster: managed ACR, cache rules, private endpoints, or privat...

**Root Cause**: Managed ACR infrastructure resources deleted

**Solution**:
Cache rule deleted: delete ACR then reconcile cluster. ACR/endpoints/DNS deleted: reconcile cluster

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-network-isolated-cluster)]`

## Phase 4: On-premises DNS server is unable to resolve the pr

### aks-905: GMSA enabled pods fail to start with error "The RPC server is unavailable" and c...

**Root Cause**: On-premises DNS server is unable to resolve the private endpoints for AKS (azmk8s.io) and ACR (azurecr.io), causing GMSA credential retrieval and container image pull failures.

**Solution**:
Configure on-premises DNS servers with conditional forwarders: create a forwarder of azmk8s.io to 168.63.129.16 for AKS clusters, and a forwarder of azurecr.io to 168.63.129.16 for ACR registries. This enables resolution of private endpoints.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FTSG%20GMSA%20Deployments%20Entered%20Failed%20State)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACR login via private endpoint fails with 403 error and 'CONNECTIVITY_REFRESH_TO... | In Virtual WAN Hub architecture, Azure Firewall in the Virtu... | Create a new private endpoint for ACR in the same VNet as th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Unauthorized%20Access%20Errors%20with%20Virtual%20WAN%20Hub) |
| 2 | Azure Function App deployment fails to pull image from private ACR with err_code... | Known limitation: For premium and dedicated Linux Functions,... | Ensure the image being pulled uses media type application/vn... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20image%20pulls%20fail%20unknown%20blob) |
| 3 | Network isolated cluster: managed ACR, cache rules, private endpoints, or privat... | Managed ACR infrastructure resources deleted | Cache rule deleted: delete ACR then reconcile cluster. ACR/e... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-network-isolated-cluster) |
| 4 | GMSA enabled pods fail to start with error "The RPC server is unavailable" and c... | On-premises DNS server is unable to resolve the private endp... | Configure on-premises DNS servers with conditional forwarder... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FTSG%20GMSA%20Deployments%20Entered%20Failed%20State) |
