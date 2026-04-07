# AKS RBAC 与授权 — rbac -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 6
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After switching AKS cluster authorization mode from Azure RBAC to Kubernetes RBA... | Azure RBAC role assignments do not convert to Kubernetes RBA... | Before switching from Azure RBAC to Kubernetes RBAC: 1) Crea... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | BYOK disk encryption set permission revoked - must grant permissions to key vaul... | Disk encryption set permission for key vault was deleted | Re-run az keyvault set-policy to grant DiskEncryptionSet acc... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/troubleshoot-common-bring-your-own-key-issues) |
| 3 | Helm commands fail with no available release name found or could not find tiller... | RBAC-enabled AKS cluster requires a dedicated service accoun... | Create a service account for Tiller with proper RBAC binding... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS cluster creation or update fails with error: 'A hash conflict was encountere... | This is a known issue within the RBAC dependency. A hash col... | Create a new cluster with a different NRG name. This can be ... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNRG%20Lockdown) |
| 5 | Azure Pipelines deployment to AKS fails with: services is forbidden: User system... | Kubernetes ServiceAccount used by Azure DevOps service conne... | 1) Check current permissions: kubectl auth can-i --list --as... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FRole%20and%20RoleBindings%20for%20Azure%20DevOps) |
| 6 | az aks command invoke fails with Error from server (Forbidden): cannot list reso... | User does not have Microsoft.ContainerService/managedCluster... | Assign Azure Kubernetes Service Cluster User Role or a custo... | [Y] 4.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/resolve-az-aks-command-invoke-failures) |

## Quick Troubleshooting Path

1. Check: Before switching from Azure RBAC to Kubernetes RBAC: 1) Create K8s RBAC Roles and RoleBindings for a `[source: onenote]`
2. Check: Re-run az keyvault set-policy to grant DiskEncryptionSet access to key vault `[source: mslearn]`
3. Check: Create a service account for Tiller with proper RBAC bindings per https://docs `[source: onenote]`
