---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/Troubleshooting Guides/Troubleshooting extension auto upgrade issue on windows"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Windows%2FTroubleshooting%20Guides%2FTroubleshooting%20extension%20auto%20upgrade%20issue%20on%20windows"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::


****Note:** Information in this page are from test lab and don't compromise any Pii data.**

[[_TOC_]]

# Issue description
---

Customer already had set enableAutomaticUpgrade as $true (SEE: [How to confirm if automatic upgrade is enabled wiki](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/785543/How-to-Verify-enabled-extension-autoupgrade-for-Arc-and-Azure-VM-on-windows?anchor=determine-installed-extension-version-and-if-auto-upgrade-is-enabled-in-arc-and-azure-vm) but the mentioned extension wasn't updated to the latest version as result.

# Extension upgrade flow and statuses
Note: Once the release is started in a region, resources that are eligible will start upgrading after 1 hour or so.  Note that we have seen sometimes delays for up to 1 day. Not all VMs updated at about the same time, and resources that are not in the same availably set, might get upgraded at the same time.

![image.png](/.attachments/image-6521915a-5211-4c4a-bd6b-04aab01382d7.png)

# Troubleshooting
---

## 1. Configuration

   1.1. Make sure auto upgrade is enabled in Azure VM or Arc server, see [How to enable auto upgrade](https://learn.microsoft.com/azure/virtual-machines/automatic-extension-upgrade#enabling-automatic-extension-upgrade).

   1.2. Follow [this wiki](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/785543/How-to-Verify-enabled-extension-autoupgrade-for-Arc-and-Azure-VM-on-windows) to determine:
   - auto upgrade is enabled
   - the targeted extension version is available in special region

## 2. Log investigation

   2.1. Confirm extension auto upgrade through the logs for Arc and Azure VM

   **Arc server**

   For Arc enabled machines, events can be located in %ProgramData%\GuestConfig\ext_mgr_logs\gc_ext.log:

**//downloading and validating:**
   [2022-12-18 22:39:53.219] [PID 2412] [TID 2952] [DISPATCHER] [INFO] [55e1bdea-151a-4599-86b0-ae497ee4519a] New extension 'AzureMonitorWindowsAgent' - Downloading and validating extension package
[2022-12-18 22:39:53.249] [PID 2412] [TID 2952] [Pull Client] [INFO] [55e1bdea-151a-4599-86b0-ae497ee4519a] Downloading and validating extension package for extension : Microsoft.Azure.Monitor.AzureMonitorWindowsAgent
[2022-12-18 22:40:00.357] [PID 2412] [TID 2952] [Pull Client] [INFO] [55e1bdea-151a-4599-86b0-ae497ee4519a] Successfully downloaded extension from https://umsa31fxrb0jp4frc0mk.blob.core.windows.net/db0e35e6-0822-745f-3a05-1a9a27c3cd23/db0e35e6-0822-745f-3a05-1a9a27c3cd23_1.11.0.0.zip.
[2022-12-18 22:40:00.394] [PID 2412] [TID 2952] [Pull Client] [INFO] [55e1bdea-151a-4599-86b0-ae497ee4519a] Unzipping extension package C:\ProgramData\GuestConfig\downloads\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent1.11.0.0.zip to C:\ProgramData\GuestConfig\downloads\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent1.11.0.0 location.
...
[2022-12-18 22:40:25.608] [PID 2412] [TID 2952] [Pull Client] [INFO] [55e1bdea-151a-4599-86b0-ae497ee4519a] Downloading package to C:\Program Files\AzureConnectedMachineAgent\ExtensionService\GC\..\downloads\validation_files_AzureMonitorWindowsAgent.zip location from https://oaasguestconfigaes1.blob.core.windows.net/extensions/microsoft.azure.monitor__azuremonitorwindowsagent/microsoft.azure.monitor__azuremonitorwindowsagent__1.11.0.0.zip uri.
...
[2022-12-18 22:40:27.944] [PID 2412] [TID 2952] [PACKAGE_VALIDATOR] [INFO] [55e1bdea-151a-4599-86b0-ae497ee4519a] Catalog: 'C:\ProgramData\GuestConfig\downloads\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent1.11.0.0\microsoft.azure.monitor__azuremonitorwindowsagent__1.11.0.0.cat' is valid
[2022-12-18 22:40:27.944] [PID 2412] [TID 2952] [Pull Client] [INFO] [55e1bdea-151a-4599-86b0-ae497ee4519a] Extension package validated.
...
**//upgrade extension**
[2022-12-18 22:40:28.179] [PID 2412] [TID 3728] [DISPATCHER] [INFO] [e81aa658-5492-4ccb-92f3-5a8690832f34] dequeuing extension
[2022-12-18 22:40:28.180] [PID 2412] [TID 3728] [EXTMGR] [INFO] [e81aa658-5492-4ccb-92f3-5a8690832f34] Running install request for extension 'Microsoft.Azure.Monitor.AzureMonitorWindowsAgent'
[2022-12-18 22:40:28.180] [PID 2412] [TID 3728] [EXTMGR] [INFO] [e81aa658-5492-4ccb-92f3-5a8690832f34] Executing Upgrade request for extension: Microsoft.Azure.Monitor.AzureMonitorWindowsAgent from version: 1.9.0.0 to version: 1.11.0.0 and request ID: c72415a4-ce95-4d3a-bf7a-f991152e5b23

   **Azure VM**

   In Azure VM scenario it is similar to manual extension upgrade, the upgrade status confirmation events can be found in C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\<version>\CommandExecution.log file that gets generated under each Azure VM extension path C:\WindowsAzure\Logs\Plugins<extension name> (AMA, OMS or LAD).

   2.2. Rollback if upgrade to latest version failed

   If new version upgrade fails, extension will automatically rollback to previous good known state of it's installation. You can use the following queries to check failure events, if the extension upgrade succeeded, it will not report any event as result.

- Auto upgrade RSM logs that show auto upgrade events and upgrade status by Azure VM:
   //change the region name in MonitoringApplication as needed, region name can be found from [the queries in this wiki](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/785543/How-to-Verify-enabled-extension-autoupgrade-for-Arc-and-Azure-VM-on-windows?anchor=determine-available-extension-version-by-region)
   
   Execute in [[Web](https://dataexplorer.azure.com/clusters/azmc2.centralus/databases/rsm_prod?query=H4sIAAAAAAAAA0WMvQ6CMBCAd57i0kkHQ2RzwKTGDiQ2EgqupkJTG/FK6IEMPrydcP5+0vQqFbcG6eJwWpKb5BN5sZDB4Dw2gx11Z8QcheQLn6cZDdSFFKrmsoQjaOs3+267MunRkR8dWj4MvWs1xQvkObBKyZ3QgRqViYaX97/J1nqWRQetR9IOAzDUEZv32TycxkPl+/6k21dtAsUqYz/1YD/+vAAAAA==)] [[Desktop](https://azmc2.centralus.kusto.windows.net/rsm_prod?query=H4sIAAAAAAAAA0WMvQ6CMBCAd57i0kkHQ2RzwKTGDiQ2EgqupkJTG/FK6IEMPrydcP5+0vQqFbcG6eJwWpKb5BN5sZDB4Dw2gx11Z8QcheQLn6cZDdSFFKrmsoQjaOs3+267MunRkR8dWj4MvWs1xQvkObBKyZ3QgRqViYaX97/J1nqWRQetR9IOAzDUEZv32TycxkPl+/6k21dtAsUqYz/1YD/+vAAAAA==&web=0)][[Open in Azure Data Explorer](https://dataexplorer.azure.com/clusters/azmc2.centralus/databases/rsm_prod)]
   VMAutoExtensionUpgradeEvent
   | where TIMESTAMP > ago(1d)
   | where MonitoringApplication == "RSM-EastUS2EUAP_Monitoring"
   | where vMId contains "vm_name"

- Auto upgrade RSM logs that show auto upgrade events and upgrade status by Arc server:
 Execute in [[Web](https://dataexplorer.azure.com/clusters/azmc2.centralus/databases/rsm_prod?query=H4sIAAAAAAAAA0WOPY/CMBBE+/sVVpqEAktQ0XBSihQURoiPa9FirxKL4I12NwQhfjy+Bto3M0/j+1EUuSrhefNL6zEpQ2b2mjnZKaZAk9iEWs5sAIULCFYly+08MIUMa/Z/rh6VmodikkjpNLQMAZt7lv28zNQhozluXHM41m5nfg20VC3C7JM5SlGJY2rrYeijB80Ws16bYn9wc6FROwRRkAjnb7f47OH/wiaYDsQU25hgzh32q+INxExrv90AAAA=)] [[Desktop](https://azmc2.centralus.kusto.windows.net/rsm_prod?query=H4sIAAAAAAAAA0WOPY/CMBBE+/sVVpqEAktQ0XBSihQURoiPa9FirxKL4I12NwQhfjy+Bto3M0/j+1EUuSrhefNL6zEpQ2b2mjnZKaZAk9iEWs5sAIULCFYly+08MIUMa/Z/rh6VmodikkjpNLQMAZt7lv28zNQhozluXHM41m5nfg20VC3C7JM5SlGJY2rrYeijB80Ws16bYn9wc6FROwRRkAjnb7f47OH/wiaYDsQU25hgzh32q+INxExrv90AAAA=&web=0)][[Open in Azure Data Explorer](https://dataexplorer.azure.com/clusters/azmc2.centralus/databases/rsm_prod)]
	ArcVMAutoExtensionUpgradeEvent
	| where TIMESTAMP > ago(1d)
	| where MonitoringApplication == "RSM-southeastasia_Monitoring"
| where arcVMId has "vm_name"

2.3. The latest version upgrade has issue
If extension upgrade keeps failing or rolls back, it may keep retrying continuously which probably cause high disk consumption. In this case, please help customer to disable automatic extension upgrades on the extension to pause the behavior, once issue is fixed, re-enable automatic upgrade or manually upgrade the extension.
- Disable automatic upgrade in Azure portal:
![image.png](/.attachments/image-0f7edcb3-4d9a-4d1c-9a95-898419a3d1eb.png)
- Downgrade extension version by running Set-AzVMExtension cmdlet or cli equivalent to the last known good version if there is ongoing issue in latest version.
- [Re-enable automatic upgrade](https://learn.microsoft.com/azure/virtual-machines/automatic-extension-upgrade#enabling-automatic-extension-upgrade) once issue is fixed

2.4. Activity logs
Check extension upgrade operation in activity logs, see [How to get Activity Log events for an Azure subscription from Kusto](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480450/How-to-get-Activity-Log-events-for-an-Azure-subscription-from-Kusto):

|Server type| operationName |
|--|--|
| Azure VM | Microsoft.Compute/virtualMachines/extensions/write |
| Arc server | Microsoft.HybridCompute/machines/extensions/write |


let subId = "subscription ID";
let StartTime = todatetime(ago(1d));
let EndTime = todatetime(now());
EventData
| where TIMESTAMP between (StartTime..EndTime)
| where subscriptionId == subId
| where operationName == "Microsoft.Compute/virtualMachines/extensions/write" or operationName == "Microsoft.HybridCompute/machines/extensions/write"
| sort by eventTimestamp desc
| project-reorder eventTimestamp, TIMESTAMP, correlationId, eventDataId, category, eventName, status, subStatus, resourceProviderName, operationName, resourceGroupName, resourceId  

- If there is any error about extension upgrade operation, kindly check Guest agent or Arc agent if any issue. Guest agent is supported by Azure VM team while Arc agent is supported by Azure Arc team.

# Trainings
- [AMA OMS LAD Auto upgrade](https://microsoft-my.sharepoint.com/:v:/p/narinem/EbgnhfVef0FEmNPuSqYJsaUB3ECg4Y9dz_dGLwB3imCkWQ?e=O9Coyu)
- [Brownbag: Automatic Extension Upgrade for Azure Arc enabled servers](https://microsoft-my.sharepoint.com/:v:/r/personal/aptravis_microsoft_com/Documents/Recordings/Brownbag_%20Automatic%20Extension%20Upgrade%20for%20Azure%20Arc%20Enabled%20Servers-20220516_150311-Meeting%20Recording.mp4?csf=1&web=1&e=0kGnI5)

# Appendix Update Azure VM extensions
AMA Extension management can refer to [this doc](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-powershell).

Legacy parameter: DisableAutoUpgradeMinorVersion
```
Set-AzVMExtension -Name AzureMonitorWindowsAgent -ExtensionType AzureMonitorWindowsAgent -Publisher Microsoft.Azure.Monitor -ResourceGroupName <resource-group-name> -VMName <virtual-machine-name> -Location <location> -TypeHandlerVersion <version-number> -DisableAutoUpgradeMinorVersion:$false
```

New parameter: EnableAutomaticUpgrade
```
Set-AzVMExtension -Name AzureMonitorWindowsAgent -ExtensionType AzureMonitorWindowsAgent -Publisher Microsoft.Azure.Monitor -ResourceGroupName <resource-group-name> -VMName <virtual-machine-name> -Location <location> -TypeHandlerVersion <version-number> -EnableAutomaticUpgrade $true
```

New and legacy parameter mix (legacy will be just ignored)
```
Set-AzVMExtension -Name AzureMonitorWindowsAgent -ExtensionType AzureMonitorWindowsAgent -Publisher Microsoft.Azure.Monitor -ResourceGroupName <resource-group-name> -VMName <virtual-machine-name> -Location <location> -TypeHandlerVersion <version-number> -DisableAutoUpgradeMinorVersion:$false -EnableAutomaticUpgrade $true
```


