---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/How To Manually Collect the AMA logs in Linux"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Linux%2FHow-To%2FHow%20To%20Manually%20Collect%20the%20AMA%20logs%20in%20Linux"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To Manually Collect AMA Logs in Linux

## Scenario
When the AMA agent troubleshooter is unable to complete, manually collect the logs using these paths.

Applies To: AMA Linux versions 1.12.2+. Older versions should be upgraded to latest.

## Linux Agent Installation and Log Locations

| Component | Path |
|---|---|
| AMA Extension logs | `/var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/extension.log` |
| Azure Guest Agent logs | `/var/log/waagent.log` |
| AMA Installation Directory | `/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-<version>` |
| AMA VM Startup Logs | `/var/opt/microsoft/azuremonitoragent/log/` |
| AMA VM Data Directory | `/var/opt/microsoft/azuremonitoragent/events/` |
| AMA VM Configuration Store | `/etc/opt/microsoft/azuremonitoragent/mdsd.xml` |
| Downloaded AMCS VM Configurations (DCRs) | `/etc/opt/microsoft/azuremonitoragent/config-cache/configchunks` |

## Logs to Collect
1. AMA Extension logs
2. AMA VM Startup Logs
3. AMA VM Configuration Store
4. Downloaded AMCS VM Configurations (DCRs)

For Azure Arc-enabled servers, also run the Arc log collection process:
https://supportability.visualstudio.com/AzureArcforServers/_wiki/wikis/AzureArcenabledservers.wiki/807393/HT-Collect-Logs-from-Customer-VMs
