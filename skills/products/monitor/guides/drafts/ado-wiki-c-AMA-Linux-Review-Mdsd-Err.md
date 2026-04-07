---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Review mdsd.err"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Review%20mdsd.err"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The mdsd process in the Linux AMA performs many functions related to agent operation. The mdsd records its operational logs in four different log files (mdsd.info, mdsd.warn, mdsd.err, and mdsd.qos). In this article, we'll explore reviewing mdsd.err logs for different agent scenarios. 

The mdsd.err log can be found here:
```VM|Arc: /var/opt/microsoft/azuremonitoragent/log/mdsd.err```
```Troubleshooter: ...\mdsd\logs\mdsd.err```

# Scenario: Installation
When reviewing the mdsd.err log for this scenario, we generally only expect to see the following logs:

```
2025-01-02T10:54:24.2649480Z: [DAEMON] Parent process 23816 exit. child process id=23857
2025-01-02T10:54:24.2656660Z: [DAEMON] START mdsd daemon ver(1.33.1) pid(23857) uid(991) gid (990)
```

If we see other events here, these may be indicative of an issue. If we see these events repeatedly occurring, this may indicate the agent is restarting constantly.

## Known Issues (Installation)
#89760

# Scenario: Config
When reviewing the mdsd.err log for this scenario, we generally only expect to see the following logs:

```
2025-01-02T10:54:24.2649480Z: [DAEMON] Parent process 23816 exit. child process id=23857
2025-01-02T10:54:24.2656660Z: [DAEMON] START mdsd daemon ver(1.33.1) pid(23857) uid(991) gid (990)
```

If we see other events here, these may be indicative of an issue. If we see these events repeatedly occurring, this may indicate the agent is restarting constantly.

## Known Issues (Config)
#102457

# Scenario: Heartbeat

When reviewing the mdsd.err log for this scenario, it may be easiest to first restart the AMA service and wait two minutes for the agent to initialize and attempt to send a Heartbeat and then review the logs.

```systemctl restart azuremonitoragent && tail -f /var/opt/microsoft/azuremonitoragent/log/mdsd.err```

In most heartbeat scenarios, we'll be experiencing connectivity issues to endpoints. 
- [Test Connectivity](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710468/AMA-Linux-HT-Test-connectivity-to-endpoints) to endpoints.
- [Review Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710468/AMA-Linux-HT-Test-connectivity-to-endpoints?anchor=review-related-logs) and [Common Errors](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710468/AMA-Linux-HT-Test-connectivity-to-endpoints?anchor=common-errors).
- [Collect a Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590073/AMA-Linux-HT-Network-Trace) and [Review the Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/936016/How-to-analyze-AMA-Network-Trace-global.handler.control.monitor.azure.com)

## Known Issues (Heartbeat)
#81921
#89020
#94643
#95694
#89187
#105812
#137401

If you find an error that is not yet documented, please use the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1343718/AMA-Linux-TSG-Collection-Heartbeat?anchor=getting-help) section to review this with an agents subject matter expert (SME) and get the new error documented.

# Scenario: Syslog

## Known Issues (Syslog)
#89020
#89187

# Scenario: Text Logs

## Known Issues (Text Logs)
#82182