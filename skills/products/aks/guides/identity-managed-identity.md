# AKS 托管标识 (MSI) -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Service Principal login blocked by Conditional Access with AADSTS53003 error whe... | Conditional Access policies enforce location-based, device c... | Switch to User-Assigned Managed Identity which bypasses CA p... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConnecting%20Private%20Cluster%20Jumpbox%20MI) |
| 2 | KMS etcd encryption fails with StatusCode=403 ForbiddenByPolicy: AKS managed ide... | Key Vault access policy is missing Encrypt and Decrypt key p... | Assign Key Vault access policy with Encrypt and Decrypt key ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/KMS%20etcd%20Encryption) |
| 3 | 'az dataprotection backup-instance update-msi-permissions' fails: NoRegisteredPr... | The dataprotection CLI extension bundles a vendored AKS SDK ... | Create IcM with debug output (--debug flag). After PG repack... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20azure%20backup%20troubleshooting) |
| 4 | KMS plugin logs show 'using system-assigned managed identity to retrieve access ... | KMS only supports user-assigned managed identity and service... | This log is expected behavior. Ensure the cluster is configu... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/KMS%20etcd%20Encryption) |
| 5 | AKS Backup extension pods (dataprotection-microsoft-geneva-service) constantly r... | Azure Policy or Kyverno drops NET_RAW capability from datapr... | Exclude dataprotection-microsoft namespace from the Azure Po... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FMultiple%20user%20assigned%20identities%20error%20with%20AKS%20extensions) |

## Quick Troubleshooting Path

1. Check: Switch to User-Assigned Managed Identity which bypasses CA policies via IMDS authentication; see gui `[source: ado-wiki]`
2. Check: Assign Key Vault access policy with Encrypt and Decrypt key permissions for the AKS managed identity `[source: ado-wiki]`
3. Check: Create IcM with debug output (--debug flag) `[source: ado-wiki]`
