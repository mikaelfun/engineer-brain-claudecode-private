---
title: Azure VM Connectivity Troubleshooting Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/troubleshoot-vm-connectivity
product: networking
21vApplicable: true
---

# Azure VM Connectivity Troubleshooting Guide

## Scenario 1: VM-to-VM in Same VNet

### Step 1: Verify Communication
- Download TCping: tcping64.exe -t <dest-VM-IP> 3389
- If ping works → skip to Step 3

### Step 2: Check NSG Settings
- Verify default rules: Allow VNet Inbound, Allow Load Balancer Inbound
- Check no lower-priority deny rules override
- Re-test with tcping64.exe

### Step 3: Test RDP/SSH Connection
- Windows: Azure portal > VM > Connect > RDP
- Linux: SSH connection test

### Step 4: Network Watcher Connectivity Check
- Windows: PowerShell connectivity check
- Linux: Azure CLI connectivity check
- Review Hops section in response

### Step 5: Fix Based on Issues Found
| Issue Type | Resolution |
|---|---|
| NetworkSecurityRule | Delete or modify blocking NSG rule |
| UserDefinedRoute | Delete/update UDR, adjust NVA forwarding |
| CPU | Follow generic performance troubleshooting |
| Memory | Follow generic performance troubleshooting |
| Guest Firewall | Adjust Windows/Linux firewall rules |
| DNS Resolution | Use Azure DNS troubleshooting guide |
| Socket Error | Port in use by another app, try different port |

## Scenario 2: Secondary NIC Connectivity

### Problem
Secondary NICs have no default gateway by default → traffic limited to same subnet.

### Fix
1. Run as admin: Route add 0.0.0.0 mask 0.0.0.0 -p <Gateway IP>
   - Gateway IP = first usable IP of secondary NIC subnet
2. Verify with route print
3. Check NSG on both primary and secondary NICs

## Scenario 3: VM Cannot Connect to Internet

### Step 1: Check NIC Provisioning State
1. Go to resources.azure.com (Resource Explorer)
2. Navigate to subscription > resource group > Microsoft.Network > networkInterfaces
3. Select affected NIC
4. Switch to Read/Write mode
5. Click Edit then Put to re-provision
6. Wait for ProvisioningState: Succeeded

### Step 2: Run Connectivity Check (Network Watcher)
### Step 3: Fix Based on Hops Issues (see table above)

## General Tips
- Use TCP-based testing tools (tcping, PsPing), not ICMP ping
- ICMP is deprioritized by many Azure networking devices
- Always check both subnet-level and NIC-level NSGs
- Use Network Watcher IP Flow Verify for quick NSG analysis
