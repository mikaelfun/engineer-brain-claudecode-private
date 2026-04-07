---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Check the Azure VM Guest Agent extension installation logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Check%20the%20Azure%20VM%20Guest%20Agent%20extension%20installation%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Review Related Logs
**VM Guest Agent (WaAppAgent.exe)** logs are found here:
```C:\WindowsAzure\Logs\WaAppAgent.log```

- Plugin environment is setup:
```[00000010] 2024-02-26T21:01:09.101Z [WARN]  Setting up plugin environment (name: Microsoft.Azure.Monitor.AzureMonitorWindowsAgent, version: 1.23.0.0)., Code: 0```

- Plugin installer is run:
```[00000010] 2024-02-26T21:01:09.304Z [WARN]  Installing plugin (name: Microsoft.Azure.Monitor.AzureMonitorWindowsAgent, version: 1.23.0.0), Code: 0```
```[00000010] 2024-02-26T21:01:13.197Z [WARN]  Started a process with the launch command C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.23.0.0\AzureMonitorAgentExtension.exe, params: install.```

- Plugin installation results are reported:
```[00000010] 2024-02-26T21:01:16.373Z [WARN]  Installed plugin (name: Microsoft.Azure.Monitor.AzureMonitorWindowsAgent, version: 1.23.0.0), Code: 0```

**Azure Monitor Agent Extension Command** logs are found here:
```C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\CommandExecution*.log```

- Are there any stdout or stderr during install?
![image.png](/.attachments/image-97bb8907-c681-491b-8756-b1a5afdc1c18.png)

**Azure Monitor Agent Extension** logs are found here:
```C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\Extension.*.log```

![image.png](/.attachments/image-a5368ae1-01cf-47ec-8e6f-583baa2d8ca1.png)

- Handler state is set to Installed:
```[00000010] 2024-02-26T21:01:16.373Z [WARN]  Setting the install state of the handler Microsoft.Azure.Monitor.AzureMonitorWindowsAgent_1.23.0.0 to Installed```

- Plugin is enabled:
```[00000010] 2024-02-26T21:01:16.373Z [WARN]  Enabling plugin (handler name: Microsoft.Azure.Monitor.AzureMonitorWindowsAgent, extension name: , version: 1.23.0.0)., Code: 0```

- Plugin enablement results are reported:
```[00000010] 2024-02-26T21:01:22.582Z [INFO]  Command C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.23.0.0\AzureMonitorAgentExtension.exe of Microsoft.Azure.Monitor.AzureMonitorWindowsAgent has exited with Exit code: 0```

- Handler state is set to Enabled:
```[00000010] 2024-02-26T21:01:22.582Z [WARN]  Setting the install state of the handler Microsoft.Azure.Monitor.AzureMonitorWindowsAgent_1.23.0.0 to Enabled```

**Azure Monitor Agent Extension Command** logs are found here:
```C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\CommandExecution*.log```

- Are there any stdout or stderr during enable?
![image.png](/.attachments/image-3f6eac9a-9cfa-4a23-b78c-cbc8ac55e11c.png)

# Additional Logs
The **Extension Status** that is sent to Azure can be found here:
```C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\*\Status\*.status```

- Are there any errors?
![image.png](/.attachments/image-d11d3cbd-7acb-494d-9a97-13e27bd8d034.png)

# Known Issues
#94789