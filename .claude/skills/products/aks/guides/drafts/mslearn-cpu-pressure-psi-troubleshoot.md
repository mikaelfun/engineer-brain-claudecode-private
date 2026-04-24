---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-node-cpu-pressure-psi"
importDate: "2026-04-23"
type: guide-draft
---

# Troubleshoot CPU Pressure in AKS Clusters Using PSI Metrics

## Overview

CPU pressure via PSI (Pressure Stall Information) metrics is a more accurate indicator of resource contention than traditional CPU utilization.

## Symptoms

- Increased application latency even when CPU utilization appears moderate
- Throttled containers experiencing delays despite available CPU
- Degraded/unpredictable performance not correlating with CPU usage

## Step 1: Enable and Monitor PSI Metrics

### Via Azure Monitoring Managed Prometheus
1. Enable Managed Prometheus for AKS cluster
2. Set minimum ingestion profile to false, node-exporter to true
3. Query node-level: node_pressure_cpu_waiting_seconds_total
4. Query pod-level: container_cpu_cfs_throttled_seconds_total
5. Calculate PSI-some: rate(node_pressure_cpu_waiting_seconds_total[5m]) * 100

### Via kubectl
kubectl debug node/<node_name> -it --image=busybox
cat /host/proc/pressure/cpu

## Step 2: Best Practices

- Focus on PSI metrics instead of CPU utilization
- Remove CPU limits; rely on Linux CFS with CPU shares
- Set appropriate QoS classes
- Use pod anti-affinity for CPU-intensive workloads

## Key Metrics
- Node: node_pressure_cpu_waiting_seconds_total, node_cpu_seconds_total
- Container: container_cpu_cfs_throttled_periods_total, container_cpu_cfs_throttled_seconds_total
