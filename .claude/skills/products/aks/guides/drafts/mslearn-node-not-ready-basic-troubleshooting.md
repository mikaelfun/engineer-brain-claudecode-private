---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-basic-troubleshooting
importDate: 2026-04-23
type: guide-draft
---

# Basic Troubleshooting of Node Not Ready Failures in AKS

## Overview
Troubleshooting steps to recover AKS cluster nodes after a Node Not Ready failure.

## Node Heartbeat Mechanisms
- **Node .status updates**: kubelet updates every 5 minutes (default)
- **Lease objects**: lightweight heartbeat in kube-node-lease namespace, updated every 10 seconds
- Unreachable node timeout: 40 seconds (default)

## Node States
- **NotReady/Unknown**: Cannot schedule pods
- **MemoryPressure/DiskPressure/PIDPressure**: Must manage resources before scheduling
- **NetworkUnavailable**: Must configure network correctly

## Pre-check Checklist
1. Cluster in Succeeded (Running) state - check via Azure portal or 
2. Node pool Provisioning state = Succeeded, Power state = Running
3. Required egress ports open in NSG and firewall for API server access
4. Latest node images deployed
5. Nodes in Running state (not Stopped/Deallocated)
6. Cluster running AKS-supported Kubernetes version

## Important Notes
- AKS auto-repairs unhealthy nodes automatically
- Do NOT modify IaaS resources directly (SSH, packages, network config)
- Two heartbeat types: .status updates and Lease objects (independent)
