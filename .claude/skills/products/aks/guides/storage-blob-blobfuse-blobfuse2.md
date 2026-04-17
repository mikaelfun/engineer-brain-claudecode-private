# AKS Blob CSI / BlobFuse — blobfuse2 -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After AKS upgrade to v1.33, pods fail to mount Azure Blob CSI volumes with 403 A... | AKS v1.33 uses blobfuse2 >= v2.4.2 with automatic account ty... | Temporary: Roll back blobfuse2 to v2.4.1 via DaemonSet patch... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Blobfuse2 static mount fails on AKS with permission errors; pod cannot access Az... | For blobfuse2 static mount using MSI auth, the AKS kubelet i... | 1) Identify kubelet identity: az aks show -> identityProfile... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | After AKS/node image upgrade, Azure Blob CSI mount failures: pods stuck in Conta... | AKS node image upgrades implicitly upgrade blobfuse2 (e.g., ... | Explicitly specify storage account type in blobfuse config: ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Blob%20CSI%20DriverMountFailure%20VolumeMountFailure) |
| 4 | After AKS upgrade to 1.25+ (Ubuntu 22.04/blobfuse2), pods fail to mount blob con... | Blobfuse2 on Ubuntu 22.04 requires --use-adls=true mount opt... | Add --use-adls=true to StorageClass mountOptions. For existi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Blob%20containers%20failing%20due%20to%20Storage%20Account%20HNS) |

## Quick Troubleshooting Path

1. Check: Temporary: Roll back blobfuse2 to v2 `[source: onenote]`
2. Check: 1) Identify kubelet identity: az aks show -> identityProfile `[source: onenote]`
3. Check: Explicitly specify storage account type in blobfuse config: 'block' for standard Blob, 'adls' for AD `[source: ado-wiki]`
