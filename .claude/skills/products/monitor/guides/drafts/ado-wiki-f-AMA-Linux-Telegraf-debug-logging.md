---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/AMA Linux: HT: Telegraf - Enable debug logging"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Telegraf%20-%20Enable%20debug%20logging"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Telegraf - Enable Debug Logging

## Scenario
Telegraf is the plugin-driven agent used by AMA for collecting and reporting metrics. By default only error-level events are logged. Enable debug logging for troubleshooting performance/metrics data collection.

## Prerequisites
- Root access to the machine with AMA for Linux installed

> **Note:** Restarting AMA using `./shim.sh -enable` will re-write `telegraf.conf` to its original form, restoring default log level.

## Step 1: Enable Debug in telegraf.conf
```bash
sed -i -e 's/quiet = true/quiet = false/' \
       -e '/quiet = false/a debug = true' \
  /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-<version>/config/telegraf_configs/telegraf.conf
```

Validate:
```bash
cat /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-<version>/config/telegraf_configs/telegraf.conf
```
Confirm `quiet = false` and `debug = true` appear in the `[agent]` section.

Note the `logfile` parameter — this is where debug output goes.

## Step 2: Restart Telegraf
```bash
systemctl restart metrics-sourcer
```

## Step 3: Review Logs
Check the telegraf.log file at the path from telegraf.conf:
- `D!` = debug entry
- `I!` = informational entry
- `E!` = error entry

## Step 4: Reset to Default
Restart AMA using the standard restart method to restore default log level.

Reference: [How to restart the Azure Monitor Agent - Linux](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/766334/How-to-restart-the-Azure-Monitor-Agent-Linux)
