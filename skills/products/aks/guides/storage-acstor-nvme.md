# AKS Azure Container Storage — nvme -- Quick Reference

**Sources**: 1 | **21V**: None | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACStor EphemeralDisk StoragePool creation fails with No block devices found; no ... | VMs used for EphemeralDisk StoragePool do not have NVMe driv... | Create a node pool with storage optimized VMs that have NVMe... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FCreating%20Or%20Deleting%20StoragePools%20Issues) |
| 2 | ACStor acstor-preq pods not Running: 'Failed to load kernel modules' or 'A reboo... | A Linux upgrade is in progress but the required NVMe kernel ... | Wait for the Linux upgrade to complete, reboot the node, the... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FInstallation%20Failures) |
| 3 | ACStor NVMe replication workload pod stuck in Pending state with PVC warning 'No... | Not enough nodes in the cluster for the requested replica co... | 1) Ensure node count >= replica count (kubectl get nodes). 2... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FReplication) |

## Quick Troubleshooting Path

1. Check: Create a node pool with storage optimized VMs that have NVMe drives (https://learn `[source: ado-wiki]`
2. Check: Wait for the Linux upgrade to complete, reboot the node, then retry ACStor installation `[source: ado-wiki]`
3. Check: 1) Ensure node count >= replica count (kubectl get nodes) `[source: ado-wiki]`
