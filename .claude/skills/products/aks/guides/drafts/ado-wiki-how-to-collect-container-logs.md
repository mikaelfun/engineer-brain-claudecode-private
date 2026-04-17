---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/How to collect the container logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Monitoring/How%20to%20collect%20the%20container%20logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collecting container logs in AKS

## Summary

Methods for collecting container and VM logs in AKS for troubleshooting: kubectl logs, Log Analytics Workspace KQL, ASC IaaS Disk inspection, Guest Agent VM Logs, and XTS Tool.

### Prerequisites

* AKS cluster running a supported version
* (Optional) Insights enabled for Log Analytics Workspace
* kubectl access, or LAW access, or ASC access

## Methods

### 1. kubectl logs

```sh
kubectl logs <pod_name> -n <namespace_name>
```

### 2. Log Analytics Workspace

If Insights is enabled, container logs go to the associated LAW. In ASC, find the LAW via "Omsagent Config Log Analytics Workspace Resource ID", then "Query Customer Data".

Example KQL:

```kql
let startTimestamp = ago(7d);
KubePodInventory
| where TimeGenerated > startTimestamp
| project ContainerID, PodName=Name, Namespace, ContainerName
| where PodName contains "Pod_Name" and Namespace contains "Namespace_Name" and ContainerName contains "Container_Name"
| distinct ContainerID, PodName, ContainerName
| join (ContainerLog | where TimeGenerated > startTimestamp) on ContainerID
| project TimeGenerated, PodName, ContainerName, LogEntry, LogEntrySource
| sort by TimeGenerated desc
```

More queries: https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-log-query

### 3. ASC — Inspect IaaS Disk

For Managed Disks (non-ephemeral). Run "Inspect IaaS Disk" with AKS/Diagnostics mode on the VMSS instance. Pod logs at `device_0/var/log/pods/` (format: `<ns>_<pod>_<uid>`).

### 4. ASC — Guest Agent VM Logs

For ephemeral OS disks. "Guest Agent VM Logs" > "Create Report". Pod logs at `var/log/pods/`.

### 5. XTS Tool

Requires SAW + AME account. Can collect logs from recently deleted VMs. Get container ID and cluster ID from ASI, download XTS from https://aka.ms/xts, browse to GuestAgentLogs > VMLogs.

## References

* https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-log-query
* https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/854946/XTS_Tool
