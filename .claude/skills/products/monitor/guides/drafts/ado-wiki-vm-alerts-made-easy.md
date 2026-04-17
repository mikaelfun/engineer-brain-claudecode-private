---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Concepts/Virtual Machine (VM) Alerts Made Easy"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FConcepts%2FVirtual%20Machine%20(VM)%20Alerts%20Made%20Easy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Virtual Machine (VM) Alerts Made Easy

## Problem

The customer wants to create alerts for their Azure Virtual Machine, such as:
- High CPU
- Free disk space
- Available memory
- VM Availability
- Network alerts
- Changes to Windows/Linux software, files, registry keys, services, daemons

> **IMPORTANT**: The following options are examples only. The user will need to customize them to suit their production needs.

## VM Alerts Known Issues

Please make sure to be familiar with known issues (query-table 9797cd00-bcaf-4a1e-a918-71ef47ac09fa).

---

## Option 1: Recommended Alerts

If the customer has not created Alerts scoped to a particular VM, they can enable Recommended Alerts which provides easy configuration for common alert types.

Reference: [Virtual Machines - Enabled Recommended Alerts](https://learn.microsoft.com/azure/azure-monitor/vm/tutorial-monitor-vm-alert-recommended)

---

## Option 2: Ready Signals

### VM Availability Alerts
- Log search and metric built-in signals available
- Note: If the VM is off, the VM availability metric will not be sent. This metric is relevant if the VM is on, but unavailable.
- References:
  - [Metric Alerts - Create availability alert rule](https://learn.microsoft.com/azure/azure-monitor/vm/tutorial-monitor-vm-alert-availability)
  - [Log/Log2Metric Alerts - Agent Heartbeat alerts](https://learn.microsoft.com/azure/azure-monitor/vm/monitor-virtual-machine-alerts#agent-heartbeat)

### VM CPU Alerts
- Signal: Percentage CPU metric (scoped to VM)
- Log signal: Log Analytics performance counters
- Reference: [VM Alerts: CPU Alerts](https://learn.microsoft.com/azure/azure-monitor/vm/monitor-virtual-machine-alerts#cpu-alerts)

### VM Available Memory Alerts
- Signal: Available memory metric (scoped to VM)
- Log signal: Log Analytics performance counters
- Reference: [VM Alerts: Available Memory](https://learn.microsoft.com/azure/azure-monitor/vm/monitor-virtual-machine-alerts#memory-alerts)

### VM Logical Disk Space Alerts
- Log signal: Log Analytics performance counters
- Reference: [VM Alerts: Disk Alerts](https://learn.microsoft.com/azure/azure-monitor/vm/monitor-virtual-machine-alerts#disk-alerts)

### VM Network Alerts
- Reference: [VM Alerts: Network Alerts](https://learn.microsoft.com/azure/azure-monitor/vm/monitor-virtual-machine-alerts#network-alerts)

---

## Option 3: Custom Log Searches based off of VM Insights

### CPU Alerts
```kql
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "Processor" and Name == "UtilizationPercentage"
| summarize AggregatedValue = avg(Val) by bin(TimeGenerated, 15m), Computer, _ResourceId
```

### Available Memory (MB)
```kql
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "Memory" and Name == "AvailableMB"
| summarize AggregatedValue = avg(Val) by bin(TimeGenerated, 15m), Computer, _ResourceId
```

### Available Memory (Percentage)
```kql
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "Memory" and Name == "AvailableMB"
| extend TotalMemory = toreal(todynamic(Tags)["vm.azm.ms/memorySizeMB"])
| extend AvailableMemoryPercentage = (toreal(Val) / TotalMemory) * 100.0
| summarize AggregatedValue = avg(AvailableMemoryPercentage) by bin(TimeGenerated, 15m), Computer, _ResourceId
```

### Logical Disk Space (All Disks)
```kql
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "LogicalDisk" and Name == "FreeSpacePercentage"
| summarize AggregatedValue = avg(Val) by bin(TimeGenerated, 15m), Computer, _ResourceId
```

### Logical Disk Space (Individual Disks)
```kql
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "LogicalDisk" and Name == "FreeSpacePercentage"
| extend Disk=tostring(todynamic(Tags)["vm.azm.ms/mountId"])
| summarize AggregatedValue = avg(Val) by bin(TimeGenerated, 15m), Computer, _ResourceId, Disk
```

### Network Bytes Received (All Interfaces)
```kql
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "Network" and Name == "ReadBytesPerSecond"
| summarize AggregatedValue = avg(Val) by bin(TimeGenerated, 15m), Computer, _ResourceId
```

### Network Bytes Sent (All Interfaces)
```kql
InsightsMetrics
| where Origin == "vm.azm.ms"
| where Namespace == "Network" and Name == "WriteBytesPerSecond"
| summarize AggregatedValue = avg(Val) by bin(TimeGenerated, 15m), Computer, _ResourceId
```

---

## Option 4: Guest Metrics sent to Azure Monitor metrics store

Guest metrics can be sent using:
- Azure Monitor Agent with Data Collection Rules (destination: Azure Monitor Metrics)
- Windows Diagnostic Extension (WAD) — cannot create alerts on classic guest OS metrics
- Telegraf agent for Linux — cannot create alerts on classic guest OS metrics

### Guest Metric Examples

| Resource | Windows | Linux |
|----------|---------|-------|
| CPU | `\Processor Information(_Total)% Processor Time` | `cpu/usage_active` |
| Memory | `\Memory% Committed Bytes in Use`, `\Memory\Available Bytes` | `mem/available`, `mem/available_percent` |
| Disk | `\Logical Disk(_Total)% Free Space`, `\Logical Disk(_Total)\Free Megabytes` | `disk/free`, `disk/free_percent` |
| Network | `\Network Interface\Bytes Sent/sec` | — |

---

## Changes to software, files, services, daemons, and registry keys

Use Azure Change Tracking and Inventory service. It logs to Log Analytics and alerts can be set up on the results.

- [Change Tracking using AMA - Support for Alerts](https://learn.microsoft.com/azure/automation/change-tracking/overview-monitoring-agent?tabs=win-az-vm#support-for-alerts-on-configuration-state)
- [Change Tracking using Automation - Support for Alerts](https://learn.microsoft.com/azure/automation/change-tracking/overview?tabs=python-2#support-for-alerts-on-configuration-state)
