---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-after-being-healthy
importDate: 2026-04-23
type: guide-draft
---

# Troubleshoot AKS Node That Changes to Not Ready After Being Healthy

## Overview
Multi-step troubleshooting for AKS node that transitions from healthy to Not Ready state.

## Symptoms
- Node was previously healthy, unexpectedly changes to NotReady
- kubelet stops posting Ready status
- kubectl describe nodes shows conditions changed

## Diagnostic Steps

### Step 1: Check Network Level Changes
- DNS changes, firewall rule changes, NSG modifications, route table changes
- Verify connectivity to AKS outbound requirements with curl/telnet
- If all nodes affected simultaneously, likely network-level issue

### Step 2: Stop and Restart Nodes
- For individual node failures, stop and restart
- Use AKS Diagnostics to check for node faults, SNAT failures, IOPS issues

### Step 3: Fix SNAT Issues (Public AKS API)
- Check for idle connections relying on default 30-min timeout
- Review outbound connectivity patterns (code review / packet capture)
- Scale managed outbound public IPs and allocated outbound ports
- Use Azure Monitor SNAT Connections metric (Failed category)

### Step 4: Fix IOPS Performance
- Deploy larger disk sizes for better IOPS by creating new node pool
- Increase node SKU for more memory/CPU
- Consider Ephemeral OS
- Limit CPU/memory for pods, use topology spread constraints

### Step 5: Fix Threading Problems
- Check if containerd/kubelet fail due to thread creation limits
- Review ulimit settings on the node
