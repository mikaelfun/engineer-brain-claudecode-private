---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Check if the Azure Arc agent downloaded extension binaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Check%20if%20the%20Azure%20Arc%20agent%20downloaded%20extension%20binaries"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# PowerShell (on VM)

```Get-ChildItem -Path "C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent"```

![image.png](/.attachments/image-ee6b866c-ab47-42eb-baee-069fa6fe041f.png)

Does the version we are installing appear in the output?

# Review Related Logs

Operations related to this step will largely be found in this log:

```C:\ProgramData\GuestConfig\ext_mgr_logs\gc_ext.log```

- New extension is identified and download begins:

```[2024-03-20 17:02:29.854] [PID 4528] [TID 1328] [DISPATCHER] [INFO] [aec640de-6f43-4607-b7f9-332b93bcdb0b] New extension 'AzureMonitorWindowsAgent' - Downloading and validating extension package```

```[2024-03-20 17:02:53.606] [PID 4528] [TID 1328] [Pull Client] [INFO] [aec640de-6f43-4607-b7f9-332b93bcdb0b] Successfully downloaded extension from https://umsaddwcxgnp541g14wt.blob.core.windows.net/db0e35e6-0822-745f-3a05-1a9a27c3cd23/db0e35e6-0822-745f-3a05-1a9a27c3cd23_1.24.0.0.zip.```

- Unzipping binaries to disk:

```[2024-03-20 17:02:53.619] [PID 4528] [TID 1328] [Pull Client] [INFO] [aec640de-6f43-4607-b7f9-332b93bcdb0b] Unzipping extension package C:\ProgramData\GuestConfig\downloads\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent1.24.0.0.zip to C:\ProgramData\GuestConfig\downloads\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent1.24.0.0 location.```

- Getting signing files (to validate the package is genuine):

```[2024-03-20 17:02:59.312] [PID 4528] [TID 1328] [Pull Client] [INFO] [aec640de-6f43-4607-b7f9-332b93bcdb0b] Successfully downloaded extension signing files from https://oaasguestconfigwus2s1.blob.core.windows.net/extensions/microsoft.azure.monitor__azuremonitorwindowsagent/microsoft.azure.monitor__azuremonitorwindowsagent__1.24.0.0.zip.```

```[2024-03-20 17:03:00.554] [PID 4528] [TID 1328] [PACKAGE_VALIDATOR] [INFO] [aec640de-6f43-4607-b7f9-332b93bcdb0b] The file: 'C:\ProgramData\GuestConfig\downloads\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent1.24.0.0\microsoft.azure.monitor__azuremonitorwindowsagent__1.24.0.0.cat' is signed and the signature was verified.```

```[2024-03-20 17:03:02.746] [PID 4528] [TID 1328] [PACKAGE_VALIDATOR] [INFO] [aec640de-6f43-4607-b7f9-332b93bcdb0b] Catalog: 'C:\ProgramData\GuestConfig\downloads\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent1.24.0.0\microsoft.azure.monitor__azuremonitorwindowsagent__1.24.0.0.cat' is valid```

```[2024-03-20 17:03:02.916] [PID 4528] [TID 1328] [Pull Client] [INFO] [aec640de-6f43-4607-b7f9-332b93bcdb0b] Extension package validated.```

# Common Errors
#84160
