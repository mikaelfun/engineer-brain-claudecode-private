---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/AMA Linux: HT: Fluentbit - Demonstrate file change tracking"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Fluentbit%20-%20Demonstrate%20file%20change%20tracking"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Fluentbit - Demonstrate File Change Tracking

## Scenario
Verify whether Fluentbit (used by AMA for custom text log collection) is observing changes to monitored files and forwarding them to Azure Monitor Agent (mdsd).

## Prerequisites
- Root access to the machine with AMA for Linux installed
- A DCR associated that configures AMA to collect a text log (which configures Fluentbit)

## Step 1: Find the Fluentbit Output Port
```bash
cat /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf
```
Look for the `[OUTPUT]` section's `Port` value (typically 28230).

Key config to note:
- `Path` = monitored file path
- `db` = Fluentbit's tracking database for file offsets
- `Mem_Buf_Limit` / `Buffer_Max_Size` = buffer sizes

## Step 2: Tcpdump the Fluentbit Output Port
```bash
tcpdump -i any -A -vv port {FluentBitOutputPort}
```
Watch for forwarded log entries appearing in the tcpdump output — you should see the monitored file path and content.

## Step 3: Simulate Test Messages (Optional)
```bash
count=1
end=10
pathToFile=/var/log/messages
while [ $count -le $end ]; do
    echo "Test log message $count" >> $pathToFile
    count=$((count + 1))
done
```

Verify:
```bash
cat {pathToFile} | grep "Test log message"
```
