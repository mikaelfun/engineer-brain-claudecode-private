# AKS PV/PVC 与卷管理 — networking -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS pods experience higher-than-expected latency for initial outbound requests (... | After pod start, Calico has a delay in updating iptables rul... | Use an init container or application startup delay to provid... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FNetwork%20latency%20in%201st%20connection%20of%20pod%20with%20Calico) |
| 2 | AKS persistent connectivity issues when nodes reuse SNAT ports with Azure Firewa... | AKS nodes reuse source ports when connecting through Azure F... | See Azure Networking wiki TSG: https://supportability.visual... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F7%20-%20Troubleshoot%20Azure%20Firewall) |
| 3 | Intermittent DNS timeouts and failures as request volume increases. CoreDNS logs... | The DNS response from the upstream DNS server (168.63.129.16... | Increase CoreDNS buffer size by editing the coredns-custom c... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FDNS%2FDNS%20Timeouts%20-%20Overflowing%20header%20size) |

## Quick Troubleshooting Path

1. Check: Use an init container or application startup delay to provide enough time for Calico to complete ipt `[source: ado-wiki]`
2. Check: See Azure Networking wiki TSG: https://supportability `[source: ado-wiki]`
3. Check: Increase CoreDNS buffer size by editing the coredns-custom configmap: kubectl edit cm coredns-custom `[source: ado-wiki]`
