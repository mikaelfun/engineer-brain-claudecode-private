# AKS Blob CSI / BlobFuse — general -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS agentpool delete fails with FailToDeleteVMSS / DiskServiceInternalError — 'T... | Known CRP-level race condition: while processing a VM disk's... | Requires manual mitigation from VMSS team. 1) Run Kusto quer... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FAgentpool%20delete%20operation%20failed%20with%20FailToDeleteVMSS%20DiskServiceInternalError) |
| 2 | AKS pod cannot reach Azure Blob Storage with AuthorizationPermissionMismatch err... | The managed identity authenticates successfully but lacks St... | 1) Verify workload identity enabled: az aks show --query sec... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FAKS%20AuthorizationPermissionMismatch%20BlobStroage) |
| 3 | AKS pod fails to upload files to Azure blob container intermittently with 403 er... | AKS pods intermittently resolve storage FQDN to public IP in... | Option 1: Allow AKS subnet in storage account firewall rules... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FAKS%20pod%20failed%20to%20upload%20files%20to%20Azure%20blob%20container%20Intermittently%20due%20to%20client%20DNS%20issues) |
| 4 | Blob CSI Driver installation with useDataPlaneAPI=true parameter fails with Stat... | The useDataPlaneAPI=true parameter in the storage class trig... | Remove the useDataPlaneAPI=true parameter from the storage c... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FuseDataPlaneAPI%3Dtrue%3AStatusCode%3D403%2C%20ErrorCode%3DAuthorizationFailure) |

## Quick Troubleshooting Path

1. Check: Requires manual mitigation from VMSS team `[source: ado-wiki]`
2. Check: 1) Verify workload identity enabled: az aks show --query securityProfile `[source: ado-wiki]`
3. Check: Option 1: Allow AKS subnet in storage account firewall rules `[source: ado-wiki]`
