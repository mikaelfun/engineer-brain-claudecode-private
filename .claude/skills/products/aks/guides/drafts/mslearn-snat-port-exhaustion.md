---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/snat-port-exhaustion
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot SNAT Port Exhaustion on AKS Nodes

## Step 1: Locate exhausted node via LB metrics
## Step 2: Find high-connection pod via tcptracer + lsns + crictl
## Step 3: Analyze connections via netstat
## Mitigation: Increase IPs/ports, NAT GW, fix connection pooling
