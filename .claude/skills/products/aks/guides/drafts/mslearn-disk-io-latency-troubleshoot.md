---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/identify-high-disk-io-latency-containers-aks"
importDate: "2026-04-23"
type: guide-draft
---

# Troubleshoot High Disk I/O Latency in AKS Clusters

## Overview

Uses Inspektor Gadget (eBPF-based) to identify containers/pods causing high disk I/O latency.

## Symptoms

- Applications unresponsive during file operations
- High disk utilization with low throughput
- Database operations significantly slower
- Pod logs show file system errors or timeouts

## Prerequisites
- Inspektor Gadget installed, kernel 6.5+ for top_blockio

## Workflow

### Step 1: Profile latency (profile_blockio)
kubectl gadget run profile_blockio --node <node-name>
Look for high counts above 100ms.

### Step 2: Top I/O consumers (top_blockio)
kubectl gadget run top_blockio --namespace <ns> --sort -bytes

### Step 3: Identify files (top_file)
kubectl gadget run top_file --namespace <ns> --max-entries 20 --sort -wbytes_raw,-rbytes_raw

## Next Steps
- High latency: storage-optimized nodes
- High I/O: optimize app disk access, implement caching
- Specific files: move to faster storage
