# AKS 防火墙与代理 — networking -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Private Cluster: traffic to API server private endpoint bypasses firewall/NV... | By default, Private Endpoint Subnet Policy Configuration is ... | 1) Enable Private Endpoint Subnet Policy Configuration on th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTSG%3A%20AKS%20-%20Troubleshooting%20Cluster%20API%20Connectivity%20Issues%20(Start%20Here%20Workflow)%2F%5BTSG%5D%20AKS%20troubleshooting%20cluster%20API%20connectivity%20issues%20-%20Private%20cluster) |
| 2 | Networking issues (traffic blocked, connectivity failures) after AKS outbound ty... | Changing outbound type (loadBalancer/NATGateway/userDefinedR... | 1) Use Kusto query on AsyncQoSEvents filtering for 'enableOu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOutbound%20Type%20Migration) |
| 3 | AKS cluster cannot enable authorized IP ranges because firewall subnet CIDR conf... | AKS validation rejects configs where any subnet overlaps ser... | 1) Remove/change conflicting subnet CIDR. 2) Plan CIDR range... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Enable Private Endpoint Subnet Policy Configuration on the AKS subnet (Azure Portal or CLI); 2) C `[source: ado-wiki]`
2. Check: 1) Use Kusto query on AsyncQoSEvents filtering for 'enableOutboundMigration' to confirm migration oc `[source: ado-wiki]`
3. Check: 1) Remove/change conflicting subnet CIDR `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-firewall-proxy-networking.md)
