---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/TSGs/VMApps Kusto and General Troubleshooting Info_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20%28ACG%29%2FTSGs%2FVMApps%20Kusto%20and%20General%20Troubleshooting%20Info_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Log Location

The following are the locations that contain the relevant log file for VMApps

| Operating system | Test extension | Log directory | Settings file | Status file | applicationRegistry location |
|---|---|---|---|---|---|
| Windows | No | %system drive%\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.VMApplicationManagerWindows | %system drive%\Packages\Plugins\Microsoft.CPlat.Core.VMApplicationManagerWindows\<extension version>\RuntimeSettings\<n>.settings | %system drive%\Packages\Plugins\Microsoft.CPlat.Core.VMApplicationManagerWindows\<extension version>\Status\<n>.status | %system drive%\Packages\Plugins\Microsoft.CPlat.Core.VMApplicationManagerWindows\<extension version>\RuntimeSettings\applicationRegistry.active |
| Windows | Yes | %system drive%\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.EDP.VMApplicationManagerWindows | %system drive%\Packages\Plugins\Microsoft.CPlat.Core.EDP.VMApplicationManagerWindows\<extension version>\RuntimeSettings\<n>.settings | %system drive%\Packages\Plugins\Microsoft.CPlat.Core.EDP.VMApplicationManagerWindows\<extension version>\Status\<n>.status | %system drive%\Packages\Plugins\Microsoft.CPlat.Core.EDP.VMApplicationManagerWindows\<extension version>\RuntimeSettings\applicationRegistry.active |
| Linux | No | /var/log/azure/Microsoft.CPlat.Core.VMApplicationManagerLinux | /var/lib/waagent/Microsoft.CPlat.Core.VMApplicationManagerLinux-<extension version>/config/<n>.settings | /var/lib/waagent/Microsoft.CPlat.Core.VMApplicationManagerLinux-<extension version>/status/<n>.status | /var/lib/waagent/Microsoft.CPlat.Core.VMApplicationManagerLinux-<extension version>/config/applicationRegistry.active |
| Linux | Yes | /var/log/azure/Microsoft.CPlat.Core.EDP.VMApplicationManagerLinux | /var/lib/waagent/Microsoft.CPlat.Core.EDP.VMApplicationManagerLinux-<extension version>/config/<n>.settings | /var/lib/waagent/Microsoft.CPlat.Core.EDP.VMApplicationManagerLinux-<extension version>/status/<n>.status | /var/lib/waagent/Microsoft.CPlat.Core.EDP.VMApplicationManagerLinux-<extension version>/config/applicationRegistry.active |

Note: test extension only applies to subscriptions that are marked as test subscriptions

## Kusto Queries

### VMApplicationManagerWindows / VMApplicationManagerLinux events

```kql
// Cluster: azcore.centralus.kusto.windows.net | Database: Fa
cluster('azcore.centralus.kusto.windows.net').database('Fa').GuestAgentExtensionEvents
| where PreciseTimeStamp > ago(5d)
| where Name contains "VMApplicationManager"
| project-reorder PreciseTimeStamp, ContainerId, SubscriptionId, ResourceGroupName, Name, Version, Message
| take 100
```

### Guest Agent logs related to VMApplicationManager extension

```kql
// Cluster: azcore.centralus.kusto.windows.net | Database: Fa
cluster('azcore.centralus.kusto.windows.net').database('Fa').GuestAgentGenericLogs
| where PreciseTimeStamp > ago(5d)
| where EventName contains "VMApplicationManager"
| extend CorrectTimestamp = todatetime(Context2)
| project-reorder CorrectTimestamp, ContainerId, SubscriptionId, ResourceGroupName, EventName, CapabilityUsed, Context1
| take 500
```

## Key Log Files (Windows)

- VmAppExtension.log
- Handler.log
- stdout
- stderr

Located at: `C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.VMApplicationManagerWindows\`
