# AKS 防火墙与代理 — networking -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-troubleshoot-nva-and-routing.md
**Generated**: 2026-04-07

---

## Phase 1: By default, Private Endpoint Subnet Policy Configu

### aks-541: AKS Private Cluster: traffic to API server private endpoint bypasses firewall/NV...

**Root Cause**: By default, Private Endpoint Subnet Policy Configuration is Disabled. The private endpoint injects a /32 system route for its IP, which takes precedence over broader UDR prefixes due to longest-prefix-match. Any UDR with a less-specific prefix (e.g. /16) cannot override the /32 route, so traffic goes directly to the endpoint bypassing the firewall.

**Solution**:
1) Enable Private Endpoint Subnet Policy Configuration on the AKS subnet (Azure Portal or CLI); 2) Create a UDR with an addressPrefix that includes the private endpoint IP — this will invalidate the /32 system route; 3) Verify via Effective Routes that the /32 system route now shows as 'False' (inactive); 4) Traffic will then follow the UDR through the firewall/NVA. Ref: https://learn.microsoft.com/en-us/azure/private-link/disable-private-endpoint-network-policy

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTSG%3A%20AKS%20-%20Troubleshooting%20Cluster%20API%20Connectivity%20Issues%20(Start%20Here%20Workflow)%2F%5BTSG%5D%20AKS%20troubleshooting%20cluster%20API%20connectivity%20issues%20-%20Private%20cluster)]`

## Phase 2: Changing outbound type (loadBalancer/NATGateway/us

### aks-940: Networking issues (traffic blocked, connectivity failures) after AKS outbound ty...

**Root Cause**: Changing outbound type (loadBalancer/NATGateway/userDefinedRouting) changes the cluster's egress configuration, which can alter source IPs. Existing firewall rules, NSGs, or third-party services filtering by source IP will break.

**Solution**:
1) Use Kusto query on AsyncQoSEvents filtering for 'enableOutboundMigration' to confirm migration occurred; 2) Update downstream firewall rules, NSGs, and allowlists with the new source IPs from the new outbound configuration.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOutbound%20Type%20Migration)]`

## Phase 3: AKS validation rejects configs where any subnet ov

### aks-269: AKS cluster cannot enable authorized IP ranges because firewall subnet CIDR conf...

**Root Cause**: AKS validation rejects configs where any subnet overlaps service CIDR. No backend workaround exists.

**Solution**:
1) Remove/change conflicting subnet CIDR. 2) Plan CIDR ranges during initial design. 3) Consider separate VNet for firewall + peering.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Private Cluster: traffic to API server private endpoint bypasses firewall/NV... | By default, Private Endpoint Subnet Policy Configuration is ... | 1) Enable Private Endpoint Subnet Policy Configuration on th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTSG%3A%20AKS%20-%20Troubleshooting%20Cluster%20API%20Connectivity%20Issues%20(Start%20Here%20Workflow)%2F%5BTSG%5D%20AKS%20troubleshooting%20cluster%20API%20connectivity%20issues%20-%20Private%20cluster) |
| 2 | Networking issues (traffic blocked, connectivity failures) after AKS outbound ty... | Changing outbound type (loadBalancer/NATGateway/userDefinedR... | 1) Use Kusto query on AsyncQoSEvents filtering for 'enableOu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOutbound%20Type%20Migration) |
| 3 | AKS cluster cannot enable authorized IP ranges because firewall subnet CIDR conf... | AKS validation rejects configs where any subnet overlaps ser... | 1) Remove/change conflicting subnet CIDR. 2) Plan CIDR range... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
