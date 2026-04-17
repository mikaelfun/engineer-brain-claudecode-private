---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Check the Azure Arc Agent extension installation logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Check%20the%20Azure%20Arc%20Agent%20extension%20installation%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Review Related Logs
## Azure Arc
The Azure Monitor Agent extension defines the install and enable commands in this file:
```"C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\HandlerManifest.json"```

![image.png](/.attachments/image-36bf3e4d-dd47-484e-849a-046ff310fdab.png)

Operations related to this step will largely be found in this log:

```C:\ProgramData\GuestConfig\ext_mgr_logs\gc_ext.log```

- Create a worker process to run the install and enable:

```[2024-03-20 17:03:29.835] [PID 4528] [TID 2116] [EXTMGR] [INFO] [266c698f-ab13-4bd3-96c9-40b18c513d2f] Creating worker process for command: cmd.exe /c cd /d C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.24.0.0 && AzureMonitorAgentExtension.exe install```

```[2024-03-20 17:03:30.439] [PID 4528] [TID 2116] [EXTMGR] [INFO] [266c698f-ab13-4bd3-96c9-40b18c513d2f] Creating worker process for command: cmd.exe /c cd /d C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.24.0.0 && AzureMonitorAgentExtension.exe enable```

- Execute the command:

```[2024-03-20 17:03:22.048] [PID 4528] [TID 2116] [EXTMGR] [INFO] [266c698f-ab13-4bd3-96c9-40b18c513d2f] Executing Install request for extension: Microsoft.Azure.Monitor.AzureMonitorWindowsAgent with version: 1.24.0.0 requestID: 31878140-3e20-40f2-9774-9457671f43e6 Sequence Number: -1 Increase Sequnce number? true```

```[2024-03-20 17:03:29.981] [PID 4528] [TID 2116] [EXTMGR] [INFO] [266c698f-ab13-4bd3-96c9-40b18c513d2f] Executing Enable command for extension: Microsoft.Azure.Monitor.AzureMonitorWindowsAgent with version: 1.24.0.0 and requestID: 31878140-3e20-40f2-9774-9457671f43e6 Sequence Number: 0```

- Report results:

```[2024-03-20 17:03:30.535] [PID 4528] [TID 2116] [EXTMGR] [INFO] [266c698f-ab13-4bd3-96c9-40b18c513d2f] Process finished. Exit code: 0```
```[2024-03-20 17:03:30.551] [PID 4528] [TID 2116] [EXTMGR] [INFO] [266c698f-ab13-4bd3-96c9-40b18c513d2f] Enable command for extension: Microsoft.Azure.Monitor.AzureMonitorWindowsAgent with version 1.24.0.0 completed successfully.```

```[2024-03-20 17:03:30.988] [PID 4528] [TID 2116] [EXTMGR] [INFO] [266c698f-ab13-4bd3-96c9-40b18c513d2f] Finished processing extension: 'Microsoft.Azure.Monitor.AzureMonitorWindowsAgent'```

## Azure Monitor Agent
Operations related to this step will largely be found in this directory:
```C:\ProgramData\GuestConfig\extension_logs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent```

![image.png](/.attachments/image-93b040ff-f587-4773-84e9-4b8049a1106f.png)

```C:\ProgramData\GuestConfig\extension_logs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\*_stdout.txt```
```C:\ProgramData\GuestConfig\extension_logs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\*_stderr.txt```

The above files represent when Arc runs the AzureMonitorAgentExtension.exe install and enable commands and captures [stdout and stderr](https://learn.microsoft.com/cpp/c-runtime-library/stdin-stdout-stderr?view=msvc-170). If these are not empty, this will likely give clues to any issues encountered when executing those commands. 

```C:\ProgramData\GuestConfig\extension_logs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\Extension.*.log```

The above files represent the AzureMonitorAgentExtension.exe built-in logging statements. 

- Initialize the extension configuration:

```[2024-07-15 08:28:21.000]  [ExtensionConfiguration] ErrorCode:0 INFO: Initializing ExtensionConfiguration```

- Define what parameter is running:

```[2024-07-15 08:28:21.000]  [ParseExtensionCommand] ErrorCode:0 INFO: Command Received : install```

- Start executing the command:

```[2024-07-15 08:28:21.000]  [HandleInstallCommand] ErrorCode:0 INFO: Starting the Install Command```

- End executing the command:

```[2024-07-15 08:28:21.000]  [HandleInstallCommand] ErrorCode:0 INFO: Completed the Install Command```

- Output status:

```[2024-07-15 08:28:21.000]  [Main] ErrorCode:0 ERROR: Operation Complete.```

# Common Errors
#73635