# AKS DNS 解析排查 — dns-resolution -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 4
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | DNS resolution fails inside pods on AKS cluster with BYO CNI (network-plugin=non... | The br_netfilter kernel module is not loaded on the worker n... | Load the br_netfilter kernel module on all worker nodes: sud... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FBYO%20CNI%20with%20AKS) |
| 2 | AKS stop/start (preview): node cannot resolve DNS record of API server, fails wi... | Known issue with stop/start preview feature. After restart n... | Known preview limitation. Check TSG: msazure.visualstudio.co... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS node shows NotReady status. Node cannot communicate with API server; error i... | AKS agent node fails to resolve API server FQDN. Root cause ... | SSH/exec into node and test DNS: nslookup <api-server-fqdn>.... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Private AKS cluster: Container Insights shows no logs/metrics. AMA pods (ama-log... | Azure Monitor Private Link Scope (AMPLS) is missing or misco... | 1) Validate DNS inside AKS node: nslookup <workspaceId>.ods.... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Private%20AKS%20Azure%20Monitor%20Logging%20Not%20Working%20Without%20AMPLS) |

## Quick Troubleshooting Path

1. Check: Load the br_netfilter kernel module on all worker nodes: sudo modprobe br_netfilter `[source: ado-wiki]`
2. Check: Known preview limitation `[source: onenote]`
3. Check: SSH/exec into node and test DNS: nslookup <api-server-fqdn> `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-dns-resolution-dns-resolution.md)
