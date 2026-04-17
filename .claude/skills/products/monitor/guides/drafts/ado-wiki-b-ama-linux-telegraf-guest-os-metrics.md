---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/The source & logic of AMA Linux (telegraf, under the hood) to collect guest OS metrics?"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FThe%20source%20%26%20logic%20of%20AMA%20Linux%20(telegraf%2C%20under%20the%20hood)%20to%20collect%20guest%20OS%20metrics%3F"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux - Source & Logic of Guest OS Metrics Collection (Telegraf)

This information article is regarding source of Guest OS metrics by Azure Monitor Linux agent.

## What is the source of these guest OS metrics collected by AMA?

These metrics are collected from procfs (/proc filesystem)
- `/proc/meminfo` for memory
- `/proc/cpuinfo` for CPU

## Background from product group

- Based on DCR config, AMA provides the embedded telegraf instance with the configuration to collect metrics.
- These metrics go to **Metrics Extension** process in case of Azure Monitor destination.
- These metrics go to **AMA process** in case of Log Analytics destination.

## References
- [Telegraf](https://github.com/influxdata/telegraf) (open source)
- [Telegraf 1.23 Documentation](https://docs.influxdata.com/telegraf/v1.23/)
- **AMA is not open source.**

## Verify correctness of guest OS metrics
Use commands like the `free` command (for memory) which also pulls data from procfs and compare the results.

## Important file paths

- Initial configuration: `/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/config/`
- Metrics extension config: `/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/config/metrics_configs`
- Telegraf configuration: `/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/config/telegraf_configs`

## Troubleshooting steps

1. Check the services installed:
```bash
systemctl list-units --type=service | grep -i Agent
```

2. AMA-related services:

| Service | Description |
|---------|------------|
| azuremonitor-agentlauncher.service | Azure Monitor Agent Launcher daemon (on systemd) |
| azuremonitor-coreagent.service | Azure Monitor Agent Core Agent daemon (on systemd) |
| azuremonitoragent.service | Azure Monitor Agent daemon (on systemd) |
| metrics-extension.service | Metrics Extension service for Linux Agent metrics sourcing |
| metrics-sourcer.service | Custom Modified Telegraf service for Linux Agent metrics sourcing |

3. Check if the metrics-extension and telegraf services are running:
```bash
systemctl status metrics-extension
systemctl status metrics-sourcer
```
Metrics extension service should show that it started telegraf service (renamed as metrics-sourcer).
