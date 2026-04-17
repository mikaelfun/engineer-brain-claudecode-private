---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/Learning Resources/Concepts/AMA Linux: Concepts: Syslog Daemon (rsyslog)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/Learning Resources/Concepts/AMA Linux: Concepts: Syslog Daemon (rsyslog)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AMA Linux: Concepts: Syslog Daemon (rsyslog)

## Overview
Basic technical concepts of the rsyslog daemon relevant to AMA syslog collection.

## Configuration

### Primary config: `/etc/rsyslog.conf`

#### workDirectory
Sets the directory rsyslog uses for work files (e.g., imfile state, queue spool files).
When AMA detects >20k EPS, it throttles inbound messages, forcing rsyslog to buffer. Buffered messages are stored in workDirectory.

- RHEL: `global(workDirectory="/var/lib/rsyslog")`
- Debian: `$WorkDirectory /var/spool/rsyslog`

#### include()
Defines location of additional config files. AMA stores its config `10-azuremonitoragent-omfwd.conf` here.

- RHEL: `include(file="/etc/rsyslog.d/*.conf" mode="optional")`
- Debian: `$IncludeConfig /etc/rsyslog.d/*.conf`

#### input()
Defines listening ports. By default commented out (only local syslog). Must be enabled for remote syslog sources.

```
module(load="imudp")
input(type="imudp" port="514")
module(load="imtcp")
input(type="imtcp" port="514")
```

## AMA Default Configuration File
AMA creates `/etc/rsyslog.d/10-AzureMonitorAgent-omfwd.conf` when:
1. A DCR with valid syslog data source is associated
2. The rsyslog package is installed

```
template(name="AMA_RSYSLOG_TraditionalForwardFormat" type="string"
  string="<%PRI%>%TIMESTAMP% %HOSTNAME% %syslogtag%%msg:::sp-if-no-1st-sp%%msg%")

*.* action(type="omfwd"
  template="AMA_RSYSLOG_TraditionalForwardFormat"
  queue.type="LinkedList"
  queue.filename="omfwd-azuremonitoragent"
  queue.maxFileSize="32m"
  queue.maxDiskSpace="1g"
  action.resumeRetryCount="-1"
  action.resumeInterval="5"
  action.reportSuspension="on"
  action.reportSuspensionContinuation="on"
  queue.size="25000"
  queue.workerThreads="100"
  queue.dequeueBatchSize="2048"
  queue.saveonshutdown="on"
  target="127.0.0.1" Port="28330" Protocol="tcp")
```

## Troubleshooting

### Scenario: Invalid configuration
1. Check status: `systemctl status rsyslog`
2. Investigate: `journalctl -u rsyslog`
3. Look for error messages pointing to specific file, line, and character
4. Fix the configuration and restart rsyslog
