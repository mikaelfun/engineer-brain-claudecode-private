# AKS Istio 安装与配置 — service-mesh -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Istio service mesh addon not available on AKS Azure China cluster | Istio addon had no confirmed Mooncake GA date in Feature Lan... | Istio addon availability in Azure China is unconfirmed. Cons... | [B] 7.5 | [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Open Service Mesh (OSM) addon is being retired and will be removed on 30 Septemb... | OSM is deprecated by Microsoft in favor of Istio service mes... | Migrate to Istio following the migration guidance at https:/... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Addons%20and%20Extensions/Open%20Service%20Mesh) |
| 3 | AKS pods using Istio or service mesh experience connectivity issues on ports 130... | Istio/service mesh proxy reserves certain port ranges (inclu... | 1) Check if Istio or service mesh is installed in the cluste... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F13%20-%20Common%20Troubleshoot%20Steps) |
| 4 | [DEPRECATED] Customer asks how to enable encrypted pod-to-pod communication betw... | AKS does not natively enforce mTLS between services; Istio s... | DEPRECATED — use AKS Istio addon for modern approach. Histor... | [Y] 3.0 | [onenote: MCVKB/Net/=======8.AKS=======/8.2[Deprec] |

## Quick Troubleshooting Path

1. Check: Istio addon availability in Azure China is unconfirmed `[source: 21v-gap]`
2. Check: Migrate to Istio following the migration guidance at https://learn `[source: ado-wiki]`
3. Check: 1) Check if Istio or service mesh is installed in the cluster; 2) Verify service mesh proxy port res `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/istio-installation-service-mesh.md)
