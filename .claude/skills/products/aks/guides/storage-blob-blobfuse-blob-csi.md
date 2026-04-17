# AKS Blob CSI / BlobFuse — blob-csi -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After AKS upgrade to 1.28.x, Blob CSI volume mount fails with failed to initiali... | BlobCSI driver with azureStorageAuthType=MSI and azureStorag... | Option 1 (recommended): Change PV configuration from azureSt... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FVolume%20Issues%20AKS%201%2028%20x) |
| 2 | Blob CSI driver provisioning fails with 403 AuthorizationFailure when using --en... | The AKS control plane managed identity (same name as cluster... | Grant Storage Account Contributor role to the AKS control pl... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2F403%20Authorization%20Error%20-%20CSI%20driver) |
| 3 | blobfuse-proxy pod CrashLoopBackOff in kube-system; blob CSI volume mount fails ... | Customer using open-source blob CSI driver which includes bl... | 1) Confirm open-source CSI driver (blob-controller visible i... | [B] 7.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4] |

## Quick Troubleshooting Path

1. Check: Option 1 (recommended): Change PV configuration from azureStorageIdentityObjectID to azureStorageIde `[source: ado-wiki]`
2. Check: Grant Storage Account Contributor role to the AKS control plane managed identity on the storage acco `[source: ado-wiki]`
3. Check: 1) Confirm open-source CSI driver (blob-controller visible in kube-system) `[source: onenote]`
