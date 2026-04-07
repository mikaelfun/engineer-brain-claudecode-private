# AKS Portal CLI 与工具 -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Case created outside Azure Portal (phone, Partner portal, Dynamics), customer da... | Cases created outside the Azure Portal do not trigger the da... | 1) Troubleshoot manually using screensharing or file attachm... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FCase%20Management%2FProtecting%20Customer%20Data%20in%20ASC%20Logs%20Access%20Consent) |
| 2 | Customer asks support engineer to access portal or make changes in their environ... | - | Decline per Microsoft security policy: We do not access cust... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FCase%20Handling%20E2E%2FOn%20Going%20Cases%2FExample%20Scenario%20Based%20Responses%2FAccessing%20Customer%20Environment) |
| 3 | AKS API calls fail after preview API version deprecated; Terraform/az cli/SDK us... | AKS deprecates preview API versions on a rolling schedule. O... | Update tools to latest GA API version: az cli 'az upgrade' +... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/API%20Deprecation) |
| 4 | AKS creation from portal fails with RoleAssignmentExists 409 error when enabling... | Portal logic attempts to create a role assignment that alrea... | Ignore the portal error and proceed. The role assignment alr... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | Error stating AzureLinux option not supported for OSSku parameter when deploying... | Outdated Azure CLI version or outdated aks-preview extension... | Upgrade Azure CLI: az upgrade. Upgrade aks-preview extension... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-common-azure-linux-aks) |

## Quick Troubleshooting Path

1. Check: 1) Troubleshoot manually using screensharing or file attachments; 2) Ask customer to create a new su `[source: ado-wiki]`
2. Check: Decline per Microsoft security policy: We do not access customer data/applications nor make changes  `[source: ado-wiki]`
3. Check: Update tools to latest GA API version: az cli 'az upgrade' + 'az extension update --name aks-preview `[source: ado-wiki]`
