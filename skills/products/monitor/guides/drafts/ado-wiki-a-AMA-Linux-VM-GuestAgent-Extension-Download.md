---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check if the Azure VM Guest Agent downloaded extension binaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FAMA%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Check%20if%20the%20Azure%20VM%20Guest%20Agent%20downloaded%20extension%20binaries"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Check if Azure VM Guest Agent Downloaded Extension Binaries

## Bash (on VM)

Check if correct agent version exists:
```bash
ls -ltr /var/lib/waagent | grep Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-
```

Check if .zip was extracted:
```bash
cat /var/log/waagent.log | grep ExtHandler | grep AzureMonitorLinuxAgent | grep Unzipping
```

## Review Related Logs

**VM Guest Agent (waagent)** logs: `/var/log/waagent.log`

### Expected Log Sequence

1. **Manifest file downloaded**:
```
INFO ExtHandler ExtHandler No extension/run-time settings settings found for Microsoft.Azure.Monitor.AzureMonitorLinuxAgent
INFO ExtHandler ExtHandler Downloading extension manifest
```

2. **Binaries downloaded and extracted** (if not already on disk):
```
INFO ExtHandler ExtHandler Downloading extension package
INFO ExtHandler ExtHandler Unzipping extension package: /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent__<version>.zip
```
