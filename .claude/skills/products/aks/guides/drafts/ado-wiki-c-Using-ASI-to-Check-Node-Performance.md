---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Using ASI to Check Node Performance"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FUsing%20ASI%20to%20Check%20Node%20Performance"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to use Azure Service Insights (ASI) to check AKS node performance metrics

[[_TOC_]]

## Summary

This document provides information around how to use Azure Service Insights (ASI) to check AKS node performance metrics.

Node performance may be slower than expected, or the customer may report a node performance or stability issue.

## Checking node performance metrics

### Select a Time Range

First, select a time range which you would like to review the node metrics for. To do this, set the Time Range values in ASI. In this example, we are viewing a three-hour window.

### Select the node

After opening the cluster in ASI, scroll down and click **Nodes**, **Cluster Nodes**, and in **Node Table** of cluster nodes select the name of the node.

Next, scroll down to the **Fabric Placements** section and click the GUID hyperlink for the node under **Analyzer (VM)**.

On the **Analyzer (VM)** page you can view the Disk Latency, the average CPU usage, and the available memory.

### Checking CPU Percentage

To view the CPU usage, click **VM Counters**, **Shoebox**, and then select **VM CPU**.

Note: The CPU data is based off **average** values, so the max CPU is the max of the average over the sampling period.

In a scenario where there is CPU exhaustion, you may observe that the AvgCPU or MaxCPU values are at or near 100% for a specific timeframe.

### Available Memory

To view the available memory, click **VM Counters**, **Shoebox**, and then select **VM Memory**.

In a scenario where memory pressure exists, you will observe that no memory or a very small amount of memory is available for a specific timeframe.

### VM Disk IO Latency Stats

Select **VM Disk IO Latency Stats** to view the disk latency metrics.

Very high latencies will be highlighted in red by the tool.

You can select specific disks for the node by clicking the **Azure Host VM Active Blobs Filter** option.

Note that for checking disk latency metrics, focus on a narrower time frame (+/- 5 minutes of a specific error or issue occurrence).

### Related articles

* [High memory usage handling in k8s](Azure-Kubernetes-Service-Wiki/AKS/How-Tos/Compute/Linux/High-memory-usage-handling-in-k8s.md)
* [Detecting Disk IO Throttling](Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Detecting-Disk-IO-Throttling.md)
* [AKS Performance Investigation Flow](Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/AKS-Performance-Investigation-Flow.md)
* [VM Performance Troubleshooting Guideline](Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Virtual-Machine-TSGs/VM-Performance-Troubleshooting-Guideline.md)
