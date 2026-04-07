# AKS 通用排查 — ssh -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node timezone is UTC and customer wants to change it to a different timezone | AKS nodes are deployed with UTC timezone by default. There i... | SSH into node and copy timezone file: 'cp /usr/share/zoneinf... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Checking%20the%20timezone%20configuration%20on%20nodes) |
| 2 | Attempting to disable SSH access on AKS cluster fails with error DisableSSHNotSu... | The --ssh-access disabled feature is only supported on VMSS-... | Feature limitation. Only VMSS-based agent pools support disa... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Need to access AKS node host filesystem for troubleshooting but SSH session land... | AKS node SSH connects to a privileged container, not directl... | After SSH into AKS node (per docs.azure.cn/zh-cn/aks/ssh), r... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: SSH into node and copy timezone file: 'cp /usr/share/zoneinfo/<Region>/<City> /etc/localtime' or cre `[source: ado-wiki]`
2. Check: Feature limitation `[source: onenote]`
3. Check: After SSH into AKS node (per docs `[source: onenote]`
