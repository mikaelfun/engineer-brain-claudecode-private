# AKS ACI 网络与 DNS — networking -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Pod subnet full: nodes cannot request more IPs from delegated subnet, pods stuck... | The pod subnet CIDR is exhausted because IPs are allocated i... | Reduce pod count if possible. Create a new pod subnet on the... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20dynamic%20pod%20IP%20allocation) |
| 2 | AKS virtual node fails with 'error creating provider: error setting up network: ... | ACI does not support user-defined routing (UDR). The aci-con... | Remove the user-defined routing (route table association) fr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2Ferror%20setting%20up%20network%20-%20AKS%20virtual%20node) |
| 3 | AKS virtual node fails: error creating provider: error setting up network: unabl... | ACI does not support user-defined routing (UDR). Subnet for ... | Remove the route table association from the subnet used for ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/AKS%20Network%20Troubleshooting%20Methodology/error%20setting%20up%20network%20-%20AKS%20virtual%20node) |

## Quick Troubleshooting Path

1. Check: Reduce pod count if possible `[source: ado-wiki]`
2. Check: Remove the user-defined routing (route table association) from the subnet used for ACI virtual node `[source: ado-wiki]`
3. Check: Remove the route table association from the subnet used for ACI virtual node `[source: ado-wiki]`
