---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-oomkilled-aks-clusters
importDate: 2026-04-23
type: guide-draft
---

# Troubleshoot OOMKilled in AKS Clusters

## Overview
Guide for identifying and resolving out-of-memory (OOMKilled) issues in AKS cluster nodes.

## OOMKilled vs Evictions
- **OOMKilled**: Container-level termination when container exceeds memory limit (exit code 137). Only the offending container is terminated and restarted.
- **Evictions**: Pod-level removal by Kubelet when node is under memory pressure. Entire pod is affected, status shows Failed/Evicted.

## Common Causes
1. Resource overcommitment - inappropriate requests/limits
2. Memory leaks in applications
3. Sudden workload spikes
4. Insufficient node resources
5. No resource quotas/limits set

## Identification Methods
1.  - look for OOMKilled status
2.  - check Container Statuses
3.  - review logs before crash
4. Node SSH: 
5. 

## System Pods (kube-system)
- **metrics-server OOMKilled**: Configure Metrics Server VPA for extra resources
- **CoreDNS OOMKilled**: Customize CoreDNS scaling for auto-scaling based on workload
- Other pods: Ensure separate system and user node pools with >= 3 system nodes

## User Pods
- Check if user workloads run on system node pool (should use user node pool)
- Set appropriate memory requests and limits
- Contact app vendor to investigate memory usage patterns
