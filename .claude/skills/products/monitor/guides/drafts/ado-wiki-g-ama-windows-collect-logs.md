---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/How-To/How To Manually Collect the AMA logs in Windows"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Azure%20Monitor%20Agent%20%28AMA%29%20for%20Windows/How-To/How%20To%20Manually%20Collect%20the%20AMA%20logs%20in%20Windows"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Manually Collect AMA Logs in Windows

:::template /.templates/Common-Header.md
:::
---
Applies To:
- Azure Monitor Agent Windows
---


# Scenario
---
If you are ever in the position where the agent troubleshooter is unable to complete for any given reason, you can follow the steps in this guide to capture the logs manually.



# Windows Agent Installation and Log locations:


AMA Extension logs:
- C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent

Azure Guest Agent logs:
- C:\WindowsAzure\Logs\WaAppAgent.*.log

AMA Installation Directory:
- C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent

AMA VM Startup Logs:
- C:\WindowsAzure\Resources\AMADataStore.<HostName>\Configuration\MonAgentHost.*.log (Highest Number will have the newest data)

AMA VM Data Directory:
- C:\WindowsAzure\Resources\AMADataStore.<HostName>\Tables

AMA VM Configuration Store:
- C:\WindowsAzure\Resources\AMADataStore.<HostName>\mcs

Downloaded AMCS VM Configurations (DCR's)
- C:\WindowsAzure\Resources\AMADataStore.<HostName>\mcs\configchunks



AMA ARC Startup Logs:
- C:\Resources\Directory\AMADataStore.<HostName>\Configuration\MonAgentHost.*.log

AMA ARC Data Directory:
- C:\Resources\Directory\AMADataStore.<HostName>\Tables

AMA ARC Configuration Store:
-C:\Resources\Directory\AMADataStore.<HostName>\mcs

Downloaded AMCS ARC Configurations  (DCR's):
- C:\Resources\Directory\AMADataStore.<HostName>\mcs\configchunks\*.json

# Azure Based resource logs to collect:

AMA Extension logs
AMA VM Startup Logs
AMA VM Data Directory
- maeventtable.tsf (All fragments)
AMA VM Configuration Store
Downloaded AMCS VM Configurations (DCR's)

# Arc connected resource logs to collect:

AMA ARC Startup Logs
AMA ARC Data Directory
- maeventtable.tsf (All fragments)
AMA ARC Configuration Store
Downloaded AMCS ARC VM Configurations (DCR's)

Also please be sure to run the Arc Collection Process for any ARC related logs (extension and services)

https://supportability.visualstudio.com/AzureArcforServers/_wiki/wikis/AzureArcenabledservers.wiki/807393/HT-Collect-Logs-from-Customer-VMs





