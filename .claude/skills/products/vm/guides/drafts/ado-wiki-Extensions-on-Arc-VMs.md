---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/Extensions on Arc VMs_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20(AGEX)/How%20Tos/Extension/Extensions%20on%20Arc%20VMs_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Extensions on Arc-enabled Servers — Support Scope & Troubleshooting

## Summary

This article explains the supportability scope regarding extensions on **Arc-enabled servers.**

## What are Arc-enabled servers?

Arc-enabled servers are VMs not hosted in Azure but able to utilize some Azure services. They use the [Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview) instead of the normal VM Guest Agent.

## Support Scope

- **Monitoring team** supports Arc-enabled servers and the Azure Connected Machine Agent itself.
- **VM team** supports the various extensions (same teams as Azure IaaS VM extensions).
- Reference: [Supportability guidelines in Monitoring team's wiki](https://supportability.visualstudio.com/AAAP_Code/_wiki/wikis/AAAP/1696998/SB-Extension-Management)
- SAP: Azure/Azure Arc enabled servers/Extensions/Problems with multiple extensions or other extensions not listed above

## Troubleshooting Differences from Azure IaaS

- ASC looks different (hosted outside Azure, less detail available)
- If Connected Machine Agent not working → Monitoring team owns support
- Extension logs are in a different location — customer must manually send logs
- [How to collect logs from Arc VMs](https://supportability.visualstudio.com/AAAP_Code/_wiki/wikis/AAAP/1696972/HT-Collect-Logs-from-Customer-Arc-VMs)

## Custom Script Extension (CSE) on Arc

- VM team supports CSE on Arc since **January 2024**
- [Monitoring team's CSE guidance for Arc](https://supportability.visualstudio.com/AzureArcforServers/_wiki/wikis/AzureArcenabledservers.wiki/379248/Custom-Script-Extension)
- Start troubleshooting at [manually check log files section](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494962/Custom-Script-Extension-Workflow_AGEX?anchor=manually-check-log-files)

## Run Command Extension on Arc

- Since **December 2025**, Run Command on Arc deploys a hidden extension.
- Azure Arc team delivers the installation command; VM team owns the extension itself.
- [Arc Support Boundaries for Run Command](https://supportability.visualstudio.com/AAAP_Code/_wiki/wikis/AAAP/1697003/SB-The-Run-command?anchor=boundaries)
- [Run Command Workflow](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494969/Run-Command-Workflow_AGEX)
