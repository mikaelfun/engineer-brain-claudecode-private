# AKS 节点池扩缩容 — vmss -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS VMSS-based cluster experiences ARM API throttling (HTTP 429 errors) causing ... | High frequency of ARM API calls from VMSS cluster operations... | To reduce ARM API requests: 1) Reduce number of nodes and fr... | [G] 8.0 | [onenote](https://github.com/Azure/AKS/issues/1187) |
| 2 | AKS node pool goes into failed state or takes very long when scaling by 200+ nod... | Internal bug: VMSS instance update for Application Security ... | Scale up in smaller batches instead of large increments (avo... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit) |
| 3 | AKS cluster using Availability Set based node pools will face deprecation; Avail... | Azure is deprecating Availability Set based AKS node pools i... | Migrate existing Availability Set based node pools to VMSS-b... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS cluster cannot scale or deploy; operations hang or fail with HTTP 429 thrott... | Old Go-SDK (Kubernetes < 1.15) does not handle ARM throttlin... | 1) Contact AKS PG to mitigate: stop the Controller Manager, ... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 5 | AKS node count mismatch after deleting nodes using kubectl delete node; agent po... | AKS agent pool state is managed at VMSS level not k8s level.... | Correct method: delete VMSS instance from portal/CLI at VMSS... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.5] |

## Quick Troubleshooting Path

1. Check: To reduce ARM API requests: 1) Reduce number of nodes and frequency of node scaling operations `[source: onenote]`
2. Check: Scale up in smaller batches instead of large increments (avoid 200+ nodes at once) `[source: ado-wiki]`
3. Check: Migrate existing Availability Set based node pools to VMSS-based node pools `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-nodepool-vmss.md)
