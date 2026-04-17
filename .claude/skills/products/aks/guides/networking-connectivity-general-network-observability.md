# AKS 网络连通性通用 — network-observability -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Hubble UI not working in AKS with Network Observability / ACNS | Hubble UI is NOT officially supported by AKS. Users can set ... | Follow Hubble CLI TSG steps 0 and 1 to verify underlying con... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FNetwork%20Observability%20(Kappie)%2FAdvanced%2FHubble%20UI) |
| 2 | Network observability metrics (hubble_flows_processed_total) showing fewer packe... | Retina agent hubble events queue full, dropping messages due... | 1) Identify the node where affected pod runs. 2) Get Retina ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FNetwork%20Observability%20(Kappie)%2FAdvanced%2FNon-Cilium%2FLost%20Packets) |
| 3 | Creating a Retina network capture on a Windows node fails with error when anothe... | Retina Capture uses netsh trace on Windows. Only one netsh t... | 1) List capture pods on the Windows node: kubectl get pod -A... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Capture%20TSG) |
| 4 | ContainerNetworkMetric CR created successfully but cilium-dynamic-metrics-config... | Reconciliation timing delay (normal up to 2 minutes), retina... | 1) Check CR status: kubectl describe containernetworkmetric ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Container%20Network%20Metrics%20Filtering-Dynamic%20Metrics) |
| 5 | Retina/Network Observability pod logs show 'unsupported value type' error, e.g. ... | Known non-issue. The 'unsupported value type' log message is... | Inform customer this is a known cosmetic log issue and NOT a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Errors) |

## Quick Troubleshooting Path

1. Check: Follow Hubble CLI TSG steps 0 and 1 to verify underlying connectivity `[source: ado-wiki]`
2. Check: 1) Identify the node where affected pod runs `[source: ado-wiki]`
3. Check: 1) List capture pods on the Windows node: kubectl get pod -A -o wide | grep <WindowsNodeName> `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-connectivity-general-network-observability.md)
