---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/AMA Linux: HT: Enable debugging for AMA and mdsd logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Enable%20debugging%20for%20AMA%20and%20mdsd%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Enable Debugging for AMA and MDSD Logs

## Scenario
Enable debugging for AMA Linux to capture more information in the MDSD logs. Useful for in-depth troubleshooting of collection, parsing, or uploading stages on Linux machines.

> **Note:** Debug logging can grow mdsd logs exponentially. Disable debugging immediately after capturing the issue.

## Prerequisites
- Root access to the machine where Azure Monitor Agent (AMA) for Linux is installed
- Ability to restart AMA services

## How-To

### Step 1: Navigate to file path and modify with editor
```bash
cd /etc/default
vi azuremonitoragent
```
- Comment out the original line:
  ```
  export MDSD_OPTIONS="-A -c /etc/opt/microsoft/azuremonitoragent/mdsd.xml -d -r $MDSD_ROLE_PREFIX -S $MDSD_SPOOL_DIRECTORY/eh -L $MDSD_SPOOL_DIRECTORY/events"
  ```
- Insert the debug line:
  ```
  export MDSD_OPTIONS="-A -c /etc/opt/microsoft/azuremonitoragent/mdsd.xml -d -r $MDSD_ROLE_PREFIX -S $MDSD_SPOOL_DIRECTORY/eh -L $MDSD_SPOOL_DIRECTORY/events -e $MDSD_LOG_DIR/mdsd.err -w $MDSD_LOG_DIR/mdsd.warn -o $MDSD_LOG_DIR/mdsd.info -T 0x2"
  ```

### MDSD Trace Flags Reference

| Trace Category | Hex Flag | Flag Name | Description |
|---|---|---|---|
| Config file load/parsing | 0x000001 | ConfigLoad | |
| Event ingest via JSON | 0x000002 | **EventIngest** | Tracks data received across incoming protocols (syslog/json) |
| Internal CanonicalEvent handling | 0x000004 | CanonicalEvent | |
| MDS record batching | 0x000008 | Batching | |
| Azure table operations | 0x000010 | XTable | |
| Scheduler for time-driven tasks | 0x000020 | **Scheduler** | Tracks upload/data handling task scheduling |
| Event ingest via OMI | 0x000040 | OMIIngest | |
| Storage credential management | 0x000080 | Credentials | |
| Daemon mechanisms | 0x000100 | **Daemon** | Tracks process forking/startup |
| Use of configuration data post-load | 0x000200 | ConfigUse | |
| Local table operations | 0x002000 | **Local** | Tracks storing events to in-memory/persistent stores |
| Body of ingested events | 0x200000 | **EventContents** | Extremely heavy, drops event content into log file |

### Step 2: Save and exit
- Press **Esc** then **ZZ** to save

### Step 3: Restart AMA
```bash
systemctl restart azuremonitoragent
```

### Step 4: Reproduce the issue
- Optionally capture tcpdump: `tcpdump -s 0 -Ani any port 28330 -vv -w /var/log/on28330.pcap`
  - AMA = port 28330, syslog = port 514
- Generate test syslog: `logger -p syslog.debug "Test sample"`

### Step 5: Disable debugging
- Uncomment the original MDSD_OPTIONS line, delete the debug line
- Restart AMA: `systemctl restart azuremonitoragent`
