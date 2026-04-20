---
title: Troubleshoot High Disk I/O Latency in AKS Clusters
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/identify-high-disk-io-latency-containers-aks
product: disk
date: 2026-04-18
type: troubleshooting-guide
21vApplicable: true
---

# Troubleshoot High Disk I/O Latency in AKS Clusters

## Symptoms

- Applications become unresponsive during file operations
- Azure Portal metrics (Data Disk Bandwidth Consumed Percentage, Data Disk IOPS Consumed Percentage) show high disk utilization with low throughput
- Database operations take significantly longer than expected
- Pod logs show file system operation errors or timeouts

## Diagnostic Methodology (Inspektor Gadget)

### Prerequisites

- kubectl access to AKS cluster
- Inspektor Gadget installed
- Kernel version 6.5+ for top_blockio gadget (Azure Linux Container Host)

### Step 1: Profile Disk I/O Latency (profile_blockio)

```bash
kubectl gadget run profile_blockio --node <node-name>
```

Generates histogram distribution of I/O latency. Key indicators:
- **Normal**: Most operations in 16-32 ms range
- **Degraded**: High counts above 100 ms (100,000 us), operations extending into 500 ms-2s range

### Step 2: Find Top Disk I/O Consumers (top_blockio)

```bash
kubectl gadget run top_blockio --namespace <namespace> --sort -bytes [--node <node-name>]
```

Identifies containers with:
- Unusually high BYTES read/written
- High US (time spent) values
- High IO operation counts

### Step 3: Identify Files Causing High Activity (top_file)

```bash
kubectl gadget run top_file --namespace <namespace> --max-entries 20 --sort -wbytes_raw,-rbytes_raw
```

Pinpoints specific files and processes causing the I/O pressure.

### Root Cause Analysis Workflow

1. **profile_blockio** -> confirms disk latency exists on a specific node
2. **top_blockio** -> identifies which pod/container generates most I/O
3. **top_file** -> reveals specific files and commands causing the problem

This allows targeted remediation (e.g. resource limits, disk tier upgrade, workload redistribution) instead of broad system changes.
