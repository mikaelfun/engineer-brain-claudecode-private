# AKS VMSS CSE 与节点启动 — general -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 8
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to SSH into AKS VMSS worker node for troubleshooting; kubectl debug method ... | AKS nodes have no direct SSH access by default; official doc... | Method 1: kubectl-node-shell plugin (https://github.com/kvap... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS node provisioning fails with vmssCSE exit code 84 (ERR_GPU_DRIVERS_START_FAI... | NVIDIA GPU drivers did not correctly install or start. Commo... | 1. Verify customer followed GPU documentation. 2. Check GPU ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 3 | BYOK CreateVMSSAgentPoolFailed - KeyVaultNotPurgeProtectionEnabled | Key vault created without purge protection enabled | Recreate key vault with --enable-purge-protection true | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/troubleshoot-common-bring-your-own-key-issues) |
| 4 | BYOK CreateVMSSAgentPoolFailed - KeyVaultAndDiskInDifferentRegions | Key vault and disk encryption set are in different Azure reg... | Create key vault in same region as disk encryption set | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/troubleshoot-common-bring-your-own-key-issues) |
| 5 | After manually resizing AKS VMSS to a different VM SKU size, the AKS resource pr... | AKS RP tracks VM SKU in its internal state database; manual ... | Do NOT manually resize AKS VMSS. Use AKS-supported method: 1... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AKS cluster creation fails with VMExtensionProvisioningError exit status=65 (ERR... | Connectivity issue between AKS cluster and required Azure en... | Review outbound network and FQDN rules for AKS clusters. Ens... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-vhdfilenotfound) |
| 7 | AKS cluster extension creation fails with 'Unable to get a response from the age... | Cluster extension agent and manager pods fail to initialize ... | Run kubectl describe pod -n kube-system extension-operator-{... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors) |
| 8 | AKS extension Helm chart install fails with 'Timed out waiting for resource read... | Common causes: insufficient CPU/memory, policy constraints o... | Ensure sufficient cluster resources and proper node scheduli... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors) |

## Quick Troubleshooting Path

1. Check: Method 1: kubectl-node-shell plugin (https://github `[source: onenote]`
2. Check: 1 `[source: ado-wiki]`
3. Check: Recreate key vault with --enable-purge-protection true `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-vmss-cse-general.md)
