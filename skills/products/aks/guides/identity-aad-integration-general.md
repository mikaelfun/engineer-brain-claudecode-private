# AKS AAD 集成与认证 — general -- Quick Reference

**Sources**: 4 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Microsoft Defender publisher pods crash with 403. Log Analytics workspace has lo... | LA workspaces with local auth disabled cannot be used with D... | Enable local auth: az resource update --ids /subscriptions/{... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Microsoft%20defender%20publisher%20pods%20crashing%20%28OOMKilled%29%20with%20403%20errors) |
| 2 | Running 'az aks get-credentials' fails with: 'The client does not have authoriza... | User lacks necessary Azure IAM role assignment to retrieve A... | Assign user 'Azure Kubernetes Service Cluster User Role' or ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FUnable%20to%20retrieve%20cluster%20credentials) |
| 3 | CSS members working on AKS can no longer request JIT at CustomerDataAdministrato... | Permission change effective 05/30/2024 - CustomerDataAdminis... | Use new JIT process: 1) Submit ICM via template O2h2V3; 2) R... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | While installing the Azure monitoring agent on an Azure ARC enabled Kubernetes c... | During a troubleshooting call, it was discovered that the in... | To resolve the issue, the iptable_nat module had to be manua... | [B] 6.5 | [ContentIdea#186299](https://support.microsoft.com/kb/5035315) |
| 5 | azure-defender-publisher DaemonSet pods continually fail and restart after enabl... | Authentication issues or misconfiguration when Defender Prof... | Workaround: Disable Azure Defender profile via REST API PUT ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/failure-restart-azure-defender-publisher-daemonset-pods) |

## Quick Troubleshooting Path

1. Check: Enable local auth: az resource update --ids /subscriptions/{sub}/resourcegroups/{rg}/providers/micro `[source: ado-wiki]`
2. Check: Assign user 'Azure Kubernetes Service Cluster User Role' or 'Cluster Admin Role' `[source: ado-wiki]`
3. Check: Use new JIT process: 1) Submit ICM via template O2h2V3; 2) Request JIT via jitaccess `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/identity-aad-integration-general.md)
