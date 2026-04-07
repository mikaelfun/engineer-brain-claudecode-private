---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check the Azure VM Guest Agent extension installation logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Check%20the%20Azure%20VM%20Guest%20Agent%20extension%20installation%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Review Related Logs
**VM Guest Agent (waagent)** logs are found here:
```/var/log/waagent.log```

- Installer is initialized:
```2024-10-18T15:20:58.314550Z INFO ExtHandler [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Initializing extension Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1```

- Installation start:
```
2024-10-18T15:20:59.713453Z INFO ExtHandler [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Install extension [./shim.sh -install]
2024-10-18T15:20:59.714094Z INFO ExtHandler [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Executing command: /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1/./shim.sh -install with environment variables: {"AZURE_GUEST_AGENT_UNINSTALL_CMD_EXIT_CODE": "NOT_RUN", "AZURE_GUEST_AGENT_EXTENSION_PATH": "/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1", "AZURE_GUEST_AGENT_EXTENSION_VERSION": "1.33.1", "AZURE_GUEST_AGENT_WIRE_PROTOCOL_ADDRESS": "168.63.129.16", "ConfigSequenceNumber": "0", "AZURE_GUEST_AGENT_EXTENSION_SUPPORTED_FEATURES": "[{\"Key\": \"ExtensionTelemetryPipeline\", \"Value\": \"1.0\"}]"}
```

- Installation log location defined:
```
2024/10/18 15:21:00 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] cwd is /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1
2024/10/18 15:21:00 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Change log file to /var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/extension.log
```

- Installation results:
```
2024-10-18T15:22:04.871064Z INFO ExtHandler [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Command: ./shim.sh -install
[stdout]
2024/10/18 15rpm  and  azuremonitoragent-1.33.1-build.main.708.x86_64.rpm
] Install,success,0,Install succeeded
[stderr]
Running scope as unit: install_d3f0c40f-da8d-45b1-9dc6-619920a910cf.scope
```

- Enable start: 
```
2024-10-18T15:22:04.873786Z INFO ExtHandler [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Enable extension: [./shim.sh -enable]
2024-10-18T15:22:04.874307Z INFO ExtHandler [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Executing command: /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1/./shim.sh -enable with environment variables: {"AZURE_GUEST_AGENT_UNINSTALL_CMD_EXIT_CODE": "NOT_RUN", "AZURE_GUEST_AGENT_EXTENSION_PATH": "/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1", "AZURE_GUEST_AGENT_EXTENSION_VERSION": "1.33.1", "AZURE_GUEST_AGENT_WIRE_PROTOCOL_ADDRESS": "168.63.129.16", "ConfigSequenceNumber": "0", "AZURE_GUEST_AGENT_EXTENSION_SUPPORTED_FEATURES": "[{\"Key\": \"ExtensionTelemetryPipeline\", \"Value\": \"1.0\"}]"}
```

- Enable log location defined:
```
2024/10/18 15:22:04 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] cwd is /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1
2024/10/18 15:22:04 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Change log file to /var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/extension.log
```

- Enable results:
```
2024-10-18T15:22:07.883475Z INFO ExtHandler [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Command: ./shim.sh -enable
[stdout]
2024/10/18 15:22:06 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Enable,success,0,Enable succeeded
[stderr]
Running scope as unit: enable_2f9adc50-6623-4a73-9e29-f17073f4902c.scope
```

**Azure Monitor Agent Extension Command** logs are found here:
```/var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/CommandExecution.log```

- Are there any stdout or stderr during install or enable?
![image.png](/.attachments/image-7b7ef522-0b1c-488c-aa78-a29527cb15f8.png)

**Azure Monitor Agent Extension** logs are found here:
```/var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/extension.log```

There are some expected, non-terminating errors. Our primary objective will be to ensure we see the following records:

```
2024/10/18 15:22:03 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Install succeeded
2024/10/18 15:22:03 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Install,success,0,Install succeeded

2024/10/18 15:22:06 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Enable succeeded
2024/10/18 15:22:06 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Enable,success,0,Enable succeeded
```

# Additional Logs
The **Extension Status** that is sent to Azure can be found here:
```/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/status/*.status```

- Are there any errors? 

Here is an example of success:
```[{"version": "1.0", "timestampUTC": "2024-10-18T17:03:03Z", "status": {"name": "Microsoft.Azure.Monitor.AzureMonitorLinuxAgent", "operation": "Enable", "status": "success", "code": "0", "formattedMessage": {"lang": "en-US", "message": "Enable succeeded"}}}]```

If we do not see message of "Enable succeeded", what do we see? This may be an indicator of the type of failure.

# Common Errors
#82117
#86500
#95408
#71040