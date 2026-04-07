---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check the Azure Monitor Agent (AMA) Processes"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Check%20the%20Azure%20Monitor%20Agent%20%28AMA%29%20Processes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Bash shell
- When running the following commands, what processes do you see?
    - Required processes: agentlauncher, amacoreagent, mdsd
    - Scenario-based processes: fluent-bit (text log, custom log), telegraf (perf), MetricsExtension (mdm)

```
ps -ef | grep -v grep | grep azuremonitoragent
```

![image.png](/.attachments/image-9fe9d954-b8c6-48f0-aadb-7985dc33eb23.png)

# Review Related Logs
**agentlauncher** logs are found here:
```Arc | VM: /var/opt/microsoft/azuremonitoragent/log/agentlauncher*.log```
```Troubleshooter: ...\mdsd\logs\agentlauncher.log```

Are there any errors listed here?

**amacoreagent** logs are found here:
```Arc | VM: /var/opt/microsoft/azuremonitoragent/log/amaca*.log```
```Troubleshooter: ...\mdsd\logs\amaca.log```

Are there any errors listed here?

**mdsd** logs are found here:
```Arc | VM: /var/opt/microsoft/azuremonitoragent/log/mdsd.*```
```Troubleshooter: ...\mdsd\logs\mdsd.*```

[AMA Linux: HT: Review mdsd.info - Scenario: Start-up/initialization](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710889/AMA-Linux-HT-Review-mdsd.info?anchor=scenario%3A-start-up/initialization)
[AMA Linux: HT: Review mdsd.err - Scenario: Installation](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710890/AMA-Linux-HT-Review-mdsd.err?anchor=scenario%3A-installation)

- mdsd.info initialization
```2024-10-17T16:34:18.8608710Z: [DAEMON] START mdsd daemon ver(1.33.1) pid(22036) uid(989) gid (985)```

- mdsd.info IMDS successfully called
```2024-10-17T16:34:19.1037370Z: Detected cloud region "{region}" via IMDS```

- mdsd.info MCS successfully initialized
```2024-10-17T16:34:19.1169090Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/McsManager.cpp:428,Initialize]McsManager successfully initialized```

- mdsd.info Successfully acquired MSI token
```2024-10-17T16:34:19.1498940Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/RefreshMSIToken.cpp:94,RefreshMsiTokenThreadProc]Next refresh of MSI token for MCS in 85592 seconds```

- mdsd.info Global Handler redirect to DCE (example from a DCE scenario)
```2024-10-17T16:34:24.1601590Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/McsManager.cpp:1032,CallMcsWithRedirect]MCS redirected to endpoint https://{dceName}.{region}.handler.control.monitor.azure.com for path locations/westus2/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Compute/virtualMachines/{vmName}/agentConfigurations```

- mdsd.info Found an associated DCR and added it to configchunks
```2024-10-17T16:34:24.2697920Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/RefreshConfigurations.cpp:580,ReconcileConfigurationsTable]Configuration [dcr-61ab199c0bab41f1a6bd407d0798a956] added```

- mdsd.info Successfully acquired GIG token
```2024-10-17T16:34:24.4155800Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/RefreshGigToken.cpp:238,RefreshGigToken]Retrieved gig token for configuration id [dcr-61ab199c0bab41f1a6bd407d0798a956] channel id [ods-831b1cf0-823a-4d8c-80d6-a7957e3cf4bb]: [eyJhbGciOi...]```

# Additional Logs
- If we are unable to start these processes, we may also benefit from reviewing the system logs:
    - ```RHEL: /var/log/messages```
    - ```Debian: /var/log/syslog```
- If we suspect system hardening (for example SELinux), we may also benefit from using strace
    - [AMA Linux: HT: Use strace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1702180/AMA-Linux-HT-Use-strace)

# Common Errors
#84812