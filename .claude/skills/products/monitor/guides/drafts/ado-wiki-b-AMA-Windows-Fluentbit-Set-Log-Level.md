---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Fluentbit - Set log level (debug, error, warn, info, off)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Fluentbit%20-%20Set%20log%20level%20%28debug%2C%20error%2C%20warn%2C%20info%2C%20off%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
[Fluentbit](https://docs.fluentbit.io/manual/) is an open-source telemetry agent for collecting and processing telemetry data used by the Azure Monitor Agent. By default, only **error** level events are recorded in the log. When troubleshooting [text log](https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-text-log?tabs=portal) (formerly called custom logs) or [json log](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/data-collection-log-json) data collection it may be useful to enable extended logging.

# Prerequisites
- Administrator access to the machine where Azure Monitor Agent (AMA) for Windows is installed
- A DCR associated that instructs the AMA to collect a text log or json log (which will in turn configure Fluentbit)

# Process
- Open the Fluent-bit agent configuration file in Notepad

```C:\WindowsAzure\Resources\AMADataStore.{hostname}\mcs\fluentbit\td-agent.conf```

- Take note of the current value for log_level and change it to one of the following values, based on your situation:

```debug```
```error```
```warn```
```info```
```off```

![image.png](/.attachments/image-9632b134-b5cb-45df-b84d-3dbea0d9a580.png)

- Stop the fluent-bit.exe process (it will automatically restart)

PowerShell
```Get-Process fluent-bit | Stop-Process -Force```

- Wait for the fluent-bit.exe process to start again and then check the log

The path to the log file is also found in the td-agent.conf file (log_file value). 

![image.png](/.attachments/image-e98c0c98-d727-4283-a0bb-b98f71ea58db.png)

If you are running the [AMA Troubleshooter](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell#run-the-troubleshooter) the Fluentbit log will be collected at ```..\AgentDataStore\Mcs\fluentbit\Logs```.

- When finished, be sure to repeat this process and return the fluent-bit config to its starting log_level