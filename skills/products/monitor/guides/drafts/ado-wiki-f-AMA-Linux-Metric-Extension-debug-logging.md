---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/AMA Linux: HT: Metric Extension - Enable debug logging"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Metric%20Extension%20-%20Enable%20debug%20logging"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Metric Extension - Enable Debug Logging

## Scenario
Troubleshoot problems with sending metrics to Azure Monitor Metrics. Enable debug logging for MetricsExtension component.

## Prerequisites
- Root access to the machine with AMA for Linux installed

> **Note:** Restarting AMA using `./shim.sh -enable` will re-write the `metrics-extension.service` file to its original form, restoring default log level.

## Step 1: Set Debug Log Level
```bash
sed -i 's/-LogLevel Error/-LogLevel Debug/' /etc/systemd/system/metrics-extension.service
```

Validate the change:
```bash
cat /etc/systemd/system/metrics-extension.service
```
Confirm `-LogLevel Debug` appears in the ExecStart line.

## Step 2: Reload and Restart
```bash
systemctl daemon-reload
systemctl restart metrics-extension
```

## Step 3: Collect Logs
```bash
journalctl -u metrics-extension --since "2 hours ago" > me_systemd.log
```

## Step 4: Reset to Default
Restart AMA using the standard restart method — this restores the metrics-extension.service file to default (Error log level).

Reference: [How to restart the Azure Monitor Agent - Linux](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/766334/How-to-restart-the-Azure-Monitor-Agent-Linux)
