---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Check the Azure Monitor Agent (AMA) Processes"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Check%20the%20Azure%20Monitor%20Agent%20%28AMA%29%20Processes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# PowerShell (on VM)
- When running the following command, do you see the **five agent processes**?
```
Get-Process MonAgent*| Where Path -like "C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\*"
Get-Process AMAExtHealthMonitor
```

![image.png](/.attachments/image-d9f50896-e322-4030-bc72-f4a7fa74a85d.png)

# Review Related Logs
This is the order in which processes are launched:
VM Guest Agent (WaAppAgent.exe) > AMAExtHealthMonitor.exe > MonAgentLauncher.exe > MonAgentHost.exe > MonAgentManager.exe > MonAgentCore.exe

![image.png](/.attachments/image-b25ebd61-1f50-424d-baf1-9bbf57000b61.png)

**AMAExtHealthMonitor.exe** logs are found here:
```VM: C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\Extension.*.log```
```ARC: C:\ProgramData\GuestConfig\extension_logs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\Extension.*.log```
```...\AgentTroubleshooterOutput-{date}\VmExtLogs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\Extension.*.log```

The Extension logs are recorded in **Local Time** not UTC.

- Enable AMAExtHealthMonitor
```[2024-03-13 19:26:30.000]  [StartProcess] ErrorCode:0 INFO: Starting the command: AMAExtHealthMonitor.exe Global\AMA-HealthMonitor-ShutdownEvent AzureMonitorAgent-ResetEvent enable.```

- Enable results
```[2024-03-13 19:26:30.000]  [HandleEnableCommand] ErrorCode:0 INFO: Completed Extension Enable```

**MonAgentLauncher.exe** logs are found here:
```VM: C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\ExtensionHealth.*.log```
```ARC: C:\ProgramData\GuestConfig\extension_logs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\ExtensionHealth.*.log```
```...\AgentTroubleshooterOutput-{date}\VmExtLogs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\ExtensionHealth.*.log```

The ExtensionHealth logs are recorded in **Local Time** not UTC.

- Start MonAgentLauncher.exe MCS
```[2024-03-27 18:12:06.000]  [StartAzureMA] ErrorCode:0 INFO: Starting agent with MCS:Monitoring\Agent\MonAgentLauncher.exe  -useenv -ShutDownEvent AzureMonitorAgentExtension-ShutdownEventName -TotalShutDownEvent AzureMonitorAgentExtension-TotalShutdownEventName -StartEvent AzureMonitorAgentExtension-StartAgentEventName -StopEvent AzureMonitorAgentExtension-StopAgentEventName```

- Identify MCS endpoints
```[2024-03-27 18:12:06.000]  [StartAzureMA] ErrorCode:0 INFO: MCS endpoints, regional=[MCS_REGIONAL_ENDPOINT=https://westus.handler.control.monitor.azure.com], global=[MCS_GLOBAL_ENDPOINT=https://global.handler.control.monitor.azure.com], resource=[MCS_AZURE_RESOURCE_ENDPOINT=https://monitor.azure.com/]```

- Start MonAgentLauncher.exe process
```[2024-03-27 18:12:06.000]  [StartProcess] ErrorCode:0 INFO: Starting the command: Monitoring\Agent\MonAgentLauncher.exe -useenv -ShutDownEvent AzureMonitorAgentExtension-ShutdownEventName -TotalShutDownEvent AzureMonitorAgentExtension-TotalShutdownEventName -StartEvent AzureMonitorAgentExtension-StartAgentEventName -StopEvent AzureMonitorAgentExtension-StopAgentEventName.```

**MonAgentHost.exe** logs are found here:
```VM: C:\WindowsAzure\Resources\AMADataStore.{hostname}\Configuration\MonAgentLauncher.*.log```
```ARC: C:\Resources\Directory\AMADataStore.{hostname}\Configuration\MonAgentLauncher.*.log```
```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Configuration\MonAgentLauncher.*.log"```

- Start MonAgentHost.exe
```Info  (2024-04-09T17:22:55Z): MonAgentLauncher.exe - Starting the host: 'C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.24.0.0\Monitoring\Agent\MonAgentHost.exe  -LocalPath "C:\WindowsAzure\Resources\AMADataStore.win19ama-wus" -parent 6320 -mcsmode  -ShutDownEvent AzureMonitorAgentExtension-ShutdownEventName -TotalShutDownEvent AzureMonitorAgentExtension-TotalShutdownEventName -InitializedEvent AzureMonitorAgentExtension-StartAgentEventName'```

- Start results
```Info  (2024-04-09T17:22:55Z): MonAgentLauncher.exe - Started the host```

**MonAgentManager.exe** logs are found here:
```VM: C:\WindowsAzure\Resources\AMADataStore.{hostname}\Configuration\MonAgentHost.*.log```
```ARC: C:\Resources\Directory\AMADataStore.{hostname}\Configuration\MonAgentHost.*.log```
```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Configuration\MonAgentHost.*.log"```

- Start MonAgentManager.exe
```Info  (2024-04-09T17:22:55Z): MonAgentHost.exe - Starting agent manager: 'C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.24.0.0\Monitoring\Agent\MonAgentManager.exe -serviceShutdown MonAgentShutdownEvent.1384 -parent 1384 -deploymentdir "C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.24.0.0\Monitoring\Agent" -LocalPath "C:\WindowsAzure\Resources\AMADataStore.{hostname}" "-mcsmode" "-ShutDownEvent" "AzureMonitorAgentExtension-ShutdownEventName" "-TotalShutDownEvent" "AzureMonitorAgentExtension-TotalShutdownEventName" "-InitializedEvent" "AzureMonitorAgentExtension-StartAgentEventName" -LogPath "C:\WindowsAzure\Resources\AMADataStore.{hostname}\Configuration\MonAgentHost.*.log"'```

- Initialize MCS
```Info  (2024-04-09T17:22:55Z): MonAgentManager.exe - Initializing McsManager using mcsRegionalEndpoint=https://{region}.handler.control.monitor.azure.com,mcsGlobalEndpoint=https://global.handler.control.monitor.azure.com,azureResourceEndpoint=https://monitor.azure.com/,m_MonAgentVersion=46.15.01,customResourceId=,ManagedIdentity=,AADMode=false,aadClientId=,aadAuthority=,aadResource=,aadDomain=,proxyMode=system,proxyAddress=,proxyAuth=false```

- MCS results
```Info  (2024-04-09T17:22:55Z): MonAgentManager.exe - McsManager successfully initialized```

**MonAgentCore.exe** logs are found here:
```VM: C:\WindowsAzure\Resources\AMADataStore.{hostname}\Configuration\MonAgentHost.*.log```
```ARC: C:\Resources\Directory\AMADataStore.{hostname}\Configuration\MonAgentHost.*.log```
```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Configuration\MonAgentHost.*.log"```

- Start MonAgentCore.exe
```Info  (2024-04-09T17:22:56Z): MonAgentManager.exe - Starting agent: 'C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.24.0.0\Monitoring\Agent\MonAgentCore.exe   -deploymentdir "C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.24.0.0\Monitoring\Agent" -LocalPath "C:\WindowsAzure\Resources\AMADataStore.win19ama-wus"  -mcsmode    -InitializedEvent "AzureMonitorAgentExtension-StartAgentEventName"  -managerver 1  -parent 4220 -ShutDownEvent AzureMonitorAgentExtension-ShutdownEventName1384 -TotalShutDownEvent AzureMonitorAgentExtension-TotalShutdownEventName1384 -ConfigFile "C:\WindowsAzure\Resources\AMADataStore.win19ama-wus\mcs\mcsconfig.latest.xml" '```

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: The process for MonAgentCore.exe is restarted (i.e. new PID) each time a DCR is added, removed, or changed (i.e. a configuration change to the agent).
</div>

# Additional Logs
- If we are unable to start these processes, we may also benefit from reviewing the **Windows Event Logs (Application, Security, and System)**, which may indicate that another process, system policies, permissions or resource constraints were preventing agent processes from starting.
- If we suspect another application (that is antivirus), a system policy, access control, or resource constraint on the system is preventing an installation operation from succeeding or an agent process from starting, we may want to [Capture ProcMon .PML](https://techcommunity.microsoft.com/t5/iis-support-blog/basic-steps-for-making-a-process-monitor-procmon-capture/ba-p/348401) while reproducing the issue.

# Common Errors
#82358
#77672