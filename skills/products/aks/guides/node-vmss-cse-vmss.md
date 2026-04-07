# AKS VMSS CSE 与节点启动 — vmss -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to SSH directly into AKS VMSS worker node when kubectl-node-shell or kubect... | AKS nodes have no direct SSH access by default; VMAccessForL... | 1) Create Linux VM in same VNET. 2) ssh-keygen. 3) az vmss e... | [G] 10.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS cluster cannot add new nodes after user modified VMSS extensions. Node provi... | User changed the VMSS extension at VM level, which is not su... | Use AKSNodeInstaller DaemonSet to reinstall required compone... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/AKS%20Cheatsheet) |
| 3 | Need to access AKS worker node shell or retrieve node logs for troubleshooting b... | AKS nodes have no direct SSH access by default; official doc... | Method 1 — kubectl node-shell: Install plugin from github.co... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 4 | AKS worker node shows NotReady status with conditions MemoryPressure/DiskPressur... | Multiple possible causes: VM powered off, kubelet process cr... | 1) kubectl get nodes to identify NotReady nodes. 2) Confirm ... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.8] |

## Quick Troubleshooting Path

1. Check: 1) Create Linux VM in same VNET `[source: onenote]`
2. Check: Use AKSNodeInstaller DaemonSet to reinstall required components on affected nodes `[source: ado-wiki]`
3. Check: Method 1 — kubectl node-shell: Install plugin from github `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-vmss-cse-vmss.md)
