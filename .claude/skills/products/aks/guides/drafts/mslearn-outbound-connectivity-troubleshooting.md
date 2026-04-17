# Outbound Connectivity Troubleshooting (AKS)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/troubleshoot-connections-endpoints-outside-virtual-network
> Status: draft (from mslearn-scan)

## Overview
Troubleshoot connections from AKS pods/nodes to endpoints outside the virtual network (public internet).

## Persistent Issues

### Step 1: Basic Outbound Troubleshooting
See: [Basic troubleshooting of outbound connections](basic-troubleshooting-outbound-connections)

### Step 2: Determine Outbound Type
```bash
az aks show --resource-group <rg> --name <cluster> --query "networkProfile.outboundType"
```

| Outbound Type | Check |
|---|---|
| `loadBalancer` | kubenet: check route table for blocking rules; CNI: check NSG |
| `userDefinedRouting` | Verify egress device reachable + allows required FQDNs |
| `managedNATGateway` | Verify NAT gateway associated with AKS subnet |

List required egress endpoints:
```bash
az aks egress-endpoints list --resource-group <rg> --name <cluster>
```

### Step 3: Analyze HTTP Response Codes
- 4xx → client issue or network blocker (NSG/firewall)
- 5xx → server-side issue

### Step 4: Bypass Virtual Appliance Test
Temporarily route 0.0.0.0/0 through internet instead of virtual appliance. If works → check appliance logs for denied packets.

## Intermittent Issues

### Step 1: Check Pod/Node Resources
```bash
kubectl top pods
kubectl top nodes
```

### Step 2: Check OS Disk Usage
Azure Portal → VMSS → Metrics → OS Disk metrics. Consider:
- Increase OS disk size
- Switch to Ephemeral OS disks
- Move heavy I/O to data disk

### Step 3: Check SNAT Port Exhaustion
Monitor LB SNAT port usage. If exhausted:
- Increase public IPs on LB: `az aks` commands
- Increase ports per node
- Optimize application connection reuse

## 21V Applicability
Applicable. NAT gateway and UDR work the same. Use 21V-specific egress endpoints.
