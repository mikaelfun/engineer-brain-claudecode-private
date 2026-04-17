---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check the Azure Arc Agent extension installation logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Check%20the%20Azure%20Arc%20Agent%20extension%20installation%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Review Related Logs
## Azure Arc
The Azure Monitor Agent extension defines the install and enable commands in this file:
```/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/HandlerManifest.json```

![image.png](/.attachments/image-a4153fd0-ec8a-4f4b-8e79-5683b10ad5ac.png)

Operations related to this step will largely be found in this log:

```/var/lib/GuestConfig/ext_mgr_logs/gc_ext.log```

- Create a worker process to run the install and enable:

```[2024-10-17 16:12:47.841] [PID 862] [TID 937] [EXTMGR] [INFO] [348a0b42-1271-4f32-a6ff-9ec6d8546189] Creating worker process for command: cd /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1 && chmod 744 . --recursive && systemd-run --scope --property=CPUAccounting=no --property=CPUQuota=60% /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1/./shim.sh -install 2>> /var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1/ca311e76-bdc3-42c1-acb5-79ec48cb14c8_cmd_execution_0_1776091_stderr.txt 1>> /var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1/ca311e76-bdc3-42c1-acb5-79ec48cb14c8_cmd_execution_0_1776091_stdout.txt```


```[2024-10-17 16:12:54.771] [PID 862] [TID 937] [EXTMGR] [INFO] [348a0b42-1271-4f32-a6ff-9ec6d8546189] Creating worker process for command: cd /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1 && chmod 744 . --recursive && systemd-run --scope --property=CPUAccounting=no --property=CPUQuota=60% /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1/./shim.sh -enable 2>> /var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1/ca311e76-bdc3-42c1-acb5-79ec48cb14c8_cmd_execution_0_1268980_stderr.txt 1>> /var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1/ca311e76-bdc3-42c1-acb5-79ec48cb14c8_cmd_execution_0_1268980_stdout.txt```

- Execute the command:

```[2024-10-17 16:10:38.950] [PID 862] [TID 937] [EXTMGR] [INFO] [348a0b42-1271-4f32-a6ff-9ec6d8546189] Executing Install request for extension: Microsoft.Azure.Monitor.AzureMonitorLinuxAgent with version: 1.33.1 requestID: ca311e76-bdc3-42c1-acb5-79ec48cb14c8 Sequence Number: -1 Increase Sequnce number? true```

```[2024-10-17 16:12:54.466] [PID 862] [TID 937] [EXTMGR] [INFO] [348a0b42-1271-4f32-a6ff-9ec6d8546189] Executing Enable command for extension: Microsoft.Azure.Monitor.AzureMonitorLinuxAgent with version: 1.33.1 and requestID: ca311e76-bdc3-42c1-acb5-79ec48cb14c8 Sequence Number: 0```

- Report results:

```[2024-10-17 16:13:00.728] [PID 862] [TID 937] [EXTMGR] [INFO] [348a0b42-1271-4f32-a6ff-9ec6d8546189] Worker process finished. Exit code: 0```
```[2024-10-17 16:13:00.801] [PID 862] [TID 937] [EXTMGR] [INFO] [348a0b42-1271-4f32-a6ff-9ec6d8546189] Enable command for extension: Microsoft.Azure.Monitor.AzureMonitorLinuxAgent with version 1.33.1 completed successfully.```

```[2024-10-17 16:13:00.861] [PID 862] [TID 937] [EXTMGR] [INFO] [348a0b42-1271-4f32-a6ff-9ec6d8546189] Finished processing extension: 'Microsoft.Azure.Monitor.AzureMonitorLinuxAgent'```

## Azure Monitor Agent
Operations related to this step will largely be found in this directory:
```/var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}```

![image.png](/.attachments/image-5332271b-e23d-451e-af9a-05c4304c2bf5.png)

```/var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/*_stdout.txt```
```/var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/*_stderr.txt```

The above files represent when Arc runs the /shim.sh -install and -enable commands and captures [stdout and stderr](https://learn.microsoft.com/cpp/c-runtime-library/stdin-stdout-stderr?view=msvc-170). If these are not empty, this will likely give clues to any issues encountered when executing those commands. 

# Common Errors
#82117