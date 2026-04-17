# AKS CNI 与 Overlay 网络 — general -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 4
**Last updated**: 2022-09-22

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS nodes using kubenet with /24 pod CIDR report InsufficientPodCidr error; pods... | With kubenet each node gets /24 subnet from pod CIDR range. ... | Use larger pod CIDR range (e.g. /14 or /12) at cluster creat... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS cluster creation fails with CNI address range validation error; Kubernetes s... | AKS clusters cannot use 169.254.0.0/16, 172.30.0.0/16, or 17... | Use address ranges outside the restricted blocks. Best pract... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS creation via CLI stuck in loop when deploying into existing VNET; cluster ne... | Deploying AKS into an existing VNET via CLI without specifyi... | Add --network-plugin azure flag when creating AKS cluster in... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | After enabling VPA on AKS, VPA components (vpa-recommender, vpa-updater, vpa-adm... | VPA overlay installation failed during cluster reconciliatio... | Check AsyncContextActivity for OverlayVpaReconciler messages... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Vertical%20Pod%20Autoscaler) |

## Quick Troubleshooting Path

1. Check: Use larger pod CIDR range (e `[source: onenote]`
2. Check: Use address ranges outside the restricted blocks `[source: onenote]`
3. Check: Add --network-plugin azure flag when creating AKS cluster in existing VNET: az aks create --resource `[source: onenote]`
