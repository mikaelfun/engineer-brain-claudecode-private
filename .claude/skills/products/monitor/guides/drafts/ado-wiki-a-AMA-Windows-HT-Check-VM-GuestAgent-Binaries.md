---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Check if the Azure VM Guest Agent downloaded extension binaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Check%20if%20the%20Azure%20VM%20Guest%20Agent%20downloaded%20extension%20binaries"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# PowerShell (on VM)
- When running the following command, do you see the **correct agent version**?

```
Get-ChildItem -Path "C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\" -Recurse -Filter "Microsoft.Azure.Monitor.AzureMonitorWindowsAgent_*.zip"
```

![image.png](/.attachments/image-b345ca4c-c7fa-459f-af43-50edd55d648b.png)

- When running the following command, do you see that the .zip was extracted (that is the **AzureMonitorAgentExtension.exe is present**)?

```
Get-ChildItem -Path "C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\" -Recurse -Filter "AzureMonitorAgentExtension.exe"
```

![image.png](/.attachments/image-b17ec7a4-98d3-4ec3-9dbd-8d59ceb445c5.png)

# Review Related Logs

**VM Guest Agent (WaAppAgent.exe)** logs are found here:
```C:\WindowsAzure\Logs\WaAppAgent.log```

- Manifest file is downloaded:
```[00000010] 2024-02-26T21:00:38.850Z [INFO]  Starting download of plugin version manifest Microsoft.Azure.Monitor.AzureMonitorWindowsAgent from location: https://umsazkwnwlhzrkff1lj1.blob.core.windows.net/db0e35e6-0822-745f-3a05-1a9a27c3cd23/db0e35e6-0822-745f-3a05-1a9a27c3cd23_manifest.xml```

- If binaries do not already exist on disk, the .zip will be downloaded:
```[00000010] 2024-02-26T21:00:40.031Z [INFO]  Starting download of plugin Microsoft.Azure.Monitor.AzureMonitorWindowsAgent from location: https://umsadp3gdxscskqffbbl.blob.core.windows.net/db0e35e6-0822-745f-3a05-1a9a27c3cd23/db0e35e6-0822-745f-3a05-1a9a27c3cd23_1.23.0.0.zip.```

- The .zip will be extracted to disk:
```[00000010] 2024-02-26T21:00:42.389Z [INFO]  Extracting plug-in zip file to folder. Zip file: C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.23.0.0\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent_1.23.0.0.zip```

# Common Errors
#69395
